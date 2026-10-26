# 阶段B：采购退货、供应商贷项与退款

仅修改htt-backend。支持AUD采购收货的分批退回、原供应商账单的调整贷项、已付贷项余额退款和未核销预付退款。新交易对冲原交易，不编辑/删除已入账收货、账单、付款或原Journal。接口记录实际退回/已核实的入账资金，不自动安排物流或调用银行。

## 接口和权限

前缀 `/api/v1`，JWT、X-Company-Id和公司RLS必需。POST必须有Idempotency-Key；命令追加不可变单据，不要求If-Match。数量/金额输出十进制字符串。

| 方法与路径 | 权限 | 用途 |
|---|---|---|
| GET `/warehouse/purchase-receipts/{id}/return-sources` | purchase.returns.read＋仓库范围 | 原收货行、已开票/未开票来源及剩余可退数量，不含价格 |
| POST `/purchase-receipts/{id}/returns` | purchase.returns.post＋仓库范围 | PRT退货、扣库/成本及GRNI或待贷项清算 |
| GET `/purchase-returns/{id}` | purchase.returns.read＋仓库范围 | 退货数量、来源；金额另需purchase.cost.read |
| GET `/accounting/purchase-returns/{id}` | purchase.credits.read | 财务追溯退货，含金额，无实物仓库操作权 |
| POST `/supplier-bills/{id}/credits` | purchase.credits.post | 根据实际已退来源和核验的供应商调整通知创建SC |
| GET `/supplier-credits/{id}`、`/supplier-credits?supplierId=...` | purchase.credits.read | 贷项、已退款/可退款金额及来源 |
| POST `/supplier-refunds` | purchase.refunds.post | 实际收到的SR供应商退款记账 |
| GET `/supplier-refunds/{id}`、`/supplier-refunds?supplierId=...` | purchase.refunds.read | 入账退款及银行/贷项/预付来源 |

列表支持page/pageSize，默认1/25、上限100。ADMIN具全部权限；PROCUREMENT、WAREHOUSE具退货权限，WAREHOUSE仅分配仓库且不见净额/税/成本/GL账户。FINANCE具贷项及退款权限，不默认获实物退货权，可财务读取退货来源。OFFICE、SALES无本批写权限。SQL命令再次核验操作权限与公司/仓库范围。停用供应商仍可处理历史退回、贷项和收回旧债，不由此恢复新采购或新付款权限。

## 采购退货

```json
{
  "reference": "supplier-return-docket-unique",
  "reason": "Goods damaged; return accepted by supplier",
  "lines": [{
    "receiptLineId": "uuid",
    "billLineId": "uuid-or-null",
    "quantity": "1"
  }]
}
```

响应 `{ "return": {...}, "lines": [...] }`，return含PRT号、日期、来源收货/仓库/供应商及状态，lines含新退货行ID。数量以原采购单位计，1—50个不同(receiptLineId,billLineId)来源，最多6位精度并满足原合同步长及换算精度。原收货必须属于当前公司，billLineId如提供，必须是该收货行已匹配的账单行。

- **未开票**：billLineId=null，上限为原收货数量减已开票数量及已退未开票数量；冲减原GRNI，退回后不能再为这部分匹配账单。后续账单仅匹配余量，保留剩余净额/税额尾差。
- **已开票**：billLineId明确指定，数量不超过该账单行尚未退回量；先记入待供应商贷项清算，不立即减AP，避免把实物退回误认为已获得财务减免。
- 同一收货单可同时退未开票/已开票部分，但要分成不同来源。退货不重新开放原PO可收数量，不允许用原送货凭证再次收回同一批退货；替换货/补货应另建可追溯采购业务。
- STOCK从原接收仓库扣减，必须有足额**未预留且已估值**库存。按当前同仓同SKU移动平均成本扣减，最后一份吸收剩余成本；保留其他销售预留。不能假定原收货批次实物仍在，也不重写历史销售COGS。
- NON_STOCK/SERVICE表示撤销此前已接受的数量，冲原采购费用，不生成库存。需要对应供应商同意/业务证据，不提供任意金额费用退款或不关联验收的返利。

