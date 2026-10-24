# 阶段B：在途调拨、发运、分批收货与短收

仅修改htt-backend。在014已确认交接的直接调拨之外，新增同公司AUD“实际发运→在途→分批接收/实物退回/财务短收”的流程。发运只扣源仓，不提前增加目的仓；在途量按调拨行独立保管，不进入可售/可预留库存池。

## 接口与权限

前缀 `/api/v1`，JWT、X-Company-Id、公司RLS必需，POST都需Idempotency-Key。事件追加不可变明细，共享锁后余量校验，不要求If-Match；transfer.version是原发运注册版本，不随分批到货变化，实时state从明细计算。

| 方法与路径 | 权限 | 用途 |
|---|---|---|
| POST `/inventory/transit-transfers` | inventory.transit.dispatch，源仓范围 | 创建即确认实际发运，TT号，201 |
| POST `/inventory/transit-transfers/{id}/receipts` | inventory.transit.receive，目的仓范围 | 本次实际分批到货，TIR号，201 |
| POST `/inventory/transit-transfers/{id}/returns` | inventory.transit.return，源仓范围 | 尚在途货物实际退回源仓，TIA号，201 |
| POST `/inventory/transit-transfers/{id}/shortages` | inventory.transit.resolve，公司财务权限 | 根据证据核销确认短收/在途损失，TIA号，201 |
| GET `/inventory/transit-transfers/{id}` | inventory.transit.read，源或目的任一仓范围 | 本调拨发运、收货/退回/短收数量与余量 |
| GET `/inventory/transit-events/{id}` | 同上 | 实际事件明细 |
| GET `/inventory/transit-transfers?warehouseId=...&state=PARTIAL` | inventory.transit.read，所选仓范围 | 与本仓有关的在途队列 |
| GET `/accounting/transit-transfers/{id}`、`/accounting/transit-events/{id}` | inventory.control.read | 财务成本、库存变更、GL来源完整追溯 |
| GET `/accounting/transit-transfers?warehouseId=...&state=IN_TRANSIT` | inventory.control.read | 公司/仓库在途队列和remainingCost合计 |

列表支持page/pageSize，默认1/25、最多100，state可选IN_TRANSIT/PARTIAL/CLOSED。财务汇总按相同仓库/状态过滤条件计算，不受分页裁剪；跨SKU基础单位不能直接相加，数量按行展示。

ADMIN有全部权限。WAREHOUSE可在分配源仓发运/收回退货，在分配目的仓接收，不要求同一人有双仓权限；只需其中任一相关仓权限即可跟踪该调拨。FINANCE可公司级核销损失、读取财务明细，但不默认获得物理发运/接收权。SALES、OFFICE、PROCUREMENT无本批写权限。

仓库响应默认隐藏成本、GL账户/Journal；即使可跟踪两端，也不返回另一仓库存池的变更前后数量/价值、预留或内部余额修订信息。成本读取另需inventory.cost.read；完整池流水通过财务路由查看。SQL命令会再次核验有效成员、操作权限和对应仓库范围，视图用security_invoker遵守调用者RLS。

## 实际发运

```json
{
  "sourceWarehouseId": "uuid",
  "destinationWarehouseId": "uuid",
  "reference": "verified-carrier-dispatch-docket",
  "reason": "Goods handed to carrier and counted",
  "lines": [{ "productId": "uuid", "quantity": "5.5" }]
}
```

返回 `{ "transfer": {...}, "lines": [...], "events": [...] }`。每行有唯一id，后续用作transferLineId；quantity/cost是冻结发运量与成本，另有received/returned/shortage/remaining数量及成本。transfer含TT号、sourceId/destinationId、state、原documentState/version、日期和参考。

创建即扣库、记在途，不是未执行的调拨计划。reference公司内去两端空白且不区分大小写唯一，跨员工/键不能重录同一次发运。reason应对应承运交接/箱单等已核实证据。每次1—50个不同STOCK产品，以**基础单位**正数数量计，最多6位小数；不是BOX销售数量，不限制必须整箱。

两个仓库必须不同、同公司、有效SELLABLE/QUARANTINE，TRANSIT目录仓不用于本流程。在途资产由独立明细跟踪，避免多个货运批次混在可售仓余额。发运不移动/释放销售预留，数量不能超过源onHand−reserved；已有正库存却缺成本拒绝，不能当作免费。历史已停用STOCK仍可整理实物，非库存/服务拒绝。

发运成本取当时源仓移动平均：`round(value × 发运数量 / onHand,2)`，全部发走取全部剩余价值。数量、成本、SKU/基础单位快照以及源仓/在途账户来源冻结；源仓后来采购、盘点、成本或科目映射变化，不重算已发运批次。

## 分批到货

```json
{
  "reference": "destination-receipt-proof-001",
  "reason": "Actual quantity counted on arrival",
  "lines": [{ "transferLineId": "uuid", "quantity": "2.2" }]
}
```

返回 `{ "event": {...}, "lines": [...] }`。每次1—50个不同来源行，正数实际基础数量，不超过该行剩余在途。可以只传本批到货SKU；不能补入原发运没有的商品、跨调拨借用来源行、修改目的地或填写客户端成本。0到货不生成虚假的0收货，保留在途并提供后续差异证据。

