# 项目进度复核与下一阶段输入

最新复核日期：2026-11-07（Asia/Shanghai）。依据源码、迁移、实际报告，不按目录或依赖存在判断业务完成。下方保留此前阶段历史。

**开发真实登录（最新）**：已创建4个Keycloak DEMO用户、2个独立Swagger客户端并绑定Main；真实邮箱密码授权码PKCE→Java JWT校验→Main权限/数据查询通过。4个me、客户各自门店、跨公司403、匿名/错误realm401通过。development配置实测显示3条接口，专用Java truststore；浏览器CA需用户手动信任。最终94项普通/15项真实PG、JAR通过，日志 `.cache/development-login-final-verify.log`、`.cache/development-login-real-auth.log`。未改三端原客户端或前端；手机号/找回/退出撤销同步、三端E2E仍待完成。见 [开发登录](development-login.md)、[本轮范围与回退](plans/development-login.md)。下方“实际IdP未联调”“无业务绑定”属于早期记录，不再作为DEMO当前状态，也不能据此推断生产登录完成。

**日常业务库统一（最新）**：用户确认当前均为开发/测试环境；Main=`htt_management`用于日常应用/人工验收。只读盘点起点V1/V2且业务表全空，验证库92项普通/15项PG与JAR通过后，Main已显式应用V3～V6并validate成功；演示数据现只保留Main，Validation演示数据已定向清理。Main运行账号启动及readiness UP通过，临时进程停止。新增显式迁移入口/空库schema准备脚本，生产一个HTT业务库即可，自动化库不属于生产依赖。真实业务登录仍未完成。见 [数据库现状和生产建表](database.md)、[演示数据](demo-data.md)、[ADR-0010](adr/0010-development-business-database.md)。下方“Main未迁移”和“演示数据在Validation”为历史记录。

**开发演示数据（2026-11-07）**：用户授权后，已在专用 `htt_management_validation` 保留两家 DEMO 公司、两个客户、三个门店和四个内部账户及角色/范围。脚本事务演练（含定向清理）通过，随后92项普通/15项真实PG测试及JAR构建通过，再写入并重新连接检查。没有Keycloak用户或外部身份绑定，尚不能登录；无财务/库存/通知演示数据。主库、ERPNext与前端未改。详见 [演示数据与清理命令](demo-data.md)，构建日志 `.cache/demo-data-verify.log`。下方“测试数据均已清理”是早期自动化验收记录，当前另有这组人工演示数据。

**最新门户切片**：仅CTX-002 GET /api/portal/v1/branches完成后端迁移与兼容验收；92项普通测试、15项真实PG测试通过，JAR成功。V6仅应用专用验证库，测试数据/访问审计清理。前端当前无HTTP调用，未接线/部署；真实数据、授权及主库迁移尚未完成。完整接口进度见 [门户清单](migration/customer-portal.md)，文件/命令/回退见 [本轮计划](plans/customer-portal-branches.md)。

**最新通知复核**：独立业务事件发布配置已从通知开关拆出；71项普通测试与JAR构建通过，7项真实PostgreSQL/RabbitMQ容器测试通过，覆盖新增真实HTTP/SSE+RSA+实际身份仓储/RLS的恢复/隔离切片。临时容器已清理，没有修改业务主库、既有基础服务或迁移。FCM仍为Fake，真机、实际业务模板/接收者及容量验收待完成。详见 [本轮文件/测试/回滚](plans/notification-verification.md)。

**最新增量**：用户已确认 HTT 共享库存表为三端和后续ERP的权威来源。V5四张新表及内部PostgreSQL读取实现已完成，验证库V1～V5/28张RLS表核对通过；最终69项普通测试、14项真实PG测试通过，库存测试数据清理。Keycloak26.8.2已部署至 https://192.168.10.174:18443，独立身份库、IP开发CA、TLS/ready/realm/JWKS/管理登录/三客户端配置及Java21可信访问通过，备份归档可读。详细变更/回滚见 [当前阶段](plans/shared-inventory-and-keycloak.md)、[库存](adr/0008-shared-postgresql-inventory.md) 和 [开发到生产部署](../deploy/keycloak/DEPLOYMENT.md)。

