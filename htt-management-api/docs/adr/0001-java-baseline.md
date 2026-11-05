# ADR-0001：Java 技术基线与隔离验证

日期：2026-11-05。状态：已采用；PostgreSQL 实际运行验证受本机 Docker 前置条件限制。

后续更新：[ADR-0004](0004-postgresql-databases-and-access.md) 记录用户新授权的主库/专用验证库及通过的 PostgreSQL 验收，并将启动行为改为仅校验迁移。以下保留第一阶段决策背景。

## 背景与决定

保留 Java 21、Spring Boot 4.1.2、Maven Wrapper 3.10.0，根包改为 `com.htt.management`。单 Maven 模块按业务包扩展。保留 PostgreSQL/JPA/Flyway/AMQP 基础依赖；不建立业务表、空业务模块、消息消费者或外部身份占位实现。

使用 `spring-boot-starter-amqp`、`spring-boot-starter-flyway` 和 `flyway-database-postgresql`；版本由 Boot 管理。OpenAPI 采用 `springdoc-openapi-starter-webmvc-ui:3.2.0`，仅本地 profile 开放。移除第一阶段没有使用的专项测试 starter 和 devtools。

安全默认拒绝，健康端点只公开状态；无默认用户、密码、登录表单或 Basic 登录。尚未接入身份时不提供业务访问。统一错误体不返回异常详情；服务端请求 UUID 用于日志关联，不能替代授权或审计。

`local` profile 排除 JDBC/JPA/Flyway 自动配置，用于无基础设施的 HTTP 冒烟。默认 profile 必须有显式数据库配置，JPA 只验证，不建表；Flyway 禁止 clean 和自动 baseline。未配置消息业务之前不连接 Rabbit 健康检查、不声明队列、不启动监听器。

普通 `verify` 使用本地 HTTP 与安全/错误测试。`-Ppostgres-it verify` 独立要求本机 Docker，验证一次性 PostgreSQL；无 Docker 必须失败。数据库测试源单独挂载，避免普通构建误报数据库已验证。没有 H2 替代，也不回退到远程测试库。

## 兼容依据

2026-11-05 核对官方资料，并通过项目 Maven 解析实际坐标；文档证据不等于运行验收。

- [Boot 系统要求](https://docs.spring.io/spring-boot/system-requirements.html)：4.1.2 支持 Java 21，Maven 最低 3.6.3。
- [Boot 托管坐标](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html)：本次解析包括 Flyway 12.4.0、Spring AMQP 4.1.2、Testcontainers 2.0.5；以本项目 `dependency:tree` 为最终构建证据。
- [Boot AMQP](https://docs.spring.io/spring-boot/reference/messaging/amqp.html)：RabbitMQ 使用 AMQP starter。
- [Flyway PostgreSQL](https://documentation.red-gate.com/flyway/reference/database-driver-reference/postgresql-database)：需要独立 PostgreSQL 模块。
- [springdoc 兼容矩阵](https://springdoc.org/#what-is-the-compatibility-matrix-of-springdoc-openapi-with-spring-boot)：Boot 4.1.x 对应 springdoc 3.1.x–3.2.x。

## 代价与后续

实施证据：`clean verify` 的 22 项测试全部通过，包含真实回环 HTTP 请求与 OpenAPI 生成；`dependency:tree` 已确认依赖版本。数据库 profile 已编译，实际运行时 Testcontainers 未找到可用 Docker，Failsafe 明确失败且没有跳过。因此不宣称 PostgreSQL/Flyway/JPA 运行验收完成，待本机 Docker 就绪后补验。

本地健康检查成功不证明 PostgreSQL/RabbitMQ 可用；文档与测试必须明确这个边界。Spring Boot 4 模块名和 Jackson 3 包名与旧代码不同，不复制旧依赖名称。真实部署需要身份接入、数据库角色/迁移执行方式、TLS/代理及资源验证，不能直接部署 local profile。
