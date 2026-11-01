# D03：受控周期草稿与审核过账（052）

本包只改htt-backend；新增052，001—051不修改。三个客户端、真实邮件、银行、工资或税务服务不操作；未执行生产迁移。

交付的是**自动生成待审核提案→独立人员核对当期事实→调用既有单据过账**。提案不是已开税务发票/应付/已付款证明。不会自动创建销售订单、直接绕开订单开票、自动支付、自动申报GST或发邮件。原R024整行保持部分实现，自动最终过账、复杂排程及客户端另验；这符合D03先做草稿和受控审批的约定。

## 调度与版本

模板包含name、kind、frequency、every、startsOn、endsOn、maxOccurrences、payload；kind为INVOICE/EXPENSE_BILL/BANK_TRANSACTION。frequency为DAY/WEEK/MONTH，every为1—120，maxOccurrences为1—1200；开始日期不早于2000-01-01，结束日期必须明确、不早于开始、最多相距36525天。无无限循环模式。

初始PAUSED。RESUME才启动，PAUSE只停止后续生成，已有提案仍可独立审核；CANCEL不可恢复，拒绝所有未过账DRAFT/FAILED，保留APPROVED及其正式单据。达到结束日或次数上限为COMPLETED，不自动延长；新计划另建模板。无删除/恢复导致重复出单。

日粒度排程使用**当前公司时区的本地日期**，不借服务器UTC日期推断澳洲业务日。没有小时/Cron/分钟计划。月度计算始终从原startsOn加n×every个月，月末按该目标月末截断；1月31日→2月28/29日→3月31日，不逐月从2月末继续漂移。周按7天，日按本地日期相加；没有DST重复钟点问题。

Worker每次事务锁定一个到期模板（FOR UPDATE SKIP LOCKED），最多补生成25期，仍有工作立即继续；空闲30秒再轮询。每个(template,occurrenceIndex)唯一，创建提案、推进nextIndex和审计同事务；崩溃/超时回滚后可以安全重试，无外部副作用，不需要远端UNKNOWN租约。不得以跳到今天的方式静默丢弃逾期次数。

只有PAUSED可REVISE payload。每次追加不可变revision，已生成提案固定引用旧版本；新版本仅作用于尚未生成的下一个槽位。频率、起止日、最大次数、类型不可原地修改，避免切点歧义；需要更改时显式取消旧模板并新建。修订原因保存于审计/版本历史，版本元数据也按对应来源权限过滤。

生成前重新检查scheduleActor活跃权限和来源。来源权限撤销、商品/会计来源不可用时暂停，lastError=recurring_source_unavailable，不推进nextIndex；修复后由有权限人员RESUME继续原槽位。恢复不会改动已生成提案版本。

## API

所有路径加`/api/v1`，沿用OIDC、X-Company-Id、no-store、限流及事务；写请求Idempotency-Key必填。change/review同时需当前对象If-Match；revision为内容版本，version为乐观并发版本，两者不可混用。

| 方法 | 路径 | 契约 |
|---|---|---|
| POST | /recurring/templates | 创建上述模板，201返回完整PAUSED模板 |
| GET | /recurring/templates | page/pageSize；授权后计数和分页，最大100 |
| GET | /recurring/templates/{id} | 当前payload、版本、进度、时区、受权版本元数据 |
| POST | /recurring/templates/{id}/change | `{action:PAUSE/RESUME/CANCEL/REVISE,reason,payload?}`；REVISE需payload |
| GET | /recurring/runs?templateId=... | 分页授权提案及totalCount；过滤不泄漏无权来源的金额/数量 |
| GET | /recurring/runs/{id} | 固定来源版本、dueOn、authorId、state/version、documentId/errorCode |
| POST | /recurring/runs/{id}/review | `{action:APPROVE/REJECT/RETRY,reason,evidence?}`；APPROVE需当期真实证据 |

新增recurring.read/write/review。ADMIN/FINANCE默认三项，OFFICE默认read/write，底层来源权限仍需逐项满足。read需要发票读+客户分配/订单可见性，或账单读+purchase.cost.read，或通用银行原读权限集；有recurring.read不等于能读全部模板。APPROVE另需原销售开票/费用账单/银行过账及其相关权限。只有原角色范围内的数据可见，公司/来源越权404或403。

模板原创建人及该提案版本作者不能通过review自审（包括重试/拒绝）；CANCEL是模板层明确停止操作。审批在模板→提案锁顺序下重查版本/状态；一次提案最多一个正式documentId。已APPROVED/REJECTED不能再次批准；正式单据的撤销只走原合法冲销流程，不通过改提案来改账。

