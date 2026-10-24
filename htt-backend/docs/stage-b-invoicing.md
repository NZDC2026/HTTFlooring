# 阶段B：销售开票、应收与GST过账

本批只修改htt-backend。沿用已批准订单和仓库交接，不修改三个客户端。支持一个订单分批开票；每次命令直接开具并过账正式发票，没有可修改的已过账发票草稿。后续[收款切片](stage-b-receipts.md)已实现客户收款、预收核销、应收余额及现金GST归属；贷项通知单/退款、退货、BAS申报、发票PDF及邮件发送仍待后续实现。

## 接口与权限

所有路径前缀 `/api/v1`，需要有效JWT、`X-Company-Id`，公司RLS及客户范围。

| 方法与路径 | 作用 | 权限 |
|---|---|---|
| GET `/sales-orders/{id}/invoiceable` | 订单版本、已开票/本次可开销售单位数量 | sales.invoices.read |
| POST `/sales-orders/{id}/invoices` | 正式INV编号、应收/收入/GST、释放同额未开票承诺 | sales.invoices.write |
| GET `/sales-invoices/{id}` | 冻结发票、来源、明细、会计分录ID | sales.invoices.read |
| GET `/sales-invoices?customerId=...&orderId=...&page=1&pageSize=25` | 按授权客户分页查询 | sales.invoices.read |
| GET `/customers/{id}/receivables?page=1&pageSize=25` | 客户应收投影及本系统发票应收明细 | accounting.receivables.read |
| GET `/sales-invoices/{id}/gst` | 发票GST明细及冻结的现金制/非现金制设置 | accounting.receivables.read |

ADMIN、OFFICE、FINANCE默认可开票/读发票/读应收；SALES仅可读分配客户的发票及可开数量；WAREHOUSE无发票/财务权限。没有customers.all时仍要求客户分配，数据库开票函数也重复校验有效成员、权限及客户范围。税务设置CLI默认限ADMIN、FINANCE。

POST需要 `Idempotency-Key`，以及**来源订单当前版本** `If-Match: "version"`。不是发运单版本。成功开票和出库都会增加订单版本；下一批应刷新。相同员工、同路由、同键和同内容返回原结果，即使原来源版本已经改变。相同键不同内容409；不同键使用旧版本或重复开完的数量409。失败不会保留成功幂等记录，可修复配置后原键重试。

```json
{
  "lines":[{"orderLineId":"uuid","quantity":"2"}],
  "fulfilmentReference":null
}
```

quantity是销售单位（例如BOX），每次1—50个不同订单行，正数、最多6位小数并遵守订单冻结步长。库存商品上限是已确认提货/发运数量减已开票数量，已拣未交接不能开票。服务及非库存行由办公室在本命令确认履约，必须提供非空fulfilmentReference（最长200字符，例如完工单号），上限为订单剩余数量；这是有权限人员的人工履约声明，不是外部完工真实性验证。仓库实物接口仍不处理服务。

不能提交自定义客户、单价、税率、金额、科目、编号、业务日期或到期日。服务端按订单冻结金额进行累计分摊：

`本批net = round(订单行net × 累计开票数量 / 订单数量, 2) − 之前已开net`

tax同样分摊，gross为两者之和。最后一批吸收尾差，累计金额严格等于已批准订单。发票快照保留原单价、税率、含税方式及税码；当前促销或主数据变化不会重定价。分批发票的分摊金额以本批明细net/tax/gross为准，snapshot里的quantity/baseQuantity是原订单行数据。

发票日期为公司澳洲时区当前日，不支持本批追溯/未来日期；到期日按开票时客户payment_terms_days生成并冻结。发行方名称/ABN/币种/GST登记状态、客户订单身份地址快照、税率及税务核算基础均保留。

## 原子事务与信用

同一个公司事务中锁定订单→客户→信用投影，并锁住公司税务设置及开放会计期间，然后分配INV号、写不可变发票/行/GST明细、过账、写应收、更新信用、审计、Outbox和幂等结果。订单锁与仓库交接/整单取消使用同一顺序，避免并发超开及取消与开票同时成功。关账、失效科目映射、未登记GST或晚期故障会使整笔操作回滚，包括编号。

