# C08 基础返点、佣金与授权展示

本批仅 htt-backend；澳洲公司时区和 AUD。048 迁移新增 incentives 领域，不修改 001—047，不执行生产迁移，不配置真实费率、不发起银行付款，也不计算工资/PAYG/STP。原 R110/R111/R117 含 D 阶梯范围，整行保持部分实现；R115 的约定后台授权查询切片完成。C09 工作台聚合另行实施。

## 政策与计提

一个 program 指定一个客户返点或一个公司成员的佣金。政策是不可变的版本，创建与批准必须为不同当前授权成员。政策需明确有效期、NET_SALES 口径、公式、值、费用/收入科目、专属负债科目、结算方式、税务分类及审核依据。没有默认真实政策；CASH_SALES、毛利及阶梯口径拒绝启用。禁用 program 停止新来源，已有权利及追回仍允许受控调整。

基础公式为未税净额百分比、每张发票固定额、每个指定基础单位固定额。固定额按保留净额/原始净额折算；基础单位固定额按原始基础数量计算后折算，表示批准的“价值保留”合同，不把价格贷项说成实物数量变化。净销售复用 C07 发票、数量及金额贷项；实物退回待贷项不重复扣收入，退款/解除核销不再扣一次。税额单独调整不改变未税计提。

每种激励、受益人、发票仅一个经济 claim，跨 program/政策版本不重复。首次非零批准后钉住政策版本；后来版本仅适用于未形成 claim 的来源，不暗中重算旧合同。审批者可据原政策重估目标，计提差额为累计目标减已批准计提；差额为负时反向过账。源事实、归属、政策、累计额与哈希冻结于 run；审批锁住相应销售订单并重算同一发票集合，来源或余额变化则 409，重新准备，不自动接受新内容。

客户返点贷项是 C07 财务收入中的真实扣减；计算返点时排除本模块已链接的返点贷项，防止自身递归。同一基础规则仍受剩余数量价值上限及原发票净额归零保护，全部取消后目标归零。佣金政策必须明确 deductRebates；非自身返点的普通金额/数量贷项照常扣减。客户原价全额返点暂拒绝，以避免自递归及零价边界伪造追回。

财务台账按页读取，claim/结算来源关联使用专用索引；实际生产规模另作性能验收。每个 run 最多 50 张发票，可显式传 invoiceIds 分批；自动发现超过 50 张时拒绝，不能静默截断。一票事实最多 5000 条/3MB，一次计划最多 4MB。日期按半开 review period，1..366 天；valuationDate 不晚于公司今日，postingDate 不早于 valuationDate，且必须是开放财务期间。过期政策、产品和基础单位均明确筛选。

## 结算、GST 与追回

计提只借费用/收入调整、贷专属激励负债，不计 GST；GST 归属由关联正式单据处理。结算日期不得早于对应已批准计提；结算前再次核查当前来源目标已全额计提，拒绝使用过期权利余额。

- CUSTOMER_CREDIT：仅经审核的 PRICE_REDUCTION 客户返点，显式原发票行净额、税额与原因，复用现有金额贷项、AR、信用及现金/非现金 GST 逻辑。返点释放分录借激励负债、贷原计提费用/收入，避免重复费用。只能正金额，追回负余额保留并抵扣后续权益，不虚构客户借项单。
- SUPPLIER_BILL：承包商佣金需 CONTRACTOR_SERVICE、有效供应商、税码及凭证；客户提供服务的返点需 CUSTOMER_SUPPLY 且供应商与客户同 party。复用独立费用账单、AP 和进项 GST；释放原计提，已有付款/预付款核销、贷项及退款保持原入口。负向追回需关联本 claim 原结算账单，复用供应商费用贷项，实际净额/税额不符整笔回滚。
- CLEARING：员工佣金仅允许 EXTERNAL_PAYROLL、批准的非控制负债清算科目、零税及外部批次凭证。状态为 TRANSFERRED，不代表已付工资或已汇款。正负净额均可受余额限制地转清算。
- OFFSET：同类、同受益人的正权益与负追回成对抵扣。两边均复核最新来源，保留关联明细，净额零，不新建银行交易或 GST 事件；税务更正仍依原合法单据，不能把内部抵扣当税额冲销。