库存授权查询/商品建立/出库用例、三端真实接线仍未实现，主库未应用V3～V5。Keycloak开发服务已经可用，真实手机号/邮箱业务登录、Java身份绑定、客户端回调与生产配置尚未完成。下方此前68/11/6等记录属于各自历史验证，不替代本次结果。

上一阶段记录（已被上方最新增量推进）：补齐架构/模块/阶段计划、依赖检查和库存来源契约；当时来源未知、Keycloak仅准备模板，无新表。随后用户明确统一库存主表并授权IP部署，已按最新增量执行。此前架构记录见 [ADR-0007](adr/0007-inventory-and-erp-boundary.md)。

本阶段最终结果：`mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository clean verify` 通过，68 项普通测试，零失败/错误/跳过，JAR 构建成功。其中新增架构 5 项、库存契约 4 项、Keycloak 模板 3 项；进一步限制库存 api/Controller 不能直接调用来源端口后，定向 5 项架构测试再次通过。`-Ppostgres-it,notification-it test-compile` 成功编译 11 个测试源文件；本轮没有重新执行远程 PostgreSQL/RabbitMQ 集成测试，历史 11/6 项结果不算本轮验收。Bash 语法及 5 项启动前拒绝检查通过；未启动 Keycloak 或执行 Docker Compose 配置/导入验收。

日志：`.cache/inventory-keycloak-final-verify.log`、`.cache/module-architecture-final-test.log`、`.cache/inventory-keycloak-it-compile.log`、`.cache/inventory-boundary-test.log`。JAR 已核对只有 notification.OutboxStore，无旧 platform.events.OutboxStore 或 ArchUnit 运行时依赖。当前文件/回退边界见阶段计划；不使用全仓 reset，保留既有未提交改动。

后续通知任务已实现 Outbox、消费去重/重试/死信、渠道任务、Fake Push、本人历史/设备/已读和认证 SSE；V4 已应用专用验证库，56 项普通测试、11 项 PG 测试、6 项真实 RabbitMQ 容器测试通过。用户授权 SSH/Docker 后已部署独立 RabbitMQ/Redis 测试栈，交付生产 TLS/备份脚本并通过冒烟；FCM/APNs 未真机验证，功能默认关闭。详见 [通知模块](notification.md) 和 [部署说明](../deploy/infra/README.md)。

当前结论：工程、数据库/认证授权基础、库存结构和Keycloak开发部署已实现；尚未完成真实业务登录和三端迁移，不能替换旧 htt-backend。Keycloak当前范围见 [ADR-0006](adr/0006-keycloak-identity-provider.md)。

## 当前阻塞与未开发的区别

Docker、SSH、RabbitMQ/Redis及Keycloak开发环境均已就绪。开发Keycloak已用IP和开发CA提供HTTPS，不再等待域名才能部署。真实业务登录仍缺三端精确回调、初始公司/账户/授权及手机号/邮箱双标识、验证/找回与生命周期同步；生产域名/证书另按部署文档配置。

真实移动推送还缺 Firebase/移动端配置、iOS APNs 配置及真机验收；目前 Fake Provider 返回 SIMULATED。Java 身份/通知开关默认关闭、模板为空，不能据基础测试通过就直接接入真实用户。

完整 API 矩阵、三端业务用例、订单/财务/库存、Redis 应用接线、API 正式部署/CI及十万在线容量验收属于尚未完成的实施工作，并非 Docker 环境故障。主库最后已知为 V1/V2，未实时复核；V3/V4 在验证库完成，主库迁移与切换尚未实施。

## 已完成且有验证证据

