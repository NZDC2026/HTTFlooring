param([int]$Port = 8070)
$ErrorActionPreference='Stop'
if($Port -ne 8070){throw 'The development API and Swagger use port 8070.'}
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Push-Location $projectRoot
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
    & java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=database,development "--server.port=$Port"
    if($LASTEXITCODE -ne 0){throw "Development server exited with code $LASTEXITCODE."}
} finally {Pop-Location}