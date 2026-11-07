# HTT Management API

日常运行、IDEA Run/Debug配置和换机接续，请先看 **[开发环境与换机手册](docs/development-setup.md)**，包含DPAPI凭据恢复、Java/浏览器证书、Maven构建、Swagger登录及故障排查。

**本地真实登录已接通（开发DEMO）**：4个Keycloak测试用户已绑定 `htt_management`，邮箱密码+授权码PKCE→Java→Main的me/门店/越权验收通过。运行 `./scripts/Start-Development.ps1 -Port 8081`，打开 http://localhost:8081/swagger-ui/index.html；证书信任、密码获取和操作见 **[开发登录](docs/development-login.md)**。最终94项普通/15项真实PG及JAR通过。下方“业务身份未绑定”是早期状态；三端接入、手机号及生命周期同步仍待完成。

HTT三端共用的Java后端。当前有工程/数据库、Bearer身份与资源权限、独立通知和内部库存读取；客户业务本轮只完成CTX-002门店只读切片，订单/财务API尚未迁移。

2026-11-07最新：按用户要求，日常开发/人工验收统一使用 **`htt_management`**，现已V6并保留最小演示数据；Validation只做自动化隔离测试，人工演示数据已清理。92项普通/15项真实PG测试、JAR和Main运行账号readiness验证通过。生产只需一个HTT业务库，通过Flyway脚本建表。见 [数据库启动及生产建表](docs/database.md)、[演示数据](docs/demo-data.md)。真实业务登录仍待Keycloak账户绑定。

[门户门店API](docs/migration/customer-portal.md)保留旧响应/范围/错误/限流，HTT_PORTAL_BRANCHES_ENABLED默认false；前端尚未接入。文件、精确命令与回滚见 [门户计划](docs/plans/customer-portal-branches.md)。下方迁移范围和测试数量保留各阶段历史。

最新通知复核：业务事件发布配置独立于通知开关，71项普通测试/构建及7项真实PG/RabbitMQ容器测试通过；新增真实HTTP/SSE、RSA身份、RLS、跨客户/门店和Last-Event-ID补偿的同链路验收。FCM仍为Fake，未真机验证。文件清单/命令/回滚见 [通知阶段记录](docs/plans/notification-verification.md)，渠道和部署说明见 [通知文档](docs/notification.md)。

库存阶段进展：共享库存V5及PostgreSQL读取已通过专用验证库验收（14项真实PG测试），该阶段69项普通测试/JAR构建通过。Keycloak已运行于 **https://192.168.10.174:18443**；开发CA、凭据位置、运维及生产域名/配置切换详见 [部署记录](deploy/keycloak/DEPLOYMENT.md)。三端共用库存表的字段、数量语义和未实施用例见 [ADR-0008](docs/adr/0008-shared-postgresql-inventory.md)。没有新增业务HTTP路由或变更前端登录。

分层与依赖见 [架构](docs/ARCHITECTURE.md)、[模块及数据所有权](docs/MODULES.md) 和 [本阶段计划](docs/plans/shared-inventory-and-keycloak.md)。内部库存来源已接入同一PostgreSQL余额表，授权查询API/出库事务仍待实施；ERPNext未访问或集成。下面保留各阶段历史验收记录。

2026-11-06 通知增量：实现事务 Outbox、RabbitMQ 消费/去重/重试/死信、渠道任务、Fake FCM、本人历史/设备/已读接口及认证 SSE。V4 已应用专用验证库；56 项普通测试、11 项真实 PostgreSQL 测试、6 项真实 RabbitMQ Testcontainers 测试全部通过。后者已在用户提供的 Linux Docker 服务器执行，临时测试容器已清理；FCM/APNs 未真机验证。配置、接口、Nginx 和多实例说明见 [通知模块](docs/notification.md)。功能默认关闭，未知领域事件/模板未自动启用。

基础服务已在 192.168.10.174 隔离部署 htt-infra-test（RabbitMQ/Redis），端口仅环回绑定，随机凭据留在服务器私有状态目录。已准备并验证 [生产部署脚本](deploy/infra/README.md)：镜像 digest、双向 TLS、资源限制、持久化、ACL、健康检查、冷备份及保留卷停止。生产 TLS 冒烟栈已停止，测试证书状态不能用于正式生产；Redis 尚未接入 Java 缓存或会话逻辑。