| 项目 | 实际能力 | 证据/边界 |
| --- | --- | --- |
| Java 工程 | Java 21、Boot 4.1.2、Maven Wrapper、可执行 JAR、YAML、统一根包 | pom.xml、应用入口、普通 verify |
| 开发基础 | local/test 配置、健康检查、本地 OpenAPI、统一错误及 requestId | platform、LocalApplicationTests、ApiExceptionHandlerTests |
| 数据库基础 | V1/V2 的 9 张公司/用户/客户/产品/仓库基础表；运行与迁移账号分离、RLS | db/migration/V1/V2、docs/database.md |
| 认证授权模型 | V3 的外部身份、多角色权限、公司成员类型、客户/门店范围、访问审计 | V3__identity_authorization.sql、identity 包 |
| JWT 校验 | OIDC/Cognito Bearer、固定 issuer/JWKS、签名/有效期/audience 校验，忽略客户端角色声明 | IdentityConfiguration；尚未连接实际 IdP |
| 访问控制 | 动作权限 + 公司/客户/门店归属；每请求重新查询账户/成员/权限/范围；撤销时间 | ResourceAccess、AccessRepository、数据库解析函数 |
| 正式订单权限守卫 | STAFF + MANAGEMENT + order:create + 数据范围；客户/销售误获权限仍拒绝 | 安全集成测试；不是已实现正式订单业务 |
| 身份查询 | GET /api/v1/me、GET /api/portal/v1/me；保持已有公司/Grant 选择字段 | CurrentUserController；默认认证开关关闭 |
| 审计 | 持久化访问决策，独立事务保留拒绝记录，不记录 token/密码 | AccessAudit；真实 PostgreSQL 回滚测试通过 |
| 通知模块 | 事务 Outbox、消费去重/重试/死信、任务/审计、历史/已读/设备、SSE 恢复与多实例分发 | 普通、真实 PG 和真实 RabbitMQ 测试；FCM 仍为 Fake |
| 测试库验证 | 专用htt_management_validation已应用V1～V6；V6不增加表，既有28张业务/安全表RLS；本轮账户/客户/门店/Grant/审计合成数据清理 | 15项真实PG及事后只读核对 |
| 基础服务 | 独立 htt-infra-test RabbitMQ 4.3.7 / Redis 8.6.8，环回端口、独立随机账号/卷 | SSH/Docker 实测、ACL 与健康检查；没有复用 ERPNext Redis |
| 生产部署基础 | 镜像 digest、双向 TLS、资源/日志限制、持久化、冷备份与保留卷停止脚本 | TLS 正向/负向、Java AMQP mTLS、vhost 隔离、备份校验和 RDB 完整性；不是正式云端上线 |
| Keycloak开发服务 | 26.8.2、IP HTTPS/CA、独立PG、两realm三客户端、管理登录及重启检查通过 | 开发可用；业务账户、手机/邮箱登录和前端未联调 |
| 当前测试结果 | 92项普通、15项dedicated PG；此前7项真实RabbitMQ结果保留，本轮未重跑broker | 真实门户/Keycloak业务用户/真机与容量仍待验收 |

安全测试使用真实 RSA 签名与 Nimbus 验证，存储和审计为受控替身。数据库测试独立验证真实 SQL、权限、撤销及审计事务；二者不能等同于真实 IdP、HTTP、安全链和 PostgreSQL 已完成一体化联调。

## 早期认证复核记录（历史：43 项普通 / 8 项 PostgreSQL）

发现 REQUIRES_NEW 审计无法创建事务时会抛 TransactionException，不属于此前捕获的 DataAccessException。新回归测试先复现：两个过滤器错误路径异常外抛，订单方法授权错误路径返回 500。

已修改 IdentityConfiguration 与 ApiExceptionHandler，使认证失败、HTTP 拒绝、方法授权三条路径均在审计事务失败时返回统一 503，并阻止业务执行。新增 3 项集成测试；未改登录协议、权限规则、接口或数据库结构，未改写 V3。

