# 开发环境、IDEA运行与换机手册

更新日期：2026-11-07。适用Windows、PowerShell、Java 21及当前HTT内网开发环境。本文记录已验证的运行方式；不包含实际密码，不会在换机时重新创建服务器资源。生产部署另见 [数据库迁移](database.md) 和 [Keycloak部署](../deploy/keycloak/DEPLOYMENT.md)。

## 1. 当前运行关系与配置选择

| 项目 | 当前配置 |
| --- | --- |
| 工程名/主类 | htt-management-api / com.htt.management.HttManagementApiApplication |
| 技术基线 | Java 21、Spring Boot 4.1.2、Maven Wrapper；以pom.xml和Wrapper为准 |
| 当前工作目录 | D:\projects\HTTFlooring\htt-management-api；换机可以不同，但IDEA路径需同步调整 |
| 日常开发/人工验收数据库 | 192.168.10.174:5432/htt_management；当前是开发测试环境，不是生产 |
| 自动化数据库验证 | htt_management_validation，或Testcontainers；不能把故障测试指向日常业务库 |
| Keycloak | https://192.168.10.174:18443 |
| 员工issuer / audience | https://192.168.10.174:18443/realms/htt-staff / htt-staff-api |
| 客户issuer / audience | https://192.168.10.174:18443/realms/htt-customer / htt-portal-api |
| Swagger开发客户端 | 两realm各自的htt-api-swagger，公开客户端、授权码PKCE S256，无client secret |
| 本地API监听 | 127.0.0.1；开发Swagger精确支持8080或8081 |

| Active profiles | 用途 | 业务接口与Swagger |
| --- | --- | --- |
| local | 无数据库/RabbitMQ的启动冒烟 | Swagger可以打开，但业务Controller默认不注册，paths为空 |
| database | 连接真实开发数据库 | 默认不开放Swagger，认证/门店等未显式启用时仍关闭 |
| database,development | 日常开发、IDEA调试、真实测试登录 | 启用认证、门店与Swagger，通知关闭；本轮应显示3条API |

不要组合local与database/development：local会排除数据源等自动配置。不能通过permitAll、关闭JWT校验或URL token解决接口接入。

## 2. 换机前要保留哪些内容

当前工作区存在未提交/未跟踪文件。普通git clone只获取已提交内容；换机前核对 `git status --short`，由你决定提交或安全备份全部需要的源码、脚本和文档。本手册不代表已提交或推送。不要为转移代码把密钥一起提交。

| 内容 | 换机处理 |
| --- | --- |
| pom.xml、mvnw/mvnw.cmd、.mvn/wrapper、src、scripts、docs、deploy、README、AGENTS | 通过确认后的版本控制或完整源码备份转移，包括需要的未跟踪文件 |
| .cache/repository、.cache/maven、target | 可不复制，新机联网重新构建；旧缓存不是源码交付物 |
| .local/main-database.xml、validation-database.xml | DPAPI绑定原Windows用户/机器，不能当成可移植凭据；新机重新加密保存现有角色凭据 |
| .cache/htt-keycloak-development-ca.crt | 公开CA可重新从服务器获取；核对指纹后使用 |
| .local/keycloak-development.p12 | 只含公开开发CA的Java truststore，可在新机重建；不能因此复制服务器私钥 |
| .idea及运行配置 | 新机按本文重建；有密码的运行配置不共享、不提交 |
| .cache/keycloak-demo-bindings.txt | 仅DEMO绑定维护时需要，可重新下载公开subject清单；普通运行不需要 |
| 服务器数据库、Keycloak用户、DEMO账户绑定、测试密码文件 | 保留服务器现状；换开发电脑不需重建、重置或重新seed |
| 服务器.state中的CA私钥、TLS私钥、数据库/管理员密码、备份 | 不随源码搬运到开发机；由服务管理员维护 |

## 3. 新机器的工具和网络

安装JDK 21、Git、IDEA、Windows OpenSSH客户端和可用PowerShell。`java`、`keytool`应来自同一JDK；Maven使用仓库Wrapper，不要求另装全局Maven。

进入新机器的项目根目录后：

```powershell
java -version
keytool -help
./mvnw.cmd -version
Test-NetConnection 192.168.10.174 -Port 5432
Test-NetConnection 192.168.10.174 -Port 18443
Test-NetConnection 192.168.10.174 -Port 22
New-Item -ItemType Directory -Path .local,.cache -Force | Out-Null
```

Java必须是21。5432供业务数据库连接，18443供真实登录/JWKS访问；22仅用于获授权的SSH/scp维护和读取测试密码。新机器应能访问同一内网或VPN，不要修改ERPNext或共享防火墙来碰运气。SSH首次连接需通过可信管理员核对主机指纹，不关闭StrictHostKeyChecking。

## 4. 新机恢复数据库运行凭据

