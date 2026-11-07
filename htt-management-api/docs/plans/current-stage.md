# 阶段入口与前一阶段记录

2026-11-07最新：[本地Swagger真实Keycloak开发认证](development-login.md)，4个DEMO用户真实协议/Java/Main验收通过，94普通/15PG及JAR通过；用户操作见 [开发登录](../development-login.md)。手机号及三端正式接入不在本轮。

2026-11-07最新增量：[日常开发库统一](development-database.md)。Main已V6、人工演示数据保留Main，Validation只做隔离测试；真实登录待接通。生产用一个HTT业务库，通过Flyway建表。

2026-11-07当前阶段：[customer-portal CTX-002门店列表](customer-portal-branches.md)，只迁移一个只读切片，92项普通/15项真实PG通过，客户端未接线。逐接口状态见 [迁移清单](../migration/customer-portal.md)。下方为此前阶段记录。

当前已完成 [通知模块复核与真实链路验收](notification-verification.md)，71项普通/7项真实容器测试通过。此前 [共享 PostgreSQL 库存与 Keycloak 开发部署](shared-inventory-and-keycloak.md) 已确认统一库存表、V5/PG读取通过验证、Keycloak按内网IP部署。下方保留早期“来源未知、仅准备配置”的记录，不作为最新状态。

2026-11-06。用户允许继续，要求多客户端共用后端且与未确认 ERP 解耦。先补齐可执行边界，再实现确认过的最小库存查询。不是全量 ERP 实施计划。

## 本次修改清单与验证边界

- pom.xml：ArchUnit 1.5.1，仅 test scope；官方证据见 ARCHITECTURE。
- src/test/java/com/htt/management/architecture/ModuleArchitectureTests.java：模块依赖、无环、公开契约和领域隔离。
- platform/events/OutboxStore.java → notification/OutboxStore.java：通知转发租约/审计职责归位，SQL 和逻辑不变。
- notification/NotificationConfiguration.java、OutboxRelay.java；test-postgres/PostgresBaselineIT.java：同步包引用。其他通知测试在同包，继续编译验证。
- docs/ARCHITECTURE.md、MODULES.md、本计划、ADR-0007；README、STATUS 与 ADR 索引：记录事实、设计和待确认项。
- 用户随后确认先做边界：新增 inventory/contract/InventorySource.java、InventoryAvailability.java，inventory/infrastructure/UnavailableInventorySource.java；test/inventory/InventoryContractTests.java。仅内部来源契约，没有授权用例或 Bean/HTTP 接线。
- 用户随后确认先准备 Keycloak 配置：deploy/keycloak/compose.yaml、entrypoint.sh、.env.example、api.env.example、realms/htt-staff-realm.json、realms/htt-customer-realm.json、README.md；test/identity/KeycloakTemplateTests.java。无真实值，不部署。

运行时 HTTP 接口/表/权限：无新增或变更；只有内部库存 Java 来源契约。没有库存 Controller/空模块、未修改前端登录、没有新迁移，没有远程数据库/ERPNext 写入或服务部署。

## 可验收的后续增量

| 增量 | 输入 | 允许修改文件 | 交付与验收 | 验证 | 回退与风险 |
| --- | --- | --- | --- | --- | --- |
| 1 边界固化（本次） | 当前源码、ADR、两端库存证据；用户确认来源未知/先准备身份配置 | 上述明确清单 | 五项架构规则、四项库存契约、三项 Keycloak 模板检查；完整构建和集成测试源编译；不开放新行为 | 定向 test；verify；postgres-it/notification-it test-compile；bash -n | 只还原本次差异及文件移动/新增模板；无 DB 回滚；静态模板检查不是容器验收 |
| 2 仓库读取授权 | 客户/员工允许仓库、产品可见性、地区映射及 API 切片确认 | identity、相关契约/测试、单独 V5 或下一未用版本迁移、文档 | 明确 inventory:read；跨公司/客户/门店/仓库、撤权和聚合不泄露；无默认授权 | 普通 verify + 专用 validation 的 postgres-it；核对复合 FK/RLS/清理 | 关闭新增查询、保留迁移；修复用前向脚本，不改 V1～V4；防默认扩权 |
| 3 来源无关的查询用例 | 增量 2；权威来源、单位/可用量语义已确认 | inventory 的真实 contract/application/api、来源实现、测试、文档 | 门户和员工 API 共用授权查询；未知不等于零；无成本泄露；不锁货 | 用例/HTTP 权限与契约测试；PG 只读隔离；provider 故障/精度/时点测试 | 关闭入口、前端继续旧服务；不双写库存；禁止拿演示数据冒充库存 |
| 4 来源适配/同步 | 获准的源接口/账户、映射、刷新/版本/对账约定 | 独立 integration.erp 或明确本库来源实现；必要的新迁移和测试 | 有界同步、去重/顺序、重试与重建；只在获准测试环境验证；页面无需知道 ERP 标识 | 提供方契约、重复/乱序/半批失败/断线恢复、对账与延迟测试 | 停同步任务、保留最后完整快照并标过期；不删除源数据；防双权威 |
| 5 两端接入 | 真实身份、完成全量请求清单与前端修改授权、查询验收 | 另行明确 customer-portal / htt_flooring_app 文件范围；本轮不可修改 | 真实登录、授权公司/门店/仓库选择、未知/503 展示；没有前端扣库存 | 前端构建、真实合成账户 E2E、并发/容量测试 | 环境指向回旧服务；避免新旧格式/ID 不兼容 |

库测试只能用 Testcontainers 或 `htt_management_validation`。实际读取旧库/ERPNext、迁移主库或改前端之前检查对应授权和输入；不把部署 Rabbit/Redis 的授权扩展成 ERP 集成授权。

## 并行的身份前置事项

Keycloak 方案已确定，真实部署仍缺内网 HTTPS 域名/可信证书、客户端回调和账户管理规则。已有手机号/邮箱 + 密码要求不改变；手机号双标识、验证/找回及退出撤销还需实现。当前 Java 认证默认关闭，不能把库存接口上线当作真实登录已经完成。

用户已答复：库存来源未知，先建解耦边界；Keycloak 域名/证书尚无，先准备配置。因此只交付契约、测试和模板，不部署临时不可信 issuer，也不指定 ERPNext 为主数据源。Keycloak 模板的资源/TLS/身份库前置项与回退见 deploy/keycloak/README.md。

## 本次实际结果

测试执行后记录于 STATUS；旧报告中的 56/11/6 是前一增量结果。本次不把历史报告当作新代码的远程集成验收。文件移动不改 SQL 或投递逻辑。新增后的最终验证以 STATUS 的结果为准。

本次最终通过：68 项普通测试与 JAR 构建；最终 5 项架构定向复核；两个 IT 源集联合 test-compile；Bash 语法与 5 项启动前拒绝检查。没有执行远程 IT、Compose 或真实 Keycloak 导入/登录。

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' clean verify
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' '-Dtest=ModuleArchitectureTests' test
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' '-Ppostgres-it,notification-it' test-compile
& 'C:\Program Files\Git\bin\bash.exe' -n deploy/keycloak/entrypoint.sh
```

首次 ArchUnit 下载受网络沙箱限制，获准联网后成功下载；第一次边界测试漏列已有 ApiConfiguration 嵌套接线类，修正为明确例外后通过，未开放任意 DAO。最终构建离线执行。
