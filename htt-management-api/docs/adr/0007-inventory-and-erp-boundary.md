# ADR-0007：共享库存查询与 ERP 解耦

后续更新：用户已明确 HTT 主库的同一库存表为三端及 ERP 业务共同来源。[ADR-0008](0008-shared-postgresql-inventory.md) 替代本记录中“权威来源未知/仅不可用提供方”的状态；下文保留前一阶段的证据与设计过程。

日期：2026-11-06。状态：用户确认权威来源尚未确定，先建立解耦边界。模块隔离检查、Java 来源契约及未接线的不可用实现已完成；授权应用查询、真实来源和仓库授权待实施。尚未发布 API、迁移表或访问 ERPNext。

## 已观察到的代码证据

以下兄弟项目仅只读检查，路径相对工作区 `D:/projects/HTTFlooring`。

| 代码位置 | 事实 | 不能据此认定 |
| --- | --- | --- |
| customer-portal/src/data/products.ts；src/pages/ProductPage.tsx | Product 有 boxes/sqm/status/stockKnown；页面对未知库存显示 Stock on request；存在 Local sample inventory 文案 | 示例零值是真实缺货；现有演示已连接服务器 |
| customer-portal/src/pages/InventoryPage.tsx | 按 profile.region 展示库存 | region 等同 company、warehouse 或权限 |
| htt_flooring_app/lib/models/warehouse_inventory.dart | productId、SalesRegion、stockBoxes、stockSqm、stockPieces；本地低库存阈值 20 | 20 是甲方确认规则；double 可作后端库存精度 |
| htt_flooring_app/lib/services/inventory_service.dart | 硬编码产品/地区库存，加 SharedPreferences 入库、调拨与 stock_metrics；available = onHand - reserved - damaged | 它是可迁移的真实库存账；此公式已获批准 |
| htt-backend/src/Htt.Host.Api/Portal/PortalEndpoints.cs | 认证门户有 warehouses、products、product detail、availability 查询 | Java 已实现这些 API |
| htt-backend/src/Htt.Host.Api/Portal/PortalManagementEndpoints.cs | 旧门户 grant 显式配置门店与 WarehouseIds | 新 Java 门店 grant 已包含仓库权限 |
| htt-backend/src/Htt.Infrastructure/Database/Migrations/018_customer_portal.sql | portal.availability 返回单位、十进制字符串 available、stockStatus、warehouses、dataAsOf；按 scoped_stock 过滤 | 旧计算/阈值/聚合和新需求完全一致 |
| htt-management-api/src/main/resources/db/migration/V2__customer_catalog_and_warehouse.sql | 产品、单位、仓库主数据；没有余额、流水、预留表 | 本系统已有 ERP 库存管理 |

旧门户相关 GET 路径（不代表 Java 已实现）：

| 路径 | 输入 | 返回要点 |
| --- | --- | --- |
| /api/portal/v1/warehouses | branchId；已验证身份及公司/grant 上下文 | 当前门店可见仓库 items、customerId、branchId、dataAsOf |
| /api/portal/v1/products | branchId、search、page/pageSize、sort、categoryId、stockStatus | 产品分页及聚合库存；分页/过滤上限见旧实现 |
| /api/portal/v1/products/{id} | productId、branchId | 产品、单位换算、条码、dataAsOf |
| /api/portal/v1/products/{id}/availability | productId、branchId、可选 warehouseId | baseUnit、available、stockStatus、授权仓库分项 |

这只是库存迁移切片，不是三端完整接口矩阵。旧错误语义与当前 Java 403 资源拒绝规则的差异，必须通过契约测试显式处理，不能悄悄修改客户端登录或默认补零。

## 决定与拟议查询契约

客户门户与员工 API 使用同一个 inventory 授权查询用例。ERP 不建成一个统揽销售、库存、财务的大模块；具体外部系统只在 integration.erp 中适配。库存来源端口接收已经校验的 companyId/productId/warehouseIds，不接受客户端传来的“我是管理员”或未校验的仓库列表。

提供方端口 InventorySource 和不可变 InventoryAvailability 已放 inventory.contract；UnavailableInventorySource 在 infrastructure，按请求仓库返回 SOURCE_UNAVAILABLE/null，不注册 Spring Bean。它们没有认证用例或 HTTP 入口。未来授权用例放 application，真实源适配放 infrastructure 或独立 integration.erp；外部模块不能直接调用 InventorySource。来源端口是可替换边界，避免为每一个 Service/DAO 增加同名接口。

内部契约已实现下列字段/语义，不冻结 HTTP JSON：

