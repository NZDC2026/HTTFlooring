# ADR-0008：HTT 统一库存主数据与余额

日期：2026-11-06。状态：用户已确认共享数据库/表方向；V5、PostgreSQL 来源实现与隔离数据库测试已完成；授权查询 API、商品创建/发布、出库用例和三端接线待实施。本记录更新 ADR-0007 中“权威来源未知”的结论。

## 用户确认与实现边界

管理端、customer-portal、htt_flooring_app 以及后续 ERP 业务必须使用同一个 HTT 数据库中同一商品/仓库库存记录。商品都按库存商品管理，不为每个客户端维护自己的库存字段或余额表。

目标库为 `htt_management`，库存数量唯一来源为 `inventory.stock_balance`。本轮迁移只应用并验证于 `htt_management_validation`，未在主库试验或执行迁移；主库最后已知为 V1/V2，后续只能显式应用已验证迁移。ERP 指后续经营业务模块；这项确认不等于授权接管现有 ERPNext 数据库。

模块解耦意味着数据所有权明确：catalog 管产品/单位/条码，inventory 管仓库/余额/流水，sales 与后续 ERP 用例调用库存公开服务。共用一个表不意味着多个模块可以各自执行 UPDATE 或维护各自扣减公式。客户端只调用后端，不直接连接数据库。

## 前端证据与推导

| 证据 | 推导结构 / 实现 |
| --- | --- |
| Flutter models/product.dart：sku/barcode/category/colour/brand/dimensions/sqmPerBox | 复用 product；增加分类/颜色/品牌/尺寸字段；单位换算与条码独立表 |
| Flutter models/warehouse_inventory.dart：productId/region/stockBoxes/stockSqm/stockPieces | 按公司+商品+仓库保存基础单位数量；地区只是展示筛选，不作为权限或仓库主键 |
| Flutter services/inventory_service.dart：onHand/reserved/damage/available；本地入库/调拨 | 余额三项及可售派生量、变动流水；不导入 SharedPreferences 样例值作为正式库存 |
| Portal data/products.ts：boxes/sqm/status/stockKnown；ProductPage.tsx 未知库存提示 | 单位换算、未知与真实零分开；低库存阈值不照搬 App 的 20 |
| 旧门户按 branch/warehouse grant 查询 | 真实 API 上线前补仓库范围与产品可见性；公司 RLS 不能替代它们 |

这些是根据用户允许的前端推断建立的最小模型，不代表完整 ERP、会计或仓储流程已确认。价格、销售底价、促销、库存成本、COGS、批次和财务过账不混进本次库存余额。

## 表和字段

| 表 | 关键字段 / 约束 |
| --- | --- |
| catalog.product（已有） | company_id、id、sku、name、description、base_unit_id、status/version；新增 category、colour、brand、dimensions。SKU 公司内唯一 |
| catalog.unit_of_measure（已有） | 公司内单位 code/name |
| catalog.product_unit（新增） | company_id + product_id + unit_id 主键；base_unit_id、conversion_to_base、quantity_step。基础单位转换因子必须 1，转换因子/步长为正 |
| catalog.product_barcode（新增） | company_id + barcode 主键；product_id、unit_id；条码指向实际商品单位组合 |
| inventory.warehouse（已有） | 公司内仓库 code/name/address/state 等；不将 Sydney/Melbourne 自动变成两个公司 |
| inventory.stock_balance（新增） | company_id + product_id + warehouse_id 主键；base_unit_id、on_hand、reserved、damaged、available、version、updated_at |
| inventory.stock_movement（新增） | 公司/商品/仓库、基础单位代码快照、变动类型、三项数量 delta/after、balance_version、来源单据/行 ID、idempotency_key、actor、reason、occurred_at |

数量为 numeric(24,6)，换算因子/步长为 numeric(24,9)，Java 用 BigDecimal。对外 API 尚未发布，将用十进制字符串，禁止浮点库存计算。商品和库存的基础单位通过复合外键锁定，有库存/单位记录时不能随意改变商品基础单位；未来单位变更需独立转换迁移。

