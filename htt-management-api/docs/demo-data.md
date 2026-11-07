# 开发演示数据

最新开发认证增量：四个内部标签现已分别绑定真实Keycloak用户 `manager@htt-demo.invalid`、`sales@htt-demo.invalid`、`customer-a@htt-demo.invalid`、`customer-b@htt-demo.invalid`；随机密码只保存在服务器私有目录。真实协议/Java/Main验收通过，见 [开发登录](development-login.md)。下方最初“没有外部用户”的段落为种子初始状态；现在清理需先 `Use-DemoData.ps1 -Target Main -Action unbind -DevelopmentData`，再remove。

按用户最新要求，本数据集用于 `192.168.10.174:5432/htt_management` 日常开发/人工验收，Validation仅用于隔离演练。Main库名不表示当前环境是生产。不属于Flyway、应用启动或生产初始化。所有名称含 `[DEMO]`，客户邮箱使用不可投递的 `example.invalid`，地址明确为虚构地址，不生成 ABN、财务、库存或通知记录。

## 数据与权限

| 内部账户标签 | 公司 | 成员类型 | 数据范围 |
| --- | --- | --- | --- |
| manager | HTT-DEMO-A | MANAGEMENT | 公司 A；明确拥有 customer:read、branch:read、order:read、order:create |
| sales | HTT-DEMO-A | SALES | 客户 A 的 DEMO-A1 门店；customer:read、branch:read、order:read，没有 order:create |
| customer-a | HTT-DEMO-A | CUSTOMER | 客户 A 的 DEMO-A1 门店；仅 branch:read |
| customer-b | HTT-DEMO-B | CUSTOMER | 客户 B 的 DEMO-B1 门店；仅 branch:read |

两家公司、两个客户、三个门店、四个内部账户、四个成员、四个角色、四个 Grant、三个门店授权。DEMO-A2 与 A1 属于同一客户，但未分配给 customer-a，可验证不能按客户自动扩大门店范围。

这四个标签不是 Keycloak 登录名，没有密码、issuer/subject 映射或外部用户。不会凭角色名称或演示数据绕过认证。订单创建业务尚未实现；manager 的权限只用于后续授权验证。通知权限未分配，Fake 推送也不会被此脚本触发。

## 操作

在项目根目录使用Java 21，已有当前Windows用户的 `.local/main-database.xml` 和验证库凭据。凭据不打印，不写入SQL。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
# 写入/检查/清理的完整事务演练，最后全部回滚；只在未保留本数据集时运行
./scripts/database/Use-DemoData.ps1 -Target Validation -Action rehearse
# 持久化演示数据；重复 seed 会因唯一约束失败并整体回滚，不覆盖已有数据
./scripts/database/Use-DemoData.ps1 -Target Main -Action seed -DevelopmentData
# 输出内部 actor/company/grant ID，验证授权门店和跨公司拒绝
./scripts/database/Use-DemoData.ps1 -Target Main -Action check
# 可选：定向删除本数据集，不删审计，不使用 CASCADE/TRUNCATE
./scripts/database/Use-DemoData.ps1 -Target Main -Action remove -DevelopmentData
```

工具校验精确JDBC地址、迁移角色、实际数据库/会话角色和V1～V6迁移状态；操作加事务锁和语句超时，任何失败整体回滚。ID由固定 `htt-demo-v1:` 命名空间生成。Main写入必须显式 `-DevelopmentData`，Main禁止rehearse；无自动迁移或应用功能开关变更。不要在生产设置开发数据开关。

若以后新增外部身份映射或业务依赖，remove 可能被外键拒绝；应先核对依赖，不能追加 CASCADE。演示数据可与自动化随机 ID 测试数据共存，但不应同时运行人工初始化与数据库测试。未来生产发布不得导入这些文件。

## 人工检查

数据库客户端选择 `htt_management`，用有权查看该库的开发账号查看：

```sql
SELECT code,name FROM identity.company WHERE code IN ('HTT-DEMO-A','HTT-DEMO-B');
SELECT c.code AS customer,b.code AS branch,b.name
FROM crm.customer c JOIN crm.customer_branch b
 ON b.company_id=c.company_id AND b.customer_id=c.id
WHERE c.code IN ('DEMO-CUSTOMER-A','DEMO-CUSTOMER-B') ORDER BY c.code,b.code;
```

API 运行账号受 RLS 保护，直接 SQL 不会自动获得这些行的访问权。浏览器/Swagger 检验仍需后续接通真实 Keycloak 测试用户、正确的 issuer/subject 绑定、受信任证书及启用相应功能。数据库有数据不等于真实登录完成。

## 首轮实际验证（历史，2026-11-07）

- `DemoData.java rehearse`：真实验证库内 seed → scope/check → remove 成功，最后回滚。
- 主库地址及非法动作拒绝检查：均在连接前拒绝；未尝试连接主库。
- `mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository -Ppostgres-it -Dhtt.test.database=dedicated verify`：92项普通、15项真实PG全部通过，零失败/错误/跳过，JAR成功；日志 `.cache/demo-data-verify.log`。没有重新运行RabbitMQ容器测试。
- 构建后通过 `Use-DemoData.ps1 -Action seed` 提交数据，再以独立连接执行 `-Action check` 通过。验证客户A/B各有一个显式门店、跨公司拒绝、销售/客户无创建正式订单权限。
- 本轮新增四个脚本文件及本说明，更新STATUS/database；未改Java业务源码、HTTP接口、表结构、Flyway、前端、主库或ERPNext。

## 日常业务库统一后的实际结果（2026-11-07）

用户要求以Main作为当前开发/人工验收库后，已修改工具支持显式目标和开发写入开关。在Validation通过92项普通/15项真实PG及JAR验证后，Main已应用V3～V6；同一最小演示集已写入Main并重新连接check通过。Validation的人工演示集随后定向remove，rehearse再次通过并全部回滚；最终只读盘点Validation账户/客户/门店/授权均0，Main保留上述演示集。未复制任何真实客户或交易。

Main未开启开发写入开关的seed、Main rehearse、Java直接Main写入未授权开关的拒绝检查均通过，在数据库连接前终止。该开关防止误操作，生产应完全不执行演示工具。后端使用Main运行账号临时启动并readiness UP；没有创建Keycloak业务用户或接通登录。