2026-11-06 早期复核记录：当时用户刚选择 Keycloak、尚未部署；后续本轮已完成开发部署，当前状态见 [进度清单](docs/STATUS.md)。早期认证复核补齐审计事务失败的统一 503 处理，当时43项普通测试通过；后续通知增量为56项普通、11项PostgreSQL和6项真实RabbitMQ测试。这些历史结果不替代最新69项普通/14项PG验收。

认证实现轮未修改前端登录或访问远程服务。随后用户明确授权使用专门准备的测试 PostgreSQL：V3 已在 `htt_management_validation` 应用并通过验证，没有操作主库或 ERPNext，也没有部署新容器或更改服务器服务。应用启动仍仅校验迁移。

## 本轮认证与授权

完整协议比较、模型、实现阶段 20 个修改文件清单、接口/表、权限规则及回滚见 [ADR-0005](docs/adr/0005-authentication-authorization.md)。实际可信 issuer/audience/JWKS 未提供，`HTT_AUTH_ENABLED=false` 默认拒绝业务访问。V3 已通过专用验证库验收；启用仍需要目标库迁移就绪及显式身份/角色/范围分配，不生成默认管理员。

- 保留 Bearer、X-Company-Id、门户 X-Portal-Grant-Id；提供 GET /api/v1/me 与 GET /api/portal/v1/me。
- 每次请求重查账户、公司成员、角色权限与数据范围。客户/销售即使误授 order:create 也不能创建正式订单；必须是明确 MANAGEMENT 成员并同时满足权限及资源范围。
- 客户门户仍是浏览器本地演示登录；销售 App 的真实 token 获取链路未接通。本轮没有改动两个前端，也不声称已完成登录联调。
- 订单创建/报价转换集成测试使用测试专用处理器；生产尚无订单创建接口或订单表。

实际验证（2026-11-05）：初次本地容器验证因无 Docker 失败；随后按用户授权执行 `-Ppostgres-it -Dhtt.test.database=dedicated verify`，40 项普通测试（含 17 项认证与授权集成测试）及 8 项真实 PostgreSQL 集成测试全部通过，零失败、零错误、零跳过，可执行 JAR 已生成。V3 在专用验证库成功应用；重复迁移无新增执行，运行账号 Flyway 校验及真实 JPA/readiness 启动通过。该结果来自既有 PostgreSQL 服务，不是容器测试成功。

验收后只读核对：验证库 V1～V3 全部成功，17 张业务/安全表启用 RLS；测试账户、角色、业务及审计数据已清理，仅保留 4 个权限目录项。主库未访问或迁移；不得据此直接将新构建连接到主库。

验证日志：`.cache/auth-dedicated-validation.log`、`.cache/auth-dedicated-inspection.log`。报告：`target/surefire-reports`、`target/failsafe-reports`。此前本地验证日志保留在 `.cache/auth-verify.log`、`.cache/auth-postgres-local.log`。

## 环境与构建

- JDK 21；仓库自带 Maven Wrapper 3.10.0。
- Spring Boot 4.1.2，PostgreSQL 驱动、Flyway PostgreSQL 模块、Spring AMQP 由 Boot 管理版本。
- springdoc 3.2.0；兼容依据及验证记录见 [ADR-0001](docs/adr/0001-java-baseline.md)。
- 普通验证不需要 Docker、PostgreSQL 或 RabbitMQ；数据库集成验证使用本机 Docker 或明确选择专用验证库。
- RabbitMQ 选用 Boot 管理的 `spring-boot-starter-amqp`；`local`/`test` 排除 Rabbit 自动配置。通知启用后的消费者/队列和投递流程见上方通知模块说明。

在当前目录运行（Windows 使用 `mvnw.cmd`，Linux/macOS 使用 `./mvnw`）：

```powershell
# 可选：将下载缓存限制在项目内；.cache 已加入忽略规则。
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' verify
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' dependency:tree
```

首次构建需要下载 Maven 和依赖。无需全局安装 Maven。测试报告位于 `target/surefire-reports`；打包产物为 `target/htt-management-api-0.0.1-SNAPSHOT.jar`。

初始化阶段完整验证命令：

```powershell
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' clean verify
```

依赖已缓存时可以增加 `-o` 离线执行。普通构建不会激活 `postgres-it`，也不会调用 Flyway Maven 迁移目标；本阶段不要运行后文历史数据库操作命令。

