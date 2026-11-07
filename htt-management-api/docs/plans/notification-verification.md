# 当前阶段：通知模块复核、发布解耦与真实链路验收

2026-11-06。用户再次要求独立通知、可靠消息、Fake FCM、认证SSE及真实RabbitMQ/Testcontainers测试。本轮保留既有实现，针对发布开关耦合和测试分离两个缺口补强，不重复生成模块。

## 修改边界

| 文件 | 修改目的 |
| --- | --- |
| src/main/java/com/htt/management/platform/events/DomainEventsConfiguration.java（新增） | 独立注册业务发布器，不依赖通知开关；延迟实例化使无基础设施local仍可启动，真实使用仍要求JDBC和业务事务 |
| src/main/java/com/htt/management/notification/NotificationConfiguration.java | 移除对DomainEvents Bean生命周期的所有权，其余消费/拓扑/渠道配置不变 |
| src/test/java/com/htt/management/platform/events/DomainEventsConfigurationTests.java（新增） | 通知关闭时发布器存在；未使用时不连接数据源；无JDBC的技术启动不强制创建发布器 |
| src/test-notification/java/com/htt/management/notification/NotificationPipelineIT.java | 增加真实HTTP/SSE、RSA签名、实际PG/RLS和RabbitMQ共同参与的端到端切片 |
| docs/notification.md、ARCHITECTURE、ADR-0003、STATUS、README、当前阶段入口及本计划 | 更新依赖证据、发布器生命周期、测试范围、真实结果和限制 |

本轮没有新增或改写迁移、表、路由或权限，没有改前端登录、库存、Keycloak或远程服务配置。仅在已授权Docker主机新目录执行临时测试容器；既有数据库、RabbitMQ/Redis、ERPNext与身份服务不作为本次测试依赖。

## 依赖、接口与权限

Boot 4.1.2使用spring-boot-starter-amqp（RabbitMQ AMQP 0.9.1）；本轮官方复核和实际依赖树一致，不安装其他版本的starter-rabbitmq，也没有Qpid AMQP1.0依赖。独立事件配置只依赖Spring/JDBC/Jackson，不导入notification。

保持既有/api/v1/notifications和/api/portal/v1/notifications下的本人历史、SSE、已读、设备接口。RBAC动作仍为notification:read/device；验证身份、公司、门户grant，历史与接收资格再受当前客户/门店范围和RLS约束，无任意userId选择。领域事件发布要求已存在可信actor/company事务；关消费者不会禁止保存Outbox。

## 验收与实际命令

1. 定向配置/架构/local检查：修正测试替身的初始化预期后通过。最初verifyNoInteractions(JdbcTemplate)误将Spring初始化回调视为连接操作，已改用真实JdbcTemplate+DataSource替身验证不建立连接。
2. `mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository verify`：71项普通测试，零失败/错误/跳过，可执行JAR生成。
3. 相同Maven缓存参数下`dependency:tree`：starter-amqp4.1.2 → spring-boot-amqp4.1.2 → spring-rabbit4.1.2 → RabbitJavaClient5.30.0，无Qpid。
4. `-Pnotification-it test-compile`通过，源码上传独立目录`/home/eric/htt-notification-review-20261106/workspace`。只上传src、Maven和runner，不上传本地凭据。
5. 在该Linux目录执行`sh deploy/infra/run-notification-tests.sh "$PWD"`，Rabbit镜像使用已固定的4.3.7摘要；实际执行`-Pnotification-it test-compile failsafe:integration-test failsafe:verify`。7项全部通过，零失败/错误/跳过；临时PostgreSQL17.11/RabbitMQ已清理。

真实容器用例：

| 用例 | 证据范围 |
| --- | --- |
| 已提交Outbox发布/消费/去重 | JSON与JSONB重放相同语义，只生成一份历史，记录DUPLICATE |
| 业务回滚 | 不留Outbox、不向broker发布 |
| 瞬时故障 | TTL重试后消费成功 |
| 持续故障 | 有限重试后进入持久DEAD，留审计 |
| 不可路由 | confirm/return检查使Outbox保持可重试 |
| 多实例唤醒 | 两个独立fanout队列均收到提示 |
| 新增真实HTTP/SSE全链路 | 匿名/URL token/错误audience拒绝；跨公司/客户/门店/grant隔离；实际Spring业务事务发布、Rabbit消费和PG/RLS历史；Fake FCM状态；REST after=1和SSE Last-Event-ID=1均只恢复cursor2；撤权关闭连接；跨用户已读404 |

JWT使用运行时生成的RSA密钥、Nimbus验签/issuer/audience校验；只有JWKS取钥替换为测试公钥，没有替换AccessRepository、通知存储、审计、HTTP或RLS。此测试不是实际Keycloak/手机号登录验收。HTTP只在测试执行机环回随机端口监听，没有新部署API。

本地证据：`.cache/notification-review-verify.log`、`notification-review-dependencies.log`、`remote-reports/NotificationPipelineIT-review.txt`、`remote-reports/notification-review-tests.log`。此前14项dedicated PG属于上一阶段结果，本轮未重跑该套，也未访问主库或现有PG服务。

## 回滚、风险与下一步

回滚本轮两个配置文件差异即可恢复旧Bean注册；测试和文档按本轮差异回退，保留其他未提交工作。不删除V4/V5、历史、Outbox、Inbox、DEAD消息或审计。运行时停用通知/worker后，独立业务发布器仍可在已迁移业务库保存Outbox；若需完全暂停业务发布，应暂停对应业务写用例，不能丢弃事件。

通知默认关闭、模板为空；真实业务事件和接收者尚需业务用例显式接入。FCM仍为Fake/SIMULATED，Firebase项目/凭据、iOS APNs与真机没有验收。生产Nginx配置只交付示例，未修改服务器代理。Web Push、历史保留/归档、受控死信重放和容量/故障压测继续待实施；当前资源上限不能视作十万在线保证。