reference去两端空白，公司＋供应商下不区分大小写唯一，跨收货单/员工不能重复同一退回凭证。reason必填。日期固定公司澳洲时区今天，期间须开放，原仓库须有效SELLABLE/QUARANTINE；不追溯改写历史库存日。

## 供应商贷项通知单

```json
{
  "reference": "supplier-adjustment-note-123",
  "reason": "Verified supplier credit for accepted return",
  "lines": [{ "returnLineId": "uuid", "quantity": "1" }]
}
```

响应 `{ "credit": {...}, "lines": [...] }`。原账单ID在路由，必须同公司且来源退货属于该账单；1—50个不同已开票退货行，可分批贷记，不能超退货未贷数量或违反原采购步长。净额、税、可抵扣税和清算金额从退货冻结来源累计分摊，最后一批吸收尾差；客户端不能填写自由金额、科目或正式号。

reference是人工核验的供应商调整通知参考，公司＋供应商下不区分大小写唯一；一张实体通知不能分成同号多笔录入，应一次传齐明细。本批以原价、原税分类的实际退回为依据，不支持价格折让/返利、无退货贷项、跨账单合并或贷项转抵另一张账单。

SC减少原账单净应付；若原账单已付，形成该供应商AP的借方余额，API作为availableCredit列示，不能据此自动记银行收款。原账单行查询新增creditedQuantity、creditedAmount、refundedAmount、netPaidAmount、remainingGross、refundableAmount。原amount和paidAmount保留历史含义；未付为冲贷项后的净余额，银行退款不恢复为新的待付账款。

## 供应商退款

```json
{
  "creditLineId": "uuid",
  "advanceId": null,
  "amount": "11.00",
  "reference": "verified-incoming-bank-transaction",
  "reason": "Supplier refund actually received",
  "receivedOn": "2026-10-24"
}
```

响应 `{ "refund": {...} }`。creditLineId与advanceId必须且只能提供一个；金额正数、2位精度，支持部分退款。

- 贷项退款同时受该贷项行未退款金额及**该原账单行实际净已付超过净应付**的余额限制。未付款贷项不能产生现金退款；不能退超过实际已付部分，也不能借其他供应商的贷项套用。
- 预付款退款仅退原预付尚未核销/尚未退款部分，减原预付资产，不冲AP或GST。核销与退款共用同一预付余额锁。已经核销到某账单的预付，应通过该账单退货/贷项退款，退款不会再恢复原预付可用额。
- reference去两端空白、公司内退款不区分大小写唯一，覆盖不同员工和供应商；reason必填。receivedOn可省略，默认公司今天，不得未来或早于原贷项/预付付款日，须处于开放会计期间。

## 库存、会计与GST

| 业务 | 借方 | 贷方 |
|---|---|---|
| 未开票退货 | 原收货GRNI估值 | 当前库存成本／原采购费用 |
| 已开票退货 | 待供应商贷项清算1600 | 当前库存成本／原采购费用 |
| 成本差额 | 5200采购退货成本差异（成本高于原估值） | 5200（成本低于原估值） |
| 供应商贷项 | 原AP含税金额 | 原退货清算金额＋GST |
| 收到贷项退款 | 当前BANK | 原AP |
| 收到未核销预付退款 | 当前BANK | 原预付资产 |

例如退回原净额20、GST2的已开票库存：实物退货Dr1600 20/Cr库存当前成本，差额入5200；贷项Dr原AP22/Cr原1600 20/CrGST2。退货保存当时清算账户，后来改变映射也冲原账户；原账单AP/Input/Deferred和原预付账户同样保留来源。1600须为非控制类资产，不能误配AR/Bank；原科目必须仍有效。0成本/0额退货和贷项保留数量与来源，不生成空Journal。

