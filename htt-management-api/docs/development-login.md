# 本地运行与Swagger登录

IDEA具体配置和换电脑完整步骤见 **[开发环境与换机手册](development-setup.md)**。用户已确认IDEA按database,development配置运行后可用；新机器需重新准备本机凭据和证书，不能只复制旧DPAPI文件。

2026-11-07实测：4个真实Keycloak测试账户已绑定Main。授权码PKCE邮箱密码登录→Java→Main的四个me成功；各客户仅返回本人门店、跨公司403、匿名/错误realm401通过。最终94项普通、15项真实PG及JAR通过，日志 `.cache/development-login-final-verify.log`、`.cache/development-login-real-auth.log`。浏览器证书导入和实际点击未代用户执行；三端E2E、手机号/找回/退出撤销同步仍未完成。

**端口选择**：本轮8080已有进程，未停止它；使用 `./scripts/Start-Development.ps1 -Port 8081` 验收，打开 **http://localhost:8081/swagger-ui/index.html**。下方默认8080同样支持。Swagger开发客户端仅登记localhost/127.0.0.1的8080、8081四个精确回调和来源，不接受通配地址。

当前日常开发库为 `192.168.10.174:5432/htt_management`，身份服务为 `https://192.168.10.174:18443`。本轮只接通开发测试账号和Swagger，不修改三端现有登录机制、不提供Java密码登录API。手机号登录/找回与生产账户管理尚未完成。

## 1. 一次性信任开发证书

项目忽略目录已有公开证书 `.cache/htt-keycloak-development-ca.crt`。丢失时可从服务器获取公开CA（不是私钥）：

```powershell
scp eric@192.168.10.174:/home/eric/htt-keycloak/.state/development/tls/ca.crt .cache/htt-keycloak-development-ca.crt
```

核对CA SHA-256指纹：`D7:62:C1:D9:55:8F:02:B3:92:7E:E9:DF:DC:E1:ED:B1:59:08:48:9A:EC:86:21:A1:CF:4F:28:EB:F3:C1:FD:60`。将该开发CA导入你当前用户的受信任根证书，供本机浏览器访问Keycloak：

```powershell
Import-Certificate -FilePath .cache/htt-keycloak-development-ca.crt -CertStoreLocation Cert:\CurrentUser\Root
```

这是你手动执行的一次性开发信任操作；本轮未修改系统或用户证书库。Java启动脚本另建只含该CA的专用truststore，不关闭TLS/主机名校验。证书更新时先核对管理员公布的新指纹，再更新脚本和本地truststore。生产使用正式域名及受信任证书，不复用开发CA。移除开发环境时可在当前用户证书管理器删除该CA；删除前核对指纹和用途。

## 2. 本地启动

使用Java 21，先停止你自己此前占用8080的旧应用。项目根目录执行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
./scripts/Start-Development.ps1
```

脚本加载当前Windows用户的Main DPAPI凭据，用database,development配置启动；仅监听127.0.0.1:8080，启用真实认证和门店查询，关闭通知。Ctrl+C停止。若无JAR，先运行 `./mvnw.cmd verify`。不得同时启用local，它会排除数据库。

打开 **http://localhost:8080/swagger-ui/index.html**，应看到3条接口：

- GET /api/v1/me
- GET /api/portal/v1/me
- GET /api/portal/v1/branches

## 3. 获取测试密码与登录

| 用途 | 邮箱 | Swagger授权项 |
| --- | --- | --- |
| 管理人员 | manager@htt-demo.invalid | staff |
| 销售 | sales@htt-demo.invalid | staff |
| 客户A | customer-a@htt-demo.invalid | portal |
| 客户B | customer-b@htt-demo.invalid | portal |

四个随机密码只保存在服务器私有目录，分别为 `manager.password`、`sales.password`、`customer-a.password`、`customer-b.password`。例如自行查看客户A密码：

```powershell
ssh eric@192.168.10.174 "cat /home/eric/htt-keycloak/.state/development/demo-login/customer-a.password"
```

其他账户替换最后的文件名。不要提交密码、复制进YAML或分享带令牌的截图。这些`.invalid`邮箱是人工验证的合成账号，emailVerified仅用于绕过未配置的SMTP验证；不代表真实邮箱验证流程已实现。

Swagger点击Authorize，选择staff或portal对应项，保留client_id=`htt-api-swagger`，不填client_secret，选openid后授权。页面跳到Keycloak输入上表邮箱和对应密码，登录后回到Swagger。密码发给Keycloak，API请求只携带Authorization Bearer；不在URL传令牌。员工令牌不能用于门户接口，反之亦然。

Swagger Logout仅清除Swagger持有的令牌，不等于Keycloak退出或Java令牌立即失效。重新授权请求prompt=login以便切换账户；若浏览器仍保留旧状态可使用无痕窗口。令牌不持久化到Swagger本地存储。

## 4. 验证客户门店

先以customer-a登录portal，调用 `/api/portal/v1/me`，应有一个contexts项。将其中companyId和grantId分别填入branches的 `X-Company-Id`、`X-Portal-Grant-Id`：只返回DEMO-A1，不返回同客户未授权的DEMO-A2。客户B只返回DEMO-B1。

客户A的演示公司ID：`a75c3ffa-fb41-b804-9126-8d91f637b71e`；Grant ID：`49313516-d20e-ffc9-59ff-b9a7eb215d3f`。以实际me响应为准。省略令牌401，使用别人的公司/Grant403。管理人员/销售使用员工me；本轮没有正式订单创建接口，管理人员具有order:create不会凭空产生订单API，客户/销售均无该权限。

## 维护和回退

服务器脚本：`cd /home/eric/htt-keycloak && python3 development-login.py provision`。只维护有本脚本所有权标记的Swagger客户端；不采纳未知同名用户，不轮换已有密码。用户subject公开清单在 `.state/development/demo-bindings.txt`，下载到本地 `.cache/keycloak-demo-bindings.txt`后可显式绑定：

```powershell
./scripts/database/Use-DemoData.ps1 -Target Main -Action bind -DevelopmentData
# 回退Java身份接入，保留账户/门店/审计
./scripts/database/Use-DemoData.ps1 -Target Main -Action unbind -DevelopmentData
```

bindings使用固定受信任issuer、明确subject及DEMO内部ID，不按邮箱自动合并。若需清理演示数据，先unbind再remove。Keycloak侧可执行 `python3 development-login.py disable` 停用专用demo用户/Swagger客户端，不改其他客户端。disable后provision不自动恢复用户，需由管理员确认启用；密码和数据保留。

生产不启用development profile、不部署Swagger测试客户端、不导入DEMO用户；两realm的实际前端回调/域名、SMTP、手机号与账户生命周期同步另行实施。身份配置依据 [Keycloak Admin REST](https://www.keycloak.org/docs-api/latest/rest-api/index.html)，Swagger采用官方支持的[授权码PKCE配置](https://swagger.io/docs/open-source-tools/swagger-ui/usage/oauth2/)。