`.local/main-database.xml`是PowerShell Export-Clixml保存的PSCredential。原电脑可由原Windows用户解密；新机需要从授权维护人/秘密管理工具安全获取**现有角色密码**。不要在聊天、Git、YAML或终端历史中粘贴真实密码。

下面示例在新机通过安全提示输入现有Main角色密码，并加密保存为当前用户可加载的格式。它只写本地忽略文件，不连接数据库、不创建角色、不修改服务器密码。当前加载器会核对运行和迁移两个角色的元数据，因此此维护示例同时请求两者；只有获授权的维护人员应持有迁移凭据。应用实际运行只使用App密码。

```powershell
# 在项目根目录运行；若新机已配置成功，不重复覆盖
$databaseName = 'htt_management'
$credentialPath = Join-Path (Get-Location) '.local/main-database.xml'
if (Test-Path -LiteralPath $credentialPath) {
    throw '凭据文件已存在，请先核查，不自动覆盖。'
}
New-Item -ItemType Directory -Path .local -Force | Out-Null
$appCredential = Get-Credential -UserName 'htt_management_app' -Message '输入现有应用角色密码'
$migrationCredential = Get-Credential -UserName 'htt_management_migrator' -Message '输入现有迁移角色密码'
if ($appCredential.UserName -ne 'htt_management_app' -or
    $migrationCredential.UserName -ne 'htt_management_migrator') {
    throw '角色名与目标库不匹配。'
}
$databaseCredentials = [pscustomobject]@{
    Database = $databaseName
    Url = 'jdbc:postgresql://192.168.10.174:5432/htt_management?sslmode=prefer&connectTimeout=5&socketTimeout=30&ApplicationName=htt-management-api'
    App = $appCredential
    Migration = $migrationCredential
}
$databaseCredentials | Export-Clixml -LiteralPath $credentialPath
Remove-Variable appCredential,migrationCredential,databaseCredentials
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
```

预期只打印Loaded Main database environment，不输出密码。加载器校验精确URL/数据库/用户名，示例URL不能随意删掉或更改连接选项。当前服务器业务连接尚未启用强制TLS（sslmode=prefer并不保证加密）；生产按数据库文档配置verify-full，不把开发连接当生产安全配置。

Validation若需要，使用相同流程另存 `.local/validation-database.xml`，Database、URL和两个角色名全部换成 `htt_management_validation`、`htt_management_validation_app`、`htt_management_validation_migrator`。不要只改文件名却仍使用Main目标。

已有服务器库换机时，**不要运行New-DatabaseSecrets.ps1生成新密码，也不要重跑DatabaseAdmin.java provision**。前者是新资源的密码生成器，不会同步修改既有数据库密码；后者只允许初始化不存在的新库/角色。若原密码确实不可恢复，需明确安排密码轮换并更新所有使用者，不能把新机导入失败当作重建数据库的理由。

如果只从秘密管理服务注入环境变量，Java本身不要求DPAPI文件；提供HTT_DB_URL、HTT_DB_USERNAME和HTT_DB_PASSWORD即可在IDEA中运行。现有Start-Development.ps1会调用本地DPAPI加载器，因此使用该脚本仍须准备上述文件。

## 5. 重新准备Java与浏览器证书

```powershell
New-Item -ItemType Directory -Path .cache,.local -Force | Out-Null
scp eric@192.168.10.174:/home/eric/htt-keycloak/.state/development/tls/ca.crt .cache/htt-keycloak-development-ca.crt
keytool -printcert -file .cache/htt-keycloak-development-ca.crt
```

核对CA SHA-256指纹：

```text
D7:62:C1:D9:55:8F:02:B3:92:7E:E9:DF:DC:E1:ED:B1:59:08:48:9A:EC:86:21:A1:CF:4F:28:EB:F3:C1:FD:60
```

只有核对正确且仍有效后，才在你自己的当前用户浏览器信任库导入：

```powershell
Import-Certificate -FilePath .cache/htt-keycloak-development-ca.crt -CertStoreLocation Cert:\CurrentUser\Root
```

这是手动的一次性信任操作，不是应用自动修改系统证书。需要时重启浏览器；使用独立证书库的浏览器还需按其设置核对信任。浏览器访问Keycloak必须无证书错误，不能靠跳过警告作为验收。

Java使用独立truststore，不复用浏览器信任设置。首次运行Start-Development.ps1会核对固定CA指纹并创建它；如果先配置IDEA，可手动创建：

```powershell
if (Test-Path .local/keycloak-development.p12) {
    throw 'truststore已存在，请先核对内容，不覆盖。'
}
keytool -importcert -noprompt -alias htt-development `
  -file .cache/htt-keycloak-development-ca.crt `
  -keystore .local/keycloak-development.p12 -storetype PKCS12 -storepass htt-public-ca
```

