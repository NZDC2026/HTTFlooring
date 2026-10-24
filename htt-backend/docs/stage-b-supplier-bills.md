# 阶段B：供应商账单、收货匹配与应付/GST

本批仅修改htt-backend。AUD供应商账单通过已入账收货行匹配，可部分匹配、跨同一供应商多张收货/采购单合并；一次过账生成SB编号、匹配记录、GRNI冲减、正式AP及进项GST明细。过账不可编辑/删除。012起已实现供应商付款、预付核销和现金制进项GST归属，见[供应商结算流程](stage-b-supplier-payments.md)。采购退货、供应商贷项/退款及来源冲销由013实现，见[采购冲销流程](stage-b-purchase-returns.md)。

## 接口与权限

前缀 `/api/v1`，JWT、X-Company-Id和公司RLS必需。POST必须提供Idempotency-Key；这是一次创建并过账的命令，不编辑已有账单，不要求If-Match。财务金额与数量输出十进制字符串。

| 方法与路径 | 权限 | 用途 |
|---|---|---|
| POST `/supplier-bills` | purchase.bills.post | 校验匹配并整单过账，201 |
| GET `/supplier-bills/{id}` | purchase.bills.read | 冻结账单、来源匹配明细 |
| GET `/supplier-bills?supplierId=...&page=1&pageSize=25` | purchase.bills.read | 公司账单列表 |
| GET `/accounting/grni/unmatched?supplierId=...` | purchase.grni.read | 可匹配收货行、剩余数量/净额/税额/GRNI |
| GET `/accounting/grni?supplierId=...&warehouseId=...` | purchase.grni.read | accruedAmount现为未冲减余额；amount保留原暂估，outstandingAmount为行余额 |
| GET `/accounting/ap?supplierId=...` | purchase.ap.read | 公司应付总额、到期日、供应商party和总账来源 |
| GET `/accounting/purchase-gst?supplierId=...&from=2026-10-01&to=2026-10-31` | purchase.input_gst.read | 已归属进项GST及现金制待付款GST |

列表都支持page/pageSize，默认1/25，上限100。GST日期边界包含端点，仅过滤已归属条目；现金制待付款条目无归属日，仍列示，pendingPaymentTax不受该区间裁剪。该接口是归属明细查询，不是BAS申报表。

默认只有ADMIN、FINANCE获得四个新增权限；采购/仓管/销售/办公室不获得账单或AP/GST读取权限。财务匹配不要求物理仓库范围，但不能据此执行收货。数据库命令再次核验有效成员及purchase.bills.post权限。账单与匹配/应付/GST表强制公司RLS、复合外键、追加不可变，htt_app只有SELECT及受控命令EXECUTE。

## 请求与匹配

```json
{
  "supplierId": "uuid",
  "supplierInvoice": "SUP-INV-001",
  "invoiceDate": "2026-10-24",
  "dueOn": "2026-11-23",
  "postingDate": "2026-10-24",
  "taxInvoiceReference": "verified-original-tax-invoice-reference",
  "taxInvoiceHeldOn": "2026-10-24",
  "notes": "Invoice checked against accepted goods",
  "lines": [{ "receiptLineId": "uuid", "quantity": "2", "net": "20.00", "tax": "2.00" }]
}
```

响应 `{ "bill": {...}, "lines": [...] }`，bill包含id、number、version、state、供应商身份/付款条款快照、原发票号、日期、净额/税额/总额、grniAmount、recoverableTax及Journal ID。

