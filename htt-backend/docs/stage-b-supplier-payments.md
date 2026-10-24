# 阶段B：供应商付款、预付款与应付核销

本批仅修改htt-backend。支持AUD已确认付款的人工记账：部分/多账单付款、显式供应商预付款、分批核销预付款、AP余额与现金制进项GST归属。接口记录已实际发生并人工核实的资金流水，不调用银行打款；供应商退款、采购贷项及净AP/GST调整已由013实现，见[采购冲销流程](stage-b-purchase-returns.md)。付款撤销、外汇或银行对账流程待后续。

## 接口与权限

前缀 `/api/v1`。JWT、X-Company-Id、公司RLS必需；POST必须有Idempotency-Key。本批命令追加不可变结算记录，不编辑原账单，不需要If-Match。金额以AUD两位精度计算、十进制字符串输出。

| 方法与路径 | 权限 | 用途 |
|---|---|---|
| POST `/suppliers/{id}/payments` | purchase.payments.post | 记录付款、核销AP或形成预付款，返回201 |
| GET `/supplier-payments/{id}` | purchase.payments.read | SP付款及分配、预付款来源 |
| GET `/suppliers/{id}/payments` | purchase.payments.read | 供应商付款流水 |
| GET `/suppliers/{id}/advances` | purchase.payments.read | 预付款原额、可用额和原付款日 |
| POST `/supplier-advances/{id}/apply` | purchase.advances.apply | 预付款核销账单，返回201 |
| GET `/supplier-advance-applications/{id}` | purchase.payments.read | SA核销及账单行来源 |
| GET `/accounting/ap?supplierId=...` | purchase.ap.read | 原应付amount、paidAmount、outstandingAmount与公司/供应商总未付 |
| GET `/supplier-bills/{id}` | purchase.bills.read | 原冻结账单及实时行paidAmount/outstandingAmount |
| GET `/accounting/purchase-gst?supplierId=...&from=2026-10-01&to=2026-10-31` | purchase.input_gst.read | 已归属税额及尚待付款税额 |
| GET `/accounting/purchase-gst-attributions?supplierId=...&from=...&to=...` | purchase.input_gst.read | 原账单/现金付款/预付核销的税务日期与来源 |

默认仅ADMIN、FINANCE获三个新增权限。PROCUREMENT、WAREHOUSE、OFFICE、SALES无付款/预付/核销及相关流水权限。财务操作不依赖仓库实物范围；数据库命令再次检查有效成员和对应权限。表/余额视图强制公司隔离，视图使用security_invoker，不以视图所有者绕过RLS。

列表支持page/pageSize，默认1/25，上限100。GST区间两端包含，日期可省略，from不得晚于to。GST汇总attributedTax仅为所选日期区间，pendingPaymentTax始终为当前全部待付款税余额，不因日期过滤消失；明细行保留原recoverableTax，另有attributedTax/pendingPaymentTax，避免把原税额误当剩余待抵扣。NON_CASH仍只有账单归属，CASH改由结算归属累计合计，不能重复相加。

## 记录付款

```json
{
  "amount": "33.00",
  "method": "BANK_TRANSFER",
  "reference": "bank-transaction-unique-id",
  "paidOn": "2026-10-24",
  "notes": "Verified payment; 11 for next shipment",
  "advanceAmount": "11.00",
  "allocations": [{ "billLineId": "uuid", "amount": "22.00" }]
}
```

响应 `{ "payment": {...}, "allocations": [...], "advances": [...] }`。payment含id、SP编号、state/version、supplier/party、实际付款日、方式、参考号、金额/分配额/预付额和Journal/Bank账户。advances含新预付ID、原额、可用额、科目及GST政策快照。

amount必须为正，**精确等于allocations合计＋显式advanceAmount**，不能把未说明的超付自动转成预付款。每次0—50个不同账单行，分配额必须正数且不超过该行未付额；一笔可付同一供应商多个已入账账单；013起上限为贷项与退款后的净未付额。跨供应商/公司、零额账单付款、重复行、3位小数金额拒绝。不能以同一billLineId在一次请求里拆成两行。

advanceAmount默认0；大于0时notes必须说明已核实的采购预付用途。纯预付传allocations=[]，amount=advanceAmount。不将预付直接扣减AP，也不认定它已购买某个已验收商品；账单匹配后才核销。付款供应商须有效，停用后历史仍可读但不能新付款或核销。

method支持BANK_TRANSFER、CARD、CASH，均使用配置的BANK资产控制账户；需要独立银行/现金/卡账户或批量付款文件时应另扩展账户选择，不由客户端自由指定科目。

reference最长200字，去两端空白，**公司内所有供应商付款不区分大小写唯一**，防止员工、键或供应商不同而重复同一资金流水。银行一笔合并多供应商付款尚不支持；录账参考须为核实可独立追溯的分项，而非随意改号重复入账。

