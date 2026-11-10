# C07 共用净销售事实、趋势与检查点

仅 htt-backend；新增047，历史001—046和依赖锁文件不修改，三个客户端不改。C07交付后台事实、趋势及受控导出，不代表手机曲线已经联调或整个阶段C完成；C08返点/佣金政策与C09工作台仍待实施。

## 统一口径

- 未税净销售＝已开票行net－数量贷项net－自由金额贷项net；GST和gross分别保留。草稿、报价、未开票订单不算收入。收款、预收核销、解除核销、退款及现金制GST归属不会再减一次销售。现金制与非现金制公司使用同一未税销售定义，本报表不是现金制BAS。
- 事实ID为`INVOICE:{invoiceLineId}`或`CREDIT:{creditLineId}`，保留原单据、行、发票、订单、客户/门店、SKU和归属版本，可供C08按明确政策复用。来源是不可变业务行；查询不依赖异步投影，也不创建另一份往来或总账余额。
- 日期使用已入账业务单据的business_date，与其GL过账日独立桥接核对；范围为`[from,to)`，采用公司业务日期，销售时间桶为DAY/MONTH。事实只包含查询语句开始时已提交的事务，不能把created_at当成提交游标。
- 数量贷项按原发票的基础数量/销售数量比例回退，自由金额或税额贷项的数量为0。只在同一baseUomId内相加，汇总后保留6位；明细还返回originalInvoiceQuantity/originalInvoiceBaseQuantity，避免消费者逐行舍入造成累计差。M2、PIECE等不混成一个总数量。
- 已收实物退货在数量贷项关联前，列为待处理，不提前冲减收入。`pendingReturns`是截至to的全部尚未关联数量贷项的已开票退货，可早于from；金额贷项没有实物关联，不凭金额猜测哪次退货已处理。未开票退回属于订单取消/库存流程，不假造销售冲销。

## 归属与标签快照

`order_attributions`为追加历史，`line_dimensions`为不可变行维度；两表公司隔离、FORCE RLS，应用不直接读写。

- 新报价订单初始归属为不可变报价创建人，basis=QUOTE_AUTHOR。办公室直建订单为DIRECT_UNASSIGNED，不把开单人员或当前客户分配员默认为销售。
- `GET /api/v1/sales-orders/{id}/sales-attribution`；`PUT`同路径，body=`{salespersonId,reason}`，需要Idempotency-Key和当前归属If-Match。ADMIN/OFFICE的sales.attribution.assign可在首张发票前追加EXPLICIT版本，目标须为本公司活跃且可访问该客户的报告用户。
- 与开票使用相同订单注册表行锁；首票或订单取消后禁止改派；数据库触发器亦保护归属冻结。之后所有发票和贷项沿用同一冻结来源，不随员工停用、客户重新分配而改写。此归属不自动赋予佣金资格或付款权。
- 旧报价订单从历史报价创建人回填LEGACY_QUOTE_AUTHOR；旧直建订单仍未分配。基础单位ID原已有不可变约束；旧单位标签在迁移时冻结，sku/name优先取旧行快照，旧快照缺失时才取迁移时主数据，并标LEGACY_AT_CUTOVER，不声称恢复不存在的历史文字。
- 新行冻结基础单位代码及SKU/名称，更名不回写事实明细。趋势以ID为维度，标签取冻结来源的稳定标签；原标签仍可在逐笔事实中查到。

## 查询API

以下路径均以`/api/v1`开头。

| 路径 | 参数与行为 |
| --- | --- |
| `GET /sales-analytics/facts` | from/to、customerId/branchId/productId/salespersonId、page/pageSize；按日期及factId稳定分页，返回items、总数和读取时点 |
| `GET /sales-analytics/trends` | 同上，另bucket=DAY/MONTH；返回分页rows、全筛选范围totals、数量按基础单位分组、比较区间及待处理退货；不向普通报告用户返回公司GL、成本或内部MVCC标识 |
| `GET /sales-analytics/pending-returns` | 相同维度筛选/分页；截至to尚未关联数量贷项的退货，明确asOfExclusive |
| `GET /sales-analytics/reconciliation` | from/to；受控的公司整体收入及成本GL桥接，scope=COMPANY_WIDE |

范围1—366天、from年份至少3（需查询上年），每页最多100。facts最多5000条，趋势维度×时间桶最多5000格；来源及待处理退货先取最多5001条判断超限，超过限制返回422，要求收窄客户/商品/日期。报告约4 MB上限，不默默截断金额总数。普通分页不冻结跨请求数据；需要固定截止点时生成检查点。

默认ADMIN/OFFICE/FINANCE/SALES具备reports.sales.read；每次只读取当前可访问客户及其门店。销售人员即便是历史归属人，也不能在客户撤权后继续读取其事实。reports.sales.all默认ADMIN/OFFICE/FINANCE，用于公司归属筛选；销售只能指定自己的归属ID，但可读取其获授权客户的整体商品趋势。仓管/采购不获得销售报告权限，门户登录不获得员工分析权限。