返点不一律是 GST 调整，员工佣金不一律是供应商费用。真实政策和凭证应由财务明确分类后独立批准。[ATO 调整通知单指引](https://www.ato.gov.au/law/view/document?LocID=%22GST%2FGSTR20132%2FNAT%2FATO%2Ffp4%22&PiT=20251205000001)、[ATO GST workbook](https://www.ato.gov.au/api/public/content/5a0059a5-d956-4db0-9a41-665409823cb0_06a2e5c6_cad4_4023_891e_61469a3988ae_pdf)、[NSW 员工佣金说明](https://www.revenue.nsw.gov.au/taxes-duties-levies/royalties/payroll-tax/taxable-wages/bonuses-and-commissions)。本模块不启用真实工资税政策。

## 锁期、核对与权限

review period 结束后可锁定，需无待审批非零 run、负债核对一致，保存快照/版本/审核引用；已关闭财务期间重开前不能重开对应 review period。锁定不假装未来退货不存在：原归属保留，后续差额在下一开放财务期过账，不能回写关闭期。快照是已批准台账，不声称已穷举所有未来可申报合同。

专属负债科目首次批准时无历史分录，之后禁止其他来源记账及分类更改。延迟约束核对激励负债与总账，以及单据来源与完整计提/结算分录。现有 reconciliation 增加 INCENTIVE_LIABILITY；期间预检拦截本期未批准非零 run，并保留原库存/AR/AP/GST/GL检查。关闭期财务哈希结构保持原样，避免旧证书无故漂移。

ADMIN/FINANCE 获 read/manage/approve/settle/grants.manage；业务查询另需当前客户全范围、总账读取。SALES/OFFICE 仅 self.read：本人已批准净额/余额；客户返点需有效显式 grant 加当前客户可见范围。个人状态为 NO_ACCRUAL / APPROVED_BALANCE / RECOVERY_DUE / ADJUSTMENT_REQUIRED / CLEARED；CLEARED 只表示激励台账余额清理，不表示银行已支付。个人返回不含来源发票、他人政策、科目或成本，Cache-Control: no-store。撤销成员、角色或客户分配立即作用于读取；写入重放先检查当前权限。原底层贷项/AP 权限同样重查。

所有表 FORCE RLS，公司复合外键；htt_app 无直接表读写，私有函数 PUBLIC 撤权。所有写入走 Idempotency-Key；有版本资源用 If-Match，版本冲突 409。新 display grant 用 If-Match: "0"，之后当前版本；其他资源从 1 起。诊断 Outbox 与审计同事务，失败回滚含计提、结算及关联正式单据。公司激励锁→排序的来源订单锁→BAS/期间锁；财务预检仅只读激励台账，避免倒置锁。

## HTTP 契约

均在 `/api/v1` 下，正常创建 201、更新/批准 200。错误沿用 401/403/404/409/422/428，存量财务流程保留既有错误映射。

| 方法 | 路径 | 用途 |
|---|---|---|
| GET/POST | /incentives/programs | 分页列表 / 创建单受益人计划 |
| GET | /incentives/programs/{id} | 计划与不可变政策版本 |
| PUT | /incentives/programs/{id}/enabled | 乐观版本启停 |
| POST | /incentives/programs/{id}/policies | 明确 revision（首次 0）、from/to/config |
| POST | /incentives/policies/{id}/approve | 独立批准与审核引用 |
| POST | /incentives/periods | 半开复核期间 |
| POST | /incentives/periods/{id}/review | lock true/false、reference 与 If-Match |
| POST | /incentives/runs | programId/periodId/valuationDate/postingDate/reason/invoiceIds |
| GET | /incentives/runs/{id} | 冻结计划及来源哈希 |
| POST | /incentives/runs/{id}/approve 或 /reject | 当前 If-Match、独立计提批准 |
| POST | /incentives/settlements | claimId、显式 net/tax、postingDate/reference/reason/evidence/items/priorSettlementId |
| POST | /incentives/offsets | positiveClaimId/negativeClaimId/amount/postingDate/reference/reason |
| GET | /incentives/ledger | 财务 claim/计提余额及结算关联台账，page/pageSize（最大100），分别返回 claimCount/settlementCount |
| GET | /incentives/me | 当前本人及有效授权客户返点摘要 |
| PUT | /incentives/programs/{id}/display-grants | userId/active、当前 grant 版本 |

policy config 字段见 OpenAPI 的 JsonElement 和数据库白名单：basis、formula、value、可选 productId/baseUomId、expenseAccountId/liabilityAccountId、settlementMode、可选 supplierId/clearingAccountId/taxCodeId、taxTreatment/taxReviewReference、显式 deductRebates/retroactiveAcknowledged/recoverableGst。policy `to` 不包含当日。CLEARING/SUPPLIER_BILL 的 settlement items 必须为空数组，CUSTOMER_CREDIT 为原发票行的 invoiceLineId/net/tax/description；不是自由客户端分录。

## 后续边界

回款制、毛利制及阶梯激励需另行批准并独立验收；本批不开放这些 basis。激励转移后的银行付款、工资处理和税务申报沿用其正式流程及人工确认，不因 TRANSFERRED 声称完成。客户端展示、真实合同/会计科目/税务审核、生产升级备份和真实规模性能另验；C09 聚合后续实施。
