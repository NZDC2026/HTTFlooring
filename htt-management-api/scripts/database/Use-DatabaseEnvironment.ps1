param(
    [ValidateSet('Main', 'Validation')][string]$Target = 'Main',
    [switch]$Migration
)
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$databaseName = if ($Target -eq 'Main') { 'htt_management' } else { 'htt_management_validation' }
$secretPath = Join-Path $projectRoot ('.local/' + $Target.ToLowerInvariant() + '-database.xml')
$databaseSecrets = Import-Clixml -LiteralPath $secretPath
$expectedUrl = "jdbc:postgresql://192.168.10.174:5432/${databaseName}?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api"
if ($databaseSecrets.Database -ne $databaseName -or $databaseSecrets.Url -ne $expectedUrl -or
    $databaseSecrets.App.UserName -ne ($databaseName + '_app') -or
    $databaseSecrets.Migration.UserName -ne ($databaseName + '_migrator')) {
    throw 'Credential metadata does not match the selected authorized HTT database.'
}
$env:HTT_DB_URL = $databaseSecrets.Url
$env:HTT_DB_USERNAME = $databaseSecrets.App.UserName
$env:HTT_DB_PASSWORD = $databaseSecrets.App.GetNetworkCredential().Password
if ($Migration) {
    $env:HTT_DB_MIGRATION_USERNAME = $databaseSecrets.Migration.UserName
    $env:HTT_DB_MIGRATION_PASSWORD = $databaseSecrets.Migration.GetNetworkCredential().Password
} else {
    Remove-Item Env:HTT_DB_MIGRATION_USERNAME,Env:HTT_DB_MIGRATION_PASSWORD -ErrorAction SilentlyContinue
}
Remove-Variable databaseSecrets
Write-Output "Loaded $Target database environment (credentials not displayed)."
