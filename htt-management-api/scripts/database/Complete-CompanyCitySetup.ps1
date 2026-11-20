$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$previousOptIn=$env:HTT_TEST_ON_DEVELOPMENT_DATABASE
Push-Location $projectRoot
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
    $env:HTT_TEST_ON_DEVELOPMENT_DATABASE='true'
    $env:MAVEN_USER_HOME=Join-Path $projectRoot '.cache/maven'
    & ./mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
    if($LASTEXITCODE -ne 0){throw 'Database verification failed; confirmed company cities were not backfilled.'}
    $driver=Get-ChildItem .cache/repository/org/postgresql/postgresql -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
    if(-not $driver){throw 'PostgreSQL driver missing from documented Maven cache.'}
    & java --class-path $driver.FullName scripts/database/SetDevelopmentCompanyCities.java
    if($LASTEXITCODE -ne 0){throw 'Company city configuration failed; inspect the error before retrying.'}
} finally {
    $env:HTT_TEST_ON_DEVELOPMENT_DATABASE=$previousOptIn
    Pop-Location
}
