# 模块、数据所有权与允许依赖

2026-11-06。下表中的“规划”不是已生成 Java 包。数据库的基础表也不等于已实现对应业务用例。

| 模块 | 当前状态 / 数据所有权 | 允许依赖的模块 |
| --- | --- | --- |
| platform | 已实现 HTTP/安全接线、Outbox 发布；platform.domain_outbox | 无具体业务模块 |
| identity | 已实现账户/外部身份、公司成员、多角色、动作权限、客户/门店范围、访问审计 | platform |
| notification | 已实现通知历史、设备、投递/消费审计、SSE；通知 worker 托管 Outbox 租约/转发状态 | identity、platform |
| crm | 客户/门店/联系人；V6 code及CTX-002门户门店读取已验收，其他用例未迁移 | identity、platform |
| catalog | product/unit_of_measure，以及 V5 product_unit/product_barcode；可见性和创建/发布用例待实施 | identity、platform |
| inventory | warehouse、V5 stock_balance/stock_movement，内部 PostgreSQL 读取实现；授权查询/过账用例未实现 | catalog、identity、platform |
| pricing | 规划：价格、客户价及价格规则 | catalog、crm、identity、platform |
| sales | 规划：报价、正式订单、交易快照；可读库存不代表可锁货 | crm、catalog、pricing、inventory、identity、platform |
| fulfilment | 规划：拣货、交付和履约凭证 | sales、inventory、identity、platform |
| purchasing | 规划：采购承诺和收货流程 | crm、catalog、inventory、identity、platform |
| finance | 规划：仅已确认的发票/应收等；总账、BAS、工资未确认 | crm、catalog 的明确主数据契约、identity、platform |
| integration | 规划：ERP 外部适配、标识映射与同步状态；不拥有业务账 | catalog、inventory 的公开契约、platform |
| document | 规划：文件及访问元数据；业务范围经明确契约核验 | identity、platform；新增业务依赖需显式评审 |
| reporting | 规划：受授权的查询/报表，只读明确契约 | identity、crm、catalog、pricing、inventory、sales、fulfilment、purchasing、finance、platform |

依赖名单在 `ModuleArchitectureTests.DEPENDENCIES` 同步维护。销售读取库存契约是本轮对 ADR-0002 的细化，不意味着销售依赖 ERP 适配器。finance 不依赖销售/库存内部实体，也不读取其他模块业务表自行计算应收或成本。

## 模块间规则

1. 自己的 Repository 负责自己的表。跨模块通过公开 contract 用例或事件；不共享 JPA Entity、Repository 或 HTTP Controller。
2. 同一数据库不等于所有表可随意 JOIN/更新。授权实现可通过经审核的限定函数读取必要资源归属；报表需要显式读契约/投影，不将 reporting 变成后门。
3. platform 不引用业务类。通知发布者只用 platform.events；通知内部的 Rabbit/FCM/SSE 实现不暴露给业务。
4. 平铺identity的AccessSnapshot/VerifiedUser/VerifiedToken/ResourceAccess/AccessAudit及CustomerBranchAccess是明确入口，跨模块范围值为identity.contract.CustomerBranchScope。AccessRepository仅对既有NotificationAccess/Configuration例外，不向CRM公开DAO。
5. HTT PostgreSQL 已确定为库存权威；后续 ERP 业务与三端调用同一库存用例，共用 stock_balance，不各自 UPDATE。inventory 不依赖 integration；未来外部同步不沿用通知收件人模型。
   InventorySource 是内部提供方契约，不是带权限的查询用例；api、sales 等不得直接调用它。未来授权应用用例必须验证完整范围，再访问来源。
6. 不创建全局 entity/service/dao/controller 大目录，不按 customer-portal/sales-app/admin 复制业务模块。不同 API 可以映射不同展示字段，但共享授权查询和业务规则。

## 库存资源归属

| 资源 | 所有者 / 当前事实 | 后续必须校验 |
| --- | --- | --- |
| 产品、基础单位 | catalog；按公司唯一 SKU，V2 已有表 | 公司归属、状态、客户可见性；公开查询不能暴露成本 |
| 客户、门店 | crm；门店含 company_id/customer_id 复合外键 | 门店真实客户与当前 grant 范围，不能相信请求体归属 |
| 仓库 | inventory；V2 仅 company_id 与地址等主数据 | 显式可见仓库集合；不能按 Melbourne/Sydney 文本推断授权 |
| 库存数量、可用量、预留/损坏 | V5 stock_balance 统一存储并派生 available；stock_movement 留变动历史 | 单位、来源时点、完整性、仓库权限和并发版本；写入用例待实施 |
| ERP 标识与同步游标 | 未创建；将由具体 integration 实现持有 | company + source + externalId 映射；不得按产品名称/地区猜测 |

当前 IAM 只有公司/客户/门店范围，没有仓库范围或 inventory:read 权限。下一增量必须先定义、迁移并验证仓库授权，不能只调用 canReadBranch 就返回所有公司仓库。仓库主数据不从属于客户门店；“门店允许查看哪些仓库”是授权/供应关系，不是把 warehouse 直接挂到某一个 customer_branch。

库存流水及余额已建结构，实际预留/入库/出库/调拨用例尚未开放；批次、成本和财务凭证暂不建表。Flutter 本地收货/调拨数据不能自动导入为服务器业务事实。当前生产 API 未变，V5 仅在验证库验收，见 ADR-0008。
