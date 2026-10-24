# 阶段B：仓库调拨、盘点差异与报损

仅修改htt-backend。支持同公司AUD库存的已确认交接调拨、选定SKU实盘与财务过账、盘盈盘亏及实物报损。沿用同仓同SKU移动平均成本，不改既有销售/采购/退货记录。所有数量都是**商品基础单位数量**（如M2），不是BOX销售/采购单位；最多6位小数，可如实记录拆箱/破损面积，不套用整箱销售限制。

## 接口与权限

前缀 `/api/v1`，JWT、X-Company-Id和公司RLS必需。所有POST需要Idempotency-Key，盘点提交/过账/取消另需当前 `If-Match: "version"`。decimal输出字符串。

| 方法与路径 | 权限 | 作用 |
|---|---|---|
| POST `/inventory/transfers` | inventory.transfers.post，源/目的双仓范围 | 已核实交接的直接调拨，201 |
| GET `/inventory/transfers/{id}` | inventory.transfers.read，双仓范围 | 调拨数量与来源，成本另需inventory.cost.read |
| POST `/inventory/write-offs` | inventory.writeoffs.post，公司财务权限 | 根据损坏/处置证据报损，201 |
| POST `/inventory/stock-counts` | inventory.counts.write，仓库范围 | 建立选定SKU库存快照，201 |
| POST `/inventory/stock-counts/{id}/submit` | inventory.counts.write，仓库范围 | 一次提交完整实盘，200 |
| POST `/inventory/stock-counts/{id}/post` | inventory.counts.post，公司财务权限 | 审核并过账盘盈盘亏，200 |
| POST `/inventory/stock-counts/{id}/cancel` | inventory.counts.write，仓库范围 | 撤销尚未过账盘点，200 |
| GET `/inventory/stock-counts/{id}` | inventory.counts.read，仓库范围 | 盘点数量与状态，成本另需inventory.cost.read |
| GET `/accounting/stock-counts/{id}`、`/accounting/stock-counts?state=SUBMITTED` | inventory.control.read | 财务读取快照/实盘/估值与待审核队列 |
| GET `/accounting/inventory-operations/{id}`、`/accounting/inventory-operations?warehouseId=...&kind=TRANSFER` | inventory.control.read | 财务查询调拨/COUNT/WRITE_OFF成本、Journal及库存变化 |

列表支持page/pageSize，默认1/25，上限100。ADMIN拥有全部新权限；WAREHOUSE可在分配仓库做调拨及采集/提交/取消盘点，看不到成本、快照价值和Journal账户。FINANCE可公司级读取财务库存操作、审批盘点及报损，不能据此代做仓库调拨或创建实盘。SALES、OFFICE、PROCUREMENT默认没有本批写权限。数据库命令再次核验有效成员和公司/仓库权限，不能仅凭htt_app凭证绕过。

默认按仓库采集与财务过账分权，不强制必须不同自然人；管理员可以完整处理一张盘点单。报损POST是财务确认已核实损坏/处置报告的记账动作，reason/reference应对应实际证据，不是银行或物流指令。

## 已确认交接的直接调拨

```json
{
  "sourceWarehouseId": "uuid",
  "destinationWarehouseId": "uuid",
  "reference": "handover-evidence-unique",
  "reason": "Physical transfer counted and received",
  "lines": [{ "productId": "uuid", "quantity": "2.2" }]
}
```

响应 `{ "operation": {...}, "lines": [...] }`，operation包含TR号、kind=TRANSFER、POSTED状态、源/目的仓库、业务日及（财务可见）Journal；每个SKU有两条带符号数量/价值流水，保存变更前后数量/价值、预留、修订号及SKU/基础单位快照。

源/目的必须不同，且属于当前公司、有效SELLABLE/QUARANTINE。TRANSIT不纳入本批。执行者必须获双仓权限。1—50个不同STOCK产品、正数基础数量；历史已停用STOCK仍可整理实物，非库存/服务不可调拨。reference公司内TRANSFER类型下不区分大小写且去空白唯一，跨员工/键也不能重复同一交接。

源仅能移走onHand−reserved，不能移动或释放已有销售预留。源成本=`round(源value × 数量 / 源onHand,2)`，全部移出时取全部剩余价值。目的数量和值增加完全相同金额，新均价自然由剩余价值/基础数量得到。两仓数量及成本总额不变；转入隔离仓保留价值但不增加可售量。

本批是**两个仓库已核实交接后的同一事务直接调拨**，不表示货物发出即已到货；015已实现分日/分批在途接收与短收，见[在途调拨流程](stage-b-transit-transfers.md)，不能提前记目的仓实物。跨公司或跨币种仍待后续。

## 盘点与审批

建立快照：

```json
{
  "warehouseId": "uuid",
  "reference": "count-sheet-20261024-01",
  "reason": "Physical count evidence",
  "productIds": ["uuid"]
}
```

返回 `{ "count": {...}, "lines": [...] }`，count含CT号、state=OPEN、version=1；每行保存基础数量、预留、成本、库存修订号及SKU/基础单位快照。本批为选定1—50个SKU的盘点，不把未传SKU自动盘成0；新SKU/空仓可建立0余额快照，已有正库存未估值则拒绝，需先受控初始化估值。零数量残留非零价值也拒绝。

