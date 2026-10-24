# 阶段B第一批：报价、转订单、信用与库存预留

本篇记录阶段B第一批报价到订单的业务API；后续仓库交接与成本见[仓库流程](stage-b-warehouse.md)。第一批不包含发运/提货、采购收货、开票、AR/AP核销或库存估值/GL期初。下述确认与预留不产生收入、库存成本或总账分录。

## 请求及权限

所有接口以`/api/v1`开头，使用现有OIDC、`X-Company-Id`和公司RLS。POST/PUT命令必须有`Idempotency-Key`；已有单据的更新、提交、审批、退回及取消还须有`If-Match: "当前version"`。金额/数量返回十进制字符串。

| 接口 | 作用 | 权限 |
|---|---|---|
| POST `/quotes` | 创建草稿，不分配正式编号 | sales.quotes.write |
| PUT `/quotes/{id}` | 完整更新草稿并重新解析价格 | sales.quotes.write，限本人或manage.all |
| GET `/quotes`、`/quotes/{id}` | 按授权客户查看列表及详情 | sales.quotes.read |
| POST `/quotes/{id}/submit` | 校验版本和价格，分配Q编号，冻结提交快照、创建待审批 | sales.quotes.write，限本人或manage.all |
| POST `/quotes/{id}/return-to-draft` | 办公室退回修订，保留编号及提交历史 | sales.quotes.approve |
| POST `/quotes/{id}/approve-and-convert` | 办公室审批、建SO、检查信用并预留库存 | sales.quotes.approve |
| GET `/sales-orders`、`/sales-orders/{id}` | 查看授权客户订单 | sales.orders.read |
| POST `/sales-orders/{id}/cancel` | 取消未履约订单、释放库存与信用承诺 | sales.orders.cancel |
| GET `/inventory/availability?warehouseId=...&productId=...` | 查询基础单位的实物、预留及可售量 | inventory.read，另检查仓库范围 |
| GET `/customers/{id}/credit` | 查询额度、AR投影、未开票订单、预收抵减及剩余额度 | sales.credit.read，另检查客户范围 |

默认ADMIN和OFFICE可操作办公室转单/退回/取消。SALES只能读授权客户、创建/修改/提交本人草稿，并读取授权客户订单及分配仓库库存；不能审批、取消订单或读取信用明细。WAREHOUSE/PROCUREMENT只有库存读取，FINANCE可读订单及信用。默认策略由005同时补入已有公司和新公司。

正常报价通过办公室权限审批，不额外设置多级或强制双人流程；无底价/信用豁免接口，办公室也不能绕过底价或超额度转单。员工拥有多个角色时按其实际权限集合处理。

## 报价请求

```json
{
  "customerId":"customer-uuid",
  "customerBranchId":"branch-uuid",
  "warehouseId":"warehouse-uuid",
  "expiresOn":"2026-11-30",
  "notes":"Delivery requested next week",
  "lines":[
    {"productUnitId":"box-unit-uuid","quantity":"23","requestedArea":null,"unitPrice":null,"discountPercent":"0"}
  ]
}
```

UUID示例需替换。每张报价1..50行。每行`quantity`与`requestedArea`二选一；使用面积时，必须选择基础单位为M2的BOX销售单位。50m²、2.2m²/箱会向上取整成23箱、覆盖50.6m²；单据保留请求面积、实际数量及覆盖面积。直接数量输入必须符合商品单位步长和整包政策，M2可售步长应按实际配置（例如0.000001），不会自动忽略步长。

省略unitPrice时使用当前有效标准/协议/促销价。手工价或额外折扣需要sales.quotes.price.override，折后价仍不能低于当前底价。客户端不能决定总额、税率、换算、价格来源、正式编号或操作者。净额/GST按统一行级舍入相加，所有信用检查使用含税总额。

公司本地日期用于报价有效期，默认30天，截止日当天仍可用。客户/门店/仓库、商品/单位需要有效且在权限范围内；引用其他客户的门店、未分配仓库或其他公司资源会被拒绝。

## 编号、冻结和修订

创建草稿返回UUID、`number:null`及version，不消耗Q序列。提交时在同一事务中锁单、复核价格/单位/税务规则、分配正式编号、保存不可变提交快照并创建PENDING审批。正式编号由事务序列表生成，默认Q-000001、SO-000001；公司/类型隔离，数字超过6位会继续增长，不截断。不使用MAX+1。

