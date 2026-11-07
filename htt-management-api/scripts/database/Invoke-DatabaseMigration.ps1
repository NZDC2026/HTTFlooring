param([switch]$Offline)
$ErrorActionPreference = 'Stop'
# Credentials are loaded separately: DPAPI in development, secret manager in production.
foreach ($name in @('HTT_DB_URL','HTT_DB_USERNAME','HTT_DB_MIGRATION_USERNAME','HTT_DB_MIGRATION_PASSWORD')) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
        throw "Missing migration environment: $name"
    }
}
if ($env:HTT_DB_USERNAME -eq $env:HTT_DB_MIGRATION_USERNAME -or
    $env:HTT_DB_USERNAME -eq 'postgres' -or $env:HTT_DB_MIGRATION_USERNAME -eq 'postgres') {
    throw 'Use separate dedicated application and migration roles.'
}
if ($env:HTT_DB_URL -notmatch '^jdbc:postgresql://[^/?@]+/[^/?]+\?' -or
    $env:HTT_DB_URL -match '(?i)[?&](user|password)=') {
    throw 'Use an explicit database URL with connection options and separate credentials.'
}
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
Push-Location $projectRoot
try {
    $mavenArguments = @('-B','-ntp','-Dmaven.repo.local=.cache/repository')
    if ($Offline) { $mavenArguments += '-o' }
    # validate catches changed history; migrate creates only the reviewed versioned objects.
    & ./mvnw.cmd @mavenArguments flyway:info flyway:migrate flyway:validate
    if ($LASTEXITCODE -ne 0) { throw "Migration failed (exit $LASTEXITCODE). Inspect history before retrying." }
} finally {
    Pop-Location
}
