# ADR-0005：认证兼容、公司权限与资源范围

日期：2026-11-05。状态：Java 安全边界及 V3 专用 PostgreSQL 验证通过；实际身份提供方接入和主库迁移待完成，尚不可切换线上认证。

## 范围与证据

初始实现轮遵循当时限制：仅修改 htt-management-api，不连接远程 PostgreSQL、不访问 ERPNext、不修改前端登录。仓库已有 AGENTS.md 和 ADR-0001～0004；未找到 docs/ARCHITECTURE.md、docs/MODULES.md 或独立的本阶段计划文件，因此以用户本轮范围和已有 ADR 为实施依据，不虚构批准记录。后续用户明确授权使用专门准备的测试 PostgreSQL；仅在 htt_management_validation 执行以下数据库验收，不涉及主库、ERPNext 或服务器服务变更。

| 组件 | 代码事实 | 兼容影响 |
| --- | --- | --- |
| 旧员工 API | `../htt-backend/src/Htt.Host.Api/Program.cs` 配置 OIDC/Cognito Bearer JWT；`../htt-backend/src/Htt.Infrastructure/AccessResolver.cs` 用已验证的 issuer + subject 调用 identity.resolve_access | 保留 Bearer 传输；不新增密码、Cookie 或客户端角色登录 |
| 旧公司上下文 | `../htt-backend/src/Htt.Host.Api/ApiInfrastructure.cs` 读取 X-Company-Id，检查有效成员和动作权限，再设事务内公司/用户上下文 | 公司头仅选择公司，不授予访问权 |
| 旧门户 API | `../htt-backend/src/Htt.Host.Api/Portal/PortalAuthentication.cs` 独立 audience；PortalEndpoints.cs 使用 X-Portal-Grant-Id；`../htt-backend/src/Htt.Infrastructure/Database/Migrations/018_customer_portal.sql:174` 定义 portal.me | 保留独立 audience、grant ID 和 contexts；dataAsOf 在响应顶层 |
| 客户门户 | `../customer-portal/src/data/localAccount.ts:20` 使用浏览器存储及本地密码校验；App.tsx 的 RequireAccount 读取本地账户 | 这是本地演示会话，不可映射为已认证的服务端用户。本轮不修改该机制，不声称已完成真实登录接入 |
| 销售 App | `../htt_flooring_app/lib/services/visit_backend.dart:51` 发送 Bearer 与 X-Company-Id；sales_visit_screen.dart:84 调用 /api/v1/me 选择公司；app_session.dart:28 定义 setEmployeeAccessToken | 全 lib 搜索只找到 token setter 定义，未找到真实登录流程调用它。保留传输契约，不把演示身份升级为服务端身份 |

旧后端直接订单创建使用 `sales.orders.create`，报价批准转换使用另一个权限。按用户本轮明确要求，新权限统一为 `order:create`。本记录更新 ADR-0002 中的旧权限码；不自动把旧角色或旧权限映射成新授权。旧权限迁移必须单独审核，前端当前登录机制未改变。

## 模型与依赖

```text
platform/security → Spring Security 标准扩展点（不依赖 identity 内部类）
identity/IdentityConfiguration → JWT 校验 → AccessRepository → PostgreSQL 限定函数
identity/CurrentUserController → ResourceAccess → 权限 + 资源归属 → AccessAudit
未来业务用例 → ResourceAccess.requireCreateOrder → 自己的事务与数据仓储
```

- user_account 是统一内部账户；external_identity 以受信任 issuer + subject 唯一绑定账户及 STAFF/CUSTOMER 身份域。不会以邮箱自动合并账户。
- company_member 是账户在公司的成员关系，拥有独立 membership_id、状态及 member_kind。一个成员可经 member_role 关联多个公司内角色，动作权限为有效角色权限的并集。角色名仅用于管理和展示。
- member_kind 是服务端维护的业务身份属性，默认 UNCLASSIFIED。CUSTOMER、SALES、OPERATIONS 和 UNCLASSIFIED 均不具备正式订单创建资格。MANAGEMENT 是必要条件之一，不会自动授予权限或范围。
- resource_grant 与 grant_branch 明确 COMPANY、CUSTOMER、BRANCH 范围；复合外键阻止跨公司角色、跨客户门店授权。门户忽略 COMPANY 级授权，并必须选择属于自己的 X-Portal-Grant-Id。
- 客户/门店真实归属由存储查询，不能使用请求体中声称的公司/客户归属。门店范围可以访问已授权父客户的摘要，但不意味着可以列出该客户其他门店的数据。
- 目前没有正式订单表。ORDER 归属函数返回 NULL，生产读取默认拒绝；未来订单必须保存 company_id/customer_id/branch_id 并使用复合外键及可靠的归属查询。测试中的订单归属和处理器仅为授权测试夹具。

只增加四个动作目录项：customer:read、branch:read、order:read、order:create。不会创建演示账户、角色、成员、权限分配或资源授权；不会实现身份管理 CRUD。

## 请求流程和强制规则

