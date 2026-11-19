$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
Push-Location $projectRoot
try {
    # This runs the complete Main verification and the already confirmed A/B city backfill first.
    & ./scripts/database/Complete-CompanyCitySetup.ps1
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
    $driver=Get-ChildItem .cache/repository/org/postgresql/postgresql -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
    if(-not $driver){throw 'PostgreSQL driver missing from documented Maven cache.'}
    & java --class-path $driver.FullName scripts/database/GrantDevelopmentCompanyCreation.java
    if($LASTEXITCODE -ne 0){throw 'Development company creation authorization failed.'}
} finally {Pop-Location}