### 比较与零值

- 趋势rows按客户×门店×产品×基础单位，补足所选维度的零值时间桶；维度并集包含对比期，避免本期无销售的旧商品消失。rows含净销售、基础数量及previousBucket/yearAgo比较。
- rows的上期为上一个日/月桶的对应边界；totals.previousPeriod为整个报告范围的前一段。整月对齐范围按相同月数前移，其余范围按相同天数前移。上年按日历年边界比较。
- 正基数百分比=`(本期−基数)/基数×100`，4位小数；零基数NO_BASELINE，负基数NEGATIVE_BASELINE，percent均null，仍给绝对差值。
- 不把2月29日映射到2月28日并重复计数。缺失的上年2月29日边界移至3月1日，单独闰日为NO_CALENDAR_EQUIVALENT；连续区间的上年边界保持连续，不重复或遗漏2月28日。

## 财务与成本桥接

只允许同时具备reports.sales.reconcile、reports.sales.all、customers.all、accounting.ledger.read、accounting.reports.read和inventory.cost.read的当前用户，默认ADMIN/FINANCE。

收入先逐单据核对发票减贷项与GL的REVENUE净额，再列出otherRevenueGl，使销售事实与公司利润表收入可以桥接；不把通用银行收入等其他收入误记为SKU销量。使用既有business_journal_entries，排除年结及其反向凭证。返回差额、差异单据数与RECONCILED/UNRECONCILED；不靠跨单据差异相抵得出一致，也不自动更改原账。

成本证据来自出库成本、实物退货成本冲回和采购价差expense_delta，与其来源单据的费用GL逐单据核对。采购差异的在库部分仍由原采购流程调整库存；已售费用差异列UNALLOCATED_PURCHASE_VARIANCE，不反写原发票净额或虚构客户/SKU毛利。allocationBasis=SOURCE_EVENT_NO_INVOICE_ALLOCATION；同一期间销售与发运成本可能错期，这个桥接不是逐发票毛利，也不默认C08的毛利佣金规则。

## 可重建检查点与CSV

`POST /sales-analytics/checkpoints`，body例如：

```json
{"from":"2026-10-01","to":"2026-11-01","bucket":"MONTH"}
```

支持与趋势相同的客户/门店/商品/归属筛选。需要Idempotency-Key以及SALES经营报告的完整权限。每个新键从规范来源重新生成一份检查点，保存完整sourceFacts、sourceHash、schemaVersion=1、读取时点、比较、待处理退货和公司GL桥接；同键返回原检查点，不执行财务过账。销售事实与GL桥接在**同一条SQL读取语句/同一MVCC快照**中构造，即使贷项在构造过程中提交也不会混合时点。

这是有界期间的重建/冻结凭证，不是后台物化余额或可重放的跨事务提交游标；后续新开票、贷项、实物退货或成本后到，用新键重建并比较sourceHash/完整sha256。旧检查点永不修改，期间关账不妨碍只读重建；不重开期间或改账。

- `GET /sales-analytics/checkpoints/{id}`，也兼容既有`GET /operating-report-runs/{id}`及kind=SALES列表。
- C03通道新增kind=SALES：`GET /accounting/reports/operating`及`POST /operating-report-runs`可生成整家公司报告；该通道不接收party/warehouse/bank筛选，维度筛选使用sales-analytics接口。
- `POST /operating-report-runs/{id}/export`复用If-Match=1、持久文档作业、重试及文件下载授权。CSV含当前/上期/上年净额与数量/百分比，空基数为空单元格，公式文本防注入，携带冻结摘要；不根据当前事实偷偷重算旧导出。
- 每次读取、导出、Worker执行和下载均复查当前权限；普通销售不接触公司冻结报表或成本。报告生成失败回滚注册表/快照/审计/幂等，不留半份检查点；导出失败可重试，不重新记账。

## 验收边界

覆盖真实发票/数量与金额/税额贷项、CASH/NON_CASH、收款退款不重复扣销售、实物待处理及成本冲回、直建/报价归属冻结、SKU/单位更名、客户撤权、跨公司、历史003—046升级及缺失旧标签、同环比/闰日/跨单位/负基数、检查点同键/异键并发、开票与归属竞争、贷项提交时点的受控快照并发、审计失败回滚、CSV公式/失败重试/下载撤权和采购成本后到。

实际测试数量、构建和发布记录见[verification.md](verification.md)。客户端曲线、真实规模/性能、C08政策计提审批结算及C09统一工作台另验；不借C07启用任何佣金、返点、税务申报或银行付款。

048后续增量：C08基础NET_SALES激励政策、差额计提、结算关联及授权展示已交付，见[C08](stage-c-incentives.md)。本文中C08前置/待办描述反映047批次边界；回款/毛利及D阶梯口径仍另验，C09聚合保留。