| 字段 | 约束 |
| --- | --- |
| companyId/productId/warehouseId | HTT 内部稳定 ID；外部 ERP ID 不进入前端业务逻辑 |
| quantity / unitCode | 内部 BigDecimal，外部十进制字符串；未知量为 null，真实 0 才表示零库存 |
| knowledge | KNOWN / UNKNOWN / STALE / SOURCE_UNAVAILABLE；数据不完整或过期不能显示成可靠可售量 |
| sourceAsOf / observedAt | 来源业务时点与本系统观察时点分开；不能把响应时间当来源更新时间 |

sourceVersion/同步去重元数据待选定权威来源后设计，没有添加无意义的空版本字段。内部 BigDecimal 对外的字符串映射由未来 API DTO 实现，当前没有声明可直接序列化的 HTTP 响应。

未配置来源或来源整体不可用：查询返回统一 503，不回退样例/空数组/0。来源明确表示某产品数量未知时：成功响应可带 UNKNOWN 与 null 数量。仍可读取的过期快照显式 STALE；容忍时长由甲方确认。不得把任何状态当作可承诺发货或成功预留。

stockStatus 的低库存阈值、available 的计算口径、箱/片/平方米换算均待确认，不从 Flutter 的 20 或旧 SQL 公式直接复制。聚合仅覆盖已授权仓库、同一已确认单位；部分来源未知时不能将已知小计标为完整总量。门户原则上只返回获准的可售数量；onHand/reserved/damaged/成本各字段是否允许员工查看需单独动作权限。

## 权限设计（尚未实现）

1. 保留现有 Bearer、X-Company-Id、门户 X-Portal-Grant-Id；验证 issuer/subject、账户、公司成员和当前授权。
2. 增加独立库存读取动作（建议 inventory:read，待契约落实）；它不赋予库存调整、入库、调拨、锁货或 order:create。
3. 验证客户、门店真实归属和授权，产品对该客户是否可见，再计算显式允许仓库集合。门户不接受 COMPANY grant 直接扩权。
4. 授权集合与请求 warehouseId 取交集；请求指定越权仓库时拒绝，不能静默返回其他仓库。列表、详情、聚合、搜索排序/计数、导出及通知均不可泄露集合外数量。
5. Java 现有 V3 没有仓库 grant，必须新增独立迁移，复合外键防跨公司/门店绑定，并验证仓库权限撤销。没有规则或没有授权默认拒绝；不按客户、销售、管理端来源默认开放。
6. 正式订单仍要求 STAFF + MANAGEMENT + order:create + 客户/门店范围。只读库存对 CUSTOMER/SALES 开放不改变订单规则。

旧门户的显式 branch→warehouse 授权可作为迁移参考；员工仓库范围、公司级库存管理员、客户可见精度还需确认。不在本轮臆造授权表或自动授予历史角色权限。

## 来源与同步

每家公司/数据集指定一个权威写入方。可选旧后端、本 Java 库或将来外部 ERP，当前未选定；ERPNext 只是已知部署，未访问、未指定为来源。禁止双向同步时双方同时修改同一余额。

若采用外部来源，优先评估有界同步形成本地只读投影：查询不随每个客户端请求直连 ERP。需要独立公司/产品/仓库/单位映射、来源版本或游标、去重键、失败重试、对账、延迟指标及重建流程。没有可靠源版本的轮询必须设计完整快照发布，不能把半批数据当完整余额。

若暂时同步 HTTP 查询，要设超时、并发上限与故障状态；网络调用不占用数据库事务。Redis 可缓存已授权结果/源快照但不是库存权威；缓存键包含公司、产品、仓库、授权版本，撤权不得被旧缓存绕过。当前 Redis 尚未接入，不宣称已实现缓存或十万在线容量。

库存变化通知在权威事务/同步投影提交后走 Outbox；不能消费客户端演示事件修改库存。以后做真实预留/扣减需强一致、幂等、并发版本和取消释放，作为独立写用例评审。成本核算、库存计价、COGS、税务和财务过账继续留在明确的财务边界内。

## 验收与未决问题

本轮验收覆盖依赖隔离、内部契约（未知/零/精度/时点/不可变范围）和原功能回归，不等于库存授权查询可用。下一库存增量必须通过：未认证、无动作权限、跨公司/客户/门店/仓库、产品不可见、撤权、授权仓库聚合、来源故障与无事务内网络调用测试。

OPEN QUESTIONS：库存权威来源；地区/公司/仓库映射；客户可见仓库/精度；员工与仓库操作人员范围；available 口径/损坏/预留；基本单位及换算/舍入；低库存阈值；刷新频率与过期容忍；同步与对账；是否需要锁货/欠货/批次。用户未答复前不实施这些规则。