paidOn可省略，默认公司澳洲时区今天；不得未来、必须处于开放GL期间。直接核销账单的付款不得早于账单过账日，历史先付款后开账单应记录为预付款，再核销。录入追溯付款时系统按实际付款日记Bank和资产/AP，不改库存历史。

## 预付款核销

```json
{
  "reference": "reconciliation-work-reference",
  "allocations": [{ "billLineId": "uuid", "amount": "11.00" }]
}
```

响应 `{ "application": {...}, "allocations": [...] }`。application含id、SA编号、advanceId、amount、reference、当前过账日及Journal。一次1—50个不同账单行，必须同一供应商。支持一笔预付款分次核销、多张账单合并核销；同时受预付available和AP未付额限制。公司＋预付款＋reference不区分大小写唯一，跨员工异键也不能重用。同号不能用于同一预付款的下一次分批核销，应使用可追溯的新核销记录参考。

核销GL日期固定公司今天，要求当期开放；不再次记Bank，也不重新冲GRNI/费用/库存。使用原付款保存的预付科目、原账单AP科目及GST科目，即使后来映射变化也不冲错来源；原科目必须仍有效。预付资产科目必须为非控制类ASSET，不能误配为AR/GST/Bank。

预付款冻结GST登记和CASH/NON_CASH政策。已有预付或账单后owner税务配置CLI拒绝直接切换，需受控税制过渡；核销也校验预付、公司和目标账单政策一致。预付款不与其他供应商、客户应收、采购退货或贷项直接互抵。

## 会计与GST

| 场景 | 借方 | 贷方 |
|---|---|---|
| 账单付款22 | 原AP 22 | Bank 22 |
| 尚未匹配的预付22 | Supplier prepayments 1500 22 | Bank 22 |
| 预付核销22 | 原AP 22 | 原Supplier prepayments 22 |
| CASH已付份额GST2 | 原GST Input 2 | 原待付款GST 1410 2 |

现金制税额按账单行可抵扣税与含税金额累计分摊：`round(recoverableTax × 累计已支付金额 / 行含税金额,2) − 已归属税额`。直接付款和预付核销共用同一累计明细，最后一笔结清尾差。不可抵扣税、未登记采购和零税不产生Input抵扣；NON_CASH账单已经归属，付款/核销不再记GST。

现金制归属日期取原实际付款日与账单记录持票日较晚者。直接付款通常按实际付款日；预付核销保留原付款日，持票在后则等待持票。GL清算发生在付款/当前核销日，税务归属独立保留上述证据日期。历史付款月已关账时，当前开放期仍可核销，不回开或重写原GL；财务需审核此前BAS的迟录/更正，系统不自动提交或更正申报。

本批预付款是**尚未分配的供应商资产**，付款时不接受独立税票/可抵扣税声明，不在未匹配时提前抵扣。已有可匹配税票应先录账单后按账单付款；先付但尚无可匹配账单的部分，在税票入账且核销后确认归属。验收前税票、独立预付税票及当场提前申报的工作流尚需专项扩展，不能把预付余额直接作为GST抵扣依据。

规则参考：ATO [GSTR 2000/13](https://www.ato.gov.au/law/view/document?LocID=%22GST%2FGSTR200013%2FNAT%2FATO%2Ffp24%22&PiT=20241204000001)、[GSTR 2003/12](https://www.ato.gov.au/law/view/htm?Docid=GST%2FGSTR200312%2FNAT%2FATO%2F00001)、[现金制GST](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/accounting-for-gst-on-a-cash-basis)。支持普通国内可抵扣/不可抵扣采购，不包含进口、逆向征税、特殊押金、分期租购或完整BAS规则。

## 事务、并发和追溯

按公司/操作员/路由/幂等键序列化，同键同内容重放原成功响应，不同内容409；响应是当时快照，核销后余额需GET刷新。失败不保留成功键。付款参考号和核销参考号数据库唯一约束覆盖跨操作员重复。

付款和核销按供应商行统一锁，再锁预付款及按ID排序的AP来源；每次在锁后读取已付/已核销累计。不同命令争最后余额、付款与预付核销竞争，都不能超付或双重归属GST。同一供应商结算串行化，换取可靠余额及固定锁顺序；不同供应商可并行。锁超时/死锁409按原键重试，业务超额409先刷新余额。

SP/SA编号、结算与分配明细、预付余额、Journal、GST、审计/Outbox和成功键同事务。晚期失败整笔回滚，无部分成功。AP与预付余额为不可变明细的派生视图，不直接改原账单/原应付；历史原AP金额仍可追溯。

新增012迁移与5张表：accounting.supplier_payments、supplier_advances、supplier_advance_applications、supplier_payment_allocations、purchase_gst_attributions；新增两个security_invoker余额视图、1500及SUPPLIER_ADVANCES映射、SP/SA序列。共99张业务/基础表、12个迁移，另有迁移历史。001—011不改写。新旧公司补种权限/科目/序列；htt_app仅SELECT和受保护命令EXECUTE，htt_worker无付款执行权。
