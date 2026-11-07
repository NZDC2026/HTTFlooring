# 开发 IP 部署记录与生产迁移

2026-11-07开发联调增量：独立 `development-login.py` 已在 `/home/eric/htt-keycloak` 创建并重复检查两realm的 `htt-api-swagger` 客户端及4个DEMO邮箱用户。既有三端客户端和全局realm配置未改。密码位于 `.state/development/demo-login/*.password`（0600，父目录0700），公开subject清单在 `.state/development/demo-bindings.txt`；已绑定HTT Main并完成真实PKCE/Java/PostgreSQL验收。登录、证书、生产禁用和回退详见 [开发登录](../../docs/development-login.md)。仅添加localhost/127.0.0.1的8080/8081精确回调；不启用密码grant/隐式流程，不承诺手机号、三端或生产认证完成。

记录日期：2026-11-06，Asia/Shanghai。用户明确授权在 192.168.10.174 Docker 部署 Keycloak、优先本地 IP。本次实际部署不依赖尚未提供的域名。

## 当前已运行的开发环境

| 项目 | 实际值 |
| --- | --- |
| 地址 / 管理控制台 | https://192.168.10.174:18443 / https://192.168.10.174:18443/admin/ |
| Compose project / 目录 | htt-keycloak-dev / /home/eric/htt-keycloak |
| Keycloak | 26.8.2；quay.io/keycloak/keycloak@sha256:3879c623248408de29a5303178b5816c77e8dfef3890c361f8c0bbeaa979ba3b |
| PostgreSQL | 独立 PostgreSQL 17 容器；postgres@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73 |
| 身份库 / 业务连接账号 | htt_keycloak / htt_keycloak；NOSUPERUSER、NOCREATEDB、NOCREATEROLE，已实查 |
| 数据库端口 | 仅 Compose 内部网络，无宿主机发布端口；没有使用既有 5432 服务 |
| 健康/指标接口 | HTTPS 127.0.0.1:19000 → 9000，仅服务器环回 |
| 持久化卷 / 网络 | htt-keycloak-dev_identity-data / htt-keycloak-dev_identity |
| 资源上限 | Keycloak 2 CPU/2 GiB；PostgreSQL 1 CPU/512 MiB |
| 空闲实测 | Keycloak 499.6 MiB、PostgreSQL 44.39 MiB；一次观测，不代表负载容量 |
| 启动模式 | start（生产运行模式），无 start-dev；开发证书与 DB 网络例外由独立开发文件控制 |
| 其他服务 | ERPNext、原 PostgreSQL、RabbitMQ、Redis 及其他既有容器未重启；未访问 ERPNext HTTP/数据库 |

现有开发栈仅内部 DB 链路使用 sslmode=disable，DB 地址硬限定 `keycloak-db:5432/htt_keycloak`，不暴露宿主机端口。外部身份访问仍是 HTTPS。`compose.yaml` 生产模板不设置开发开关，继续要求 PostgreSQL verify-full TLS。此例外不扩展到 Java 的业务数据库或 JWT 校验。

## 登录和开发 CA

开发 CA SHA-256 指纹：

```text
D7:62:C1:D9:55:8F:02:B3:92:7E:E9:DF:DC:E1:ED:B1:59:08:48:9A:EC:86:21:A1:CF:4F:28:EB:F3:C1:FD:60
```

服务器证书 SAN 为 192.168.10.174、127.0.0.1；有效期至 **2027-02-04 19:02:09（Asia/Shanghai）**，开发 CA 有效期 365 天。公钥 CA 位于服务器 `.state/development/tls/ca.crt`，本工作区已取回 `.cache/htt-keycloak-development-ca.crt`；CA 私钥和服务器私钥均留在服务器私有状态目录，没有下载。

管理账户为 `htt-bootstrap`。随机密码只保存在服务器文件中，未写入文档、环境变量示例、日志或 Git。使用你已有的 SSH 访问权限查看：

```sh
cat /home/eric/htt-keycloak/.state/development/secrets/bootstrap_password
```

