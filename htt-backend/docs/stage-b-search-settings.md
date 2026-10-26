# 员工搜索及业务设置（031）

员工 API 使用原公司、客户分配及仓库范围；门户 JWT 不获得员工权限。

| API | 行为 |
|---|---|
| GET /search/customers | q 按客户名称/编号/ABN、门店名称/编号/地址、联系人姓名/电话/email 搜索；status、code/name 排序、分页 |
| GET /search/branches、/search/contacts | q、customerId、分页；只返回可访问客户的门店/联系人 |
| GET /search/products | SKU/名称/旧产品条码与新单位条码；status、sku/name 排序、分页 |
| GET /customers/{id}/catalog | warehouseId、q、分页；返回客户价格/有效活动价、单位及仓库可售库存；价格缺失返回原因 |
| GET /products/{id}/barcodes | 读取本次单位条码档案；旧门户产品条码仍由原发布接口维护 |
| POST /product-barcodes | productUnitId、barcode、active；同公司唯一，禁止跨产品复用旧条码 |
| PUT /product-barcodes/{id} | active；If-Match 与幂等键，保留历史档案 |
| GET/PUT /settings/business | 默认销售/采购账期、报价有效天数、提货/配送模式、备注 |
| GET /settings/document-numbering | 各单据序列、前缀、下一值及版本 |
| PUT /settings/document-numbering/{type} | prefix、nextValue；If-Match 与幂等键；禁止回拨及当次编号碰撞 |

搜索为字面子串，输入的 `%`/`_` 不扩张为通配符；排序字段白名单，稳定分页上限沿用主数据规范。客户库存价格聚合是读取提示，不是信用承诺或库存预留；提交仍执行原事务规则，读取期间价格和库存可能变化。

设置读权限默认 ADMIN/FINANCE/OFFICE/PROCUREMENT，写默认 ADMIN/FINANCE。默认值只用于后续省略相应字段的新交易/主数据，原显式值及历史快照不重写。报价创建时解析有效期；客户/供应商创建时解析账期；提货确认省略模式时使用当前默认模式。编号配置和正式编号共用同一序列锁及版本。

本次是后端 API：客户端搜索页面、最近访问/区域 CRM 功能、模板设计器、提醒及在线支付配置未包含；旧模板和邮件服务仍按原文档模块运行。会计账户/税码/映射及商品价格设置继续使用既有 API。
