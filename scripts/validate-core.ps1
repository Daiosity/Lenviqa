param(
    [string]$WordPressBase = 'http://wp-to-react.local',
    [string]$FrontendBase = 'http://localhost:5173',
    [switch]$SkipGutenbergScenarios,
    [switch]$SkipRouteScenarios,
    [switch]$SkipPreviewScenarios,
    [switch]$SkipPreviewRefresh
)

$ErrorActionPreference = 'Stop'

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Invoke-Json {
    param(
        [string]$Url
    )

    $response = Invoke-WebRequest -UseBasicParsing $Url
    Assert-Condition ($response.StatusCode -eq 200) "Expected 200 from $Url but got $($response.StatusCode)."

    return $response.Content | ConvertFrom-Json
}

function Assert-ResolveRoute {
    param(
        [string]$ApiBase,
        [string]$Path
    )

    return Invoke-Json "$ApiBase/resolve?path=$([uri]::EscapeDataString($Path))"
}

function Assert-HttpError {
    param(
        [string]$Url,
        [int]$StatusCode,
        [string]$BodyPattern
    )

    try {
        Invoke-WebRequest -UseBasicParsing $Url | Out-Null
        throw "Expected error from $Url but request succeeded."
    } catch {
        $response = $_.Exception.Response
        Assert-Condition ($null -ne $response) "Expected HTTP response from $Url but none was returned."
        Assert-Condition ([int]$response.StatusCode.value__ -eq $StatusCode) "Expected HTTP $StatusCode from $Url but got $([int]$response.StatusCode.value__)."

        if ($BodyPattern) {
            $bodyReader = New-Object IO.StreamReader($response.GetResponseStream())
            $body = $bodyReader.ReadToEnd()
            Assert-Condition ($body -match $BodyPattern) "Expected error body from $Url to match '$BodyPattern'."
        }
    }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiBase = ($WordPressBase.TrimEnd('/')) + '/wp-json/pressbridge/v1'

& (Join-Path $projectRoot 'scripts\validate-static.ps1')

Write-Host "Checking Lenviqa core endpoints..." -ForegroundColor Cyan

$site = Invoke-Json "$apiBase/site"
Assert-Condition (-not [string]::IsNullOrWhiteSpace($site.name)) 'Site endpoint returned no site name.'

$pages = Invoke-Json "$apiBase/pages"
Assert-Condition ($null -ne $pages.items) 'Pages endpoint returned no items collection.'

$posts = Invoke-Json "$apiBase/posts"
Assert-Condition ($null -ne $posts.items) 'Posts endpoint returned no items collection.'

$resolvedHome = Invoke-Json "$apiBase/resolve?path=/"
Assert-Condition (-not [string]::IsNullOrWhiteSpace($resolvedHome.route_type)) 'Resolve endpoint returned no route_type for home.'

Write-Host "Checking frontend availability..." -ForegroundColor Cyan

$frontendResponse = Invoke-WebRequest -UseBasicParsing $FrontendBase
Assert-Condition ($frontendResponse.StatusCode -eq 200) "Expected 200 from $FrontendBase but got $($frontendResponse.StatusCode)."

if (-not $SkipGutenbergScenarios) {
    Write-Host "Checking Gutenberg scenario routes..." -ForegroundColor Cyan

    $scenarioPages = @(
        @{ Path = '/pb-scenario-nested-layout/'; Title = 'PB Scenario Nested Layout' },
        @{ Path = '/pb-scenario-media-and-buttons/'; Title = 'PB Scenario Media and Buttons' },
        @{ Path = '/pb-scenario-cover-cta/'; Title = 'PB Scenario Cover CTA' },
        @{ Path = '/pb-scenario-gallery-fallback/'; Title = 'PB Scenario Gallery Fallback' },
        @{ Path = '/pb-scenario-mixed-layout-stack/'; Title = 'PB Scenario Mixed Layout Stack' }
    )

    foreach ($scenario in $scenarioPages) {
        $resolvedScenario = Invoke-Json "$apiBase/resolve?path=$([uri]::EscapeDataString($scenario.Path))"
        $scenarioItem = if ($null -ne $resolvedScenario.item) { $resolvedScenario.item } else { $resolvedScenario }

        Assert-Condition ($resolvedScenario.route_type -eq 'singular') "Scenario route $($scenario.Path) did not resolve as singular."
        Assert-Condition ($scenarioItem.title -eq $scenario.Title) "Scenario route $($scenario.Path) resolved unexpected title '$($scenarioItem.title)'."
        Assert-Condition (($scenarioItem.blocks | Measure-Object).Count -gt 0) "Scenario route $($scenario.Path) returned no Gutenberg blocks."
        Assert-Condition ($scenarioItem.content.Length -gt 500) "Scenario route $($scenario.Path) returned unexpectedly short content."

        $scenarioFrontend = Invoke-WebRequest -UseBasicParsing (($FrontendBase.TrimEnd('/')) + $scenario.Path)
        Assert-Condition ($scenarioFrontend.StatusCode -eq 200) "Expected 200 from frontend scenario route $($scenario.Path) but got $($scenarioFrontend.StatusCode)."
    }
}

if (-not $SkipRouteScenarios) {
    Write-Host "Checking route scenario routes..." -ForegroundColor Cyan

    $homeRoute = Assert-ResolveRoute -ApiBase $apiBase -Path '/'
    Assert-Condition ($homeRoute.route_type -eq 'archive') 'Home route should resolve as archive for the Local posts-front-page setup.'

    $samplePageRoute = Assert-ResolveRoute -ApiBase $apiBase -Path '/sample-page/'
    Assert-Condition ($samplePageRoute.route_type -eq 'singular') 'Sample page route did not resolve as singular.'
    Assert-Condition ($samplePageRoute.title -eq 'Sample Page') "Sample page route resolved unexpected title '$($samplePageRoute.title)'."
    Assert-Condition ($samplePageRoute.path -eq '/sample-page/') "Sample page route resolved unexpected path '$($samplePageRoute.path)'."

    $nestedPageRoute = Assert-ResolveRoute -ApiBase $apiBase -Path '/pb-route-parent/pb-route-child/'
    Assert-Condition ($nestedPageRoute.route_type -eq 'singular') 'Nested route did not resolve as singular.'
    Assert-Condition ($nestedPageRoute.title -eq 'PB Route Child') "Nested route resolved unexpected title '$($nestedPageRoute.title)'."
    Assert-Condition ($nestedPageRoute.path -eq '/pb-route-parent/pb-route-child/') "Nested route resolved unexpected path '$($nestedPageRoute.path)'."

    $postRoute = Assert-ResolveRoute -ApiBase $apiBase -Path '/hello-world/'
    Assert-Condition ($postRoute.route_type -eq 'singular') 'Hello World post route did not resolve as singular.'
    Assert-Condition ($postRoute.title -eq 'Hello world!') "Post route resolved unexpected title '$($postRoute.title)'."

    foreach ($pathVariant in @('sample-page', '//sample-page//', 'http://wp-to-react.local/sample-page/')) {
        $normalizedRoute = Assert-ResolveRoute -ApiBase $apiBase -Path $pathVariant
        Assert-Condition ($normalizedRoute.path -eq '/sample-page/') "Normalized path '$pathVariant' resolved to unexpected path '$($normalizedRoute.path)'."
        Assert-Condition ($normalizedRoute.title -eq 'Sample Page') "Normalized path '$pathVariant' resolved unexpected title '$($normalizedRoute.title)'."
    }

    try {
        Invoke-WebRequest -UseBasicParsing "$apiBase/resolve?path=%2Fdoes-not-exist%2F" | Out-Null
        throw 'Bad path unexpectedly resolved successfully.'
    } catch {
        $response = $_.Exception.Response
        Assert-Condition ($null -ne $response) 'Bad path failure did not return an HTTP response.'
        Assert-Condition ([int]$response.StatusCode.value__ -eq 404) "Bad path expected 404 but got $([int]$response.StatusCode.value__)."
        $bodyReader = New-Object IO.StreamReader($response.GetResponseStream())
        $body = $bodyReader.ReadToEnd()
        Assert-Condition ($body -match '"code":"wtr_route_not_found"') 'Bad path did not return wtr_route_not_found.'
    }

    foreach ($route in @('/sample-page/', '/pb-route-parent/pb-route-child/', '/hello-world/')) {
        $frontendScenario = Invoke-WebRequest -UseBasicParsing (($FrontendBase.TrimEnd('/')) + $route)
        Assert-Condition ($frontendScenario.StatusCode -eq 200) "Expected 200 from frontend route $route but got $($frontendScenario.StatusCode)."
    }
}

if (-not $SkipPreviewScenarios) {
    Write-Host "Checking preview scenario routes..." -ForegroundColor Cyan

    if (-not $SkipPreviewRefresh) {
        $previewRefreshScript = Join-Path $projectRoot 'scripts\refresh-preview-scenarios.ps1'
        Assert-Condition (Test-Path $previewRefreshScript) "Preview refresh script not found at $previewRefreshScript"
        & powershell -ExecutionPolicy Bypass -File $previewRefreshScript | Out-Null
    }

    $validPreviewToken = 'pbpreviewvalidtoken001'
    $expiredPreviewToken = 'pbpreviewexpiredtoken001'
    $missingPreviewToken = 'pbpreviewmissingtoken001'
    $previewPath = '/pb-preview-scenario/'
    $draftPreviewPath = '/pb-preview-draft-only/'

    $publishedPreviewRoute = Assert-ResolveRoute -ApiBase $apiBase -Path $previewPath
    Assert-Condition ($publishedPreviewRoute.route_type -eq 'singular') 'Published preview scenario route did not resolve as singular.'
    Assert-Condition ($publishedPreviewRoute.title -eq 'Lenviqa Preview Scenario') "Published preview scenario resolved unexpected title '$($publishedPreviewRoute.title)'."

    Assert-HttpError -Url "$apiBase/resolve?path=$([uri]::EscapeDataString($draftPreviewPath))" -StatusCode 404 -BodyPattern '"code":"wtr_route_not_(public|found)"'

    $previewData = Invoke-Json "$apiBase/preview/$validPreviewToken"
    Assert-Condition ($previewData.is_preview -eq $true) 'Valid preview token did not return is_preview=true.'
    Assert-Condition ($previewData.route_type -eq 'singular') "Valid preview token did not resolve as singular."
    Assert-Condition ($previewData.title -eq 'Lenviqa Preview Scenario Draft') "Valid preview token returned unexpected title '$($previewData.title)'."
    Assert-Condition ($previewData.preview.source -eq 'autosave') "Valid preview token returned unexpected preview source '$($previewData.preview.source)'."
    Assert-Condition ($previewData.content -match 'preview seed revision') 'Valid preview token did not return the revision content.'

    Assert-HttpError -Url "$apiBase/preview/$expiredPreviewToken" -StatusCode 404 -BodyPattern '"code":"wtr_preview_expired"'
    Assert-HttpError -Url "$apiBase/preview/$missingPreviewToken" -StatusCode 404 -BodyPattern '"code":"wtr_preview_expired"'
    Assert-HttpError -Url "$apiBase/preview/invalid-token!" -StatusCode 404 -BodyPattern '"code":"rest_no_route"'

    $previewFrontendUrl = ($FrontendBase.TrimEnd('/')) + "${previewPath}?wtr_preview=1&wtr_preview_token=$validPreviewToken"
    $previewFrontendResponse = Invoke-WebRequest -UseBasicParsing $previewFrontendUrl
    Assert-Condition ($previewFrontendResponse.StatusCode -eq 200) "Expected 200 from preview frontend route but got $($previewFrontendResponse.StatusCode)."
}

Write-Host ''
Write-Host 'Lenviqa core validation passed.' -ForegroundColor Green
Write-Host "WordPress base: $WordPressBase"
Write-Host "Frontend base:  $FrontendBase"
Write-Host "Pages found:    $($pages.items.Count)"
Write-Host "Posts found:    $($posts.items.Count)"
Write-Host "Home route:     $($resolvedHome.route_type)"
if (-not $SkipGutenbergScenarios) {
    Write-Host "Scenario set:   5 Gutenberg routes verified"
}
if (-not $SkipRouteScenarios) {
    Write-Host "Route set:      home, page, nested page, post, bad path, normalization"
}
if (-not $SkipPreviewScenarios) {
    Write-Host "Preview set:    valid, expired, missing, malformed, public-route safety"
}