例如基础单位是 SQM，BOX 的 conversion_to_base=2.2，2 箱对应 4.4 基础单位。不会存一份可独立修改的 boxes 和另一份 sqm；包装允许整箱还是拆零由 quantity_step 和将来的用例校验决定。本轮没有按示例填写真实包装系数，也没有添加跨品类通用“平方米”强制字段。

## 数量与出库规则

初始保守规则来源于 Flutter stockMetrics：`available = on_hand - reserved - damaged`，在 PostgreSQL 生成列中统一计算；三项非负，reserved+damaged 不能超过 on_hand。损坏视为仍在库但不可售，预留仅占可售部分。是否允许负库存、欠货、其他库存状态仍待确认，当前不开放。

管理端可以显示“实存”“预留”“损坏”“可售”四个不同指标；门户与销售 App 若展示“可售”，必须读取同一字段。不同授权仓库集合的合计可以不同，但同一公司/商品/仓库/指标在同一提交版本上必须一致。

下单与出库是两个动作：创建订单不自动减少实存；确认出库才减少 on_hand。若以后启用预留，出库应同时释放已出库部分的 reserved，避免可售量重复扣减。订单创建仍要求 MANAGEMENT + order:create + 数据范围；库存读取和出库操作不赋予正式订单创建权。预留时点、仓库操作人员权限及部分发货规则未实现。

每个正式商品应在建立/发布用例中同事务初始化选定仓库的库存行。**目前商品创建/发布 API 尚未实现，数据库没有替它猜测仓库或库存数量，也未强制每个 catalog.product 主数据行已完成库存初始化。** 缺行返回 UNKNOWN，显式初始化为 0 才返回已知零库存。现有数据导入必须先完成仓库映射和期初数量核对再发布。

## 并发、幂等与事务

余额变更由数据库触发器增加 version、刷新 updated_at，且余额身份/基础单位不可变。流水具有公司内 idempotency_key 唯一约束及每个余额版本唯一约束。未来过账用例必须锁行或使用 WHERE version 条件更新，检查库存与单位步长，将余额、流水、幂等结果、审计和业务 Outbox 放入一个事务。

本轮仅提供结构和内部读取，运行账号不能 INSERT/UPDATE/DELETE 库存余额或流水，也没有开放调整/出库 API。唯一约束不等于已完成请求重放逻辑；流水与余额还没有通过生产过账用例强制原子关联。已存在通知 DomainEvent 要求收件人，不能将新库存事件直接塞入该信封：库存事件路由和通知接入需在过账阶段定义。

移动端本地收货/调拨仍是演示。后续迁移需服务器验证权限、锁定源/目的库存行、同事务写转出/转入流水；禁止先改单端内存或用重试重复扣库存。报价/发票/收入确认没有因为出库结构而自动实现。

## 查询、权限和实际验收

PostgresInventorySource 统一读取 stock_balance 的 available，以来源更新时间返回；要求存在 Spring 事务及可信 actor/company 上下文，RLS 按公司隔离。请求仓库中有外公司/不可见/停用资源时拒绝整个查询，不静默给不完整合计。缺少余额行则 UNKNOWN，数据库故障不会回退 Fake 数量。

来源实现没有注册 Bean 或 HTTP 入口：仓库细分授权、动作 inventory:read、产品对客户可见性及访问审计尚未接线。未来 API/application 先校验这些规则再调用内部来源端口；客户、销售、管理端复用同一用例，不能绕过权限直接访问表。

V5 已在专用验证库成功应用，新增四表均启用 RLS。68 项普通测试、14 项真实 PG 测试通过，其中新增三项验证共享读取提交可见性、未知/零/跨公司区分及运行账号禁写、单位/复合外键/超量约束。共享读取测试模拟三个来源读取方，实际更新发生在明确的合成测试事务；不是三端真实登录/订单出库端到端验收。测试后四张新表为 0 行，28 张业务/安全表启用 RLS。

回退：禁用后续入口，恢复本轮 Java 来源代码；保留已应用 V5 与 Flyway 历史，用新的前向迁移修复。不可重写 V5、自动 clean、删库存表或在主库跑测试。