提交前价格或商品规则变化返回409 `price_changed`，不分配编号。客户端先PUT刷新草稿并展示新结果，再用新version提交。正式提交后不能直接编辑内容；办公室带原因退回DRAFT，旧审批标为STALE，旧快照保留。后续PUT及重提使用新版本，保留第一次分配的Q号。

办公室审批有效提交版本；订单复制提交时的价格、税额和客户地址快照，未过期报价不因普通价格变化自动重算。转单仍检查商品/单位有效性、当前底价及客户/门店/仓库状态；失效时应退回修订，不会默默抬价或覆盖原报价。审批及取消请求体为`{"reason":"Office reviewed"}`等非空原因。

## 原子信用与库存承诺

转单依次锁报价、客户控制行及信用敞口，再按商品键顺序锁库存桶。规则如下：

```text
转单后敞口 = max(0, 应收投影 + 已确认未开票订单 + 本单含税总额 - 可用预收)
转单后敞口 <= 客户信用额度
可售量 = on_hand - reserved
同一SKU需求 = 各报价行换算后基础数量之和
```

预收在累计敞口中抵减一次，不对每张订单重复抵减。ON_HOLD/INACTIVE客户不能转单。信用与库存任一不足，整单失败，不留下订单、审批通过、局部预留、信用占用、SO号消耗或成功幂等记录；条件补齐后可重试原失败请求。

一张订单可包含不同单位的同一SKU，先按基础单位累计需求再检查，防止逐行各自通过后超卖。STOCK行需要仓库库存，NON_STOCK/SERVICE行只占信用、不预留实物。数据库触发器维护库存与信用投影；受限API数据库登录不能直接修改这两个投影。订单提交还有延迟约束检查行合计、信用承诺和必要库存预留一致。

取消只适用于未履约确认订单。库存预留和本单信用承诺同事务释放，实物on_hand不变；客户/仓库后来被冻结也不妨碍释放。已消费库存的订单拒绝用取消替代退货。取消不会把原报价变回待转单状态。

## 重试与并发契约

- 相同actor/company/route/key及相同输入返回第一次成功结果；同键不同输入409。
- 同一报价被不同办公室人员或不同key重复转单，返回同一订单（首次201，业务重放200），不重复预留或占额度。请求的源版本必须匹配实际批准版本；原因变化不会重写第一次审批。
- 取消后再次转原报价只返回原订单，不能借重试复活订单。需要新交易时新建/另行修订业务单据。
- 更新/提交过期version返回409；缺If-Match返回428；缺幂等键400。信用/库存不足、客户冻结、过期或当前底价冲突通常409；字段/金额/数据库业务约束通常422；范围外资源404，缺权限403。
- 行锁与幂等advisory lock处于同一事务；锁等待/死锁沿用有限数据库超时并返回可重试冲突。基础事务失败整体回滚，不通过客户端禁用按钮防重复。

## 库存数量初始化

本阶段尚未做采购收货。使用受控owner CLI为每个仓库/SKU初始化一次**基础单位数量**；API没有直接改on_hand接口。要求指定真实有效公司成员，并具inventory.opening.write（默认只有ADMIN）。

```sh
docker compose run --rm migrate stock-opening \
  --company 'company-uuid' --warehouse 'warehouse-uuid' --product 'product-uuid' \
  --quantity '50.600000' --reference 'Opening import 2026-10-24' \
  --issuer 'https://verified-issuer' --subject 'authorized-admin-subject'
```

同仓库/SKU相同数量和reference重试返回原opening ID；不同内容拒绝覆盖。金额/数量不接受千位分隔符。开账记录不可变，实际变化留给后续收货/调整流程。

这是数量初始化，不是库存价值或GL开账。信用使用现有customer_credit_exposures投影；迁移保留原AR/未开票订单/预收值，不从客户端余额拼算。实际账套投入使用前，应通过正式期初迁移核对这些来源；本次不宣称AR对账、库存估值或财务系统切换已经完成。

## 数据库与运维边界

新增005迁移，001—004保持原校验和。新增sales与inventory两个schema、10张表（总计63张业务/基础表，另有迁移历史）。提交快照、订单行、信用决策和库存开账不可变；预留/信用承诺只能单调消费或释放，不能改身份、数量或逆向复活。

API、Worker的连接池现在由依赖注入容器创建并释放，避免反复启停主机累积连接。Worker消费本切片事件仅作诊断；没有冒充邮件、PDF或客户通知已发送。真实外部身份/云部署及三个客户端仍未改动。
