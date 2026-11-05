param([ValidateSet('Main', 'Validation')][string]$Target = 'Main')
$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$databaseName = if ($Target -eq 'Main') { 'htt_management' } else { 'htt_management_validation' }
$secretDirectory = Join-Path $projectRoot '.local'
$secretPath = Join-Path $secretDirectory ($Target.ToLowerInvariant() + '-database.xml')
if (Test-Path -LiteralPath $secretPath) { throw 'Credential file already exists; refusing to rotate credentials implicitly.' }

function New-DatabaseCredential([string]$username) {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    $password = ConvertTo-SecureString ([Convert]::ToBase64String($bytes)) -AsPlainText -Force
    return [PSCredential]::new($username, $password)
}

New-Item -ItemType Directory -Path $secretDirectory -Force | Out-Null
$credentials = [pscustomobject]@{
    Database = $databaseName
    Url = "jdbc:postgresql://192.168.10.174:5432/${databaseName}?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api"
    App = New-DatabaseCredential ($databaseName + '_app')
    Migration = New-DatabaseCredential ($databaseName + '_migrator')
}
$temporaryPath = Join-Path $secretDirectory ([guid]::NewGuid().ToString() + '.tmp')
try {
    $credentials | Export-Clixml -LiteralPath $temporaryPath
    [System.IO.File]::Move($temporaryPath, $secretPath)
} finally {
    if (Test-Path -LiteralPath $temporaryPath) { Remove-Item -LiteralPath $temporaryPath }
}
Write-Output "Created Windows DPAPI-protected credentials for $databaseName in .local; no admin password is stored."
