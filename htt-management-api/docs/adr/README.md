# 架构决策记录

| 记录 | 状态 | 含义 |
| --- | --- | --- |
| [0001 Java 技术基线](0001-java-baseline.md) | 已采用；数据库部分后续由 0004 更新 | 第一阶段实际实现 |
| [0002 领域与权限边界](0002-domain-and-permission-boundaries.md) | 已采用约束；业务模块未实现 | 用户已明确的原则，不代表模型已完成 |
| [0003 通知可靠性](0003-notification-delivery.md) | 已确定方向；实现待后续阶段 | Outbox + RabbitMQ + FCM/SSE |
| [0004 PostgreSQL 库与访问](0004-postgresql-databases-and-access.md) | 已采用 | 授权主库、专用验证库、独立账号、显式迁移、RLS |
| [0005 认证、权限与资源范围](0005-authentication-authorization.md) | Java 与专用 PostgreSQL 验证通过；实际 IdP 待联调 | Bearer 兼容、多角色、order:create、客户/门店隔离与审计 |

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