1. HTT_AUTH_ENABLED 默认 false；未配置时保留原有业务默认拒绝策略。启用要求两个明确 HTTPS issuer/JWKS 地址及不同 audience，且必须存在 JDBC 和已验证迁移。
2. JWT 仅接受固定受信任 JWKS 的 RS256；校验签名、issuer、有效期、subject、iat。OIDC 校验 API audience；Cognito 校验 token_use=access 和 client_id。允许 30 秒时钟偏差；不会根据令牌自带 URL 发现身份提供方。
3. API 路径只决定应接受的 audience，不能证明用户身份。数据库中的外部身份绑定仍需匹配对应身份域。JWT roles/scope、X-Role、X-Client、前端隐藏按钮均不参与授权。
4. 每个请求重新读取账户、成员、角色权限及范围；不缓存用户权限、不创建 HttpSession。有效 JWT 不会绕过账户禁用或权限撤回。user_account.tokens_valid_after 可撤销既有 token；禁用账户触发撤销时间更新，重新启用也不会恢复旧 token。
5. 业务路径先要求认证；MVC handler 必须声明 PreAuthorize，否则拒绝。具体读操作必须同时匹配动作权限、所选公司、服务器查询的资源归属和有效范围。
6. 正式订单创建必须同时具备 STAFF 域、有效公司成员、member_kind=MANAGEMENT、order:create、客户和门店匹配及范围覆盖。客户和销售即使误授 order:create 或拥有名为 ADMIN 的角色，仍拒绝。
7. 未来直接创建、报价转换、导入、后台任务必须复用同一订单用例守卫。当前没有这些生产业务入口；不能把测试处理器当成已实现订单 API。当前守卫要求明确门店；无门店订单需求需另行确认，不静默放宽。

认证开启时仅 `/api/v1/**`、`/api/portal/v1/**` 这两个无 Cookie、无 Session 的 Bearer API 范围免 CSRF；其他路径保留原有保护和默认拒绝。未扩大 CORS，未增加刷新令牌、密码登录或浏览器登录重定向。

## 接口及错误兼容

| 生产接口 | 认证与返回 |
| --- | --- |
| GET /api/v1/me | STAFF；companies[] 含 actorId/companyId/companyName/membershipId/permissions；无需公司头 |
| GET /api/portal/v1/me | CUSTOMER；contexts[] 含 companyId/companyName/grantId/grantVersion/customerId/customerCode/customerName；顶层 dataAsOf；无需公司/grant 头 |

除上述身份查询外，没有新增生产客户、门店、订单 API。dataAsOf 是响应生成时间，不是数据同步或通知恢复游标。

沿用 `{code,message,requestId,retryable,fieldErrors}`：未认证、失效或无法映射的身份返回 401；无动作/范围权限返回 403；身份存储、授权存储或 JWKS 服务异常返回 503，错误不暴露令牌、SQL 或数据库信息。权限检查中不存在的资源也返回 403，避免泄露存在性。非法/缺失公司或 grant 头按未获授权处理为 403（旧员工公司过滤器可能返回 400，这是明确的错误语义差异）。不自动建议重试写请求。

OIDC 实际 API audience、Cognito client_id、签名算法及刷新/退出策略尚未提供。实际 IdP 验证和三端联调仍待完成，不应仅凭本地集成测试切换客户端地址。

## 数据库与审计边界

新增 V3，不改写 V1/V2。扩展 user_account/company_member，新增：

| 表 | 职责 |
| --- | --- |
| identity.external_identity | 外部身份显式绑定 |
| identity.permission | 动作目录 |
| identity.role、identity.role_permission、identity.member_role | 公司内多角色与权限 |
| identity.resource_grant、identity.grant_branch | 用户在公司的客户/门店数据范围 |
| platform.access_audit | 追加访问决策审计 |

运行角色不能直接查询或修改新安全表，不能改变 member_kind，也不能删除审计。resolve_access、resource_owner、append_access_audit 为限定 SECURITY DEFINER 函数：迁移角色拥有、固定 pg_catalog search_path、无动态 SQL、撤销 PUBLIC 执行权限。身份解析函数仅允许在 Java 完成 JWT 验证后调用；数据库不自行验证 JWT。持有运行角色凭据者处于受信任服务边界，需妥善隔离凭据。

既有业务表 RLS 目前是公司级保护，不能冒充已完成客户/门店级 RLS。未来真实业务查询仍必须显式按已授权范围约束列表、详情、搜索、聚合、导出；在用例事务中设置经过验证的 actor/company 的 transaction-local 上下文，不把用户头直接写入上下文。

审计持久化 requestId、已验证 actorId、所选公司、动作、资源 ID、ALLOW/DENY 和时间；不含 JWT、密码、请求体、查询参数。记录 ALLOW 表示授权通过，不代表业务提交成功。安全决策审计使用 REQUIRES_NEW 独立事务，拒绝记录不随外层业务事务回滚；审计存储失败则拒绝继续执行。未来业务变更审计、幂等记录和 Outbox 仍与业务变更同事务。外层事务回滚后审计仍持久化的行为已在真实 PostgreSQL 集成测试中通过。

