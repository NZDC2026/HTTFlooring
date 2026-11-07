# 数据库连接与迁移

换Windows用户或电脑时，请按 [开发环境与换机手册](development-setup.md) 恢复现有数据库角色凭据；包含与Use-DatabaseEnvironment.ps1一致的安全输入/Export-Clixml格式，不重新生成服务器密码或重建已有数据库。

**最新开发登录**：Main已V6并绑定4个真实Keycloak测试身份。需要Swagger/邮箱密码登录时，按 [开发登录](development-login.md) 运行 `scripts/Start-Development.ps1`，它组合database,development并使用专用Java CA truststore；支持8080/8081，开启认证和门店，关闭通知。仅database profile仍不开放Swagger；默认/生产配置保持原策略。下方“身份绑定未完成”属于此前阶段。

## 当前约定：日常开发使用一个业务库（2026-11-07）

按用户最新要求，应用和人工验收统一使用 **`htt_management`**，目前是开发/测试环境，不是生产。已从空的V1/V2升级至V6，保留两家演示公司、两个客户、三个门店和四个内部账户及授权。Validation的人工演示数据已定向清理；该库仅用于自动化迁移/故障测试，不作为生产运行依赖，不需要人工切换过去查看业务数据。下方各阶段“主库尚未迁移”是历史状态，已由本节更新。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=database
```

默认本机8080。业务身份绑定未完成，认证/门店/通知开关继续默认关闭；数据库连接成功不代表可以登录。不要用 `local` profile连接业务库，它是无数据库冒烟模式。数据库profile默认不开放Swagger。

本轮验证：92项普通、15项真实PG全部通过（仅Validation）；Main显式迁移V3～V6/validate成功，演示种子及重新连接权限核对成功；运行账号实际启动、Flyway/JPA校验及readiness UP，临时进程已停止。Main只读盘点确认V1～V6、28张业务/安全表；无外部身份绑定、库存或财务交易。日志 `.cache/main-development-verify.log`、`.cache/development-main-migrate.log`、`.cache/main-development-startup.log`。

## 生产空库建表与后续升级

生产只需一个HTT业务库，表由仓库 `src/main/resources/db/migration/V1__*.sql` ～ `V6__*.sql` 及后续版本维护，不需要复制开发库。自动化Validation/Testcontainers部署在开发或CI环境；Keycloak独立身份存储不属于第二套HTT业务数据。

1. 在专用PostgreSQL实例/数据库中由环境管理员准备两个独立LOGIN角色（例如 `htt_management_migrator` 和 `htt_management_app`），密码由秘密管理服务配置；二者均不授予SUPERUSER/CREATEDB/CREATEROLE/BYPASSRLS。创建 `htt_management`，所有者为迁移角色。撤销PUBLIC的CONNECT/TEMP，给应用角色CONNECT；不要在共享的其他系统库内运行这些操作。已有数据升级前先做备份及恢复验证。
2. 用迁移角色连接该库，执行 `scripts/database/prepare-schema.sql` 准备platform schema。例如在已安全配置 `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSFILE` 的环境执行 `psql -X -v ON_ERROR_STOP=1 -f scripts/database/prepare-schema.sql`。密码文件权限和服务器证书由环境配置，不将密码放进命令或URL。
3. 由秘密管理服务注入 `HTT_DB_URL`、`HTT_DB_USERNAME`（应用角色）、`HTT_DB_MIGRATION_USERNAME`、`HTT_DB_MIGRATION_PASSWORD`。URL必须含目标库及连接选项，生产采用服务器证书校验，例如 `jdbc:postgresql://db.example.internal:5432/htt_management?sslmode=verify-full&connectTimeout=5&socketTimeout=30`，并准备客户端信任根。Windows可用 `./scripts/database/Invoke-DatabaseMigration.ps1`；Linux在仓库根目录执行 `./mvnw -B -ntp flyway:info flyway:migrate flyway:validate`。Flyway插件从环境读取凭据、运行角色占位符、schema和不可变脚本，不依赖开发机器的DPAPI文件。
4. 迁移成功后移除迁移凭据，应用只注入 `HTT_DB_URL/HTT_DB_USERNAME/HTT_DB_PASSWORD` 和实际业务身份等配置，以database profile启动。新库从V1顺序建表，已有库只应用未执行版本；应用只validate，不自动建表。禁止clean、自动baseline或改写已应用脚本。

