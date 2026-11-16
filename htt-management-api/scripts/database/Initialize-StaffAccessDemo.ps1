param([switch]$InspectOnly)
$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$labels=@('group-admin','owner-a','owner-b','sales-multi')
Push-Location $projectRoot
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
    $jars=@(
        Get-ChildItem .cache/repository/org/postgresql/postgresql -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
        Get-ChildItem .cache/repository/org/springframework/security/spring-security-crypto -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
        Get-ChildItem .cache/repository/commons-logging/commons-logging -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
    )
    if($jars.Count -ne 3){throw 'Build the project first to populate the documented dependency cache.'}
    if($InspectOnly) {
        & java --class-path ($jars.FullName -join ';') scripts/database/StaffAccessDevelopmentData.java inspect
    } else {
        $secretPath=Join-Path $projectRoot '.local/staff-access-demo.xml'
        if(-not (Test-Path -LiteralPath $secretPath)) {
            $accounts=@{}
            foreach($label in $labels) {
                $bytes=New-Object byte[] 18
                $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
                try {$rng.GetBytes($bytes)} finally {$rng.Dispose()}
                $password=[Convert]::ToBase64String($bytes).Replace('+','-').Replace('/','_')
                $accounts[$label]=[Management.Automation.PSCredential]::new("$label@htt-demo.invalid",(ConvertTo-SecureString $password -AsPlainText -Force))
            }
            $accounts | Export-Clixml -LiteralPath $secretPath
        }
        $accounts=Import-Clixml -LiteralPath $secretPath
        foreach($label in $labels) {
            [Environment]::SetEnvironmentVariable(('HTT_ACCESS_PASSWORD_'+$label.ToUpperInvariant().Replace('-','_')),$accounts[$label].GetNetworkCredential().Password,'Process')
        }
        $env:HTT_DEVELOPMENT_DATA='true'
        & java --class-path ($jars.FullName -join ';') scripts/database/StaffAccessDevelopmentData.java seed
    }
    if($LASTEXITCODE -ne 0){throw 'Staff access DEMO preparation failed; no existing password was reset.'}
} finally {
    foreach($label in $labels){[Environment]::SetEnvironmentVariable(('HTT_ACCESS_PASSWORD_'+$label.ToUpperInvariant().Replace('-','_')),$null,'Process')}
    Remove-Item Env:HTT_DEVELOPMENT_DATA -ErrorAction SilentlyContinue
    Pop-Location
}