本次执行 `mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository verify`：43 项普通测试全部通过，其中认证与授权测试 20 项；JAR 打包成功。日志 `.cache/status-review-verify.log`。复现日志 `.cache/auth-audit-transaction-before.log`。本轮没有重新访问数据库；此前 8 项 PostgreSQL 成功结果为 2026-11-05 的独立验收记录。

回滚仅撤回上述两个实现文件、AuthenticationIntegrationTests 及本轮文档差异；保留其他用户改动和数据库历史，不全仓 reset/clean。

## 尚未完成

| 优先级 | 未完成项 | 目前缺口/验收条件 |
| --- | --- | --- |
| P0 | 身份服务生产配置与业务联调 | 开发Keycloak已部署及验证；生产域名/证书、恢复/容量及真实业务登录待完成 |
| P0 | 手机号/邮箱密码登录 | 用户已要求该方式；同账户双标识、手机号格式/唯一性、绑定验证及找回方案待实现和验证 |
| P0 | 初始用户及授权配置 | 尚无实际公司、用户绑定、管理人员名单、角色分配和客户/门店授权；没有 IAM 管理 API/维护 CLI |
| P0 | 三端真实登录 | 门户仍为浏览器本地演示账户；Flutter 有 Bearer 传输但未找到 token setter 的登录调用；管理端接入也未迁移 |
| P0 | 真实认证全链路 | IdP 签发 token → Java HTTP → 实际 PostgreSQL → 权限/审计；需验证刷新/退出、密钥轮换、故障和多客户端 |
| P0 | 多客户端身份配置 | 当前 staff/portal 各一个 audience；Keycloak 员工两个客户端共享员工 API audience，门户用独立 issuer/audience；配置和负向测试待完成，不能把客户端作为角色 |
| P0 | IdP/业务账户生命周期同步 | Java 数据库禁用及撤权已实现，但 Keycloak 管理台禁用/退出尚不能同步 Java 撤销已有 JWT；需受控维护流程或事件同步 |
| P1 | 全量迁移清单 | 本仓库没有覆盖三个前端全部请求、模型、模拟数据和旧实现的完整接口矩阵；现有认证比较不是全量业务盘点 |
| P1 | 完整业务迁移阶段计划 | ARCHITECTURE、MODULES 和当前库存前置阶段计划已补齐；全量 API 矩阵、业务确认后的全程切换/验收计划仍未完成 |
| P1 | 共享库存查询 | HTT统一库存表已确认；V5/PG读取已验证，商品建立/发布、授权API、inventory:read/仓库授权及过账未实现。地区不等于公司/仓库，未知不等于零 |
| P1 | 客户门户/销售 App 业务 API | 门户CTX-002门店列表已迁移验收；其余客户详情/产品/仓库/拜访等仍未完成，客户端未接线 |
| P1 | 真实业务数据隔离 | CTX-002已验证客户/Grant/显式门店范围及RLS；其他列表/搜索/导出等仍需逐用例落实 |
| P1 | 正式订单和报价转换 | 没有订单表、生产创建/转换接口、版本/幂等/业务事务；订单测试处理器不在生产 JAR 中 |
| P1 | 主库 V3/V4 与部署 | 主库最后已知为 V1/V2，本轮未复核；不能把新 JAR 直接接入。未部署远程 API/反向代理及完整运维体系 |
| P1 | 通知链路验收 | 可靠链路、Fake Push/SSE、历史及真实 broker 测试已通过；FCM/APNs、实际身份/模板/权限配置及容量验收未完成 |
| P2 | 财务与其他运营 | 发票、应收、付款、贷项、库存流水等未移植；总账/BAS/对账/工资范围仍需甲方确认，不能按旧代码默认启用 |
| P2 | 上线工程 | 基础服务生产部署、TLS 和备份脚本已交付验证；Java API 正式部署/CI、生产灾难恢复、容量/审计保留与旧库切换方案仍未完成 |

