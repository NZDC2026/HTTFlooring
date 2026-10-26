# 阶段B：独立供应商费用贷项与退款

022在021独立费用账单上补充供应商贷项通知单（Adjustment Note）、原费用/AP/进项GST冲销，以及实际到账的供应商退款。仅修改htt-backend；三个客户端未改，正式库未迁移。

## 费用贷项

`POST /api/v1/supplier-expense-bills/{billId}/credits`

```json
{
  "reference": "SUPPLIER-CN-1042",
  "reason": "Verified supplier adjustment note for cancelled services",
  "lines": [
    {"billLineId": "<original expense bill line UUID>", "amount": 55.00}
  ]
}
```

需要员工JWT、公司上下文、`Idempotency-Key`，以及 `purchase.expense_credits.post`、`purchase.credits.read`、`purchase.bills.read`。新增post权限默认ADMIN/FINANCE；原实物采购贷项权限不隐含费用贷项权，费用贷项也不需要仓库退货权。接口与SQL入口均鉴权，重放先重新检查权限及原账单公司/类型。

每单1—50个不同原账单行，全部必须属于指定的EXPENSE账单。`amount`为显式含税贷项金额，非负且至多2位小数；非零来源要求正数，不得超过该行剩余含税金额。系统按原行累计比例计算：

`本次net = round(原net × 累计贷项gross / 原gross,2) − 已贷net`，`本次tax = 本次gross − 本次net`。

可抵扣税沿用原冻结全额可抵扣/不可抵扣事实；不可抵扣税计入费用冲销。最后一笔吸收尾差，不接受客户端更改税码、税率、科目或任意税额，不按当前商品/税率重新计税。零金额来源允许一次0额贷项作完整追溯，不生成空Journal或可退现金。

贷项使用现有SC编号；供应商参考号trim并忽略大小写后，与原收货来源贷项统一唯一。响应201 `{credit,lines}`，头增加 `creditType=EXPENSE/expenseAmount`，行增加原 `expenseAccountId/expenseAmount/snapshot`；费用行的 `returnLineId`、`quantity` 为null，按金额管理，没有实物数量。旧收货来源仍为RECEIPT，旧quantity和returnLineId保持原语义。

## 分录与退款

以原费用100、可抵扣GST10、含税110为例：

| 情况 | 贷项借方 | 贷项贷方 | 后续 |
|---|---|---|---|
| NON_CASH全额贷项 | 原供应商AP110 | 原费用100、原Input GST10 | 已付超额形成可退余额 |
| CASH全额贷项 | 原供应商AP110 | 原费用100、原Deferred Input GST10 | 未付不抵扣；已抵扣部分按现有现金制退款/重算规则调整 |
| 不可抵扣全额贷项 | 原供应商AP110 | 原费用110 | 不产生进项抵扣/调整 |

部分贷项按同一原账单行派生剩余gross/tax/AP。CASH在已付额不超过剩余账单金额时重算累计归属并处理尾差；已付额超过剩余账单形成可退余额时，超额已抵扣GST保留为pendingRefundTax，实际收到退款后按现有规则调整Input/Deferred。NON_CASH在贷项业务日冲减归属，退款不重复冲GST。

退款继续使用原接口 `POST /api/v1/supplier-refunds`，以及原 `purchase.refunds.post` 权限、SR编号和幂等规则：

```json
{
  "amount": 55.00,
  "reference": "BANK-RECEIPT-8042",
  "reason": "Verified incoming supplier refund",
  "creditLineId": "<expense credit line UUID>",
  "receivedOn": "2026-10-25"
}
```

同一请求只选creditLineId或advanceId之一，amount必须正数；不得早于贷项日、不得晚于公司当天，退款期间必须开放。可退额同时受该贷项行未退余额和原账单行真实净付款超额限制。未付贷项只消除AP，不能凭贷项套取现金。退款借银行、贷原供应商AP；CASH按来源调整原Input/Deferred并写不可变GST调整明细。退款是记录已核实到账，不向银行执行操作。

直接付款和预付核销均计入原账单净已付额；核销后贷项可形成可退余额，实际退款经AP回收，不悄悄恢复已用预付款。尚未分配的预付款仍沿用原advanceId退款流程。贷项后的付款/核销只能结算剩余AP，超额拒绝。

## 查询、控制与迁移

统一使用 `/supplier-credits`、`/supplier-credits/{id}`、`/supplier-refunds`、`/supplier-refunds/{id}`、`/supplier-bills/{id}`、`/accounting/ap`、`/accounting/purchase-gst`、`/accounting/purchase-gst-attributions`、`/accounting/reconciliation`。保留原读权限与公司隔离；GET展示当前余额，幂等重放返回原命令响应，不重新记账。

022只扩展既有贷项头/行，仍123张业务/基础表，22个版本化迁移；001—021摘要不改。RLS/公司复合FK、原不可变约束、互斥实物/费用来源、延迟金额/原费用凭证校验保留。贷项使用原费用/AP/GST账户，实际使用的原账户必须有效；后续映射、科目名称、税率或供应商停用不改原金额与税务事实。原账期可关闭，新的贷项/退款必须在各自开放过账期。

贷项、付款、核销及退款共用供应商→AP锁顺序。并发不超贷、不超付、不超退；同键同内容只一次，异内容409；不同键也受余额及供应商参考号唯一性保护。SC/SR编号、来源、费用/AP/GST/GL、冲销链接、审计和成功幂等记录同事务；晚期失败完整回滚，原键可重试。无需PO、收货、实物退货、退货清算账户或库存/成本更新。

本批为原账单金额范围内、沿用原税务分配的金融贷项/退款。023已补供应商贷项跨账单抵扣与整笔解除，见[贷项抵扣流程](stage-b-credit-applications.md)。任意价格/税额差异、外币、银行账户选择/对账、费用账单草稿/附件、贷项或退款本身撤销及完整BAS仍待后续。已过账原单、贷项和退款均不能删除或改写；退款不表示撤销贷项，不恢复原费用或重新开立原AP。
