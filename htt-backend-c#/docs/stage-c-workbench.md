# C09 工作台聚合后台

049 提供六类只读工作台，复用现有业务对象和财务事实。仅修改 htt-backend；不修改三个客户端，不执行生产迁移，也不发送邮件、推送或银行指令。不新增余额表、缓存表、定时聚合任务或第二套经营台账。

## API 与角色

工作台为读取摘要；编辑对象前沿用原详情读取、完整输入及 If-Match 版本契约，不能把汇总对象当完整编辑载荷。

所有路径在 `/api/v1/workbench` 下，返回 `Cache-Control: no-store`。均为 GET，无业务写入和幂等键要求；重复或并发读取不增加单据、审计、Outbox、同步序号或会计分录。

| 路径 | 默认角色 | 聚合内容 |
|---|---|---|
| `/finance` | ADMIN、FINANCE | 利润表摘要、资产负债表摘要、月度收入/费用/净利润、AR/AP账龄及到期单据、当前授权任务/up-next和本人消息 |
| `/sales` | ADMIN、OFFICE、SALES | 当前授权客户目录、报价及待审数、销售订单、任务、Note/拜访/展板、资料草稿、净销售及同环比、本人及授权返点/佣金摘要 |
| `/office` | ADMIN、OFFICE | 同一运营聚合，但另需 customers.all、crm.collaboration.manage；用于办公室全客户队列与受控协作，不自动开放其他作者的 PRIVATE Note |
| `/customers/{id}` | ADMIN、OFFICE、SALES、FINANCE | 当前客户基本资料、门店/联系人、相关单据、协作、任务、资料草稿、趋势、授权客户返点；有财务读取权限才显示该客户AR |
| `/banks` | ADMIN、FINANCE | 银行目录、截止日总账余额、最近有效流水/对账结果、未匹配及部分匹配关注数、规则启停数、真实能力范围内的导入状态 |
| `/warehouse` | ADMIN、OFFICE、WAREHOUSE | 当前授权仓库、库存SKU记录数、待发拣货数、按基础单位汇总的在库/预留/可用数量；无售价、成本、信用或公司财务数据 |

入口权限为 `workbench.{finance|sales|office|customers|banks|warehouse}.read`。入口不是绕过原权限的通行证：财务还需 accounting.reports.read 与 accounting.ledger.read；银行还需 accounting.banks.read、accounting.ledger.read、accounting.bank_statements.read；仓库还需 inventory.read 与当前仓库范围。可选区块逐项检查已有模块权限，返回 `status: AVAILABLE` 或 `status: FORBIDDEN, data: null`，不把未授权金额伪装成零。非本人佣金不能通过办公室或客户视图取得；客户返点还需C08显式授权。

## 参数与响应

财务、销售、办公室、客户视图接受 `from`、`to`，采用半开区间，1..366天，缺省为公司本月1日至公司今日+1日。日期使用 `yyyy-MM-dd`。`to` 不晚于公司今日+1；财务截止日为 `to-1`（包含当日）。销售与办公室可用 `customerId` 缩小当前授权范围；客户视图使用路径ID。银行仅用 `asOf`，包含当日，默认公司今日且不接受未来日；仓库可用 `warehouseId`。

所有视图支持 `page`（默认1，最大1000000）、`pageSize`（默认20，最大100）。同一页参数分别应用于各区块的列表；每个列表独立返回完整授权范围下的计数，不能把一页长度当总量。财务摘要不返回全量科目明细，钻取沿用既有报表API。净销售返回完整口径 totals、rowCount、pendingReturnCount，但 rows/pendingReturns 分页，去除原始 sourceFacts；保留C07来源哈希及同环比口径。C07既有来源数量/4MB保护仍有效，过大查询需缩小日期或客户范围。

响应包含 `schemaVersion`、`kind`、`companyId`、`timezone`、`currency: AUD`、`snapshotAt`、`mvccSnapshot`、`readOnly: true`、`period`、`operationalBasis`、页参数和 `data`。不同视图的data即表中区块；可选区块带授权状态，必需财务区块直接提供原报表结构的摘要。

不存在、其他公司或超出当前范围的客户/仓库统一404；入口或强制源权限不足403；日期、页参数及直接数据库网关非法过滤422；认证沿用既有401流程。撤销角色、客户分配、仓库范围或返点展示授权后，下一次请求立即重新判断，无共享响应缓存。

## 口径与一致性

- 财务摘要使用与现有财务报表相同的查询；P&L及图表使用 business_journal_entries，排除年结结转对经营收入/费用的重复影响。资产负债表按含当日截止、原财政年度及未结转损益规则计算；AR/AP沿用原 report_open_item_movements 和 report_control_dates，不从销售单据总额另造欠款。
- 金额与销售事实按所选财务期间，任务、消息、草稿、协作、授权及银行匹配状态使用**当前已提交状态**，不声称恢复某日的历史权限或历史待办。响应明确给出 `operationalBasis: CURRENT_COMMITTED_AND_CURRENT_AUTHORIZATION`；银行另标注 `CURRENT_STATUS_FOR_TRANSACTIONS_THROUGH_ASOF`。
- 报价待审数使用 sales.quotes.status；通用 documents.state 的 CONFIRMED 不能冒充 SUBMITTED。单据使用现有 document_visible，排除回收站；正式客户可追溯到已批准的创建草稿，仍保留原草稿owner/审核者授权。
- Task upNext 仅含 OPEN/IN_PROGRESS，按到期时间及ID排序，未设日期在后；其他状态仍可在授权任务列表中查看。C05 PRIVATE/TEAM/OFFICE和他人拜访GPS、C06创建者/执行者/管理者及客户范围、消息来源可见性全部复用，不因聚合扩大。
- 银行总账余额是指定截止日余额；最近流水/对账日期单独标出，不把旧流水余额标成今日余额。部分匹配仍按剩余金额列关注；VOID流水和已重开对账排除。Feeds 明示 NOT_CONFIGURED / MANUAL_IMPORT / liveConnection=false，不虚构D阶段真实连接。
- 仓库只在同一 base_uom_id 下求和，保留不同单位行；当前授权仓库由 warehouses.all 或有效仓库分配决定，不借客户范围推定仓库范围。

数据库网关 `workbench.query(kind, filter)` 为 STABLE SECURITY DEFINER，一次HTTP调用只执行一条聚合SQL；私有辅助函数及原查询在同一语句MVCC快照内读取，避免拼接多次READ COMMITTED查询。各来源写入、审批、结算和银行匹配仍走原命令；工作台不加全公司写锁，不触发消息或自动分类。独立权限网关、PUBLIC撤权和公司过滤经集成测试验证。

## 验收与后续

专项覆盖角色/租户/客户/仓库越权、私有协作、角色与展示授权撤销、日期/分页、财务报表和图表相等、报价状态、草稿关联、任务up-next、部分银行匹配、激励隔离、并发重载无副作用、信用贷项在读取中提交时的单一快照。范围及实际通过数量见[验证记录](verification.md)。

本批补齐 R005、S-02、R113、R116 的约定后台切片，以及 R025 的C银行Hub部分。D真实Bank Feeds、工资/阶梯规则、C08回款/毛利独立口径、S-30设备离线/实机、客户端展示、真实规模性能和生产验收继续保留。C01—C09实施包具备约定后台切片后，仍需对明确范围做阶段C最终收口验收，不以工作台上线替代底层或客户端验收。
