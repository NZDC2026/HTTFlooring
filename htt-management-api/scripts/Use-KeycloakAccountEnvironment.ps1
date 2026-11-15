$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$credential = Import-Clixml -LiteralPath (Join-Path $projectRoot '.local/keycloak-account-service.xml')
if ($credential -isnot [PSCredential] -or $credential.UserName -ne 'htt-api-account-admin') {
    throw 'Unexpected dedicated development identity-service credential.'
}
$env:HTT_KEYCLOAK_ACCOUNTS_CLIENT_ID = $credential.UserName
$env:HTT_KEYCLOAK_ACCOUNTS_CLIENT_SECRET = $credential.GetNetworkCredential().Password
Remove-Variable credential
Write-Output 'Loaded dedicated development Keycloak service credential (not displayed).'
