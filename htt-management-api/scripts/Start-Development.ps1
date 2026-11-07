param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
if ($Port -notin @(8080, 8081)) { throw 'Swagger development callbacks are registered for ports 8080 and 8081 only.' }
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$certificate = Join-Path $projectRoot '.cache/htt-keycloak-development-ca.crt'
$truststore = Join-Path $projectRoot '.local/keycloak-development.p12'
if (-not (Test-Path -LiteralPath $certificate)) { throw 'Download the public development CA first; see docs/development-login.md.' }
Push-Location $projectRoot
try {
    $certificateInfo = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($certificate)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try { $fingerprint = ([BitConverter]::ToString($sha256.ComputeHash($certificateInfo.RawData))).Replace('-', '') }
    finally { $sha256.Dispose(); $certificateInfo.Dispose() }
    if ($fingerprint -ne 'D762C1D9558F02B3927EE9DFDCE1EDB15908489AEC8621A1CF4F28EBF3C1FD60') {
        throw 'Unexpected development CA fingerprint; verify rotation before trusting it.'
    }
    New-Item -ItemType Directory -Path (Join-Path $projectRoot '.local') -Force | Out-Null
    if (-not (Test-Path -LiteralPath $truststore)) {
        # This store contains a public CA only. Its integrity password is not an identity credential.
        & keytool -importcert -noprompt -alias htt-development -file $certificate -keystore $truststore -storetype PKCS12 -storepass htt-public-ca
        if ($LASTEXITCODE -ne 0) { throw 'Truststore creation failed.' }
    }
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
    & java "-Djavax.net.ssl.trustStore=$truststore" '-Djavax.net.ssl.trustStorePassword=htt-public-ca' `
        -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=database,development "--server.port=$Port"
    if ($LASTEXITCODE -ne 0) { throw "Development server exited with code $LASTEXITCODE." }
} finally { Pop-Location }