开发机已有凭据，可显式升级：

```powershell
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
./scripts/database/Invoke-DatabaseMigration.ps1 -Offline
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
```

本轮在已有schema的Validation实际执行过prepare-schema.sql，并通过V2→V6升级；未在全新生产环境重建或做生产备份恢复演练。首次生产上线仍需以临时空库完成全量V1→最新版本验收。演示数据不进入生产，生产账户/角色/业务初始数据应另行审核导入。参考 [ADR-0010](adr/0010-development-business-database.md) 和 [本轮计划/回退](plans/development-database.md)。

## 开发演示数据（2026-11-07）

用户授权后已在 `htt_management_validation` 持久化一组明确标记的公司/客户/门店及内部身份权限数据，不导入主库，不作为Flyway种子，不含真实身份凭据或财务库存交易。此前“测试数据清理”记录指各轮自动化测试，当前演示数据单独保留。写入前事务演练及92项普通/15项PG测试和构建通过，写入后重新连接授权检查通过。查看、回退和后续登录边界见 [开发演示数据](demo-data.md)。

## 最新门户门店迁移（2026-11-07）

V6已在htt_management_validation应用并通过15项真实PG测试，连同92项普通测试/JAR构建全部通过。仅增加crm.customer_branch.code/公司客户内唯一约束，以及identity.portal_branch_scope限定元数据函数；既有V1～V5不改。函数归迁移账号，固定search_path，PUBLIC无执行权限，运行账号仅被显式授予该函数执行。

本次身份/客户/Grant/门店及访问审计合成数据已清理，事后计数均0；没有迁移主库或访问ERPNext。旧接口必需code/address/country需实际导入，V6不伪造值。门店功能默认关闭，开启/兼容及回退见 [CTX-002计划](plans/customer-portal-branches.md)。V6已应用后不可改写。

## 最新共享库存验收（2026-11-06）

用户已确认 HTT 业务库为三端及后续 ERP 库存唯一来源。V5 已在专用 `htt_management_validation` 应用，新增 catalog.product_unit、product_barcode、inventory.stock_balance、stock_movement，并补 product 分类/颜色/品牌/尺寸字段。单位、数量、流水及边界详见 [ADR-0008](adr/0008-shared-postgresql-inventory.md)。

实际验证：68项普通 + 14项真实PostgreSQL测试通过；之后仅补部署配置检查，最终69项普通测试及JAR构建通过。事后只读核对 V1～V5成功、28张业务/安全表全部RLS、四张新表均0行。应用仍无库存写权限；未发布库存HTTP接口，主库未迁移或试验。V5现已不可改写。

另按用户授权，Keycloak使用新建的独立PostgreSQL容器/htt_keycloak身份库，无宿主机发布端口，未复用本页5432业务服务；详见 [身份部署记录](../deploy/keycloak/DEPLOYMENT.md)。

## 最新通知迁移验收（2026-11-06）

V4 已在 `htt_management_validation` 成功应用，V1～V3 保持原校验和；后续不可改写 V4。新增 platform.domain_outbox 及 notification.inbox、recipient_cursor、message、device、delivery、audit，共 7 表，连同原表共 24 张业务/安全表（不含迁移历史）；权限目录增加 notification:read 与 notification:device，未自动授予任何用户。

执行 `mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository -Ppostgres-it -Dhtt.test.database=dedicated verify`：56 项普通测试、11 项真实 PostgreSQL 测试通过。新测试验证事务回滚不留 Outbox、租约与重放去重、并发游标和历史分页、本人/Grant 数据隔离、渠道状态及永久错误停用设备。临时 API 随测试关闭。日志 `.cache/notification-postgres-final.log`。

