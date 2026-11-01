# D01：跨实体全局搜索（050）

本批仅修改 htt-backend。新增050迁移，001—049不变；没有执行生产迁移、接真实银行或修改三个客户端。

## 契约

`GET /api/v1/search?q=关键词&kind=INVOICE&page=1&pageSize=25`

通过既有OIDC、X-Company-Id、CompanyFilter、API限流及事务会话。需要 `search.global.read`，默认授予ADMIN/FINANCE/OFFICE/SALES/PROCUREMENT/WAREHOUSE；该权限不授予任何实体数据权限。明确指定kind时还需对应底层读权限；不指定时自动省略没有权限的类型。数据库函数再次检查当前成员和原权限，不依赖API传入的权限布尔值。

| kind | 原权限 | 搜索字段/范围 |
|---|---|---|
| CUSTOMER | customers.read | 编码、当前法定名称；customers.all或本人客户分配 |
| BRANCH | customers.read | 编码、门店名称；所属客户范围 |
| CONTACT | customers.read | 姓名；所属客户范围，不搜索/返回手机号和邮箱 |
| SUPPLIER | suppliers.read | 编码、当前法定名称 |
| PRODUCT | catalog.read | SKU、商品名称；不返回采购成本或销售价格 |
| QUOTE | sales.quotes.read + customers.read | 正式编号、当前客户名称；客户范围、未入回收站 |
| SALES_ORDER | sales.orders.read + customers.read | 正式编号、当前客户名称；客户范围、未入回收站 |
| INVOICE | sales.invoices.read + customers.read | 正式编号、当前客户名称、履约参考号；客户范围、未入回收站 |
| PURCHASE_ORDER | purchase.orders.read | 正式编号、当前供应商名称；未入回收站 |
| SUPPLIER_BILL | purchase.bills.read | 正式编号、当前供应商名称、供应商发票号；包含独立费用账单 |
| CUSTOMER_CREDIT | sales.credits.read + customers.read | 正式编号、当前客户名称；原发票客户范围 |
| SUPPLIER_CREDIT | purchase.credits.read | 正式编号、当前供应商名称、供应商贷项参考号；包含费用贷项 |

q去首尾普通空格后长度2—100，不接受控制字符；按数据库lower规则不区分大小写，使用字面子串匹配，`%`、`_`、引号不解释为通配符或SQL。kind为表中精确大写值；非法值422。page>=1，pageSize为1—100，最大offset10000；越界422，合法的空页返回items=[]，totalCount保留可见结果总数。

结果包含schemaVersion、companyId、snapshotAt、readOnly、query、kind、page/pageSize、totalCount、counts和items。每项仅有kind/id/code/name/status/parentId/apiPath/reference/businessDate；无余额、金额、成本、税务、银行或私人协作正文。未正式提交草稿code可以为null，不伪造正式编号。门店/联系人apiPath指向所属客户详情，parentId明确该客户；其他apiPath指向既有授权详情API，不是新增客户端路由。停用主数据仍可被发现，status明确，不代表可用于新单据。搜索当前名称，不支持历史名称审计检索。

排序：编码完全匹配、编码前缀、名称前缀、其他子串；再按lower(code)的C排序、kind、id、parentId稳定排序。items/totalCount/各kind计数在一个SQL语句快照内生成，先过滤公司/权限/客户/回收站再计数和分页。同一数据库快照内排序稳定；不同HTTP分页间发生新增/更名时可变化，客户端需刷新，不承诺跨请求冻结结果。

## 安全、并发和读取语义

050只增加权限、种子函数和只读网关，不增加搜索副本、业务表或经济余额。沿用公司RLS；SECURITY DEFINER函数固定pg_catalog search_path、每个来源显式限定当前公司、检查活跃成员及底层权限。仅htt_app可执行网关，PUBLIC/htt_portal/htt_worker无调用权限。新公司bootstrap及旧公司升级都获得种子授权；撤销分配或权限后下一次请求即时生效。

GET不需要Idempotency-Key、不写幂等缓存，也不发起审计、outbox或会计过账。重复/并发读取只返回当前可见快照；读取不触发审批、核销或发件。复用既有no-store、每用户API限流及10秒数据库语句超时，不记录搜索词为业务审计。生产HTTP代理和可观测配置也应避免记录含客户名称的查询字符串。

## 边界与验证

本批是R051的核心实体切片；收付款、退货/收货/调拨、银行、任务/消息、工资、附件正文和全文模糊纠错尚未纳入，R051整行继续部分实现。既有 `/search/customers|branches|contacts|products` 保留原契约。客户门户继续使用独立portal API，不能借此检索员工数据。

GlobalSearchTests覆盖12种空集合、七类实际业务单据与详情链接、字面匹配/稳定排序/分页/参数、匿名及当前底层撤权、公司与客户分配隔离、回收站恢复、并发无写入、同语句快照及portal/worker拒绝。回归另覆盖数据库权限、003—049旧库逐版本升级、工作台、发现设置、回收站及现金/非现金制跨模块财务核对。实际通过数量与平台在verification.md及stage-d-01-results.json记录。

当前为数据库实时子串查询，不安装新扩展或外部搜索引擎；有大规模客户/单据后需按实际选择性、数据量和延迟目标执行EXPLAIN/容量验收，再选择公司范围索引/独立授权索引。合成用例不等于生产搜索容量SLO。
