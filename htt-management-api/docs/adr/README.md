# 架构决策记录

| 记录 | 状态 | 含义 |
| --- | --- | --- |
| [0001 Java 技术基线](0001-java-baseline.md) | 已采用；数据库部分后续由 0004 更新 | 第一阶段实际实现 |
| [0002 领域与权限边界](0002-domain-and-permission-boundaries.md) | 已采用约束；业务模块未实现 | 用户已明确的原则，不代表模型已完成 |
| [0003 通知可靠性](0003-notification-delivery.md) | 代码、PG 及真实 broker 测试通过；真机推送待验收 | Outbox + RabbitMQ + Fake Push/SSE；见 [运行说明](../notification.md) |
| [0004 PostgreSQL 库与访问](0004-postgresql-databases-and-access.md) | 已采用 | 授权主库、专用验证库、独立账号、显式迁移、RLS |
| [0005 认证、权限与资源范围](0005-authentication-authorization.md) | Java 与专用 PostgreSQL 验证通过；实际 IdP 待联调 | Bearer 兼容、多角色、order:create、客户/门店隔离与审计 |
| [0006 自托管 Keycloak](0006-keycloak-identity-provider.md) | 开发 IP/TLS 部署与 realm 验证通过；业务登录待联调 | 独立身份库、客户端配置、开发 CA 和生产迁移 |
| [0007 库存与 ERP 边界](0007-inventory-and-erp-boundary.md) | 隔离检查、Java 来源契约与不可用实现已完成；授权查询待实施 | 两端共用查询方向；来源适配隔离；未知不等于零 |
| [0008 HTT 共享库存](0008-shared-postgresql-inventory.md) | 用户已确认权威来源；V5/PG 读取和真实验证通过 | 同一余额表、单位换算/条码、流水；业务过账与 API 待实施 |
| [0009 门户门店迁移](0009-portal-branch-migration.md) | CTX-002兼容/真实PG验收通过；客户端待接线 | 单一只读切片、显式Grant、旧DTO/错误/限流 |
| [0010 日常开发业务库](0010-development-business-database.md) | 已批准统一Main进行人工开发验收；自动化测试保持隔离 | 一个HTT业务库、显式开发种子、生产Flyway建表 |

后续按需要新增 ADR，不批量创建空文档：

- 身份提供方、Web 会话、移动端 PKCE、公司选择与授权上下文。
- 正式订单创建权限的所有入口及 ABAC/RLS 数据隔离策略。
- 报价/订单/履约/发票生命周期及版本、幂等规则。
- 贷项、抵扣、退款及应收余额口径（现有三端存在冲突）。
- 金额、税率、币种、单位、日期及时区；历史快照。
- 数据库业务 schema、Flyway 与旧库迁移策略、运行/迁移角色分离。
- 文件扫描、访问控制、内容存储及导出。
- API 契约、旧错误码与版本冲突兼容、管理端 RPC 改造。
- 对账、迁移切换、增量回放和回滚。
- API/Worker 部署、RabbitMQ 拓扑、容量和可观测性。

每份记录说明事实、决策、代价、验证证据、未知项。不得将待甲方确认事项标记为已通过。