撤权保证为下一请求重新检查，不承诺中断已经在执行的请求。未来业务写事务在提交前必须再次确认相关成员/授权版本，并约定并发撤权的锁顺序或乐观版本策略。当前不新增订单写事务。未来 IAM 管理操作必须递增范围版本并写变更审计；本轮不新增可写 IAM 接口。

每次请求有一次身份查询，具体授权另有归属查询和审计写入。当前不引入权限缓存，避免失效一致性问题；部署前需基于实际流量测试连接池、审计保留期及网关限流，不能让匿名审计无限增长。未来外层业务事务内调用独立审计会占用额外连接，池容量与并发上限必须一起验收，不能直接沿用小池无限并发。多实例共享 PostgreSQL，无粘性会话要求。

## 限定修改清单

- pom.xml：仅增加 Boot 管理的 Security OAuth2 Resource Server starter。
- src/main/java/com/htt/management/identity/：AccessSnapshot、VerifiedUser、AccessRepository、AccessAudit、ResourceAccess、AuthenticationProperties、IdentityConfiguration、CurrentUserController、ApiPolicyConfiguration，共 9 个有实际职责的类。
- platform/security/SecurityConfiguration.java：条件接线、方法安全、默认拒绝。
- platform/web/ApiExceptionHandler.java：存储异常 503。
- src/main/resources/application.yml、.env.example：默认关闭的身份配置，无真实凭据。
- src/main/resources/db/migration/V3__identity_authorization.sql：新增迁移，后续已应用专用验证库；不可再改写。
- src/test/java/com/htt/management/identity/AuthenticationIntegrationTests.java：生产安全链集成测试。
- src/test-postgres/java/com/htt/management/PostgresBaselineIT.java：V3、权限解析和 SQL 隔离验证。
- README.md、docs/adr/README.md、本 ADR：当前状态、兼容说明与验证入口。

初始实现轮无前端、旧后端、AGENTS.md、V1/V2、远程库或 ERPNext 修改。后续验证轮仅应用专用验证库 V3、执行及清理合成测试数据，未修订 Java 或 SQL；仓库更新限于 README、ADR 索引、本记录和数据库说明。所有原有未提交改动保留。

## 验收、回滚和未完成事项

常规测试使用真实 RSA 签名 JWT、生产验证器/过滤器/方法授权；只替换存储及审计依赖。覆盖未登录、客户/销售越权、授权管理者、无权限管理者、客户/门店/公司隔离、门户 grant、双 audience、撤权与禁用、旧 token 撤销、伪造角色/客户端头、无方法策略、身份/审计/JWKS 故障。测试解码器委托真实 Nimbus 签名验证，不使用跳过签名的 mockJwt 注入。

PostgreSQL 测试覆盖多角色解析、权限/范围撤销、账户禁用和撤销时间、跨公司角色/门店 FK、运行角色禁止修改 IAM、审计追加权限、授权审计在外层事务回滚后仍保留和 V1～V3 幂等。禁止使用主库试验；后续按用户明确授权使用 dedicated 模式，固定为 htt_management_validation，不自动回退其他数据库。

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' verify
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it test-compile
# 仅本机 Docker 可用后运行；不得自动回退远程库。
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=container' verify

# 本次实际执行：用户已明确授权的专用测试 PostgreSQL。
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
$env:HTT_AUTH_ENABLED = 'false'
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
```

实际结果：初次本地容器测试因无 Docker 失败；后续专用 PostgreSQL 服务验证成功，40 项普通测试（其中认证与授权集成测试 17 项）及 8 项数据库集成测试全部通过，零失败/错误/跳过，JAR 已生成。V3 成功应用验证库；重复 migrate、运行账号 validate、真实 Spring Boot/JPA/readiness 启动均通过，临时 API 随测试关闭。只读核对确认 17 张业务/安全表全部启用 RLS，测试账户、角色、业务及审计记录已清理，只保留 4 个权限目录项；V3 函数无 PUBLIC 执行权限。没有部署远程容器，没有访问主库或 ERPNext；未连接实际身份提供方或联调客户端。日志为 `.cache/auth-dedicated-validation.log` 和 `.cache/auth-dedicated-inspection.log`。

回滚：本地变更可按清单恢复并保留既有用户改动；不得全仓 reset/clean。关闭 HTT_AUTH_ENABLED 并重启会拒绝业务访问，而非开放接口。V3 已应用验证库，保留表及迁移历史，后续问题追加修复迁移，不得改写 V3、Flyway clean 或以回退 Java 文件代替数据库回滚。主库未迁移；其后续部署仍需相应授权、备份及验收。应用启动仍仅校验迁移，因此 V3 未部署的数据库会校验失败；不能把新构建直接指向原有 V1/V2 库。

待确认：实际 staff/portal IdP 配置与 RS256、用户映射、哪些成员明确属于管理人员、角色动作矩阵、客户/门店授权分配、旧权限迁移、审计保留期、浏览器真实登录/移动端 PKCE 接入及长连接撤权策略。当前没有 SSE/会话刷新/跨请求授权缓存实现。

依据：[Spring Security JWT Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)、[方法授权](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html)。实际 Maven 解析确认 Boot 4.1.2 使用 Spring Security 7.1.2；未手工覆盖 Spring Security 版本。
