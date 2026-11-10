# 阶段 C：GST/BAS 汇总与内部申报期间管理

> 本文保留037的原始Simpler BAS口径。038已新增Full BAS与计算表、分类和开放期间方法选择，见[Full BAS增量](stage-c-full-bas.md)；下文不包含Full BAS是对037批次范围的描述。

本批仅涉及 htt-backend。采用澳洲 AUD、单据保存的 CASH/NON_CASH 口径，提供 accounts method 的 **Simpler BAS G1、1A、1B** 工作底稿及期间定版。财务需确认该公司及申报期间适用 Simpler BAS；系统不根据销售额自动判定资格。不包含 Full BAS 的 G2/G3/G10/G11 等字段、计算表法、GST instalments、IAS/PAYG、ATO 结算付款、SBR 或向 ATO 发送申报。`record-lodgement` 只是登记已经在外部完成的申报。

ATO 依据：[Simpler BAS 字段](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/lodging-your-bas-or-annual-gst-return/options-for-reporting-and-paying-gst/monthly-gst-reporting)、[GST 会计口径](https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/accounting-for-gst-in-your-business)、[调整标签说明](https://www.ato.gov.au/api/public/content/0-1f178076-a97c-41d1-8f9a-2ad9412c6aa6)、[整澳元填报说明](https://www.ato.gov.au/api/public/content/28e03df6-130d-412c-ad54-c4281f1aad6f_CAS27844BASW_pdf)。业务已归属事项继续沿用原单据口径；历史调整可能与本期声明口径不同，`basisBreakdown` 展示原始归属，不能用当前公司设置过滤掉历史事项。变更计税口径的正式过渡仍须专门审核。

## 报表

`GET /api/v1/accounting/reports/gst-bas?from=2026-07-01&to=2026-10-01&page=1&pageSize=25`，半开区间 `[from,to)`，1..366 天；分页只影响明细。所有金额以精确十进制字符串输出。每份响应在一个 SQL 语句的同一 MVCC 快照内计算汇总和明细。

- `financial.G1`：含 GST 的销售额，包含 GST_FREE/INPUT_TAXED，排除 OUT_OF_SCOPE 及未登记 GST 的销售。现金制计直接收款、预收款、有效退款和撤销，以及跨口径贷项抵扣的来源/目标方向。预收款用于开票核销不会再次计销售额。
- 非现金制 G1 采用订单行逐期归属余额的期末减期初：已开票的非现金制金额，加首次非现金制预收款触发的全部剩余未开票供应，减取消、未开票退货及已开票贷项。首笔小额定金可能触发整个供应的税额与销售额；不能将 GST 明细的 `amount` 或本期收款额直接作为 G1。`NON_CASH_ORDER_CHANGE` 是订单行期间变动，明细日期为区间最后一天，不冒充单笔交易日期。
- `financial.1A/1B`：原始销售/采购归属，加法律调整（增加 GST 计 1A、减少计 1B）；录入撤销与解除核销按原标签反向抵销。采购仅计可抵扣部分，保留税票持有日期归属。退款、贷项抵扣、退款更正、收付款及预收预付核销均复用原有不可变税务来源。
- `wholeDollarLabels`：先精确汇总，再截去各标签的澳分；`netGst` 为整元 1A 减 1B，`roundingDifference` 解释其与精确净税额的差异。负标签原样显示并标记 `REVIEW_REQUIRED`，禁止定版，不擅自钳成零。
- `items`：税务来源及 G1 来源，包含原始单据 ID、税码、保存的计税口径、归属日期和金额；G1 明细另有 `includedInG1`。税务原始金额只供追踪，不等同于 G1。`taxSourceCount/grossSourceCount/totalCount` 不随分页变化。

## 与总账独立核对

从发票、客户预收、预收 GST 清算/舍入、贷项、退款及撤销、采购可抵扣税额、现金制付款/调整等业务事实独立重建税额科目借方净额，逐科目比较实际总账期初、本期与期末。历史原始税务科目、GST 暂挂、客户预收 GST 清算科目及其他 GST 控制科目均纳入，不因当前映射变化或账户停用漏掉历史。

`financial.accounts` 包含有金额的科目及差额。`glErrorCount/roleErrorCount/missingTaxCodeCount/missingAccountCount` 显示错误；`ledgerStatus=RECONCILED` 仅指税额总账核对，`status=READY` 还要求标签勾稽、税码完整且标签非负。未匹配的手工 GST 总账分录会标记 `UNRECONCILED` 并禁止定版，不用人为平衡数掩盖。

`bookNet` 是本期实际销项 GST 贷方净额减进项 GST 借方净额。`sourceSalesTax/sourcePurchaseTax` 来自归属事件；`timingAndCashBasisBridge` 来自独立重建的账面净额与来源净额之差，解释现金制未收款销项、预收 GST 清算及税票持有/实际过账日期差异。`unreconciledDifference` 是实际与独立重建的账面净额之差，必须为零；同时逐科目期初/本期差额必须为零，避免同额错科目互相掩盖。`labelDifference` 验证 1A−1B 与来源销售税减来源采购税一致。报表不将整段 GST 归属简单等同于权责制总账。

## 期间与修订 API

均在 `/api/v1` 下：

| 方法与路径 | 用途 |
| --- | --- |
| `GET /accounting/bas-periods?page=&pageSize=` | 当前公司期间列表 |
| `POST /accounting/bas-periods` | 创建不重叠期间 |
| `GET /accounting/bas-periods/{id}` | 期间及状态、版本、当前快照 |
| `GET /accounting/bas-periods/{id}/history` | 所有快照摘要和定版/重开/登记历史 |
| `POST /accounting/bas-periods/{id}/finalize` | OPEN → FINALIZED，冻结本次底稿与全部来源成员 |
| `POST /accounting/bas-periods/{id}/record-lodgement` | FINALIZED → LODGED，仅登记外部申报 |
| `POST /accounting/bas-periods/{id}/reopen` | FINALIZED/LODGED → OPEN，保留旧版 |
| `GET /accounting/bas-snapshots/{id}?page=&pageSize=` | 不可变报表、来源哈希及分页冻结明细 |

创建示例：

```json
{"reference":"BAS-2026-Q1","from":"2026-07-01","to":"2026-10-01","cadence":"QUARTERLY","gstBasis":"NON_CASH","reportingMethod":"SIMPLER","registrationConfirmed":true,"dueOn":"2026-10-28"}
```

`registrationConfirmed` 是财务对该期间 GST 登记状态的明确确认，公司须有 ABN；不能用当前公司登记状态推断历史。`cadence` 为 MONTHLY（日历月）、QUARTERLY（1/4/7/10 月起）、ANNUAL（7 月起）或 CUSTOM；非 CUSTOM 必须是完整标准区间。到期日可空，系统不猜测代理延期、节假日或 ATO 通知；若填写必须不早于区间结束。期间头创建后不可更改，避免改日期重叠或重解释旧申报。

所有 POST 均要求 `Idempotency-Key`；状态动作另要求 `If-Match` 当前版本。动作体为 `{"reference":"唯一操作参考","reason":"审核/修订原因","lodgedOn":"2026-10-28"}`，`lodgedOn` 仅登记申报时必填，不能早于期间最后一天或晚于公司当地今天。定版不能覆盖未来日，不会生成 GST/总账分录。快照包含精确底稿、全部税务及销售来源、SHA-256 数值指纹/来源指纹、修订号、原因与操作者；再定版新增版本，`amendsSnapshotId` 指向最近一次已登记申报版本，不改写旧快照。

定版与业务写入使用公司级互斥/共享事务锁。冻结后的财务总额或税额总账不能被迟录、倒签、修改税码/科目等操作改变；必须先重开相应期间。延迟约束检查事务最终结果，允许财务数值不变的历史预收款重新分配，不会将配对归属事件的中间状态误判为变化。数值指纹消除 `0`/`0.00` 的显示差异，但保留实际金额、科目与差额差异；源快照始终不变。重开不等于作废已向 ATO 提交的申报，应由财务根据外部申报流程处理修订。

## 权限与部署

读取同时需要 `accounting.bas.read`、`accounting.ledger.read`、`accounting.gst.read`、`purchase.input_gst.read`。写入额外分别需要 `accounting.bas.manage/finalize/reopen/lodged`；ADMIN/FINANCE 默认授权。幂等缓存命中前仍重新验证全部权限。跨公司期间/快照返回 404；五张新表 FORCE RLS，快照、成员、期间头及事件不可变，应用角色没有直接写权限。操作与审计、Outbox、幂等同事务，失败整体回滚。

通过显式迁移工具应用 037；001—036 不重写，不自动运行生产迁移。本批不新增外部依赖，不变更三个客户端。上线前仍需财务确认登记和申报方法、历史税务数据质量，并在真实数据量验证冻结期间校验的性能；生产恢复、容量及真正外部申报不在本批验收内。