NON_CASH在调整贷项日冲回可抵扣Input及税务归属，退款不再次冲税。CASH在贷项时先冲Deferred；已经实际支付且尚待退款的可抵扣税不会仅因贷项就当作已收到现金退款。当前GST汇总增加pendingRefundTax（已归属但等待退款调整的税额），pendingPaymentTax为剩余未付可抵扣税，两者分别列示；Deferred净额等于待付税减待退款调整税，可能暂时为贷方余额。

CASH若净已付不超过贷后净账单金额，按剩余可抵扣税/净账单金额重算累计现金税，尾差以CREDIT_REBASE记有符号调整；后续付款/预付核销按新的净余额分摊。实际收到退款时按净已付、剩余税额及原贷项比例计算冲减，最终结清到精确剩余税额，以CREDIT_REFUND保留来源/实际收款日期。不会重复冲原税额或伪造负付款。

`/accounting/purchase-gst`的attributedTax为所选日期内原归属＋有符号调整；pendingPaymentTax/pendingRefundTax为当前余额，不因日期筛选隐藏。`/accounting/purchase-gst-attributions`合并原账单、付款及采购调整，贷项/退款为当前调整日期，原GST记录不改写。历史期关闭后可在当前开放期退货/贷项/退款，不自动回开原GL或提交、更正BAS。

实现沿用项目销售侧的现金制净额与退款模型，依据普通国内退货/调整业务设计。税务规则参考ATO [GSTR 2000/19调整事项](https://www.ato.gov.au/law/view/pdf?DocID=GST%2FGSTR200019%2FNAT%2FATO%2F00001&PiT=20180629000001&filename=law%2Fview%2Fpdf%2Fpbr%2Fgstr2000-019c7.pdf)、[GSTR 2000/13现金制](https://www.ato.gov.au/law/view/document?LocID=%22GST%2FGSTR200013%2FNAT%2FATO%2Ffp24%22&PiT=20241204000001)。特殊税务交易、缺少调整证据、此前申报更正及正式BAS由后续税务审核流程处理，不输出已申报结论。

## 一致性与并发

所有结算按公司/供应商门闩锁，退货另锁原GRNI来源、按SKU排序库存余额与成本池；与收货、账单匹配、销售出库、付款、预付核销/退款竞争时校验锁后的余量。物理退货不任意释放销售预留，账单不再匹配已退未开票量，付款/核销不能越过贷后净AP，退款不超贷项/实付/预付余额。

同公司/操作员/路由/键同内容重放成功结果，不同内容409，失败不占成功键；公司级参考号唯一约束覆盖不同员工/键的重复录入。锁超时/死锁等409可按原键重试，业务余额冲突先刷新。PRT/SC/SR编号、库存/成本、Journal、AP/预付投影、GST、反向追溯、审计/Outbox和成功键同事务，末尾失败也无部分成功。

013新增6表：purchase.returns、return_lines、supplier_credit_notes、supplier_credit_lines、accounting.supplier_refunds、purchase_gst_adjustments，另有bill_line_balances安全视图。补种1600/5200映射、权限和PRT/SC/SR序列；扩展原reversal_links允许采购类型。所有新增表强制公司RLS、复合FK和不可变；应用仅SELECT及受控命令EXECUTE，Worker无金融命令执行权。总计105张业务/基础表、13个迁移，另有迁移历史；001—012原文件不改写。

本批不提供采购换货自动补货、转仓后跨仓退货、无来源库存负出库、自由金额贷项、价格差异审批、贷项跨账单调拨、任意Journal作废、供应商银行联调、退款撤销、独立预付税票、外币和完整BAS。正式账套未执行迁移，三个客户端未改。

## 023后续：贷项抵扣

收货来源与费用来源的贷项可使用已有AP借方余额跨其他账单抵扣，并以新凭证整笔解除。现有退款会扣除抵扣占用；原价退货/贷项与真实付款记录保持不变。见[供应商贷项抵扣及解除](stage-b-credit-applications.md)。本说明中历史跨账单待办以该增量和当前验收矩阵为准。