通知功能默认关闭。后续用户授权 SSH/Docker 后，已部署独立 HTT RabbitMQ/Redis，6 项真实 broker 测试在临时容器中通过；没有连接现有 PostgreSQL 或访问主库/ERPNext，Firebase 真机仍未验证。详见 [通知运行说明](notification.md)。原有 V1～V3 记录保留在下方作为历史。

## 最新认证迁移验收（2026-11-05）

用户在认证实现完成后明确授权使用专门准备的测试 PostgreSQL。已使用既有 `192.168.10.174:5432/htt_management_validation` 服务执行 dedicated 模式，没有安装/部署容器，也没有修改服务器服务。仅访问验证库；主库和 ERPNext 未访问。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
$env:DEBUG = 'false'
$env:HTT_AUTH_ENABLED = 'false'
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
```

- V3 在验证库成功应用，V1～V3 校验成功，重复迁移不再执行变更。V3 自此不可改写。
- 40 项普通测试和 8 项真实 PostgreSQL 集成测试全部通过，零失败/错误/跳过；构建生成 JAR。
- 实际验证身份映射、多角色、撤权、禁用及令牌撤销时间、跨公司角色/门店外键、运行角色禁止修改 IAM、审计追加及外层回滚后仍持久化、运行账号 JPA/readiness 启动。临时 API 已关闭。
- 事后只读核对验证库 17 张业务/安全表全部启用 RLS；测试数据及审计记录全部清理，仅保留 4 个权限目录项；V3 函数没有 PUBLIC 执行权限。
- 没有修改 Java、测试或 SQL 源码；本轮仓库仅更新验证文档。只读核对辅助脚本和日志位于忽略目录 `.cache/`，不含凭据。

日志：`.cache/auth-dedicated-validation.log`、`.cache/auth-dedicated-inspection.log`。报告：`target/surefire-reports/`、`target/failsafe-reports/com.htt.management.PostgresBaselineIT.txt`。初次本地 Docker 不可用的历史失败记录仍保留，不能将本次结果称为容器测试成功。

V3 仅迁移验证库；本轮未复核或变更主库，主库最后已知为 V1/V2，不能直接连接新构建。实际 IdP、用户及权限分配、前端联调仍未完成，认证默认关闭。回滚保留验证库结构和历史，追加修复迁移，不执行 clean、删库或重写 V3。

## 目标与隔离

用户已授权将 `192.168.10.174:5432` 作为 HTT 主数据库服务器，并按需求创建专用数据库及表。初始只读探测确认 PostgreSQL 17.11、非只读副本；两个目标数据库和四个角色均不存在，不涉及接管旧库。

| 用途 | 数据库 | 应用账号 | 迁移账号 |
| --- | --- | --- | --- |
| 主库 | `htt_management` | `htt_management_app` | `htt_management_migrator` |
| 独立验证库 | `htt_management_validation` | `htt_management_validation_app` | `htt_management_validation_migrator` |

ERPNext 位于同一服务器的 8093 端口，与本次 PostgreSQL 库隔离；没有访问其 HTTP 服务或数据库，没有更改服务器服务配置。

应用不使用 `postgres`。迁移账号拥有自己的数据库和 schema，但没有超级用户、建库、建角色、复制或绕过 RLS 的特权。应用账号只有本库连接、必要 schema 使用、主数据 SELECT、RLS 辅助函数执行和 Flyway 历史 SELECT 权限，没有 DDL、业务写入、临时表或迁移历史写入权限。业务写权限以后随真实用例的迁移明确授予。

角色是 PostgreSQL 集群级对象，但本次只建立上述新角色，未修改其他系统账号。新库撤销 PUBLIC 的连接/临时表权限，并撤销 `public` schema 的公共权限。

## 主库启动

Windows 当前用户的角色凭据存放在 `.local/main-database.xml` 和 `.local/validation-database.xml`，用 DPAPI 加密，已被 Git 忽略。提供的 `postgres` 管理员密码仅用于初始化进程，没有写入配置或保存到这两个文件。

```powershell
# 仅当前 PowerShell 进程允许执行仓库脚本，不改变系统/用户持久策略。
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
java -jar target/htt-management-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=database
```

数据库地址为 `jdbc:postgresql://192.168.10.174:5432/htt_management`，实际 profile 增加连接超时、读超时及应用名；用户名和密码分别注入，不放在 JDBC URL。主库地址必须包含 `/htt_management`，不能把缺少数据库名的管理员连接直接作为应用配置。

