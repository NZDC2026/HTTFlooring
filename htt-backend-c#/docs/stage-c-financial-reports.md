# 阶段C：基础财务报表与历史账龄

本批交付 htt-backend 的利润表、资产负债表和应收/应付账龄 API。新增035迁移，不修改001—034，不修改客户端，不自动执行生产迁移。

## 接口与权限

所有路径加 `/api/v1/accounting/reports`。仅查询，不需幂等键，不产生单据、凭证、审计写入或持久化报表缓存；每次请求重新授权。新增 `accounting.reports.read`，默认授予 ADMIN、FINANCE；同时要求 `accounting.ledger.read`。公司来自当前授权会话，不能用查询参数切换；其他公司 partyId 返回404。

| GET 路径 | 参数 | 日期口径 |
|---|---|---|
| `/profit-and-loss` | from,to,includeZero? | 半开区间 `[from,to)`，1—366天 |
| `/balance-sheet` | asOf,fiscalYearStart?,includeZero? | 截止日包含当天全部已过账分录 |
| `/receivables-aging` | asOf,partyId?,page?,pageSize? | 截止日包含当天；应收 |
| `/payables-aging` | asOf,partyId?,page?,pageSize? | 截止日包含当天；应付 |

日期用 ISO 格式。金额均为 AUD 精确十进制字符串，不转浮点数。响应包含 companyId/currency/snapshotAt；账龄默认每页25、最大100，汇总包含全部筛选结果，不随分页缩减。资产负债表、账龄截止日要求年份不小于0002；可查历史或未来截止日，未来日期仅包含已经过账的分录，不包含预测。

## 利润表

按 journal_entries.posting_date 汇总全部 REVENUE、EXPENSE 科目，包含停用科目的历史分录。收入按贷减借，费用按借减贷，净利润 = 收入 − 费用；负收入、费用冲销及亏损保留符号。includeZero 默认 false。

这是权责发生制总账报表（ACCRUAL_GL）。公司 CASH/NON_CASH 是 GST 归属口径，不把利润表切换成现金收支报表。GST 根据原凭证进入税务或费用科目，不把销售含税总额直接计收入。所有费用含 COGS；本批不猜测任意费用科目的毛利分类，不含比较列、预算和分部门/项目报表。

## 资产负债表

资产按借减贷，负债及已记账权益按贷减借。全部尚留在收入/费用科目的累计净额作为未结转损益纳入权益，拆成 priorUnclosedEarnings 与 currentYearEarnings；不生成虚拟结转分录，也不把已过账到权益的结转金额再次加入。

优先采用公司中覆盖 asOf 的 fiscal_years 起始日；该日期无财年配置时，采用澳洲常规7月1日起始。可用 fiscalYearStart 明确覆盖，要求在截止日前365天内；改变这个参数仅改变累计损益的前期/当期展示，不改变总权益。按现有科目 kind 展示，科目重分类必须通过正式账务维护处理。

返回资产、负债、已记账权益、前期未结转损益、本年损益、总权益、负债加权益，以及 difference/status。只有差额严格为零才返回 BALANCED，不通过四舍五入或添加“平衡数”掩盖差异。

## 账龄

到期日当天及未来为 CURRENT；逾期1—30、31—60、61—90、91天及以上分别列示。计算基础为每个原发票/账单行在截止日的净额，正余额计应收/应付，负余额单列 availableCredit，再按原单据聚合。同行的贷项不与其他发票或其他行的逾期欠款擅自抵扣。

035新增只读 security_invoker 视图 report_open_item_movements、report_control_dates，复用底表强制公司RLS。历史计算逐项包含：原发票/账单、数量/自由金额及税额贷项、直接收付款及预收/预付核销、其撤销与重新核销、跨单贷项抵扣及解除、贷项退款及退款撤销/更正。按对应 AR/AP 总账凭证的 posting_date 生效；原单据的 invoiceDate/dueOn 用于展示与分桶。不会把当前“有效记录”视图直接当历史余额。

只有已实际过账的业务计入，不依赖草稿/回收站可见性。预收/预付未核销部分留在原预收/预付科目，不擅自减少账龄；核销及撤销生效后才改变原发票/账单余额。GST、信用及库存事实不因报表读取改变。

汇总返回 outstanding、availableCredit、netBalance、controlBalance 和 difference/status，净额 = 欠款 − 可用贷项。controlBalance 来自同一截止日、同一 party 筛选的全部 AR/AP 控制科目总账；存在未映射的手工控制分录时返回 UNRECONCILED 及差额，不能静默遗漏后仍宣称对平。逐单可用 documentId 继续查原单据/总账来源。

## 一致性与并发

每个响应的明细、总计和控制余额在一个 SQL 语句快照中计算。事务未提交时全部不可见；并发提交时，单个响应只能看到提交前或提交后的完整结果，不出现半笔凭证或明细与汇总跨时点。多次独立 HTTP 请求具有各自 snapshotAt；不承诺跨请求共享同一快照。历史日期查询会纳入后来正式补记、但 posting_date 在截止日内的分录，不等于当时打印报表的永久归档。

新增专项与既有销售、采购、预收预付、贷项、退款和采购差异流程逐步核对报表；验证精确分桶边界、跨财年损益、权限、公司隔离、停用科目、历史冲销、分页、未映射差异及并发提交。结果记录见 verification.md。

## 后续范围

本批不含现金流量表、BAS生成/申报、现金制利润表、法定报表模板、审计调整/年末结转工作流、预算/维度分析、PDF/Excel导出、永久归档或客户端页面。现有账务流程继续负责实际过账与冲销；本批完成不代表整个阶段C完成。