`htt-public-ca`只保护包含公开CA的证书库完整性，不是数据库、业务用户或私钥密码。不要导出服务器CA/TLS私钥。CA或服务器证书到期/轮换时，管理员先确认新证书和指纹，再更新启动脚本中的固定指纹、浏览器信任及Java truststore；当前脚本不会自动覆盖已存在的旧truststore。主机IP/issuer变更还涉及Keycloak及数据库issuer/subject映射，不是仅改hosts即可。

## 6. 首次构建和命令行启动

新机器没有旧缓存，首次构建不要加-o：

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
./mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' verify
```

成功后得到 `target/htt-management-api-0.0.1-SNAPSHOT.jar`。网络受限需配置可用的Maven镜像/代理或可信离线依赖包；不要通过改依赖版本绕过下载失败。现有DemoData工具查找.cache/repository里的驱动，使用上面仓库路径可保持一致。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
./scripts/Start-Development.ps1 -Port 8080
# 如果8080被你其他程序占用，改用下面一条；不要同时启动两次
# ./scripts/Start-Development.ps1 -Port 8081
```

Ctrl+C停止。脚本组合database,development，用Main运行账号和专用truststore启动。它使用已有JAR，修改源码后需重新构建；IDEA直接运行主类则使用IDEA编译后的类。

## 7. IDEA直接运行/调试

用IDEA打开含pom.xml的工程根目录，导入Maven。Project SDK、Module SDK以及Maven导入/运行JDK使用21；依赖以pom.xml和Wrapper为准。IDEA需要能够解析Spring Boot/Maven依赖。