本次初始化复核结果（2026-11-05）：离线 `clean verify` 成功，23 项普通测试全部通过（0 失败、0 错误、0 跳过）；依赖树确认 Boot/AMQP 4.1.2、Flyway 12.4.0、PostgreSQL JDBC 42.7.14。打包 JAR 使用 `local` 环境启动，readiness 返回 `200 / UP`，匿名业务访问返回 `401`，验证后已停止。没有执行数据库集成测试或访问远程服务。日志位于 `.cache/bootstrap-final-verify.log`、`.cache/bootstrap-dependencies.log` 和 `.cache/bootstrap-local-jar.log`。

## 本地启动

```powershell
java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

默认仅监听 `127.0.0.1:8080`，按 Ctrl+C 退出。`local` 是无基础设施的开发/技术冒烟配置：不创建 DataSource、不运行 Flyway/JPA、不创建 RabbitMQ ConnectionFactory，也不启用 Rabbit 健康检查。它不代表数据库和消息系统已就绪，不能用于业务部署。

`.env.example` 提供无密码、无远程地址的环境变量示例。Spring Boot/Maven 不自动加载 `.env`；通过 IDE 的环境变量设置，或在 PowerShell 中显式设置：

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:SERVER_ADDRESS = '127.0.0.1'
$env:SERVER_PORT = '8080'
java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar
```

`.gitignore` 已忽略 `.env`、`.env.*`、`.local/`、`.cache/` 和构建输出，同时允许提交 `.env.example`。普通测试显式激活独立 `test` 配置；安全测试不会因为本地 Swagger 开放策略而放宽默认业务权限。

| 路径 | 本地结果 |
| --- | --- |
| `GET /actuator/health` | 仅 `{"status":"UP"}`，不公开组件或连接信息 |
| `GET /actuator/health/liveness` | 进程存活状态 |
| `GET /actuator/health/readiness` | 本地 profile 仅检查应用就绪状态 |
| `GET /v3/api-docs` | OpenAPI，当前无业务路径 |
| `GET /swagger-ui/index.html` | Swagger UI |
| 其他路径，例如 `GET /api/v1/me` | 未认证 401；不会重定向登录页 |

默认 profile 关闭 OpenAPI/Swagger，并要求显式提供 PostgreSQL 连接配置；没有配置时启动失败，不回退到内存数据库。默认 readiness 包含数据库检查。API 启动只校验 Flyway 历史，迁移必须用独立账号显式执行。没有预设身份提供方、演示管理员或自动生成密码。认证关闭时保留默认拒绝及 CSRF；认证开启后仅两个无 Cookie 的 Bearer API 路径范围免 CSRF，仍强制身份和方法授权，未扩大跨域权限。V3 未部署前不能把新构建直接指向 V1/V2 数据库。

## 历史数据库配置（不属于本阶段初始化）

此前任务已配置 `192.168.10.174:5432` 为主数据库服务器。`database` profile 默认连接独立的 `htt_management` 库；应用账号与迁移账号分离，密码保存在 Git 忽略的 Windows DPAPI 加密文件中。没有把管理员密码写入配置。当前阶段明确禁止连接远程数据库，以下仅保留历史维护说明，不能据此扩大当前任务授权。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=database
```

当前 PostgreSQL 17.11 的连接未启用 TLS，使用 `sslmode=prefer`；没有更改服务器配置。ERPNext 8093 未访问。完整表清单、凭据使用、迁移命令、验证及回滚见 [数据库说明](docs/database.md) 和 [ADR-0004](docs/adr/0004-postgresql-databases-and-access.md)。

## PostgreSQL 验证

```powershell
# 前置条件：本机 Docker 正常；不得使用远程 Docker context / DOCKER_HOST。
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it verify