分录：借记AR（含税gross，绑定客户party），贷记Revenue（net）、按税码映射贷记GST Output（tax）。不再次记库存成本或扣库存，成本已经在发运时记入。零总额发票仍消耗可开数量、写GST/应收轨迹并检查开放期间，不写零金额Journal。

`应收 += 发票gross`，`未开票承诺释放 += 发票gross`，`未开票投影 -= 发票gross`。总信用占用保持原值，原有AR/预收投影不覆盖。即使客户后来冻结或降低额度，已经批准并履约的交易仍可入账，不重新扩张信用。开票不能释放出额外额度给另一张新订单；收款核销完成后才会降低AR。

已开票订单（包括服务、部分或零金额发票）不能整单取消；应走后续贷项/退货流程。已过账发票和行、应收、GST明细不可直接编辑，数据库也阻止改写发票注册编号/日期/状态。承诺释放的延迟约束要求与已开票含税额一致，整单未开票取消除外。

应收接口返回客户总投影及本系统开票形成的明细。本批尚无付款分配，因此amount是原始发票应收金额，不输出虚构的“已付/剩余/账龄”结果；历史导入应收可能有投影但没有本系统发票明细。

## GST设置与税务边界

007增加 `core.companies.gst_registered`，已有及新公司默认false，升级不会根据ABN推断登记。首次开具含税订单发票前，应核实真实GST登记，然后使用owner CLI显式配置：

```sh
dotnet run --project src/Htt.Host.Migrations -- tax-registration \
  --company COMPANY_UUID --registered true --basis NON_CASH \
  --issuer VERIFIED_ISSUER --subject VERIFIED_SUBJECT
```

使用HTT_MIGRATION_CONNECTION，仅受控CLI连接owner；需要accounting.tax.configure有效成员。登记true必须有有效公司ABN，basis限CASH/NON_CASH；重复相同设置不重复写审计。基础资料接口返回gst_registered状态。命令记录人工核验结果，不调用ABR确认登记，也不处理税制变更的法定过渡调整。

未登记公司只能开不含GST的普通INVOICE；含税率订单拒绝开票，不能通过客户端将GST改成0。已登记公司使用TAX_INVOICE，保留卖方ABN、买方身份、日期、商品描述/数量/价格和GST。GST-free及out-of-scope的0税额行也保留税码明细。无效/停用AR、收入或有税额的GST Output映射拒绝过账。

本批GST是**销售发票税务明细与总账**，不是BAS。CASH和NON_CASH都形成应收、收入及GST控制科目分录，sales_gst_entries冻结当时basis；CASH必须等后续实际收款分配才能做BAS归属，NON_CASH也需要考虑更早付款。不会把所有发票税额直接冒充本期可申报GST。未来收款模块必须按实际现金分配、预付款和税制过渡建立BAS归属。

依据：ATO关于税务发票信息及现金/非现金GST归属的[说明](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/fast-facts)（核对日期2026-10-24）。本批不含税务集团/分支开票、复杂GST调整或电子发票网络。

## 迁移及验证

新增007迁移、4表：sales.invoices、sales.invoice_lines、accounting.receivable_items、accounting.sales_gst_entries。总计72张业务/基础表，另有迁移历史。001—006保持原始校验和，既有单据/信用/库存不变；新增表强制公司RLS、复合外键及不可变保护。普通API账号无这些表的直接写权限，开票通过固定search_path的受限函数。

覆盖真实PostgreSQL：分批发票、已发未开上限、库存不重复扣减、GST/AR借贷、含税承诺释放/总暴露不变、0税/0金额、尾差、现金制快照、税务登记、关账和映射错误、角色/客户/公司隔离、恶意金额/科目、直接数据库函数权限、冻结发票/承诺约束、同键和异键并发、同客户多订单、信用竞争、服务取消竞争、过账后故障原子回滚及原键重试。升级包含从003、004、005、006迁移至007。


后续008已接通payment_allocations及收款日GST归属，receivables接口现提供paid/outstanding；本篇“本批尚无付款分配”是007交付时的边界，当前行为以stage-b-receipts.md为准。


后续009已接通退货/贷项/退款，未开票退货与开票共用原订单金额预算，receivables现返回credited/refunded/creditBalance；原发票仍不可变。当前边界见stage-b-returns.md。
