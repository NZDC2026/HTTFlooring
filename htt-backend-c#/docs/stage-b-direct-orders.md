# 阶段B：办公室直接创建销售订单

本批仅改htt-backend，新增020迁移；业务/基础表仍123张，迁移增至20个。001—019不改。三个客户端未修改、未联调，正式数据库未迁移。

## 入口与业务状态

新增`POST /api/v1/sales-orders`，供具有`sales.orders.create`权限的办公室人员直接确认订单。默认仅ADMIN、OFFICE拥有此权限；仍须有sales.orders.read、客户读取/范围及仓库授权。SALES、WAREHOUSE、FINANCE、PROCUREMENT、PRICING_MANAGER和客户门户令牌不能借此绕过办公室授权。自定义角色可显式授予该能力，但不能绕过客户、门店、仓库和价格政策。

请求通过后直接创建正式CONFIRMED销售订单，不增加销售订单草稿、任意修改或手工指定金额/编号接口。不生成“伪报价”，不消耗Q编号，不创建报价提交/审批记录。报价转订单入口继续要求报价提交、版本、办公室审批及原资格检查。

```http
POST /api/v1/sales-orders
Authorization: Bearer <staff JWT>
X-Company-Id: <company uuid>
Idempotency-Key: <stable command key>
Content-Type: application/json

{
  "customerId": "<uuid>",
  "customerBranchId": "<uuid>",
  "warehouseId": "<uuid>",
  "lines": [
    {"productUnitId": "<uuid>", "quantity": "2"}
  ],
  "reason": "Office verified the customer's order instruction",
  "notes": "Deliver after confirmation"
}
```

reason必填且非空，最多2000字符，保存为creationReason并进入审计。notes可省略，最多2000字符。每次1—50行，支持与报价相同的quantity或requestedArea（恰好一个）、unitPrice及discountPercent。面积按BOX/M2和数量步长向上取整，整包约束、SKU/单位/有效价格/底价/GST计算由既有QuoteBuilder权威执行。手工价格或折扣仍需`sales.quotes.price.override`，低于底价依然拒绝；该权限本身不授予直接建单能力。

客户必须ACTIVE，门店必须属于该客户且启用，仓库必须为当前公司已授权、启用的SELLABLE仓；商品/销售单位必须有效且可销售。服务器决定公司业务日期、价格、数量换算、GST、总额、正式编号和业务状态。客户端自报gross、taxRate、number、state、orderOrigin或sourceQuoteId不成为权威输入。直接订单没有报价到期日字段。

返回201：

```json
{
  "orderId": "<uuid>",
  "number": "SO-000001",
  "version": 1,
  "state": "CONFIRMED",
  "orderOrigin": "DIRECT",
  "sourceQuoteId": null
}
```

现有GET `/sales-orders`、`/sales-orders/{id}`继续使用原客户范围过滤。列表增加orderOrigin；详情增加orderOrigin、creationReason、notes、pricingAt。直接订单sourceQuoteId为null，旧报价订单为QUOTE且保留来源ID。后续客户端需按orderOrigin处理nullable来源；本批没有替客户端做兼容改动。

## 共用的确认、信用与库存规则

报价审批与直接创建调用同一OrderConfirmation核心，共用同一个SALES_ORDER编号计数器、客户信用锁、按SKU汇总的库存检查、预留写入、信用决定与承诺写入。没有复制另一套额度/可售公式。

1. 锁定客户，稳定当前客户状态、信用上限、门店及仓库，再稳定单位和定价资料。
2. 锁信用投影，按原含税公式计算：`max(0, receivable + unbilled_orders + new_order_gross - available_advances)`。恰好等于额度允许，超过即409；不新增信用超限豁免。
3. STOCK行按product_id汇总基本单位需求、按稳定顺序锁库存。可售仍为on_hand-reserved；重复SKU、多销售单位和多个订单不能各自重复使用同一库存。非库存/服务行不生成库存预留。
4. 所有检查通过后才分配SO编号并写注册、订单行、库存预留、信用决定、信用承诺、审计、Outbox和成功幂等结果，全部在同一公司事务中提交。

不同客户争同仓同SKU不能超卖，同一客户的直接订单/报价转单不能同时花掉最后的信用额度。多SKU任一行不足则整单失败；成功前后的库存检查和写入不会产生部分预留。创建本身不生成收入、COGS、AR或GST总账；成本与账务继续由既有发运、开票等流程过账，不自动补库存或初始化估值。

## 来源与税务快照

020将sales.orders来源显式区分为QUOTE/DIRECT；直接来源的source_quote_id、approved_quote_version及行source_quote_line_id必须为空。报价来源仍保留非空且匹配的引用，现有唯一约束及同公司外键继续生效。创建原因、来源、客户/仓库、价格金额及行快照在确认后不可改写。

直接订单保存服务器生成的不可变行快照（单位、换算、数量步长、价格、税码、税率等），没有隐藏的报价行。现有开票和收款预付函数按来源读取税率/税码：直接来源使用订单行冻结快照，报价来源继续使用原报价行事实。后续商品税码变更不重定价已确认订单，也不把直接订单的预收或开票当成“缺报价行”。

取消、拣货/发运、开票、收款/预收核销、退货/贷项/退款和控制核对继续使用原API及权限。回收站同样只允许取消并释放预留、信用及预收等义务后的订单；恢复仍为CANCELLED，不重预留或重记账。未增加直接订单PDF模板、订单编辑、超信用审批或新的金融冲销交易。

## 幂等、失败与重试

新建无需If-Match，必须有Idempotency-Key。沿用公司+操作者+路由+键的幂等范围；同键同请求返回原201结果，同键异请求409，并发同键仅创建一次。客户、仓库范围及建单/读取权限在重放前再次检查。不同键视为不同下单命令，不提供跨人员或客户PO参考号自动去重。

已成功后，价格或当前业务状态变化不会让同一键重新建单；即使订单随后取消，旧键重放也不会重新确认、预留或分配编号。重复响应表示原命令结果，最新状态应GET原订单。尚未成功的请求（例如库存不足、信用不足或事务失败）不留下成功键，条件恢复后可用原键重试，届时重新执行当前业务校验与定价。

401为身份无效；403为缺权限；404为公司/客户/门店/仓库/单位不可用或不在范围；409为客户状态、信用、库存或幂等冲突；422为输入、数量/步长、底价等校验失败。数据库并发冲突按既有retryable响应处理；网络结果不明时保留原键查询/重试，不能换键盲目重发。

## 验证与升级

DirectOrderTests覆盖办公室/非办公室、客户/仓库/公司范围、缓存权限撤销、数据库直接插入越权、权威金额/来源不可覆盖、整包/面积、客户价格/底价/手工价权限、含税额度及零金额、同键并发、直接/报价混合编号和额度/库存竞争、多SKU/审计失败整单回滚，以及取消后幂等重放与回收站衔接。

CASH/NON_CASH与STOCK/SERVICE组合实际执行直接订单→预收→发运（库存品）→开票→核销→退货/贷项→退款，并要求AR/信用/库存成本/GST/GL控制核对CONSISTENT。另验证商品税码改为免税后，原直接订单的预收与开票仍使用原冻结GST事实。完整本机/Linux回归结果见[verification.md](verification.md)。

升级不增加环境变量或数据库登录角色。先在备份副本演练并用既有迁移工具升级至020，再发布匹配的API/Worker；ready要求新权限种子函数存在。既有订单默认标记QUOTE，不重建、重编号或重记账。未执行正式库升级、真实银行收退款/发件、客户端E2E或生产容量验收；阶段B其余欠交仍保留。
