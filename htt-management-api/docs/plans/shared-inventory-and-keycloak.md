# 当前阶段：共享 PostgreSQL 库存与 Keycloak 开发部署

2026-11-06。输入为用户本轮确认：三端及后续 ERP 业务使用同库同表的商品库存；可由两端模型推导结构；Keycloak 可在 192.168.10.174 Docker 部署，优先本地 IP。仓库仍采用模块化单体、默认拒绝、隔离测试和不可改写迁移原则。

## 修改文件与依赖

| 范围 | 本轮文件 / 变化 |
| --- | --- |
| 数据结构 | src/main/resources/db/migration/V5__shared_inventory_foundation.sql：新增单位换算、条码、库存余额/流水；扩展已有 product 元数据 |
| 库存实现 | src/main/java/com/htt/management/inventory/infrastructure/PostgresInventorySource.java：实现已存在 InventorySource，不注册 HTTP/Bean |
| PG 验证 | src/test-postgres/java/com/htt/management/PostgresBaselineIT.java：新增三项库存测试、V5 历史断言和夹具清理 |
| Keycloak 开发部署 | deploy/keycloak/compose.development.yaml、init-database.sql、manage-development.py、api.development.env.example；更新 entrypoint.sh 支持严格限定的开发 DB 例外 |
| Keycloak 验证 | src/test/java/com/htt/management/identity/KeycloakTemplateTests.java：新增开发 DB 不暴露/生产不接受开发开关的检查 |
| 文档与忽略 | deploy/keycloak/DEPLOYMENT.md、README；docs/ARCHITECTURE、MODULES、STATUS、database、ADR-0006/0007/0008 与索引；阶段计划与根 README；.gitignore 排除身份私有状态和 Python 缓存 |

PostgresInventorySource → InventorySource/InventoryAvailability + Spring JDBC/事务；不依赖 ERP SDK、通知内部实现或具体客户端。Keycloak 通过现有 OIDC 配置接入，无专用 Java 安全适配层。所有密码/私钥仅在服务器私有状态目录或已有 DPAPI 中，本仓库示例只含标识/路径。

## 涉及接口、表与权限

没有新增业务 HTTP 路由、写入接口或动作授权。新增四表详见 ADR-0008；目标统一业务库为 htt_management，本轮 V5 只应用 htt_management_validation。所有新表启用公司 RLS，应用只有单位/条码/余额 SELECT，无库存 DML/流水访问授权。

未实现仓库细分范围和产品可见性，因此不开放新库存 Controller。来源端口要求可信事务上下文，不能代替 RBAC/ABAC。正式订单仍只允许有 order:create 和范围的 MANAGEMENT，客户/销售不允许创建；库存表不绕过这一规则。

Keycloak 独立 Compose project htt-keycloak-dev：HTTPS 192.168.10.174:18443、环回管理端口19000、无宿主机 DB 端口。没有连接/改写 ERPNext、原 PostgreSQL 服务、主业务库或任何前端仓库。

## 实际执行与验收

| 子任务 | 实际结果 | 验证证据 |
| --- | --- | --- |
| 库存结构/读取编译 | 通过 | -Ppostgres-it test-compile |
| 隔离 DB 验证 | 68 项普通 + 14 项 PostgreSQL 全部通过，V5成功；其中三项库存测试 | .cache/shared-inventory-pg-verify.log |
| 验证库事后核对 | V1～V5 success；28 张业务/安全表 RLS；四张新表均0行 | .cache/shared-inventory-inspection.log |
| 最终构建 | 新增部署检查后69项普通测试零失败/错误/跳过，JAR成功 | .cache/shared-inventory-keycloak-final.log |
| Keycloak 部署 | 26.8.2固定digest、专用PG、IP开发CA、两个realm、三个客户端；真实健康/管理登录/配置验证通过 | .cache/keycloak-start.log、keycloak-check.log |
| 客户端到IP的TLS | Java21默认信任拒绝开发CA；显式CA校验两个真实discovery成功 | .cache/keycloak-java-tls.log |
| 重启持久化 | 仅重启新Keycloak容器后，健康/realm/客户端/管理登录检查再次通过 | .cache/keycloak-restart-check.log |
| 备份 | pg_dump自定义格式、pg_restore --list及SHA-256；没有执行恢复覆盖 | 服务器.state/development/backups，DEPLOYMENT.md |

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
# 最终普通构建
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' verify
```

服务器开发部署实际运行 `python3 manage-development.py init --address 192.168.10.174`、`up`、`check`、`backup`。初次数据库 secret 换行处理失败已修复；服务最终就绪，专用 DB 账号非超级用户。开发管理登录检查不等于业务用户或手机号登录端到端验收。

## 回滚及剩余工作

- Java 回退只撤回本轮来源类/测试差异，不全仓 reset；V5 已应用，保持不可变，数据库修复用新迁移。未在主库执行 clean/迁移测试。
- Keycloak 用 `manage-development.py stop` 停止本栈，保留身份卷和私有凭据。需要迁移/升级时先备份并做隔离恢复；本轮未完成恢复演练。不得删除其他 Compose 项目或复用 ERPNext 资源。
- 下一最小增量：商品建立/发布时初始化选定仓库库存；补 inventory:read、仓库范围、客户产品可见性和授权查询 API；随后受控出库事务、幂等/并发、审计/Outbox，再迁移两端真实请求。
- 仍需明确：真实仓库/公司映射、期初库存与单位换算、预留时点、拆零/精度、损坏处理、低库存阈值、出库/调拨人员范围。用户已确定 HTT 为权威来源，不再将此问题视为未知。
- Keycloak 真实业务账户/权限绑定、前端精确回调、手机号/邮箱流程、SMTP和生命周期同步待实施；生产域名/证书按 DEPLOYMENT.md 准备，开发IP不成为生产配置。
