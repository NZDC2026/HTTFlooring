# 供应商付款与预付款核销：撤销和重新核销

026仅改htt-backend；澳洲/AUD/公司营业日口径，原001—025不改，三个客户端未改，正式数据库未迁移。

## 操作与余额

原付款、核销、税归属和凭证均不可变。撤销新建SPR反向单，预付款核销解除新建SAU；原单保持POSTED，当前有效状态由反向事件派生。全部为账务录入更正，不发起银行交易；供应商实际退回的钱仍走原退款流程。

通常用一步reallocate，原付款撤销和新分配同事务完成，银行净额不变。也可先撤销错误录入，再关联重新核销；两步之间原付款失效，AP/预付余额如实恢复。每次处理整笔付款或整笔核销；部分改分配可在一步更正中保留其他分配、调整目标行。

付款撤销恢复原账单未付AP，并冲回原银行支出/未使用预付资产；SAU恢复原账单未付AP及可用预付资产，不动银行。重新核销沿用原供应商、party、总含税金额、方式和银行账户，仅调整合法账单分配/明确预付款金额，合计必须等于原额。银行/AP映射后来改变仍按原银行及各账单冻结AP账户处理。

## API

路径前缀`/api/v1`；员工JWT、公司上下文和`Idempotency-Key`必需，写入成功201。新写入还需purchase.payments.read和purchase.bills.read；SQL命令再次校验有效成员及权限。新增三项权限默认仅ADMIN/FINANCE。

| 方法与路径 | 用途 | 权限 |
|---|---|---|
| POST `/supplier-payments/{id}/reverse` | 整笔付款撤销，SPR编号 | purchase.payments.reverse |
| POST `/supplier-payment-reversals/{id}/reapply` | 原付款资金关联重新核销 | purchase.payments.reapply + purchase.payments.post |
| POST `/supplier-payments/{id}/reallocate` | 原子撤销并重新核销 | reverse + reapply + payments.post |
| POST `/supplier-advance-applications/{id}/unapply` | 整笔解除预付核销，SAU编号 | purchase.advances.unapply |
| POST `/supplier-advances/{id}/apply` | 使用恢复的预付余额重新分配 | 原purchase.advances.apply |
| GET `/supplier-payment-reversals/{id}` | 反向单、原分配、GST及替代付款关联 | purchase.payments.read |
| GET `/supplier-advance-unapplications/{id}` | 解除凭证、原分配和GST | purchase.payments.read |

撤销/解除：

```json
{"reference":"SUPPLIER-CORRECTION-1042","reason":"Correct verified allocation error"}
```

重新核销：

```json
{
  "reference":"SUPPLIER-REPLACEMENT-1042",
  "reason":"Correct verified allocation error",
  "advanceAmount":0.00,
  "allocations":[{"billLineId":"<bill line UUID>","amount":110.00}]
}
```

一步reallocate用同一结构，另加reversalReference作为SPR参考号。最多50个不同目标账单行，正含税金额、最多2位小数；advanceAmount显式非负。参考1—200字、原因1—2000字；参考trim并忽略大小写后唯一，替代付款使用新参考。原付款可能含直接分配和预付，支持保留或重新拆分；预付用途以更正原因记录，继续遵守既有GST政策和供应商状态校验。

返回：reverse为`{reversal,allocations,gstAdjustments}`，unapply为`{unapplication,allocations,gstAdjustments}`；重核销为`{payment,allocations,advances,reversalId}`，兼容原付款详情结构。原付款详情/列表增加settlementStatus=ACTIVE/REVERSED，详情增加reversalId/originalPaymentId；原SA详情增加applicationStatus=APPLIED/UNAPPLIED及unapplicationId。预付available按有效核销及实际退款计算，撤销付款的预付available为0，原金额保留。

每原付款仅一个SPR，每SPR仅一个关联替代付款，每SA仅一个SAU。替代付款以后可追加新的更正链；原幂等键重放只返回原结果，不重新激活失效分配。重新apply使用新键/新参考。

## 资金保护

账单净结算=有效付款/预付核销－实际退款＋有效供应商贷项转入－转出；AP、贷项可退/可抵余额、预付可用余额和对账共用该口径。

贷项已转用或已实际退款，撤销/解除会使来源账单净结算为负则409，先处理下游转用；其他有效资金可替代，但每行资金不能为负。付款含预付时，先解除所有有效SA；预付已有实际退款的原付款不能通过SPR再次释放。已撤销付款的预付不能再apply/退款。供应商退款本身不会被此流程撤销。

## GST与会计

每边沿用原账单GST口径、可抵扣税额和Input/Deferred账户。NON_CASH不重复确认或冲回原账单进项GST；CASH按当前净结算累计重算，差额记不可变purchase_gst_adjustments并过账原Input/Deferred，消化0.01尾差。解除按当前余额重算，不简单取反原分配税额；后续付款、贷项、退款可能改变税额归属。

普通供应商预付款本身保留资产，核销到账单时按原政策确认GST；SAU冲回实际减少的进项GST并恢复Deferred和预付资产。重新apply继续校验预付/账单的冻结GST口径及登记政策，解除后的重新核销使用当前更正期间，保持原付款日期可追溯。归属日期不早于原税票持有日，既有税票日期校验不放宽。

更正使用当前开放营业日期，不能早于来源付款/核销；原账期无需重开。只调整AP、银行、预付及必要GST，不重复记费用、库存、成本或GRNI。库存收货账单和独立费用账单均适用。

## 事务与权限

与原付款、核销、贷项、退款共用supplier行锁，然后按顺序锁预付/AP来源。一步更正全过程持同一供应商锁，避免出现中间可消费余额。编号、原单反向、替代付款、AP/GST/预付、审计、Outbox和幂等同事务；失败全部回滚，可原键重试。

三张新表FORCE RLS、同公司复合FK、不可变；唯一原单撤销/重核销及参考号、延迟来源/金额/逐账户与party借贷/GST凭证校验。进项GST反向来源有索引；原按付款、账单、预付查分配索引继续复用。对账保留客户、库存、AP及GL全部检查，并新增供应商更正金额和负资金检查。

不包含供应商实际退款撤销、自由价格/税额调整、银行账户档案/选择、银行对账或完整BAS。其余阶段B事项仍按原验收矩阵保留。


## 验证

新增77项专项及025旧库升级参数；最终专项和全部旧版本升级100项通过。本机及独立Docker/Linux各1151项全部通过（11单元、1140真实PostgreSQL集成；集成集分四个独立进程），0失败/跳过、进程均退出0。最终Release构建0警告/错误，API/Worker/迁移工具双环境发布通过。详见[验证记录](verification.md)。

## 028兼容增量

供应商退款现支持SFR整笔撤销与关联替代/一步更正。有效退款统一参与AP、预付余额、原付款撤销及后续核销/贷项抵扣；旧退款历史不改。CASH按当前净结算重算Input/Deferred GST，预付退款不独立确认进项税；参见[供应商退款更正](stage-b-supplier-refund-corrections.md)。
