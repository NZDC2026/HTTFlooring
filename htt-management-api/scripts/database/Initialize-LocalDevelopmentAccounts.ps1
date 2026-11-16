$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$path=Join-Path $root '.local/local-login-demo.xml'
Push-Location $root
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
    if(-not (Test-Path -LiteralPath $path)) {
        $accounts=@{}
        foreach($label in @('manager','sales','customer-a','customer-b')) {
            $bytes=New-Object byte[] 32
            $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
            try {$rng.GetBytes($bytes)} finally {$rng.Dispose()}
            $password=[Convert]::ToBase64String($bytes)
            $accounts[$label]=[Management.Automation.PSCredential]::new("$label@htt-demo.invalid",(ConvertTo-SecureString $password -AsPlainText -Force))
        }
        $accounts | Export-Clixml -LiteralPath $path
    }
    $accounts=Import-Clixml -LiteralPath $path
    foreach($label in @('manager','sales','customer-a','customer-b')) {
        [Environment]::SetEnvironmentVariable(('HTT_DEMO_PASSWORD_'+$label.ToUpperInvariant().Replace('-','_')),$accounts[$label].GetNetworkCredential().Password,'Process')
    }
    $env:HTT_DEVELOPMENT_DATA='true'
    $jars=@(Get-ChildItem .cache/repository/org/postgresql/postgresql -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1;
        Get-ChildItem .cache/repository/org/springframework/security/spring-security-crypto -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1;
        Get-ChildItem .cache/repository/commons-logging/commons-logging -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1)
    if($jars.Count -ne 3){throw 'Build the project and populate the documented .cache/repository first.'}
    & java --class-path (($jars.FullName) -join ';') scripts/database/LocalDevelopmentAccounts.java
    if($LASTEXITCODE -ne 0){throw 'Local DEMO initialization failed.'}
} finally {
    foreach($label in @('manager','sales','customer-a','customer-b')) {[Environment]::SetEnvironmentVariable(('HTT_DEMO_PASSWORD_'+$label.ToUpperInvariant().Replace('-','_')),$null,'Process')}
    Remove-Item Env:HTT_DEVELOPMENT_DATA -ErrorAction SilentlyContinue
    Pop-Location
}