源码现有CurrentUserController、NotificationController和默认关闭的PortalBranchController；其他客户业务与正式订单控制器尚未迁移。健康检查/本地OpenAPI属于基础设施；本轮只改htt-management-api。

## 下一阶段：落实自托管 Keycloak 方案

建议沿用标准 OIDC 身份服务，Java 继续负责公司成员、动作权限、客户/门店归属和订单资格；密码、登录验证及身份凭据生命周期交给身份服务。不在本轮追加自制密码/令牌签发体系。

| 方案 | 适用前提 | 需要承担的工作 |
| --- | --- | --- |
| 托管 Amazon Cognito（未采用） | 接受 AWS 托管与相应费用/网络依赖；账户和预算明确 | 身份池/客户端、域名、邮件、MFA、恢复流程及环境隔离配置；业务权限仍保留在 Java |
| 自托管 Keycloak（用户已选定） | 内网优先、自行托管 | 独立数据库/账号、HTTPS、域名、补丁、备份与可用性；不能直接借用 ERPNext 或默认开发模式上线 |

Cognito 支持授权码 + PKCE，AWS 官方将其用于公共客户端；悉尼区域 ap-southeast-2 提供 Cognito endpoint。该信息不代表已创建 AWS 资源或核算费用。依据：[AWS 客户端配置](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)、[区域端点](https://docs.aws.amazon.com/general/latest/gr/cognito.html)。Keycloak 自托管需生产 HTTPS、hostname 与可靠数据库配置，依据：[Keycloak 生产配置](https://www.keycloak.org/server/configuration-production)。

已选定方向下的设计草案（待部署与实际令牌验收）：

1. 员工与客户用两个 Keycloak realm 隔离；管理 Web、Flutter、客户门户分别配置客户端及回调。内部 user_account 显式绑定外部身份，不按邮箱自动合并。
2. 纯 SPA/移动端采用公共客户端与授权码 + PKCE，不在前端存 client secret；管理端若采用 BFF/服务端会话则另行评审，不能在当前 Bearer 策略中悄悄混入 Cookie 认证。
3. 登录界面与跳转/刷新方式需单独确认；本轮不改已有前端页面或登录流程，也不能把演示会话当真实登录兼容方案。
4. Java 的权限守卫保持不变，通过 Keycloak audience mapper 支持员工的两个客户端，并增加实际令牌回归测试。IdP groups 或登录来源不能直接授予 order:create。
5. 使用专用验证库和明确的合成账户做完整联调；账户、公司/客户/门店映射及管理人员资格必须显式配置，无默认超级管理员。

| 子步骤 | 输入 | 修改边界 | 交付/验收 | 回退 |
| --- | --- | --- | --- | --- |
| 认证决策 | 托管偏好、AWS/运维条件、域名、账户流程要求 | 本仓库决策文档和配置示例 | 明确 provider、身份域、三端客户端、回调、刷新/退出方案 | 不创建资源，无运行影响 |
| Java 接线准备 | 已选 provider 和明确配置 | identity 配置/校验、相关测试和文档；必要时单独新增迁移 | 单/多客户端验证、错误 issuer/audience/realm 拒绝；现有订单资格规则不变 | 关闭认证并恢复本轮代码，仍默认拒绝 |
| 验证库全链路 | 实际 IdP、合成用户和授权范围 | 验证库的受控测试数据、集成测试；不改主库 | /me、撤权、禁用、跨客户/门店隔离和审计通过；清理测试数据 | 移除测试绑定/授权，保留迁移和必要审计 |
| 前端联调 | 已确认登录 UX 与具体前端修改范围 | 本轮暂不修改兄弟仓库 | 真登录、刷新/退出、公司选择及权限错误正确处理 | 恢复对应前端版本/环境指向 |

在选型与授权模型之外，完整接口矩阵应先于业务迁移完成；按 customer-portal、htt_flooring_app、htt-management 的优先级逐批交付，不先实现未确认财务模块。