- 一次1—50个不同收货行，必须已POSTED、属于当前公司及同一有效供应商；数量为原采购单位，正数、6位精度、遵守确认时冻结的步长，不能超过收货未匹配量。供应商停用、登记政策变化、跨供应商/公司及未收货采购行拒绝。
- net/tax必须显式提供，非负、2位精度，表示该次匹配的实际供应商金额。系统独立计算 `round(收货原金额 × 累计已匹配数量 / 收货数量,2) − 已匹配金额`，净额与税额分别累计，最后一批吸收尾差。与实际账单金额不一致返回422，不能偷偷调库存价值或费用。
- 本批按精确三单匹配实施，价格/税额差异、运费落地成本分摊、部分商业用途再分摊、进口/逆向征税、外币及非收货费用账单尚无差异审批/调整命令；先解决来源合同/凭证差异再录账，不能更换发票号规避。
- supplierInvoice去两端空白，**公司＋供应商下不区分大小写唯一**。不同操作员、不同键及不同收货行仍不能重复同一发票；不同供应商可用相同发票号。一张实体发票多次分录不支持拆成同号多张账单，应一次传齐分项。
- invoiceDate、dueOn、postingDate必填；到期日不早于发票日，发票日不晚于过账日，过账日不晚于公司澳洲时区今天且不早于匹配收货日，必须处于开放会计期间。原发票日可早于收货/录账日，但不会追溯改变库存成本。
- 可抵扣GST遵从已冻结采购计价分类。recoverableTax>0时必须提供人工核验的有效税票引用和实际持有日；持有日须在发票日至过账日之间。引用是凭证索引/核验声明，系统不下载、不验证凭证内容或供应商GST登记。即使小额采购本批也统一要求引用；不支持缺票先入账后补票。

客户端不能指定正式号、科目、GRNI、AP余额、GST制度或库存调整。采购成本、税码/税率、可抵扣政策来自原收货/合同；未接受传入自由Journal。

## 会计与GST

假设收货净额20，GST2：

| 情形 | 账单借方 | 账单贷方 |
|---|---|---|
| GST可抵扣，NON_CASH | 原收货GRNI 20，GST Input 1300 2 | AP 2000 22 |
| GST可抵扣，CASH | 原收货GRNI 20，待付款GST 1410 2 | AP 2000 22 |
| GST不可抵扣/未登记 | 原收货GRNI 22 | AP 2000 22 |

不可抵扣税已随收货资本化/计入费用，账单不重复记税。GRNI冲减使用**原收货保存的科目**，不因后来改映射而冲错负债；原科目必须仍有效。AP和GST使用有效同公司映射并保存来源；现金制同时保存最终Input账户及本次Deferred借方账户。商品数量、成本池、预留、销售COGS在账单过账时不变。0额收货仍生成账单/匹配/AP/GST轨迹并消耗匹配数量，但不写空Journal。

NON_CASH把可抵扣税归属日保存为发票日与持票日较晚者，独立于当前GL过账日；因此迟录凭证的GST可能属于此前期间，应由财务审核历史申报/更正，接口不自动回开已关闭GL期间或提交/更正BAS。CASH在账单时没有可申报归属，先保存在1410及attribution_date=null的明细，012供应商付款/预付核销流程按实际支付份额归属并转入Input账户。新旧账单保存当时GST制度；已有账单后税制/登记切换须受控过渡，owner配置CLI拒绝直接切换。

规则依据：ATO [现金制GST](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/accounting-for-gst-on-a-cash-basis)、[非现金制GST](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/accounting-for-gst-on-a-non-cash-basis)、[GSTR 2003/12](https://www.ato.gov.au/law/view/htm?Docid=GST%2FGSTR200312%2FNAT%2FATO%2F00001)。普通国内已验收、赊购采购是本批支持场景，不覆盖特殊税务交易或正式BAS编制。

## 原子性、幂等与并发

同公司/操作员/路由/键同内容重放原成功内容；JSON存入jsonb后空白和属性顺序可能变化。不同内容409；失败不占成功键。公司＋供应商＋发票号唯一约束覆盖跨员工重复。所有账单按GRNI ID统一排序锁来源，再读取累计匹配数量/金额，禁止两笔并发超额匹配；无需修改原收货或采购单版本。多行请求先完整验证再分配SB号。

编号、账单、匹配、Journal、AP/GST、审计/Outbox及成功幂等记录在同一公司事务中提交；关账、缺映射、超额、重复及末尾异常全部回滚。锁超时/死锁等409可用原键重试；业务超额需刷新剩余量。无部分成功。

新增011迁移和4张表：purchase.bills、purchase.bill_lines、accounting.ap_items、accounting.purchase_gst_entries，合计94张业务/基础表，另有迁移历史；新增1410及GST_INPUT_DEFERRED映射。001—010不变；已有公司通过迁移补种角色/序列，新公司bootstrap调用同一seed。未迁移正式账套、未对外付款、未部署三个客户端。
