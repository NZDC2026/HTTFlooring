param([string]$BaseUrl='http://127.0.0.1:8070')
$ErrorActionPreference='Stop'
$endpoint=[uri]$BaseUrl
if(-not $endpoint.IsAbsoluteUri -or -not $endpoint.IsLoopback -or $endpoint.Scheme -notin @('http','https') -or
    $endpoint.UserInfo -or $endpoint.AbsolutePath -ne '/' -or $endpoint.Query -or $endpoint.Fragment){throw 'Use an explicit loopback API origin.'}
$projectRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$manifest=Get-Content -Raw -LiteralPath (Join-Path $projectRoot '.local/staff-access-demo-manifest.json') | ConvertFrom-Json
$accounts=Import-Clixml -LiteralPath (Join-Path $projectRoot '.local/staff-access-demo.xml')
$client=[Net.Http.HttpClient]::new()
$client.Timeout=[TimeSpan]::FromSeconds(15)
$tokens=@{}
$script:checks=0
function Send-Request([string]$Method,[string]$Path,[string]$Token,[string]$Company,$Body) {
    $request=[Net.Http.HttpRequestMessage]::new([Net.Http.HttpMethod]::new($Method),($BaseUrl.TrimEnd('/')+$Path))
    try {
        if($Token){$request.Headers.Authorization=[Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$Token)}
        if($Company){$request.Headers.Add('X-Company-Id',$Company)}
        if($null -ne $Body){$request.Content=[Net.Http.StringContent]::new(($Body | ConvertTo-Json -Depth 12 -Compress),[Text.Encoding]::UTF8,'application/json')}
        $response=$client.SendAsync($request).GetAwaiter().GetResult()
        try {
            $text=$response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            return @{Status=[int]$response.StatusCode; Json=if($text){$text | ConvertFrom-Json}else{$null}}
        } finally {$response.Dispose()}
    } finally {$request.Dispose()}
}
function Check-Status($Reply,[int]$Expected,[string]$Name) {
    if($Reply.Status -ne $Expected){throw "$Name expected $Expected, received $($Reply.Status). Restart the current backend if its build is stale."}
    $script:checks++
    Write-Output "PASS $Name [$Expected]"
}
function Check-Value([bool]$Matches,[string]$Name) {
    if(-not $Matches){throw "Assertion failed: $Name"}
    $script:checks++
    Write-Output "PASS $Name"
}
try {
    foreach($label in @('group-admin','owner-a','owner-b','sales-multi')) {
        $credential=$accounts[$label]
        $reply=Send-Request 'POST' '/api/v1/user/auth/login' $null $null @{email=$credential.UserName;password=$credential.GetNetworkCredential().Password}
        Check-Status $reply 200 "Login $label"
        $tokens[$label]=$reply.Json.accessToken
    }
    Check-Status (Send-Request 'GET' '/api/v1/customers' $null $manifest.companyA $null) 401 'Unauthenticated customer list'
    $group=Send-Request 'GET' '/api/v1/me' $tokens['group-admin'] $null $null
    Check-Status $group 200 'Group identity'
    Check-Value (@($group.Json.companies).Count -eq 2 -and @($group.Json.companies | Where-Object {-not $_.readOnly -or $_.accessProfile -ne 'GROUP_READER'}).Count -eq 0) 'Group explicitly reads exactly two companies'
    foreach($company in @($manifest.companyA,$manifest.companyB)) {
        Check-Status (Send-Request 'GET' '/api/v1/customers' $tokens['group-admin'] $company $null) 200 "Group reads company $company"
    }
    Check-Status (Send-Request 'PATCH' "/api/v1/customers/$($manifest.assignedCustomer)/status" $tokens['group-admin'] $manifest.companyA @{version=1;status='ACTIVE'}) 403 'Group business write denied'
    foreach($label in @('owner-a','owner-b')) {
        $ownCompany=if($label -eq 'owner-a'){$manifest.companyA}else{$manifest.companyB}
        $otherCompany=if($label -eq 'owner-a'){$manifest.companyB}else{$manifest.companyA}
        $ownCustomer=if($label -eq 'owner-a'){$manifest.assignedCustomer}else{$manifest.companyBCustomer}
        $me=Send-Request 'GET' '/api/v1/me' $tokens[$label] $null $null
        Check-Status $me 200 "$label identity"
        Check-Value (@($me.Json.companies).Count -eq 1 -and $me.Json.companies[0].companyId -eq $ownCompany -and $me.Json.companies[0].accessProfile -eq 'COMPANY_OWNER') "$label belongs to own company only"
        Check-Status (Send-Request 'GET' '/api/v1/customers' $tokens[$label] $ownCompany $null) 200 "$label reads own company"
        Check-Status (Send-Request 'GET' '/api/v1/customers' $tokens[$label] $otherCompany $null) 403 "$label cross-company denied"
        $current=Send-Request 'GET' "/api/v1/customers/$ownCustomer" $tokens[$label] $ownCompany $null
        Check-Status $current 200 "$label own customer detail"
        # Preserve the fixture's current status; the successful write only advances its version/audit.
        Check-Status (Send-Request 'PATCH' "/api/v1/customers/$ownCustomer/status" $tokens[$label] $ownCompany @{version=$current.Json.version;status=$current.Json.status}) 200 "$label can manage own fixture"
    }
    $sales=Send-Request 'GET' '/api/v1/me' $tokens['sales-multi'] $null $null
    Check-Status $sales 200 'Multi-role sales identity'
    Check-Value (@($sales.Json.companies).Count -eq 1 -and $sales.Json.companies[0].companyId -eq $manifest.companyA -and @($sales.Json.companies[0].roles).Count -eq 3 -and $sales.Json.companies[0].permissions -contains 'pricing:discount:read' -and $sales.Json.companies[0].permissions -notcontains 'order:create') 'Sales has three roles with bounded permissions'
    $list=Send-Request 'GET' '/api/v1/customers' $tokens['sales-multi'] $manifest.companyA $null
    Check-Status $list 200 'Sales customer list'
    Check-Value (@($list.Json).Count -eq 1 -and $list.Json[0].id -eq $manifest.assignedCustomer) 'Sales sees assigned customer only'
    Check-Status (Send-Request 'GET' "/api/v1/customers/$($manifest.assignedCustomer)" $tokens['sales-multi'] $manifest.companyA $null) 200 'Sales assigned customer detail'
    Check-Status (Send-Request 'GET' "/api/v1/customers/$($manifest.unassignedCustomer)" $tokens['sales-multi'] $manifest.companyA $null) 403 'Sales same-company unassigned customer denied'
    Check-Status (Send-Request 'GET' '/api/v1/customers' $tokens['sales-multi'] $manifest.companyB $null) 403 'Sales other company denied'
    Check-Status (Send-Request 'PATCH' "/api/v1/customers/$($manifest.assignedCustomer)/status" $tokens['sales-multi'] $manifest.companyA @{version=1;status='ACTIVE'}) 403 'Sales business management denied'
    Write-Output "Validated $script:checks persistent-fixture checks. Test accounts/data retained; no passwords/tokens logged."
} finally {
    foreach($token in @($tokens.Values)) {
        try {$null=Send-Request 'POST' '/api/v1/user/auth/logout' $token $null $null} catch {Write-Warning 'A verification session could not be logged out; it will expire under the normal session policy.'}
    }
    $client.Dispose()
}
