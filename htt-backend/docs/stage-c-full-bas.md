# 阶段 C：Full BAS 标签、计算表与申报方法管理

本批仅涉及 htt-backend，在 037 的 Simpler BAS、税额总账核对及申报期间之上增加 038。提供 Full BAS 的 G1/G2/G3/G10/G11、1A/1B，以及 G1—G20 内部计算表；支持原有 CASH/NON_CASH 单据口径。财务明确选择 accounts method 或 calculation worksheet method，系统不自动判断申报资格或切换历史计税口径。数据与过账仍是现有业务来源，本批不向 ATO 发送申报。

依据：[ATO 方法选择](https://www.ato.gov.au/api/public/content/0-38217ea8-d671-419c-aa9c-9b1ec34c9ffd)、[ATO 计算表](https://www.ato.gov.au/api/public/content/e480d501-964e-4775-840c-b9cfef019528_68f311eb_9d6a_4367_8ea5_3dbb52fb859e_pdf)、[ATO 调整说明](https://www.ato.gov.au/api/public/content/0-1f178076-a97c-41d1-8f9a-2ad9412c6aa6)、[ATO 申报标签说明](https://www.ato.gov.au/api/public/content/0-98e0ef06-57b7-4811-a119-5236f1676a3c)。计算表是内部工作记录，无需单独提交给 ATO。

## 查询与结果

```http
GET /api/v1/accounting/reports/gst-bas?from=2026-07-01&to=2026-10-01&reportingMethod=FULL&calculationMethod=ACCOUNTS&page=1&pageSize=25
```

`reportingMethod` 为 SIMPLER（默认）或 FULL；`calculationMethod` 为 ACCOUNTS（默认）或 WORKSHEET，后者仅适用于 FULL。日期仍为 1..366 天的半开区间。未带新参数的旧查询沿用 037 的汇总和 financial 结构，不改变旧 Simpler BAS 快照。每个响应在同一 SQL/MVCC 快照计算汇总、分类问题及分页来源，金额全部使用十进制字符串，分页不改变汇总。

Full 结果使用 `financial.full` 表示所选方法的正式 GST 标签，`worksheet` 是 G1—G20 计算表。原有 `financial.G1/1A/1B/netGst` 保留为 accounts method 的税务归属参考，供桥接与旧总账核对；使用 WORKSHEET 时应取 `financial.full` 与 `wholeDollarLabels`，不要将两套标签混用。

| 标签 | 来源与计算 |
| --- | --- |
| G1 | 含 GST 销售额；accounts method 沿用 037 净归属，worksheet 使用调整前供应/收款基数 |
| G2 | 明确标为 EXPORT 的 GST-free 销售 |
| G3 | 明确标为 OTHER_GST_FREE 的销售 |
| G4 | INPUT_TAXED 销售，仅工作底稿字段 |
| G5、G6 | G2+G3+G4；G1−G5 |
| G7、G18 | 支持的法律调整净 GST，分别将净增加或净减少乘 11，二者不同时为正 |
| G8、G9 | G6+G7；G8÷11（精确计算后保留澳分） |
| G10、G11 | 明确分类的资本/非资本采购，均包含 GST 和不可抵扣部分 |
| G12 | G10+G11 |
| G13 | 采购中用于 input-taxed sales 的不可抵扣部分 |
| G14 | 所含价格没有 GST 的采购部分；与 G13/G15 不重复 |
| G15 | 私人用途/不可所得税扣除的不可抵扣部分 |
| G16、G17 | G13+G14+G15；G12−G16 |
| G19、G20 | G17+G18；G19÷11（精确计算后保留澳分） |

WORKSHEET 的 1A/1B 分别为 G9/G20；ACCOUNTS 的 1A/1B 保持现有税务归属标签。由于法律调整按净额只放 G7 或 G18，两种方法的 1A/1B 不必逐项相同，净 GST 及桥接必须可解释。`wholeDollarLabels` 在各标签汇总后截去澳分，`netGst` 为整元 1A 减 1B，`roundingDifference` 记录与精确净额的差异。

### 调整、撤销与计算差异

- accounts method 保留销售贷项、退款及跨单抵扣后的净销售/采购归属。worksheet 将已有法律调整放在 G7/G18，使用调整前基数，避免在 G1/G10/G11 和调整标签重复扣减。
- 收付款录入撤销、预收预付解除核销、跨单抵扣的目标端撤销属于相应基数冲回；来源端贷项调整、退款及其反向更正按实际 GST 调整来源归集。只改净额、只改税额的贷项按实际税额计算调整，不能用折让总额直接除以十一推断。
- 首笔非现金制预收款按已归属的完整剩余供应计入，后续开票及预收核销不重复。现金制按已归属收付与抵扣计入。未分配到具体采购账单的供应商预付款仍属预付款，待现有核销流程匹配具体采购后进入本批采购来源，不凭空推算采购类型或税额。
- `salesCalculationDifference/purchaseCalculationDifference` 分别比较基数除十一与实际基数 GST，法律调整另外归集。单侧差额超过一澳分，或所选方法出现负的申报标签时进入 REVIEW_REQUIRED；不以 G7/G18 填平。小额舍入差异显式保留，整元桥接另列。特殊税率、特殊计税或明显不能按十一分之一计算的来源须由财务复核适用方法和原始业务，本批不自动转换。

## 财务分类

不能仅凭税额或费用科目名称推断出口、资本用途及不抵扣原因。新增以下接口，均在 `/api/v1`：

```http
GET /accounting/bas-classifications/{kind}/{id}
PUT /accounting/bas-classifications/{kind}/{id}
If-Match: 0
Idempotency-Key: 唯一键
```

`kind` 为 TAX_CODE、EXPENSE_ACCOUNT 或 BILL_LINE。首次未分类用 If-Match 0，之后用当前 revision。PUT 体：

```json
{"salesClass":"AUTO","purchaseClass":"NON_CAPITAL","inputTaxedPercent":0,"reason":"一般经营支出，不可抵扣部分属于私人或不可扣除用途"}
```

- TAX_CODE 只使用 `salesClass`，`purchaseClass=AUTO`、比例为空。TAXABLE、INPUT_TAXED、OUT_OF_SCOPE 分别可自动映射 TAXABLE、INPUT_TAXED、EXCLUDED。GST_FREE 必须明确 EXPORT 或 OTHER_GST_FREE。分类必须与真实税码类别相符，不能把有税销售改标出口。AUTO 恢复按类别判断，不猜测出口。同一税码不能混用出口与国内 GST-free 的语义；混用数据应先整理正确的专用税码和业务来源，不能把整批记录直接认定为出口。分类不会更改原交易税额。
- EXPENSE_ACCOUNT/BILL_LINE 使用 `purchaseClass=CAPITAL/NON_CAPITAL/EXCLUDED/AUTO`，`salesClass=AUTO`。优先行级分类，其次费用科目默认；明确的收货匹配 STOCK 采购可自动 NON_CAPITAL，其余缺分类为 PENDING。资本/非资本是 BAS 报告分类，不会重记固定资产、折旧或费用账。
- `inputTaxedPercent` 表示已不可抵扣份额中分配给 G13 的比例，0..100，最多四位小数；余下不可抵扣份额进入 G15。不可抵扣总份额取原始 `tax/recoverable_tax`，不能通过分类增加 GST 抵扣。存在有税但不可抵扣部分且比例未确认时进入待分类。无 GST 的价格优先 G14，不再重复计 G13/G15。
- EXCLUDED 用于不应进入 G10/G11 的往来等事项；已有 GST 抵扣的采购被标排除会进入 INCOMPLETE，不会藏掉原 1B。行覆盖/科目默认适用于原始来源及其贷项、退款、核销变动；分类原因、操作者与修订始终保留。

`classificationIssues` 列出需要处理的来源；`financial.full.classificationIssueCount` 包含 accounts/worksheet 两套检查，可能对同一来源分别计数。分类不全禁止 Full 定版，旧 Simpler BAS 不新增这些分类要求。分类版本表不可变，应用角色无直接写权限；修改影响已冻结 Full 底稿时，必须先重开相关期间。

## 与往来事项及总账核对

继续使用 037 的独立税额科目重建，比较实际/应有期初、本期和期末，保留现金制、税票持有日期与实际 GL 日期桥接；缺失来源、错科目、未解释的手工税额分录标为 UNRECONCILED。

采购汇总另从 035 的历史 AP 事项独立构建采购参考额：非现金制取账单/贷项，现金制取收付及抵扣影响；采用相同的税务归属日期。它不使用新采购汇总事件视图。`financial.full.purchaseReferenceGross/purchaseSourcesGross/purchaseGrossDifference` 比较参考额与实际来源，差额必须为零。`excludedPurchaseGross` 解释明确排除的金额；G10+G11 不等于包含排除/待分类记录的全部来源总额。此核对补充 GST 总账核对，不将采购含税额误当成税额余额。

Full 工作底稿来源包括原始税务事件、accounts/worksheet 两种销售与采购行；`worksheet` 布尔值区分视图。不要将全部明细直接相加，汇总以命名标签为准。源快照记录实际分类值、分类 ID/修订及计算金额，后续默认分类或名称修改不改写旧快照。

## 申报期间与方法切换

创建期间时可增加：

```json
{"reference":"BAS-2026-Q2","from":"2026-10-01","to":"2027-01-01","cadence":"QUARTERLY","gstBasis":"NON_CASH","reportingMethod":"FULL","calculationMethod":"WORKSHEET","registrationConfirmed":true}
```

原八字段请求继续有效，默认 ACCOUNTS；旧 Simpler 创建请求维持原幂等指纹。已有开放期间可使用：

```http
PUT /api/v1/accounting/bas-periods/{id}/method
If-Match: 当前期间版本
Idempotency-Key: 唯一键
```

```json
{"reportingMethod":"FULL","calculationMethod":"ACCOUNTS","reason":"财务确认本期采用 Full BAS accounts method"}
```

仅 OPEN 可切换；已定版/已登记外部申报须先 reopen。不可变的原始期间头保留原设置，控制行保存有效选择，`GET` 返回有效方法；`history.methods` 保存每次选择、前序方法、版本、原因、操作者及前次快照引用。切换不改变期间日期、原 GST basis 或已申报快照。再定版生成新修订，按当前方法冻结完整来源及财务指纹；旧 Simpler 快照仍按 037 口径核验。

方法变更、分类和定版共用公司级互斥锁；业务写入共享锁与延迟财务指纹检查继续生效。Full 冻结还保护 G10/G11 等总额，零税额采购不能因此绕过。分类/方法/审计/Outbox/幂等同事务，晚期失败整体回滚；同键并发一事实，异键同版本一成功。只保存底稿、分类和方法历史，不为报表新建任何会计凭证。

读取继续同时需要 bas.read、ledger.read、accounting.gst.read、purchase.input_gst.read。分类额外需要 `accounting.bas.classify`，期间方法变更需 `accounting.bas.manage`；原 finalize/reopen/lodged 权限不变，ADMIN/FINANCE 默认授权。跨公司来源、期间和快照不可访问，缓存命中前仍检查权限。

## 部署与本批边界

显式应用 038；001—037 及其摘要保持，不自动运行正式迁移。新增分类和方法历史两张 FORCE RLS 表，累计 172 张业务/基础表、38 个迁移；三个客户端及 ledgerone-api 不改。

本批汇总既有销售、采购、收付、贷项、退款和核销来源，不新增坏账、用途变更 GST 调整、进口/递延进口 GST、反向征税、margin scheme、保险、PAYG/IAS、WET/LCT/燃油税等专用业务过账，也不发送 ATO/SBR 申报。此类事项不能靠手工修改汇总标签或填平 G7/G18 代替合法来源。真实规模的闭期校验性能、恢复和生产财务验收仍需单独验证。
