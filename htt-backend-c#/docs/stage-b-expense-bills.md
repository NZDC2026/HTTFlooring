# 阶段B：独立供应商费用账单

本批在澳洲 AUD、现有 GST 账务框架内实现无需 PO 或收货的费用账单。仅修改 htt-backend；不执行正式数据库迁移，不向银行发起付款。原收货匹配账单继续使用原接口。

## 创建与过账

`POST /api/v1/supplier-expense-bills`，员工身份、公司上下文及 `Idempotency-Key` 必填。需要 `purchase.expense_bills.post` 和 `purchase.bills.read`，默认仅 ADMIN / FINANCE 获得新增权限；原 `purchase.bills.post` 不隐含此权限。

```json
{
  "supplierId": "<supplier UUID>",
  "supplierInvoice": "RENT-2026-10",
  "invoiceDate": "2026-10-20",
  "dueOn": "2026-11-20",
  "postingDate": "2026-10-25",
  "taxInvoiceReference": "verified-document-reference",
  "taxInvoiceHeldOn": "2026-10-20",
  "notes": "October operating expenses",
  "lines": [
    {
      "expenseAccountId": "<active expense account UUID>",
      "description": "Monthly rent",
      "net": 1000.00,
      "tax": 100.00,
      "taxCodeId": "<GST tax code UUID>",
      "recoverableGst": true
    }
  ]
}
```

成功返回201及与既有账单相同的 `{bill,lines}` 结构。正式编号共用 SB 序列；`bill.billType=EXPENSE`、`expenseAmount` 表示费用借方。行增加 `expenseAccountId/description/expenseAmount`，`receiptLineId/grniItemId` 为 null，内部 quantity=1；不伪造采购、收货、商品或库存。既有账单为 RECEIPT，新增费用字段为0/null，旧字段和结算接口保留。

每单1—50行，可重复费用科目。只能选择本公司有效、非控制类 EXPENSE 科目，不能把资产、银行、库存或 AP 控制科目当费用。金额为显式不含税净额和税额，非负且最多2位小数；按发票日期有效税率校验 `tax=round(net*rate,2)`。描述1—2000字符，供应商发票号1—200；同供应商发票号去首尾空白、忽略大小写后，在收货账单和费用账单之间统一唯一。

发票日期≤过账日期≤公司当地今天，到期日≥发票日；过账期间必须开放。可抵扣税需要已核实税票参考及持有日期（发票日≤持有日≤过账日），参考与日期成对。默认只有已登记公司且 TAXABLE 税码可抵扣；可显式 false，将不可抵扣税计入费用。GST free/out of scope 税码不产生进项抵扣；不支持部分商业用途百分比分摊。供应商、科目、税码、税率、税票证据、税务口径和原账户随来源冻结。

## 分录与现有结算

| 情况 | 借方 | 贷方 |
|---|---|---|
| NON_CASH，可抵扣100+10 | 费用100，Input GST10 | AP110（供应商party） |
| CASH，可抵扣100+10 | 费用100，Deferred Input GST10 | AP110（供应商party） |
| 未登记或明确不可抵扣100+10 | 费用110 | AP110（供应商party） |

NON_CASH 按发票/税票持有日期中较晚者归属。CASH 在付款或预付款核销时，沿用原来源 Input/Deferred 账户，按累计实付比例归属，最后一笔吸收尾差；日期沿用现有 `max(原付款日期,税票持有日期)`。账单过账不动银行、库存、成本池或 GRNI。零金额仍保留账单行、AP/GST来源，不生成空总账凭证。

查询继续使用：

- `GET /supplier-bills`、`GET /supplier-bills/{id}`：统一账单列表/详情；金额沿用十进制字符串输出。
- `GET /accounting/ap`、`GET /accounting/purchase-gst`、`GET /accounting/purchase-gst-attributions`：既有权限及供应商过滤。
- `POST /suppliers/{id}/payments`、`POST /supplier-advances/{id}/apply`：直接使用费用账单行 ID；一笔可混合结算同供应商的 RECEIPT 与 EXPENSE 行，保留原付款/核销权限和规则。
- `GET /accounting/reconciliation`：统一 AP、预付、GST、GRNI 与 GL 控制核对。

## 可靠性与边界

021增量迁移修改既有账单头/行，不新增业务表（仍123张，21个迁移）；001—020原文件不改。保留公司复合外键/RLS、只读表授权、不可变账簿、受控 definer 写入口和延迟总额/AP/GST/费用分录来源校验。API/数据库均验权限；缓存重放也重新鉴权。同键同内容返回原201，异内容409；跨员工、不同键重复供应商发票号也不能重复记账。编号、单据、费用/AP/GST/GL、审计和成功幂等响应同事务，失败完整回滚，原键可重试。付款/核销继续锁定原 AP 和供应商，避免超付。

本批为直接创建并过账，不提供费用账单草稿CRUD、修改已过账金额、删除或回收站恢复。022已补原金额范围内费用贷项及退款，见[费用贷项流程](stage-b-expense-credits.md)；自由税额/价格调整及撤销贷项本身需后续财务命令；现有实物采购退货及来源贷项仍需真实收货/退货来源，不能用伪收货冲销费用。供应商账单附件管理、价格差异审批、费用资本化/摊销、外币、银行对账和完整 BAS 仍按验收清单保留，不将本批视为阶段B全部完成。