# 或显式使用已授权的独立验证库；测试拒绝主库和不匹配的账号。
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
```

该 Maven profile 添加 `src/test-postgres/java`。默认 Failsafe 启动一次性 `postgres:17-alpine`，运行后销毁容器；拒绝远程 Docker，没有 Docker 会失败。专用验证模式必须显式指定，检查服务器、库名、角色及用途标记，验证库测试记录结束后按 UUID 清理。两种方式都不会回退主库或复制旧库。测试报告位于 `target/failsafe-reports`。

第一阶段历史验证记录（2026-11-05；后续数据库验收见下方数据库说明）：

| 检查 | 实际结果 |
| --- | --- |
| `clean verify` | 成功；22 项测试，0 失败、0 错误、0 跳过，生成可执行 JAR |
| `dependency:tree` | 成功；AMQP 4.1.2、Flyway 12.4.0、PostgreSQL JDBC 42.7.14、springdoc 3.2.0 |
| `-Ppostgres-it test-compile` | 成功；数据库测试源码与 Testcontainers 2.0.5 可编译 |
| `-Ppostgres-it verify` | 普通 22 项测试通过；数据库测试因 `Could not find a valid Docker environment` 失败，PostgreSQL 运行验证尚未完成 |

此前 Docker 环境限制通过本轮获授权的专用验证库解决；本地容器路径仍保留。测试中故意触发的一次内部异常会产生 ERROR 日志，结果以 Surefire/Failsafe 报告为准。安装依赖时存在上游 Maven 前缀元数据仓库的 401 警告，不影响本次实际依赖解析与构建；不需要为此配置业务凭据。

数据库接入后的验收：22 项普通测试及 5 项 PostgreSQL 集成测试全部通过；主库与验证库均已应用 V1/V2，9 张业务基础表均启用 RLS，业务数据行数均为 0。打包 API 使用主库应用账号启动后 readiness 为 200 / UP，业务路径仍为 401。完整记录见[数据库说明](docs/database.md)。

## 代码结构与验证入口

```text
src/main/java/com/htt/management/
  HttManagementApiApplication.java
  identity/                 # 身份映射、权限/范围、JWT 接线、访问审计和 /me
  platform/
    config/DatabaseConfiguration.java
    config/OpenApiConfiguration.java
    security/SecurityConfiguration.java
    web/ApiError.java
    web/ApiErrorWriter.java
    web/ApiExceptionHandler.java
    web/RequestIdFilter.java
src/main/resources/application.yml
src/main/resources/application-local.yml
src/main/resources/application-database.yml
src/main/resources/db/migration/
src/test/java/com/htt/management/
  LocalApplicationTests.java
  platform/security/ApiSecurityTests.java
  platform/web/ApiExceptionHandlerTests.java
src/test-postgres/java/com/htt/management/PostgresBaselineIT.java
docs/adr/
docs/database.md
scripts/database/
```

业务 Java 模块只在开始实现对应业务时创建。当前 SQL 迁移建立主数据边界，没有建立空业务服务。[ADR-0002](docs/adr/0002-domain-and-permission-boundaries.md) 记录所有权及权限约束；[ADR 索引](docs/adr/README.md) 区分已采用与待决策事项。

测试覆盖真实回环 HTTP 启动、OpenAPI 生成、安全默认拒绝、敏感健康信息隐藏、未验证角色/公司/客户端头无效，以及错误响应不泄露请求值或异常详情。

## 错误约定

```json
{
  "code": "AUTHENTICATION_REQUIRED",
  "message": "Authentication is required.",
  "requestId": "server-generated-uuid",
  "retryable": false,
  "fieldErrors": []
}
```

`X-Request-Id` 由服务端生成，与响应体和日志关联，不信任调用方传入的值。校验错误返回 422 和字段名；格式错误 400；未认证 401；无权限或 CSRF 失败 403；资源不存在 404；方法不支持 405；未知内部错误 500。未知失败不会建议自动重试写入。身份和权限检查先于业务资源查找，因此未认证调用不存在的业务路径也返回 401。

后续业务异常、版本冲突（409/412/428）、幂等和兼容旧接口等规则随真实用例补充，不预建空异常层。

## OPEN QUESTIONS / 下一阶段输入

1. 身份提供方及三端登录方式、公司成员关系和会话撤销规则。
2. 明确获授权创建正式订单的管理人员，以及客户/分支/仓库/区域的数据范围。
3. 产品、客户、余额、库存的权威数据源与迁移样本；哪些旧表和流程已经真实使用。
4. 发票是否需要订单/出库前置，销售是否有开票权限；退货、贷项、抵扣与退款的审批及余额规则。
5. 报价审批、总账、BAS、银行对账、工资、税务和收入确认规则是否在范围内。
6. Firebase/APNs 所属项目、通知保留期，以及后续 API/Worker 服务部署资源和授权。数据库初始化已有本轮明确授权。

第二阶段先明确身份与数据范围，并接入经确认的只读主数据；不得把前端演示行为自动升级为正式财务规则。

## 回滚

停止本地 Java 进程可以撤回应用运行，但撤销 Java 文件不会回滚已应用数据库迁移。保留数据库，通过新版本迁移修复；不改写历史脚本，不自动删库或运行 clean。具体要求见[数据库说明](docs/database.md)。保留兄弟项目和用户原有改动，不使用全工作区 `git reset`/`git clean`。