审核源单据被拒绝时，内部子事务回滚所有经济效果，提案保存FAILED/errorCode=recurring_posting_rejected，**HTTP200表示审核命令已处理，必须检查state，不代表已经过账**。修复证据后独立人员显式RETRY回到DRAFT，再用新键APPROVE。缺权限/自审/版本冲突在外围拒绝，返回403/404/409；输入校验422。事务末延迟约束失败也会整笔回滚，此时提案可能仍是原DRAFT，客户端应重新GET后按同键安全重试。

同键同输入重放原操作结果，输入变更409；每次重放前检查当前来源可见性及原过账权限。FAILED旧键重放仍是旧FAILED结果，不当作新审核。

## 三类payload及当期证据

所有payload为<=64KiB对象，1—50行；金额显式、有限、非负、最多14位整数及2位小数，数量6位小数。不接受NaN/Infinity、负数、科学计数法字符串或超精度。实际会计科目、税码/税率、GST、期间和原业务约束仍在正式过账时校验。

### INVOICE

```json
{"orderId":"<已有正式销售订单>","lines":[{"orderLineId":"<订单行>","quantity":"1"}]}
```

批准evidence：`{orderVersion,fulfilmentReference?}`。非库存/服务必须给真实履约参考号；库存仍需已发运未开票数量。只调用sales.post_invoice，不建假订单/假发运。按批准时公司当天开票，不能把dueOn当成任意回溯发票日期；当期GST注册、信用承诺释放、AR/GST/收入仍沿用原函数。已开票数量耗尽时后续周期失败，不复用同一供应冒充新交易；长期重复供应需相应有效订单/合同另处理。

### EXPENSE_BILL

```json
{"supplierId":"<供应商>","lines":[{"expenseAccountId":"<费用科目>","description":"租金",
"net":"100.00","tax":"10.00","taxCodeId":"<税码>","recoverableGst":true}]}
```

批准evidence：`{supplierInvoice,invoiceDate,dueOn,postingDate,taxInvoiceReference?,taxInvoiceHeldOn?}`。当期真实供应商票号/税务证据不存进循环模板自动套用；由审核人填写。复用purchase.post_expense_bill及原供应商票号防重/AP/进项GST/现金制归属规则，不伪造采购收货或GRNI。

### BANK_TRANSACTION

```json
{"kind":"PAY","bankAccountId":"<资金账户>","lines":[{"accountId":"<费用/收入科目>",
"description":"已发生收支","net":"10.00","tax":"0.00","taxCodeId":"<税码>",
"basClass":"NON_CAPITAL","cashFlowCategory":"OPERATING","recoverableTax":"0.00","inputTaxedPercent":"0"}]}
```

模板kind仅PAY/RECEIVE，不包含成对转账或支付指令。批准evidence：`{occurredOn,reference,settledConfirmed:true,noPriorPostingConfirmed:true,taxInvoiceReference?,taxInvoiceHeldOn?}`，review.reason作为记账原因。只有确认已实际发生且无先前发票/税额/过账才调用accounting.post_general_banking；否则应走原发票及核销流程，不用周期模板制造现金或重复抵税。仍需有效银行/现金流分类、会计期间和对账截止日。记录既有经济事实不等于发起银行付款。

证据日期须明确ISO yyyy-MM-dd，不接受infinity、无效日期或日期时间字符串；原函数继续验证日期范围、实际税务证据和关闭期间。

## 一致性与运行边界

三张表强制公司RLS，应用无表DML；仅白名单网关可用。revision不可变，提案来源和单据复合公司外键、唯一槽位及单据链接。Worker只可tick，不能approve；Portal不能访问。SQL安全网关固定pg_catalog search_path并检查当前成员/底层数据范围。

审核正式过账成功时同时保存原模块audit/outbox事件（sales.invoice_posted、purchase.bill_posted、accounting.general_bank_posted）和周期关联；同键或并发不会重复事件。审计/事件/正式单据/提案链接任一失败均回滚，FAILED审计不引用已回滚的幽灵单据。模板创建/修改的outbox只由既有诊断订阅消费，不模拟邮件或付款。

本包无真实定时银行扣款、订阅收费/续单、自动税务申报、附件捕获、自动PDF/邮件、银行转账循环、假发票模式、小时级Cron或时长计费。PDF/邮件仍对已正式过账单据使用原受控接口。客户端页面/通知及生产规模、监控告警、实例多副本/备份恢复仍需上线验收。

验证包含28项周期专项、003—051逐版升级及原发票/费用/银行、关账和现金/非现金制跨模块一致性；精确清单及平台结果见[验证记录](verification.md)和[机器可读结果](stage-d-03-results.json)。
