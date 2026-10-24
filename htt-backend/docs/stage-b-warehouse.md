# 阶段B：仓库拣货、交接确认与成本过账

只涉及 htt-backend。报价转订单后，仓库工作队列自动从已确认且尚有未交付实物的订单生成，无需再次建销售订单。仓库人员按仓库授权操作，不要求销售客户分配，不返回售价、税额、信用或成本。服务/非库存行不进入实物拣货；采购收货、退货冲销和独立服务履约流程待后续阶段实现；销售开票及人工服务履约声明已在后续[开票切片](stage-b-invoicing.md)实现。

## 接口与权限

全部路径前缀 `/api/v1`，需要 JWT 和 `X-Company-Id`。所有 POST 必须有 `Idempotency-Key`；创建拣货单使用订单当前 `If-Match`，确认/取消使用拣货单当前 `If-Match`。数量输出为十进制字符串。

| 方法与路径 | 作用 | 权限及范围 |
|---|---|---|
| GET `/warehouse/orders?warehouseId=UUID&page=1&pageSize=50` | 待交付实物订单队列 | inventory.picks.read，仓库范围 |
| GET `/warehouse/orders/{id}` | 实物订单行、已拣/已交付销售单位数量、拣货单列表 | 同上 |
| POST `/warehouse/orders/{id}/picks` | 记录本批已经完成的拣货，生成 PK 编号 | inventory.picks.write，仓库范围 |
| GET `/warehouse/picks/{id}` | 批次、数量、交接证据及版本 | inventory.picks.read，仓库范围 |
| POST `/warehouse/picks/{id}/confirm` | 确认客户提货或交给承运人，扣库并记成本 | inventory.dispatch，仓库范围 |
| POST `/warehouse/picks/{id}/cancel` | 取消未交接批次，允许重新拣货 | inventory.picks.write，仓库范围 |
| GET `/inventory/valuation?warehouseId=UUID&page=1&pageSize=50` | 数量、剩余成本及平均单位成本 | inventory.cost.read，仓库范围 |

ADMIN/WAREHOUSE/OFFICE默认可读、拣货及交接确认。ADMIN/FINANCE默认拥有估值读取权限。除 `warehouses.all` 外均须分配对应仓库；FINANCE需要单独仓库分配。销售角色不能操作仓库流程。原有自定义成本权限保留。升级006为已有公司补权限，新公司初始化也会补入。

创建拣货，`quantity` 是订单销售单位（例如 BOX），不是基础单位面积；沿用订单冻结的换算及数量步长，最多50个不重复的实物行。分批数量合计包含所有已拣和已交付批次，不能超过订单。一次请求代表仓库已完成拣货，无另一个空白任务确认步骤。

```json
{"lines":[{"orderLineId":"uuid","quantity":"2"}]}
```

交接确认：`PICKUP` 为客户提货；`DELIVERY` 为交给承运人，表示已发运，后续客户签收不是本接口。`recipient` 为提货人/承运人，`reference` 为签收单或运单参考号，均必填且最长200字。时间由服务器记录，业务日期使用公司澳洲时区当前日期。当前保留人工录入的证据索引；不提供照片上传、电子签名或承运商真实性验证。

```json
{"mode":"DELIVERY","recipient":"Carrier name","reference":"Consignment 123"}
```

相同员工、相同幂等键及相同内容重放原成功响应；同键不同内容409。不同键再次确认同一批次409，不产生第二次出库。更新遇到409应刷新单据版本；业务校验422不保存成功幂等结果，修复后可原键重试。

## 库存与会计

`PICKED → DISPATCHED` 或 `PICKED → CANCELLED`，交接后记录不可更改。拣货不扣实物、不再次预留；确认才消耗订单预留并扣实物。取消拣货保留订单原预留；办公室取消未履约订单则释放预留/信用并取消待交接批次。已有任何实物出库的订单不能整单取消，后续应走退货冲销。

