# 数据库连接与迁移

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