`database` profile 默认使用主库，连接池最多 5 个连接，最少空闲 1 个。API 仍只监听本机 `127.0.0.1:8080`；数据库接入不等于将 API 部署到服务器。`local` profile 保留无数据库的技术冒烟用途。

当前服务器连接协商结果为 `ssl=false`。配置使用 `sslmode=prefer`，当前连接没有 TLS 加密；本次未更改服务器 TLS 设置。后续启用服务器证书后再改为校验证书的连接方式。

换 Windows 用户或电脑时，DPAPI 文件不能直接解密。应通过新的环境/密钥管理方式配置现有角色凭据，或执行明确的密码轮换；不要重复生成本机凭据后覆盖文件导致与数据库密码不一致。禁止将 `.local` 当作可提交的配置目录。

## 迁移流程

应用启动只调用 Flyway `validate`，不会执行 `migrate`。JPA 只验证结构，不生成 DDL。存在未应用或校验和不一致的迁移会阻止启动。迁移由独立账号显式执行：

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' flyway:migrate
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify

# 仅在验证通过、该主库变更属于授权范围之后执行。
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main -Migration
.\mvnw.cmd -B -ntp '-Dmaven.repo.local=.cache/repository' flyway:migrate flyway:validate

# 应用运行前移除迁移凭据，只加载应用凭据。
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Main
```

Flyway 历史表位于 `platform.flyway_schema_history`。`clean` 和自动 baseline 禁用；已应用脚本不可修改，通过新的版本迁移修复。Maven 插件与运行时 Flyway 均为 Boot 管理的 12.4.0，并加载 PostgreSQL 支持模块。

初始化工具 `scripts/database/DatabaseAdmin.java` 只允许创建这两个命名明确的新库；遇到同名库或角色即拒绝，不覆盖密码或所有权。角色创建在一个事务内；PostgreSQL 不允许 CREATE DATABASE 放在事务内，因此中途失败可能留下新角色/新库，需要检查后恢复，不能盲目重跑或自动 DROP。

## V1/V2 基础表结构

| Schema | 表 | 用途 |
| --- | --- | --- |
| `identity` | `company` | 公司主数据，未预置实际公司记录 |
| `identity` | `user_account` | 内部用户 ID 与状态；不是登录凭据表 |
| `identity` | `company_member` | 用户与公司关系；不代表管理权限或正式订单授权 |
| `crm` | `customer` | 客户基本资料 |
| `crm` | `customer_branch` | 客户分支及可选地址、坐标 |
| `crm` | `customer_contact` | 客户联系人及可选分支关联 |
| `catalog` | `unit_of_measure` | 计量单位 |
| `catalog` | `product` | SKU、产品名称、基础单位等主数据 |
| `inventory` | `warehouse` | 仓库主数据，不存库存余额或成本 |
| `platform` | `flyway_schema_history` | Flyway 迁移历史 |

V1 建立公司/用户/成员关系与 RLS 辅助函数，V2 建立客户、产品、单位、仓库及权限。共 9 张业务基础表和 1 张迁移历史表，没有导入真实业务数据或播种演示用户。

跨公司引用使用复合外键；同公司客户编码/SKU/单位编码/仓库编码唯一。状态和正版本号有检查约束，分支经纬度必须成对且在有效范围。`updated_at` 与 `version` 后续由业务用例更新，不假设有数据库自动更新触发器。

价格、产品单位换算、库存流水、财务余额、订单、发票、贷项、总账、BAS、工资、Outbox 和通知历史尚未建表；随明确业务用例追加迁移，不预设未知会计规则。

V3 在验证库额外建立 identity.external_identity、permission、role、role_permission、member_role、resource_grant、grant_branch 和 platform.access_audit 共 8 张表，并扩展账户撤销时间及成员身份属性。运行角色仅可通过限定函数解析身份、查询归属和追加审计，不能直接操作新安全表；详细规则见 [ADR-0005](adr/0005-authentication-authorization.md)。实际用户绑定、角色分配及授权管理人员清单尚未配置。

## 行级安全与权限边界

9 张基础表启用 RLS。应用没有公司/用户上下文时不能读取业务行。业务表要求公司一致、有效用户及有效公司成员关系；用户表只允许读取当前用户，成员表只允许读取当前公司下自己的成员关系。

未来服务必须在验证身份与数据范围后，在业务事务中使用参数化 `set_config('htt.company_id', ..., true)` 与 `set_config('htt.actor_id', ..., true)` 设置上下文。`true` 表示事务结束自动清除，避免连接池复用泄漏范围。

这些数据库设置由可信应用连接设置，**不是认证机制**；拿到应用数据库凭据的人仍能选择设置值，因此数据库凭据不能发给三端。RLS 是纵深防御，应用仍需 RBAC/ABAC，不能直接信任客户端公司或角色头。迁移账号作为表所有者能够维护全部数据，不能用于 API 请求。

## 验证与回滚

普通 `verify` 不连接数据库。本地 Docker 模式仍为 `-Ppostgres-it verify`；没有 Docker 会失败，不会自动改用远程库。

显式 `-Dhtt.test.database=dedicated` 模式检查固定主机、端口、`htt_management_validation` 库名、专用账号以及数据库用途标记，然后才允许迁移/写入。测试覆盖迁移重复执行、待迁移验证失败、最低权限、9 表 RLS、跨公司外键、无效数据约束以及真实 Spring Boot/JPA/readiness。测试仅在验证库写入带 TEST ONLY 标识的临时记录，并按本次 UUID 清理，不使用 TRUNCATE 或清库。

主库验收只读：迁移历史、schema/表/策略、数据行数、应用连接及健康状态。出现问题先停止应用并保留数据库；已应用迁移用新版本修复。不要修改历史校验和，不要对主库运行 Flyway clean，也不要把切换应用版本当作数据库回滚。未来导入真实数据前补齐备份、恢复演练及核对清单。

## 初始数据库阶段执行结果（2026-11-05，V1/V2 历史记录）

| 检查 | 结果 |
| --- | --- |
| PostgreSQL 连接 | 17.11，非副本，当前 TLS 未启用 |
| 数据库与账号 | 两个新 HTT 数据库、四个独立角色已创建 |
| 验证库迁移 | V1、V2 成功应用；重复 migrate 无新增执行；validate 成功 |
| 自动化验证 | 22 项普通测试 + 5 项真实 PostgreSQL 集成测试全部通过，无跳过 |
| 主库迁移 | 验证后应用相同 V1、V2；validate 成功 |
| 主库与验证库只读核对 | 各 9 张业务表，全部启用 RLS，2 条成功迁移记录；业务表总行数均为 0 |
| 打包 API + 主库应用账号 | 启动成功；`/actuator/health/readiness` 返回 HTTP 200 / UP；`/api/v1/me` 返回 401 |
| 验证结束 | 临时 API 进程已停止；没有部署远程服务；没有访问 ERPNext |

数据库测试报告：`target/failsafe-reports/com.htt.management.PostgresBaselineIT.txt`。本次本地执行日志保存在被忽略的 `.cache/database-validation-tests.log`、`.cache/database-main-migrate.log` 和 `.cache/main-startup.log`。本机 Docker 路径没有可用环境，未宣称该路径运行通过。
