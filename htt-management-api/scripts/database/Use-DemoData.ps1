param(
    [ValidateSet('seed', 'check', 'remove', 'rehearse', 'bind', 'unbind')][string]$Action = 'check',
    [ValidateSet('Main', 'Validation')][string]$Target = 'Main',
    [switch]$DevelopmentData
)
$ErrorActionPreference = 'Stop'
if ($Target -eq 'Main' -and $Action -eq 'rehearse') { throw 'Rehearsals only run in Validation.' }
if ($Target -eq 'Main' -and $Action -ne 'check' -and -not $DevelopmentData) {
    throw 'Main writes require -DevelopmentData. Never use demonstration data in production.'
}
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$driver = Join-Path $projectRoot '.cache/repository/org/postgresql/postgresql/42.7.14/postgresql-42.7.14.jar'
if (-not (Test-Path -LiteralPath $driver)) {
    throw 'PostgreSQL driver missing. Build with -Dmaven.repo.local=.cache/repository first (pom.xml controls its version).'
}
Push-Location $projectRoot
$previousDevelopmentData = $env:HTT_DEVELOPMENT_DATA
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target $Target -Migration
    if ($DevelopmentData) { $env:HTT_DEVELOPMENT_DATA = 'true' }
    & java --class-path $driver scripts/database/DemoData.java $Action ($Target.ToLowerInvariant())
    if ($LASTEXITCODE -ne 0) { throw "Demo data operation failed (exit $LASTEXITCODE)." }
} finally {
    $env:HTT_DEVELOPMENT_DATA = $previousDevelopmentData
    Remove-Item Env:HTT_DB_MIGRATION_USERNAME,Env:HTT_DB_MIGRATION_PASSWORD -ErrorAction SilentlyContinue
    Pop-Location
}
