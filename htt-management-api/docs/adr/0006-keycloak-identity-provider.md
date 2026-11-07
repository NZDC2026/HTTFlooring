# ADR-0006：自托管 Keycloak 身份服务

日期：2026-11-06。状态：用户已授权优先使用内网 IP，Keycloak 26.8.2 已部署至 https://192.168.10.174:18443，独立身份库/TLS/ready/realm/客户端配置通过验证。前端及真实业务登录尚未接入；详见 [部署与生产迁移](../../deploy/keycloak/DEPLOYMENT.md)。

## 责任边界

Keycloak 负责登录、凭据、MFA、身份会话及令牌签发；htt-management-api 继续负责账户启用状态、公司成员、多角色动作权限、资源范围和正式订单管理资格。Keycloak 管理员、realm role、group、client_id 均不能直接授予 Java 业务权限。

标准 OIDC 对接当前 Resource Server，不引入 Keycloak 专用 Java 安全适配层，不把密码存入 user_account。内部账户仍用显式 issuer + subject 绑定；不按邮箱自动合并账户。

## 身份域与客户端草案

以下名称已实际导入；回调仍为占位地址，等待前端流程确认。

| 身份域 | 客户端 | API audience | 说明 |
| --- | --- | --- | --- |
| htt-staff | htt-management-web | htt-staff-api | 管理 Web；仅登录来源，不代表管理权限 |
| htt-staff | htt-flooring-app | htt-staff-api | Flutter 员工 App；销售仍无订单创建资格 |
| htt-customer | htt-customer-portal | htt-portal-api | 客户门户；必须使用自己的公司/客户 Grant |

两个 realm 使用不同 issuer。员工两个客户端可经 audience mapper 共用员工 API audience；因此当前 staff/portal 各一个 audience 的 Java 配置可沿用，不需要为本方案实现 Cognito client_id 集合。必须通过真实 token 验证 aud/iss/exp/iat/sub、签名及跨域拒绝。

API audience 仅加入 access token，不加入 ID token；客户端 ID 与 API audience 不同，避免误用 ID token 访问业务 API。Audience mapper 仅分配到指定客户端，不作为业务权限映射。该方案依据 Keycloak 的 [Audience 配置](https://www.keycloak.org/docs/latest/server_admin/index.html#_audience)。

SPA 和移动端建议用公共客户端、Authorization Code + PKCE S256，无前端 client secret，精确登记回调和 Web Origins，禁用隐式及直接密码授权。登录页面、回调、移动端安全存储和刷新/退出 UX 需另行确定具体前端修改范围；本轮保留原有前端行为。Keycloak 官方说明公共客户端不能安全保管客户端密钥，并要求限制回调地址：[JavaScript adapter](https://www.keycloak.org/securing-apps/javascript-adapter)。

## Java 配置映射

开发 AUTH_ORIGIN 已确定为 https://192.168.10.174:18443；生产替换为正式 HTTPS 域名并迁移 issuer 绑定。

| 配置 | 设计值 |
| --- | --- |
| HTT_STAFF_AUTH_MODE / HTT_PORTAL_AUTH_MODE | OIDC |
| HTT_STAFF_ISSUER | AUTH_ORIGIN/realms/htt-staff |
| HTT_STAFF_AUDIENCE | htt-staff-api |
| HTT_STAFF_JWKS_URI | AUTH_ORIGIN/realms/htt-staff/protocol/openid-connect/certs |
| HTT_PORTAL_ISSUER | AUTH_ORIGIN/realms/htt-customer |
| HTT_PORTAL_AUDIENCE | htt-portal-api |
| HTT_PORTAL_JWKS_URI | AUTH_ORIGIN/realms/htt-customer/protocol/openid-connect/certs |
| HTT_AUTH_ENABLED | 保持 false，完整验证后再启用目标环境 |

固定可信 issuer/JWKS，使用 RS256；不根据请求中的 issuer 动态发现服务器。端点结构依据 [Keycloak OIDC endpoints](https://www.keycloak.org/securing-apps/oidc-layers)。域名需要同时被 Java、浏览器和测试移动设备解析并信任证书，不能通过关闭 TLS 校验解决。

## 部署边界与前置条件

测试主机已检查并按本轮明确授权部署独立 htt-keycloak-dev 栈，未访问 ERPNext HTTP/数据库或变更其他容器。开发采用 IP SAN 本地 CA 证书，未关闭 Java HTTPS 校验或安装系统 CA；由开发人员显式信任开发 CA。独立 PostgreSQL 容器不发布宿主机端口，不复用业务库。

拟独立部署 Keycloak，使用自己的数据库和运行账号，不能混入 htt_management/htt_management_validation 的业务 schema，更不能复用 ERPNext 数据库。Keycloak 自行管理其 schema 生命周期；Java Flyway 不管理 Keycloak 内部表。数据库名、账号及资源限制在部署计划中固定后实施。

部署需固定经过验证的镜像版本/摘要，配置受信任 HTTPS hostname、密钥管理、健康检查、重启/备份策略；不能以 start-dev 作为正式部署。管理控制台仅限管理网络。单节点测试不代表已满足生产高可用。依据：[Keycloak 生产配置](https://www.keycloak.org/server/configuration-production)、[数据库配置](https://www.keycloak.org/server/db)。

“内网优先”意味着测试阶段在 LAN/VPN 内访问；客户门户未来是否面向公网仍待确认，不能假设外部客户能够访问当前内网 issuer。

## 撤权及账户维护

Java 已实现数据库账户禁用、权限/范围每请求重查和 tokens_valid_after。Keycloak 禁用用户或退出登录，不能直接等同于 Java 已撤销所有已签发 JWT；需要明确生命周期同步策略和验收。

下一阶段需设计受控的账户禁用/恢复流程，同时维护 Keycloak 与 Java 账户状态；数据库权限变更仍在下一请求生效。若仅在 Keycloak 管理台禁用账户，当前 Java 没有事件同步或逐次 introspection，不能承诺立即失效。短期 token 有效期只能缩小时间窗口，不能代替同步。

不开放第一个注册用户自动成为管理员；客户注册/邀请、员工创建、MFA、找回密码、邮件服务及初始授权名单尚需业务确认。

## 下一阶段验收顺序

1. 补齐主机 OS/运行时/容量、内网域名与证书、三端回调地址、管理员和账户维护流程，形成可审查的部署配置。
2. 在明确的服务变更范围内部署独立测试 Keycloak、专用数据库和两个 realm；限制端口与管理网络，不影响 ERPNext。
3. 创建仅用于验证的员工、销售、客户账户与最小业务绑定，用真实 access token 调用两个 /me；验证管理 Web 与移动客户端的共同员工 audience 及跨 realm 拒绝。
4. 将真实 HTTP 安全链与验证库连起来，验证撤权、禁用、审计、错误 audience/ID token、密钥轮换；无生产订单 API，订单资格仍通过受控测试用例验证。
5. 在明确前端修改范围和 UX 后接入真实登录。先客户门户与销售 App，再管理端；同时补齐完整 API 迁移矩阵。

回滚：部署前仅有设计文档；部署后保留数据库与备份，停止新身份服务并恢复对应环境配置，Java 关闭认证开关时仍拒绝业务请求。版本回退必须遵循 Keycloak 自身数据库兼容要求，不能只换旧容器镜像后假定数据库可以降级。主库 V3 应用和业务迁移不属于本次身份服务选型动作。