仓库提交完整实盘（If-Match=1）：

```json
{
  "lines": [{ "productId": "uuid", "countedQuantity": "9", "gainValue": null }]
}
```

必须逐一显式提供所有快照产品的countedQuantity，允许0；**漏填不能默认为0**。数量非负、6位精度，不能增删SKU或重复行。提交后state=SUBMITTED、version=2，实际数量/估值声明冻结，不能再编辑；财务通过GET审核，POST `/post` 携带If-Match=2，成功state=POSTED、version=3。

- 盘亏：按快照的当前移动均价减值，全部清空时吸收全部剩余价值；实盘数不能低于已有预留，先核实/处理预留再重盘，系统不擅自取消客户订单。
- 盘盈：原有正数量且已估值时按冻结均价增加价值，gainValue必须为空，不能借盘盈自由调价。已明确0成本的正库存保持0成本。
- 原数量为0且盘盈：gainValue必须显式提供该次增加的**总成本金额**，2位精度、可显式0，由财务审核后过账；不把缺失成本自动当免费，也不接受任意单位售价作为成本。
- 无数量差异：gainValue须空，仍保留一次完成的盘点及0差异流水，不写空Journal。

盘点期间不锁住整个仓库，正常业务可以继续。财务过账时逐行重锁并核对修订号、数量、预留和值；快照后任何变化，包括先出后回、预留变化、仅价值变动，均409并提示取消后重新盘点，不自动重算或覆盖出入库。撤销OPEN/SUBMITTED需要当前版本，生成CANCELLED终态；重新盘点使用新的reference，旧证据保留。POSTED不可撤销或原地修改。

## 实物报损

```json
{
  "warehouseId": "uuid",
  "reference": "damage-disposal-report-unique",
  "reason": "Verified physical damage and disposal",
  "lines": [{ "productId": "uuid", "quantity": "1.1" }]
}
```

响应同operation结构，正式WO号、kind=WRITE_OFF。财务权限确认公司内有效仓库1—50个不同STOCK产品，按实际未预留可用量和当前移动均价扣减，不能负库存或超扣价值。reference在公司内WRITE_OFF类型下不区分大小写去空白唯一；同号可与另一个操作类型不同的业务凭证并存。本批是实物损失，不提供仅改变市价/NRV的纯价值减值，也不处理私人领用、销售处置、保险赔偿或需另作税务判断的场景。

## 成本和会计

| 业务 | 借方 | 贷方 |
|---|---|---|
| 同公司直接调拨 | Inventory（目的成本重分类） | Inventory（源成本） |
| 盘盈 | Inventory | STOCK_GAIN，默认4100 |
| 盘亏 | STOCK_LOSS，默认5300 | Inventory |
| 报损 | STOCK_WRITEOFF，默认5400 | Inventory |

当前仓库共用INVENTORY控制账户1200，调拨写同额借/贷重分类Journal，GL净资产与损益均不变，双仓明细从不可变操作行追溯；没有虚构采购/销售、AP/AR或GST。成本0仍校验开放期间、保留数量流水，不生成零金额Journal。所有金额由服务器计算，客户端不能覆盖库存价值、成本、科目、编号或业务日。

所有操作/盘点建立及过账按公司澳洲时区今天，要求开放GL期间；盘点实际财务过账日是审批当天。库存损失费用化及移动平均计价的依据参见[AASB 102成本公式与费用确认](https://standards.aasb.gov.au/aasb-102-dec-2021)，具体金额以冻结来源及本系统受控成本池为准。本批未执行BAS或正式账套调整。

## 稳定性与数据库

数量和成本余额始终一起锁定、一起更新。调拨按产品ID→仓库ID统一排序获取两仓余额锁，多SKU反向调拨也采用相同顺序，兼容现有同仓销售/采购/退货。后续每次数量/预留更新及成本池INSERT/UPDATE都会增加stock_balances.revision；成本变化也更新修订号，防止ABA场景用相同表面余额通过旧快照。

同公司/操作员/路由/键同内容重放原成功响应，不同内容409；失败不占成功键。参考号唯一约束覆盖不同员工/键的重复录入。缺估值、关闭期间、错误科目、版本/快照冲突、多SKU末行失败、审计末尾异常均回滚数量、价值、修订号、Journal、状态、编号及幂等记录，无部分成功。锁超时/死锁409按原键重试；盘点快照变化需要重新盘点。

014新增inventory.operations、operation_lines、counts、count_lines四表，新增4100/5300/5400三个默认科目及映射（账套共20个科目）、TR/CT/WO序列及库存修订触发器。共109张业务/基础表、14个迁移，另有迁移历史；001—013原文件保持不变。四表强制公司RLS、复合FK、操作不可变及延迟一致性校验；应用只有SELECT与受控命令EXECUTE，Worker不能执行库存控制命令。新旧公司使用同一种子初始化。

015已补齐分日/分批在途调拨，见stage-b-transit-transfers.md。本模块仍未包含：跨公司调拨、批次/序列号或货位盘点、整仓盲盘、照片存储/电子签章、纯价格减值、已过账任意作废、生产容量压测和云部署。三个客户端保持原样，正式数据库未迁移。