进入Run → Edit Configurations，复制原HTT Management API - Local，或新增Spring Boot配置。没有Spring Boot配置类型时，可使用Java Application并填写相同主类和参数。[IDEA官方运行配置说明](https://www.jetbrains.com/help/idea/run-debug-configuration-spring-boot.html)

| 配置项 | 填写值 |
| --- | --- |
| Name | HTT Management API - Development |
| JRE | Java 21 |
| Main class | com.htt.management.HttManagementApiApplication |
| Use classpath of module | 包含上述主类及Maven依赖的htt-management-api模块 |
| Working directory | 你当前机器的htt-management-api工程根目录 |
| Active profiles（Spring Boot配置） | database,development |
| Program arguments | --server.port=8080；备用端口8081需同时修改浏览器地址 |
| Before launch | 保留Build，启动前编译 |

Java Application没有Active profiles字段时，把 `--spring.profiles.active=database,development` 另加到Program arguments。清除其他地方残留的local profile，包括VM options、Program arguments、环境变量SPRING_PROFILES_ACTIVE和IDEA属性覆盖项。不要同时留下两组冲突的profile设置。

在Modify options中显示VM options，填写下列两项。**换机必须把第一项改为新工程路径**；此处路径是当前机器示例：

```text
-Djavax.net.ssl.trustStore=D:/projects/HTTFlooring/htt-management-api/.local/keycloak-development.p12
-Djavax.net.ssl.trustStorePassword=htt-public-ca
```

路径含空格时给整个VM参数加双引号。浏览器信任CA不能替代Java这两项；Java信任也不会自动解决浏览器的证书错误。

### 导入运行环境变量

在IDEA PowerShell Terminal或独立PowerShell中，从项目根目录执行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
Set-Clipboard -Value "HTT_DB_URL=$env:HTT_DB_URL;HTT_DB_USERNAME=$env:HTT_DB_USERNAME;HTT_DB_PASSWORD=$env:HTT_DB_PASSWORD;HTT_AUTH_ENABLED=true;HTT_PORTAL_BRANCHES_ENABLED=true"
```

打开该运行配置的Environment variables编辑器，用粘贴功能导入上述5项。数据库应用账号是htt_management_app，不是postgres或迁移账号。运行配置不需要HTT_DB_MIGRATION_*。

**Terminal进程中的环境变量不会自动传给IDEA的Run进程。** `.env.example`也不会被Spring Boot或Maven自动读取。不要因为Terminal加载成功，就省略IDEA环境变量导入。清除运行配置里残留的HTT_AUTH_ENABLED=false、HTT_PORTAL_BRANCHES_ENABLED=false或错误数据源；不要直接把冒烟用.env.example整份当作业务开发配置。

不勾Store as project file，不共享含密码的运行配置；默认仅保存本机.idea/workspace.xml（已忽略）。不要截图/提交密码。粘贴结束后清空剪贴板：

```powershell
Set-Clipboard -Value ''
```

停止你之前启动的同端口旧应用，再Run或Debug新配置。不要看到端口冲突就终止不明进程。Run和Debug使用同一份环境/VM参数，可在Controller/用例中打断点；业务数据依然在共享开发库，不能把调试误当隔离测试。

## 8. 启动验收与Swagger登录

日志应包含激活database、development两profile和正确端口，不应包含local。打开所选端口的：

| 地址（以8080为例） | 预期 |
| --- | --- |
| http://localhost:8080/actuator/health/readiness | status UP |
| http://localhost:8080/v3/api-docs | paths包含当前三个API，而非空对象 |
| http://localhost:8080/swagger-ui/index.html | 展示API及staff/portal两种Authorize选项 |

当前API为GET /api/v1/me、GET /api/portal/v1/me、GET /api/portal/v1/branches。以后新增接口以实际代码和接口迁移清单为准，不能据此预期所有旧后台API已迁移。

测试账号：manager@htt-demo.invalid、sales@htt-demo.invalid使用staff；customer-a@htt-demo.invalid、customer-b@htt-demo.invalid使用portal。获取客户A随机密码的维护命令：

```powershell
ssh eric@192.168.10.174 "cat /home/eric/htt-keycloak/.state/development/demo-login/customer-a.password"
```

其他账户替换最后的文件名。密码不在仓库，不是SSH密码，也不是Keycloak管理员密码。Swagger Authorize选对应项，client_id保持htt-api-swagger，不填secret，选openid后在Keycloak输入邮箱/密码。授权后先me，再将本人contexts的companyId/grantId填入branches请求头。客户A只能看DEMO-A1，B只能看DEMO-B1。员工令牌用于门户会401，其他客户/公司范围会403。Logout只清除Swagger令牌，不等于Keycloak会话退出或全局令牌撤销。

换机沿用服务器现有用户和绑定，不需要运行provision、seed、bind。完整账户说明、维护和解除绑定见 [开发登录](development-login.md) 与 [演示数据](demo-data.md)。

## 9. 常见问题

| 现象 | 核对与处理 |
| --- | --- |
| Swagger打开但没有API | 看当前实际进程/profile；local冒烟本来无业务接口，改database,development，确认启用认证/门店，浏览器打开正确端口 |
| 浏览器仍是旧结果 | 确认访问的是IDEA新进程端口，而不是其他旧应用；刷新/v3/api-docs，不凭页面标题判断版本 |
| 缺少HTT_DB_PASSWORD或连接失败 | IDEA是否导入环境变量、用户名是否为App角色、DPAPI是否属于当前用户、5432是否可达 |
| Import-Clixml无法解密 | 不复制旧DPAPI文件直接用；按第4节重新保存现有角色凭据，不能生成不匹配的新密码 |
| PKIX path building failed / SSLHandshakeException | IDEA VM options的truststore路径是否是新机器真实路径、CA是否匹配/有效；不能关闭TLS校验 |
| Keycloak页面证书警告 | 在浏览器当前用户信任库正确导入已核对CA，检查IP SAN和到期时间；Java参数不影响浏览器 |
| invalid_redirect_uri | 仅支持localhost/127.0.0.1:8080或8081的精确swagger-ui/oauth2-redirect.html；任意新端口/主机名必须明确登记，不加通配 |
| 401 | 是否Authorize、是否正确staff/portal、access token是否过期、Keycloak账号是否有Java绑定；不使用管理员控制台token或ID token |
| 403 | 身份已确认但动作/公司/客户/Grant不允许；用本人me返回的上下文，不以角色名或请求头补权限 |
| Flyway校验失败/待迁移 | 确认代码版本和目标库；先在隔离库验证，再由迁移账号显式升级。禁止改历史脚本、baseline或clean |
| 端口占用 | 停止自己的旧Run配置，或改精确支持的8081；不要启动多个应用后混淆访问地址 |
| 新机Maven-o失败 | 首次没有缓存，去掉-o联网构建；不要改版本来规避依赖下载 |

## 10. 继续开发与生产边界

普通构建 `./mvnw.cmd verify`；数据库集成测试只能选本地Testcontainers或显式加载Validation凭据后运行 `./mvnw.cmd -Ppostgres-it -Dhtt.test.database=dedicated verify`。Main启动只validate，不自动migrate，任何已验证迁移的发布步骤见database.md。真实RabbitMQ测试有独立环境要求，不能把普通测试通过写成真实推送完成。

生产不使用development/local profile，不导入开发CA、Swagger客户端或DEMO种子；从秘密管理服务注入角色凭据，准备正式域名/证书并核对身份映射。未来生产只需一个HTT业务库，自动化验证库不进入生产运行依赖；Keycloak自己的身份存储独立维护。手机号/找回、三端正式接入和账户生命周期同步仍需后续实施。

本文依据当前脚本及用户已确认可运行的IDEA配置整理；本轮仅更新文档，没有在另一台新机器执行完整迁移演练、改远程服务或重跑业务测试。新机按以上步骤完成readiness、真实登录和授权门店查询后，才算该机器配置完成。