每行累计分摊冻结发运成本：`round(原cost × 累计已处理数量 / 原quantity,2) − 已处理cost`。累计已处理包含接收、退回及短收，最后一笔精确结清尾差；不能以收货时源均价或目的均价重新定价。实际到货加入目的仓现有数量/成本池，自然形成新移动均价。隔离仓可以接收，但保持可售量0。

目的已有正库存缺估值时整单拒绝，先受控补齐后可原键重试；目的仓停用时仍保留在途，不能偷偷改到别仓，可核实后启用或按实物退回源仓。新空目的池可自动以0建立，再承接本批冻结成本。到货推动库存修订号，旧盘点不会覆盖新收货。

## 少到、退回及结案

到货少于发运只表示未处理余量，**不会自动确认为损失或关闭**。可继续等待/分批到货，或按已核实事实处理：

- `/returns`：货物实际回到原源仓时由源仓人员记录，按冻结成本增加源仓、清在途，不记短收费用。不能把仍在路上的数量直接当作退回。
- `/shortages`：财务确认承运短缺、丢失或不可交付损失后，按证据录入明确数量，清在途并记5500损失。仓库人员不能单方面将少到全部写成损失。可以仅核销确认损失的一部分，其余仍在途。

reference在公司＋调拨＋事件类型内去空白/不区分大小写唯一，覆盖不同员工/键；分批使用可追溯的新凭证，同一凭证的多SKU一次传齐。reason必填，应指明收货、实际退回或财务核实的短收证据。

状态自动派生：尚无任何处理为IN_TRANSIT；有处理且有余量为PARTIAL；每个SKU的“已接收＋已退回＋已核销短收＝原发运量”才CLOSED，此时剩余成本也必须为0。成本为0的免费货仍按数量判断结案。已结清后拒绝重复收货、退回或损失，不能改原单重新打开；迟到找回、错误发运撤销及已确认损失恢复需后续专用对冲流程。

## 成本与会计

| 业务 | 借方 | 贷方 |
|---|---|---|
| 发运 | INVENTORY_TRANSIT，默认1250 | 原仓库存控制账户，默认1200 |
| 到货 | 原发运保存的库存控制账户 | 原在途账户 |
| 实际退回源仓 | 原发运保存的库存控制账户 | 原在途账户 |
| 确认短收 | TRANSIT_LOSS，默认5500 | 原在途账户 |

1250为独立INVENTORY资产控制账户，不能与仓库Inventory映射到同一个账户；到货/退回清算仍使用原账户，即使后来映射变更。账户必须同公司、有效且类型匹配。短收使用处理日的有效TRANSIT_LOSS费用映射并保存到事件；不产生销售、COGS、采购、AP/AR或GST。0成本也校验开放期间并留数量/来源轨迹，不写空Journal。

所有操作按公司澳洲时区当天入账，要求当天GL期间开放。实际到货、退回或短收用自己的新单据/新Journal，原发运期已关闭不需重开，也不改写历史发运或库存成本。金额只能来自冻结发运成本，客户端不能指定估值、科目、编号或业务日期。

成本和损失确认参考[AASB 102移动平均成本及损失费用化](https://standards.aasb.gov.au/aasb-102-dec-2021)。本批处理普通公司内部实物流转，不处理运输服务发票、保险/承运索赔应收、额外运费分摊、私人用途、外币或BAS。

## 事务、并发及数据库

同调拨的接收/退回/短收统一锁原发运头，再读取累计处理量及成本；不同键或不同仓管争最后余量只允许一笔成功。源/目的实际库存操作复用014产品→仓库排序余额锁及估值检查，与销售出库、直接调拨、采购收货和盘点保护同一池。不同调拨同时入同仓不会丢数量/价值，多SKU后行失败也回滚前行及新建空池。

同公司/操作员/路由/幂等键同内容重放原成功响应，不同内容409；失败不占成功键。参考号数据库唯一约束覆盖不同员工/键的重复。数量、成本、在途、库存修订号、Journal、编号、审计/Outbox和成功键同事务，末尾异常也无部分成功。锁超时/死锁409可按原键重试；业务余量冲突先刷新队列。

015新增inventory.transit_transfers、transit_transfer_lines、transit_events、transit_event_lines四表及两个security_invoker余额视图，新增1250/5500科目与INVENTORY_TRANSIT/TRANSIT_LOSS映射、TT/TIR/TIA序列和角色权限。总计113张业务/基础表、15个迁移，另有迁移历史；001—014原文件不变。新表强制公司RLS、公司复合FK、追加不可变及延迟一致性检查。htt_app仅SELECT与受控命令EXECUTE，Worker无库存控制命令执行权；新旧公司同seed。

014直接调拨仍用于两端已确认交接，本流程用于分日或分批实际交接；两种方式不能对同一次发运重复记账。本批不含未发运计划/审批、分批发运计划、目的地改派、超收盘盈自动处理、承运系统/物流照片、保险索赔、已结案恢复或跨公司调拨。三个客户端未改，正式数据库未迁移。
