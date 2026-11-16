param(
    [Parameter(Mandatory)][ValidateSet('GROUP_READER','COMPANY_OWNER','SALES','REVOKED')][string]$Profile,
    [Parameter(Mandatory)][guid]$ActorId,
    [Parameter(Mandatory)][guid[]]$CompanyIds,
    [guid[]]$CustomerIds=@(),
    [guid[]]$AdditionalRoleIds,
    [Parameter(Mandatory)][ValidateLength(1,500)][string]$Reason
)
$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if($CompanyIds.Count -eq 0){throw 'Explicit company IDs required.'}
Push-Location $projectRoot
try {
    . ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
    $driver=Get-ChildItem .cache/repository/org/postgresql/postgresql -Recurse -Filter '*.jar' | Sort-Object FullName | Select-Object -Last 1
    if(-not $driver){throw 'Run the documented Maven build first.'}
    $customers=if($CustomerIds.Count -eq 0){'-'}else{$CustomerIds -join ','}
    $roles=if(-not $PSBoundParameters.ContainsKey('AdditionalRoleIds')){'keep'}elseif($AdditionalRoleIds.Count -eq 0){'-'}else{$AdditionalRoleIds -join ','}
    & java --class-path $driver.FullName scripts/database/ConfigureStaffAccess.java $Profile $ActorId ($CompanyIds -join ',') $customers $roles $Reason
    if($LASTEXITCODE -ne 0){throw 'Company access configuration failed; the transaction was not committed.'}
} finally {Pop-Location}
