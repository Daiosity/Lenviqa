param(
    [string]$WordPressBase = 'http://wp-to-react.local',
    [string]$FrontendBase = 'http://localhost:5173',
    [switch]$SkipGutenbergScenarios
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

function Assert-FileParity {
    param(
        [string]$Left,
        [string]$Right
    )

    $leftHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $Left).Hash
    $rightHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $Right).Hash

    Assert-Condition ($leftHash -eq $rightHash) "Starter parity mismatch:`n$Left`n$Right"
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$apiBase = ($WordPressBase.TrimEnd('/')) + '/wp-json/pressbridge/v1'

Write-Host "Checking PressBridge core endpoints..." -ForegroundColor Cyan

$site = Invoke-Json "$apiBase/site"
Assert-Condition (-not [string]::IsNullOrWhiteSpace($site.name)) 'Site endpoint returned no site name.'

$pages = Invoke-Json "$apiBase/pages"
Assert-Condition ($null -ne $pages.items) 'Pages endpoint returned no items collection.'

$posts = Invoke-Json "$apiBase/posts"
Assert-Condition ($null -ne $posts.items) 'Posts endpoint returned no items collection.'

$resolvedHome = Invoke-Json "$apiBase/resolve?path=/"
Assert-Condition (-not [string]::IsNullOrWhiteSpace($resolvedHome.route_type)) 'Resolve endpoint returned no route_type for home.'

Write-Host "Checking starter parity..." -ForegroundColor Cyan

$parityPairs = @(
    @('frontend-app\src\App.jsx', 'assets\starter\src\App.jsx'),
    @('frontend-app\src\styles.css', 'assets\starter\src\styles.css'),
    @('frontend-app\src\lib\api.js', 'assets\starter\src\lib\api.js'),
    @('frontend-app\src\blocks\BlockRenderer.jsx', 'assets\starter\src\blocks\BlockRenderer.jsx'),
    @('frontend-app\src\blocks\renderers.jsx', 'assets\starter\src\blocks\renderers.jsx'),
    @('frontend-app\src\blocks\utils.js', 'assets\starter\src\blocks\utils.js'),
    @('frontend-app\index.html', 'assets\starter\index.html')
)

foreach ($pair in $parityPairs) {
    Assert-FileParity `
        -Left (Join-Path $projectRoot $pair[0]) `
        -Right (Join-Path $projectRoot $pair[1])
}

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

Write-Host ''
Write-Host 'PressBridge core validation passed.' -ForegroundColor Green
Write-Host "WordPress base: $WordPressBase"
Write-Host "Frontend base:  $FrontendBase"
Write-Host "Pages found:    $($pages.items.Count)"
Write-Host "Posts found:    $($posts.items.Count)"
Write-Host "Home route:     $($resolvedHome.route_type)"
if (-not $SkipGutenbergScenarios) {
    Write-Host "Scenario set:   5 Gutenberg routes verified"
}
