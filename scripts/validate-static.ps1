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

function Assert-FileParity {
    param(
        [string]$Left,
        [string]$Right
    )

    Assert-Condition (Test-Path -LiteralPath $Left) "Parity source is missing: $Left"
    Assert-Condition (Test-Path -LiteralPath $Right) "Parity target is missing: $Right"

    $leftHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $Left).Hash
    $rightHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $Right).Hash

    Assert-Condition ($leftHash -eq $rightHash) "Starter parity mismatch:`n$Left`n$Right"
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$pluginBootstrap = Join-Path $projectRoot 'pressbridge.php'
$pluginReadme = Join-Path $projectRoot 'readme.txt'

Write-Host 'Checking PHP syntax...' -ForegroundColor Cyan

$phpCommand = Get-Command php -ErrorAction SilentlyContinue
Assert-Condition ($null -ne $phpCommand) 'PHP is required for static validation but was not found on PATH.'

$phpFiles = @(
    Get-Item -LiteralPath $pluginBootstrap
    Get-Item -LiteralPath (Join-Path $projectRoot 'uninstall.php')
    Get-ChildItem -Path (Join-Path $projectRoot 'includes'), (Join-Path $projectRoot 'templates') -Recurse -Filter '*.php' -File
)

foreach ($file in $phpFiles) {
    & $phpCommand.Source -l $file.FullName | Out-Null
    Assert-Condition ($LASTEXITCODE -eq 0) "PHP syntax validation failed: $($file.FullName)"
}

Write-Host 'Checking release metadata...' -ForegroundColor Cyan

$pluginSource = Get-Content -LiteralPath $pluginBootstrap -Raw
$readmeSource = Get-Content -LiteralPath $pluginReadme -Raw
$headerVersion = [regex]::Match($pluginSource, '(?m)^\s*\*\s*Version:\s*(?<version>[0-9A-Za-z.\-_]+)\s*$')
$constantVersion = [regex]::Match($pluginSource, "define\(\s*'WTR_VERSION'\s*,\s*'(?<version>[0-9A-Za-z.\-_]+)'\s*\)")
$stableTag = [regex]::Match($readmeSource, '(?m)^Stable tag:\s*(?<version>[0-9A-Za-z.\-_]+)\s*$')

Assert-Condition $headerVersion.Success 'Plugin header Version is missing.'
Assert-Condition $constantVersion.Success 'WTR_VERSION is missing.'
Assert-Condition $stableTag.Success 'readme.txt Stable tag is missing.'
Assert-Condition ($headerVersion.Groups['version'].Value -eq $constantVersion.Groups['version'].Value) 'Plugin header Version and WTR_VERSION do not match.'
Assert-Condition ($headerVersion.Groups['version'].Value -eq $stableTag.Groups['version'].Value) 'Plugin header Version and readme.txt Stable tag do not match.'

Write-Host 'Checking starter parity...' -ForegroundColor Cyan

$parityPairs = @(
    @('frontend-app\src\App.jsx', 'assets\starter\src\App.jsx'),
    @('frontend-app\src\styles.css', 'assets\starter\src\styles.css'),
    @('frontend-app\src\lib\api.js', 'assets\starter\src\lib\api.js'),
    @('frontend-app\src\blocks\BlockRenderer.jsx', 'assets\starter\src\blocks\BlockRenderer.jsx'),
    @('frontend-app\src\blocks\renderers.jsx', 'assets\starter\src\blocks\renderers.jsx'),
    @('frontend-app\src\blocks\utils.js', 'assets\starter\src\blocks\utils.js'),
    @('frontend-app\index.html', 'assets\starter\index.html'),
    @('frontend-app\package.json', 'assets\starter\package.json')
)

foreach ($pair in $parityPairs) {
    Assert-FileParity `
        -Left (Join-Path $projectRoot $pair[0]) `
        -Right (Join-Path $projectRoot $pair[1])
}

foreach ($packagePath in @('frontend-app\package.json', 'assets\starter\package.json')) {
    $package = Get-Content -LiteralPath (Join-Path $projectRoot $packagePath) -Raw | ConvertFrom-Json
    Assert-Condition (-not [string]::IsNullOrWhiteSpace($package.name)) "$packagePath is missing a package name."
    Assert-Condition ($null -ne $package.scripts.build) "$packagePath is missing its build script."
}

Write-Host ''
Write-Host 'Lenviqa static validation passed.' -ForegroundColor Green
Write-Host "Version: $($headerVersion.Groups['version'].Value)"
