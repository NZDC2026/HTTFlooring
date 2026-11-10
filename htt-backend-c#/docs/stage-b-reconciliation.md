# 库存、往来与总账一致性检查

`GET /api/v1/accounting/reconciliation`。需要有效JWT、`X-Company-Id`及`accounting.reconciliation.read`。016为新旧公司ADMIN/FINANCE赋权；OFFICE、SALES、WAREHOUSE、PROCUREMENT默认不可读。接口没有仓库/客户缩小范围参数：必须核对整个公司，不能因过滤隐藏另一方差异。它不授予任何财务写入权限，也不是银行对账、BAS或完整财务报表。

## 结果与一致性保证

- `status`为`CONSISTENT`或`MISMATCH`；差异是成功读取的业务结果，HTTP仍为200。权限失败为401/403，数据库失败沿用API错误格式，不返回伪造零余额。
- 返回companyId、AUD、数据库statement_timestamp产生的snapshotAt及checks。每项包含code、unit、checkedCount、mismatchCount、expected、actual、difference、issues及issuesTruncated。金额/数量为十进制字符串，difference=actual−expected，无浮点误差或容差。
- 每个实体先比较，再汇总；两个客户各差+1/-1仍是两个mismatch，不能用总差0当作通过。同一单据先分别聚合明细，避免发票/分配/退货join扇出造成重复累计。
- 一次SQL语句、STABLE且SECURITY INVOKER的检查函数、MATERIALIZED检查集，确保所有子账/GL读取同一MVCC快照。并发未提交业务不可见；已提交操作的多表结果一起可见。不会锁定业务行、自动修复投影、改写旧凭证或生成补差Journal。
- 每项最多20条issue，按entityId稳定排序；mismatchCount统计全量，issuesTruncated明确是否截断。当前无逐条差异分页/导出接口，超过20条需受控数据库只读调查，不能把样本当全量。
- GET无业务副作用，不需要Idempotency-Key/If-Match。重复读取可能因合法并发提交变化，snapshotAt帮助辨认；真实数据规模下的容量/时延尚未验证，不能据此宣称达到原v2性能SLO。

## 检查目录

expected从业务来源/不可变明细计算，actual为当前投影或GL余额。每个数量均为该商品基础单位，不把不同SKU基础数量总和当作经营指标；汇总数量仅供诊断，具体差异看entityId。

| code | entityId含义 | 核对公式/语义 |
|---|---|---|
| stock.quantity | stock_balances.id | 期初数量+采购收货−销售出库+销售实物退回−采购实物退回+盘点/报损/直接调拨增减−调拨发运+在途到货/退回=on_hand |
| stock.value | stock_balances.id | 期初估值+收货估值−出库原成本+销售退回原成本−采购退回当前成本+库存调整金额−发运冻结成本+到货/退回成本=stock_values.value |
| stock.valuation_missing | stock_balances.id | 正实物余额必须有明确估值记录；显式零估值合法，缺估值不能被coalesce(0)掩盖 |
| stock.reserved | stock_balances.id | 全部有效remaining_quantity之和=reserved |
| reservation.consumed | stock_reservations.id | 原订单行实际出库基础量=consumed_quantity |
| credit.receivable | customers.id | 发票行含税−付款分配−贷项+贷项退款=客户receivable；保留负余额，不截断为0 |
| credit.unbilled | customers.id | commitment.amount−released_amount之和=unbilled_orders |
| credit.commitment | credit_commitments.id | 取消订单为0；其他订单=原含税−累计发票−未开票退货取消额，核对未释放承诺 |
| credit.advances | customers.id | 预收−预收核销−预收退款=available_advances |
| credit.projection_missing | customers.id | 客户必须有信用投影记录，包括零余额客户 |
| invoice.lines / invoice.receivable | invoices.id | 发票含税分别核对行合计、AR原始明细金额 |
| invoice.receivable_missing | invoices.id | 零金额发票也必须有AR明细 |
| bill.lines / bill.payable | bills.id | 账单含税分别核对行合计、AP原始明细金额 |
| bill.payable_missing | bills.id | 零金额账单也必须有AP明细 |
| gl.inventory | companies.id | 仓内估值+尚在途成本=全部INVENTORY控制科目净借余额；在途不加入可售仓数量 |
| gl.transit | accounts.id | 每个冻结在途科目剩余成本=该科目净借余额；包含当前映射与历史发运账户 |
| gl.receivable | parties.id | AR净子账=该party全部AR控制科目净借余额；已退款加回应收 |
| gl.payable | parties.id | AP outstanding−available_credit=该party全部AP控制科目净贷余额；未退款的供应商信用可能为负 |
| gl.grni | parties.id | 收货暂估−账单匹配−未开票退货暂估冲减=该party GRNI净贷余额 |
| gl.receivable_unassigned / gl.payable_unassigned / gl.grni_unassigned | companies.id | 控制科目无party行不得留下余额 |
| gl.customer_advances | accounts.id | 各原预收科目未核销/退款余额=净贷余额 |
| gl.supplier_advances | accounts.id | 各原预付科目未核销/退款余额=净借余额 |
| gl.purchase_return_clearing | accounts.id | 已开票采购退货暂存额−供应商贷项冲减额=原清算科目净借余额；使用原估值额，不能用当前出库成本替代 |
| journal.balance | journal_entries.id | 每张凭证借贷差必须为0 |
| journal.lines | journal_entries.id | 每张凭证至少两行；零成本业务可没有凭证，不能创建空凭证 |
| journal.batch_entry | posting_batches.id | 每个已建立过账批次恰好对应一张凭证 |

无对应业务实体的逐实体项可以不出现在checks中；库存总额等公司级控制项始终存在。checkedCount不是业务单据总数。报告没有校验全部税务归属、银行真实到账、收入完整性、所有单据状态与经济实质；CONSISTENT只说明上述控制式在该快照通过。

## 差异处理

1. 保存snapshotAt、公司、code、entityId与expected/actual；先查询原单、行、分配和过账来源，确认是待完成估值、历史期初缺来源、导入问题或缺陷。
2. 缺期初估值使用既有受控估值流程，不能把未知值默认零。遗留AR/AP余额没有来源时需设计并验收期初迁移，不直接改余额以消差。
3. 已过账错误用相应退货/贷项/退款流程或有证据的前向修复；不可直接UPDATE不可变表、关闭RLS或生成无来源手工Journal。
4. 修复后重跑本接口和受影响回归，保留原差异依据。当前没有自动定时检查/告警任务，本接口供财务或受控运维手动调用。

## 新迁移与权限

016只增加权限、种子和三个函数，不增加业务表/账户，不重写001—015。读取函数遵守公司RLS；权限辅助函数固定search_path，仅检查活动成员/用户的财务权限。htt_app可执行读取函数，htt_worker/PUBLIC不获授权。现有公司只补入ADMIN/FINANCE角色权限，不替换自定义授权。新公司bootstrap调用相同种子。ready探针新增016读取函数存在检查，避免API对旧库误报就绪。

测试见`tests/Htt.IntegrationTests/ReconciliationTests.cs`：跨流程每步核对、双GST口径、不可抵扣采购GST、分批/尾差、未提交写入并发读取、正负差异抵消、明细截断、缺估值、投影漂移、无来源但平衡的控制分录及HTTP/数据库权限。