该账户用于开发初始化。建立实名运维账户及 MFA 后删除临时账户，收回 bootstrap secret，并调整后续部署不再携带 bootstrap 配置；不要将它当作 HTT 业务管理员。

浏览器首次访问前，应核对指纹并由开发人员在自己的测试环境信任 CA。Windows 可导入当前用户的“受信任的根证书颁发机构”；本次没有自动修改本机证书存储。手机安装/信任 CA 的步骤需按平台执行；Android App 可能还需只在 debug 构建信任该 CA，见 [Android 官方网络安全配置](https://developer.android.com/privacy-and-security/security-config)。这不是开启明文 HTTP 或跳过证书验证的理由；本轮未修改 Flutter/iOS 配置或验证真机。

Java 接入建议使用只供该开发进程使用的 truststore，导入 CA 公钥，然后通过 JVM 的 `javax.net.ssl.trustStore` 和相应密码环境配置加载。不要替换机器所有应用的公共 CA 策略，也不要设置 trust-all。该 truststore 应保留应用需要的其他信任锚。实测 Java 21：默认信任拒绝此 CA，显式加载后 IP SAN 及两个 discovery 地址验证成功。

## Realm 与 API 配置

| realm | 客户端 | API audience |
| --- | --- | --- |
| htt-staff | htt-management-web、htt-flooring-app | htt-staff-api |
| htt-customer | htt-customer-portal | htt-portal-api |

issuer 为 `https://192.168.10.174:18443/realms/<realm>`，JWKS 为 `<issuer>/protocol/openid-connect/certs`，discovery 为 `<issuer>/.well-known/openid-configuration`。Java 标识示例见 `api.development.env.example`；身份开关仍 false，因为真实业务账户绑定、授权和前端登录尚未联调。

三个业务客户端均为公共客户端，启用授权码 + PKCE S256，关闭隐式/密码直授/服务账号。Audience 只加入 access token。开发部署中的回调/Web Origins 仍为明确的 `.invalid` 占位地址，等待前端实际登录流程确认；没有猜测 localhost 端口或扩大通配回调。Keycloak 已运行不代表三端已能登录。

邮箱登录已在 realm 配置允许；手机号与邮箱同账户双标识、手机号验证、SMTP、找回密码和注册仍需实现/验收。模板不含真实用户、公司、权限或业务超级管理员。自助注册/密码找回暂关闭，邮箱验证要求保持开启。

Java 继续从业务库解析动作权限和客户/门店/仓库范围，不信任客户端名称或 Keycloak 角色代替业务授权。正式订单创建规则仍为有效 STAFF 身份、MANAGEMENT 成员、order:create 和资源范围；客户/销售无创建资格。

## 日常命令与备份

在服务器 `/home/eric/htt-keycloak` 执行：

```sh
# 仅全新状态目录执行一次；已有目录时拒绝重建凭据。
python3 manage-development.py init --address 192.168.10.174
python3 manage-development.py up
# 启动后执行；验证 TLS、ready、issuer/JWKS、管理登录和三个客户端配置。
python3 manage-development.py check
python3 manage-development.py backup
# 保留卷和身份数据，只停本栈。
python3 manage-development.py stop
```

`up` 校验 Compose 和已有卷/网络所有权；`check` 校验 TLS，不使用跳过校验参数。初次启动可能需要等待数据库/realm 初始化再运行 check。部署环境需 Python 3.11+、OpenSSL 和 Docker Compose；脚本不调用 sudo、删除卷或改变其他栈。

`.state/development`、secrets/tls/backups 目录权限 0700。两个供非 root PostgreSQL 读取的 secret 文件为 0644，但宿主机父目录不可被其他普通用户遍历；其余密码、私钥文件 0600。容器仅挂载自己需要的 secret 文件。备份包含敏感身份资料，文件 0600，应另外加密并复制到受控备份存储。

备份使用 pg_dump 自定义格式，先写 `.partial`，通过 pg_restore --list 检查后才改为 `.dump` 并生成 SHA-256 文件。本次已生成并验证：`.state/development/backups/20261106T110834430244Z.dump`。仅验证归档可读，**尚未完成隔离恢复演练**。CA 私钥/配置的独立安全备份也需纳入运维；realm JSON 导出不是完整身份库备份。

恢复应在全新隔离 PostgreSQL 实例进行，重建专用角色与 htt_keycloak 库，用匹配版本 pg_restore 恢复并执行 Keycloak/账号检查后切换。脚本没有自动覆盖现有库的 restore 操作。版本升级前保留数据库备份和旧镜像摘要；数据库 schema 升级后不能仅换旧镜像降级。

## 生产环境配置和切换

1. **地址与证书**：确定浏览器/手机/Java 均可访问的正式域名，例如 `https://identity.<正式域名>`，提供受信任的证书链/私钥；替换 IP hostname、开发 CA 和调试信任配置。不要将开发 CA 私钥带入生产。后台管理路径限制到管理网络/VPN，健康/指标端口不公开。
2. **运行配置**：使用 `compose.yaml` 和填写后的 `.env.example`，配置正式镜像版本及 digest；不设置 HTT_KEYCLOAK_DEVELOPMENT，不使用 compose.development.yaml 的无 TLS DB 链路。完成镜像构建优化、升级兼容和健康检查后发布。
3. **独立身份库**：独立 htt_keycloak 库与非超级用户账号，生产可使用独立/托管 PostgreSQL，配置 verify-full 及可信数据库 CA。业务 htt_management 与 ERPNext 仍隔离。使用专用 secret 管理、备份保留、恢复演练及监控，不复用开发密码。
4. **客户端**：将三个客户端回调/Web Origins 改成实际精确地址，移动端 PKCE/回跳/安全存储经过真机验收。已有 realm 的启动 import 会跳过，不会自动覆盖旧配置；使用受审查的管理变更或环境专用 realm 配置，避免反复覆盖用户/会话。
5. **Java**：将 HTT_STAFF/PORTAL_ISSUER 和 JWKS 改成正式域名，audience 与部署中的 mapper 一致。域名改变会改变 issuer；业务库 external_identity 以 issuer+subject 绑定，必须基于确认的 subject 映射显式迁移/重新绑定并审计，不能按邮箱自动合并账户。切换后要求重新登录，不沿用开发 token。
6. **账户流程**：补齐手机号/邮箱双标识、绑定验证、SMTP、密码找回、注册/邀请、MFA 和账号生命周期同步。Keycloak 单独禁用/退出不会自动使 Java 已签 JWT 立即失效，需同步业务账户撤销时间或受控禁用流程。
7. **容量与可用性**：当前单节点资源上限与空闲观测仅用于开发；按登录/刷新/密码操作峰值压测，规划多实例、共享数据库、Keycloak 支持的缓存/集群发现、负载均衡及故障演练。Redis 不会自动接管 Keycloak 会话。三端在线人数、API 并发和 SSE 连接数分别验收。
8. **发布验收**：先隔离环境实际 token → Java → 业务权限/RLS 全链路，含错误 audience/issuer、ID token 拒绝、禁用/撤权、轮换/故障、跨客户/仓库访问，再启用业务身份开关和前端。此轮未执行生产发布。

参考：[Keycloak 下载](https://www.keycloak.org/downloads)、[容器配置](https://www.keycloak.org/server/containers)、[TLS](https://www.keycloak.org/server/enabletls)、[导入限制](https://www.keycloak.org/server/importExport)。

## 本次实测记录

首次启动因为初始化 SQL 未去掉 secret 尾部换行导致密码不匹配；已修正为去除 CR/LF，仅重置新身份库专用账号后重启 Keycloak。最终 readiness、IP TLS/CA、两个 issuer/JWKS、管理登录和三客户端 PKCE/audience 均通过；Java 21 从工作区访问也通过。随后再次仅重启新Keycloak容器，重复check成功，realm/客户端配置保持。没有输出密码/token，也没有访问 ERPNext 业务数据。日志保存在本地忽略目录 `.cache/keycloak-*.log`。
