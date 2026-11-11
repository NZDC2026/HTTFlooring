# 前端需求对齐的后台验收

本批只更新 Java 后台和验证配置。三个前端保留现有实现及连接地址；管理端 `business.command` 并不是 REST 的别名，后续接入仍需独立适配。本目录不把接口数量清点当成行为验收。

## 已补齐的业务约束

- 新库存产品默认 FIFO，原库存产品保留移动加权平均。切换成本法要求全部仓库数量、价值均为零，并检查版本、权限和幂等键。历史库存、日记账不回写。
- FIFO 负向价值调整按各层剩余价值分摊、按分取整并消化尾差，避免总库存价值仍非负时低价层被分成负数。正向调整保留数量分摊；以前已经出库的成本不改写。退货及在途返回形成新入库层。
- 报价提交后的商业预留与实物库存分开。跟进期限到达时，门户、管理端查询、转订单和预留投影使用相同判断，不依赖下一次后台轮询。
- 跟进邮件必须获得提供商接收回执，才开始报价的七个日历日期限；订单不会自动取消。暂时失败使用稳定幂等键和有界重试；超时、失效租约或不确定结果不自动重发。发信前再次检查当前收件人、配置和单据。
- 公开改期接口仅授权一张单据的日期更新：严格 Origin、自定义请求头、JSON、10KB 上限和每连接地址每分钟30次限制；不得借此写库存或账务。相同更新可安全重试，不同的重复更新被拒绝。查询索引保存 token 哈希，原 token 仅存在于私有邮件载荷；员工列表和公开响应不返回 token 或邮件载荷。
- 每项退货至少两张不同的已扫描照片，且照片必须属于当前订单；交接证明包含姓名、时间和有效手写轨迹。申请为 `PENDING`，不会改库存或账目；处理/拒绝检查版本。实际入库复用原有退货、期间、数量和仓库校验。申请不预占退货额度，处理时重新核对以防重复入库。
- 发票及客户对账单催收先预览再明确确认；预览有效期10分钟。确认、领取及 PDF 生成后发送前均复核账单、余额、收件人、权限和配置。已经付清、隐藏、Sample 或变化的数据不能沿用旧预览；不确定的发送结果保留供人工核对，不自动重发。

## 新增接口

| 用途 | 路径 |
| --- | --- |
| 调度设置 | `GET/POST /api/v1/dispatch-followups/settings` |
| 单据日期及交付标志 | `GET/POST /api/v1/documents/{id}/dispatch-schedule` |
| 客户改期链接 | `POST /api/dispatch-portal`，`action=view/update`；另支持受限预检 |
| 催收设置、候选记录 | `GET/POST /api/v1/invoice-reminders/settings`、`GET /api/v1/invoice-reminders` |
| 催收预览、确认及结果 | `POST /api/v1/invoice-reminders/preview`、`POST /api/v1/invoice-reminders/batches/{id}/queue`、`GET /api/v1/invoice-reminders/batches/{id}` |
| 退货申请 | `GET/POST /api/v1/warehouse/return-requests`；列表需 `warehouseId` |
| 退货详情、处理或拒绝 | `GET /api/v1/warehouse/return-requests/{id}`、`POST /api/v1/warehouse/return-requests/{id}/decision` |
| 照片上传 | 复用 `POST /api/v1/documents/{orderId}/attachments?fileName=...`，待扫描通过才可用于退货 |

员工写操作需要 Bearer、公司选择和 `Idempotency-Key`；设置和既有对象更新另需 `If-Match`。仓库角色只增加订单证据读写能力，不增加发票、成本或邮件权限。客户链接不使用员工登录，也不开放客户账务写权限。

## 本地重跑

先运行 `mvn --batch-mode verify`。建立临时 Python 环境，安装 `infra/stage4-test-requirements.txt`，将其中的解释器设置为 `HTT_PYTHON`。同时需要 JDK21、Docker、OpenSSL、.NET10 和项目使用的 Flutter。

```sh
python3 tests/stage4/migrations.py
python3 tests/compatibility/run.py --gst-basis CASH
python3 tests/compatibility/run.py --gst-basis NON_CASH
python3 tests/frontend-contracts/portal-sales.py --snapshot <已通过的合成快照>
```

组合脚本创建自己的 PostgreSQL 和本地 OIDC/API，运行真实订单、出库、退货及公开接口，并将邮件传输注入为本地假回执。它不会调用真实邮件 HTTP 传输。`--jar` 可选择冻结构建；探针直接使用该 JAR 中的类及资源，避免构建覆盖造成证据混淆。

完整回归可通过 `HTT_COMPAT_API_PORT`、`HTT_COMPAT_LEGACY_PORT`、`HTT_COMPAT_ISSUER_PORT` 使用独立端口并行运行。`HTT_COMPAT_JAR_OVERRIDE` 选择已构建 JAR；每次回归另存冻结副本及 SHA256。测试快照中的扩展迁移记录需匹配当前源码校验和；原55项基线快照也可直接扩展，不重复执行已记录的迁移。

原始证据在 `target/frontend-contracts/<运行ID>/`；只将结果摘要纳入文档，不提交数据库转储、测试私钥和构建缓存。CI 配置包含 CASH/NON_CASH 两个独立任务，本次不推送或触发远端 CI。

## 发布与恢复

`HTT_DISPATCH_FOLLOWUPS_ENABLED` 和 `HTT_INVOICE_REMINDERS_ENABLED` 均默认 `false`；还须显式配置后台邮件密钥、有效发送者和公司设置才会发送。任何真实启用、外部发送或系统切换均不属于本批授权。

迁移采用追加方式，不删除已应用的校验和记录。若未来需要停止新功能，先停止相应入口及后台任务、等待租约结束或标记不确定结果，保留批次、退货证据和队列。已经有新 FIFO 过账时，不能删除批次表、撤销成本补丁或把旧过账解释为移动平均。代码回退必须保留前向数据库结构并重新验收；需要数据恢复时另行批准一致性备份恢复，不能覆盖后来产生的真实交易。