确认在一个公司事务中完成：订单锁、拣货单锁、按商品排序的库存锁、成本池锁、消耗预留、扣实物、写不可变出库明细、借记COGS/贷记Inventory、更新状态/版本、审计、Outbox、幂等。不存在先扣库再异步补总账的成功状态。开放会计期间、有效库存/成本科目映射均必须满足；期间锁防止关账与过账并发。确认会增加订单版本，防止旧版本取消成功。

成本池按公司＋仓库＋商品维护。出库金额 = `round(剩余库存价值 × 出库基础数量 / 出库前基础数量, 2)`，PostgreSQL numeric 四舍五入；最后一批耗尽剩余价值。数量6位小数，账簿金额2位。显式零估值或极小成本舍入为零的出库仍记数量/成本流水并校验期间，不插入零金额会计分录。保留 `stock_movements` 的出库成本和出库后数量/价值，后续收货流程必须在同一库存锁下增加数量和实际价值，才能持续形成移动加权平均成本。

交接不确认收入/AR/GST，不释放未开票信用承诺；后续[开票流程](stage-b-invoicing.md)同步增加AR并减少同额承诺，避免先释放额度再漏记应收。

## 期初数量与估值

旧 `stock-opening` 仅初始化数量，不能自动推断真实成本。006不会替已有数量填零成本。未估值库存可预留及拣货，确认出库422并全部回滚。需由有 `inventory.opening.write` 权限的有效成员通过owner CLI录入经过核对的**整池期初总价值（AUD，不是单位价）**：

```sh
dotnet run --project src/Htt.Host.Migrations -- stock-valuation \
  --company COMPANY_UUID --warehouse WAREHOUSE_UUID --product PRODUCT_UUID \
  --value 1234.56 --reference VERIFIED_OPENING_REF \
  --issuer VERIFIED_ISSUER --subject VERIFIED_SUBJECT
```

使用现有 `HTT_MIGRATION_CONNECTION`，不向API提供owner凭据。数量必须已初始化且大于零。按余额锁记录不可变期初数量/价值/参考，分配SV编号，借记库存、贷记OPENING_EQUITY映射科目；重复相同价值/参考返回原记录，冲突拒绝。可以在订单已预留后、首次出库前估值。显式录入0表示经过确认的零成本；不是缺省值。

默认OPENING_EQUITY映射种子科目3000，库存/COGS沿用1200/5000映射。导入正式账套时必须核对库存控制科目余额，避免既已导入库存GL又重复通过此命令记期初；本命令是新账套数量期初对应的价值开账，不是既有总账余额匹配或重估工具。

## 数据库与测试

增量006新增5表（picks、pick_lines、stock_values、stock_movements、valuation_openings），总计68张业务/基础表，另有迁移历史。001—005不改写。所有新表强制公司RLS、复合公司外键；应用账号无库存数量、成本池、出库流水或交接证据的直接更新权限。SECURITY DEFINER交接函数固定search_path并再次验证成员、操作权限及仓库范围。

真实PostgreSQL测试覆盖分批提货/发运、成本舍入尾差、零分录出库、缺估值、期初授权/幂等、仓库及公司隔离、隐藏金额、非法数量/证据、同键并发、异键并发确认、超拣竞争、共享成本池、订单取消竞争、关账拒绝和过账后的整单回滚。升级验证包含从003、004、005迁移到006且保留旧校验和/主数据。


## 库存控制扩展（014）

同公司已确认交接的仓间调拨、盘点差异及实物报损已实现，见[库存控制API](stage-b-inventory-control.md)。新库存修订号同时跟踪数量、预留和价值变化；原履约流程也触发该修订，旧盘点不会覆盖正常销售出库。014不改写001—013。


## 在途发运与分批接收（015）

源仓交承运后先转独立在途资产，目的仓按实际分批接收；源/目的人员各自仓库授权，财务才可核销短收，成本与数量不超原发运。见[在途调拨API](stage-b-transit-transfers.md)。旧期发运不重开，只在实际接收/处理期新增单据和过账。
