# 阶段B：采购订单、采购收货、成本池与暂估应付

仅修改htt-backend。支持AUD采购草稿、确认冻结、按订单分批验收、关闭剩余未收数量，及库存/费用与GRNI同事务过账。供应商账单、收货匹配、GRNI冲减、AP和进项GST已由011实现，见[供应商账单流程](stage-b-supplier-bills.md)。供应商付款、预付核销及现金制进项GST归属由012实现，见[供应商结算流程](stage-b-supplier-payments.md)。采购退货、供应商贷项及退款由013实现，见[采购冲销流程](stage-b-purchase-returns.md)。价格差异处理、落地成本分摊及跨币种仍待后续模块。

## 接口及权限

路径前缀 `/api/v1`。所有接口要求JWT、X-Company-Id和公司RLS。POST/PUT需Idempotency-Key；草稿更新、确认、关闭及收货需来源采购单当前 `If-Match: "version"`。收货成功会增加采购单版本，下一批须刷新。decimal权威数量/金额字段输出字符串。

| 方法与路径 | 作用 | 权限 |
|---|---|---|
| POST `/purchase-orders` | 草稿，无正式PO号 | purchase.orders.write |
| PUT `/purchase-orders/{id}` | 完整替换当前草稿 | purchase.orders.write |
| POST `/purchase-orders/{id}/confirm` | 重新校验、分配PO号并冻结 | purchase.orders.confirm |
| POST `/purchase-orders/{id}/close` | 关闭未收余量；不撤回已验收 | purchase.orders.close |
| GET `/purchase-orders/{id}`、`/purchase-orders?supplierId=...&status=...&page=1&pageSize=25` | 单据/明细查询 | purchase.orders.read，金额另需purchase.cost.read |
| GET `/warehouse/purchase-orders?warehouseId=...&page=1&pageSize=25` | 有剩余未收数量的工作队列 | purchase.receipts.read，仓库范围 |
| GET `/warehouse/purchase-orders/{id}` | 原单位/换算/步长、数量及供应商，不含成本 | 同上 |
| POST `/purchase-orders/{id}/receipts` | 验收并记库存/费用与GRNI | purchase.receipts.write，仓库范围 |
| GET `/purchase-receipts/{id}` | 验收数量与来源 | purchase.receipts.read，仓库范围；金额另需purchase.cost.read |
| GET `/accounting/grni?supplierId=...&warehouseId=...&page=1&pageSize=25` | 暂估应付总额及来源分录 | purchase.grni.read |
| GET `/accounting/grni/receipts/{id}` | 财务追溯原验收单（公司级） | purchase.grni.read |

ADMIN拥有全部。PROCUREMENT拥有采购草稿/确认/关闭、采购成本读取及验收；已有warehouses.all允许公司仓库。WAREHOUSE仅能读取/验收分配仓库，不获采购价、GRNI或采购维护权限。FINANCE可公司级读取采购成本和GRNI，不获库存验收权限；OFFICE默认只读采购及成本。SALES无采购权限。供应商无单独分配模型，采购文档权限作用于公司内供应商；物理验收另外校验仓库授权。SQL命令会再次核验有效成员及操作权限。

## 采购单

```json
{
  "supplierId":"uuid",
  "warehouseId":"uuid",
  "expectedOn":null,
  "notes":"Delivery instructions",
  "lines":[{
    "productUnitId":"uuid",
    "quantity":"2",
    "unitCost":"10.005",
    "taxCodeId":null,
    "recoverableGst":null
  }]
}
```

每单1—50个不同productUnitId。quantity正数、最多6位小数、满足单位步长，整箱单位遵守商品整包约定；基础数量换算必须可存为6位小数。unitCost是**每采购单位的未税单价**，最多8位小数，必须显式提供，0表示经过确认的免费物料，不能以漏填代替0。单价应已扣除合同折扣，不使用客户端总额。

税码默认商品税码，也可选同公司已定义税码；税率由服务器按当前公司业务日解析。recoverableGst=null时，仅已登记GST公司且taxable税码默认可抵扣；显式true在未登记公司或非taxable税码下拒绝。该设置是采购计价估计及业务人员的税务分类声明，不代表已持有有效供应商税票或已经申报。

草稿可修改；确认时重新校验有效供应商、active SELLABLE/QUARANTINE目的仓库、active buy-enabled商品/单位、当前税率与GST登记状态。确认后的供应商身份/付款条款、SKU/名称、itemType、换算、步长、价格/税额/估值冻结，不能原地改价；需要更改未收部分时关闭余量并另建采购单。本批没有强制双人审批，默认采购角色可确认自己维护的草稿。

草稿/确认响应结构为 `{ "order": {...}, "lines": [...] }`；版本在order.version。确认保留仍存在的草稿行ID，但客户端应以确认后的返回为准。expectedOn可省略，不能早于保存/确认业务日；收货可早到或晚到，不按expectedOn阻止实际验收。

## 分批收货及去重

```json
{
  "reference":"SUPPLIER-DOCKET-123",
  "notes":"Goods counted and accepted",
  "lines":[{"orderLineId":"uuid","quantity":"1"}]
}
```

每次1—50个不重复采购行，使用采购单位数量，不是基础面积。上限为原采购数量减已验收，不能超收，也不把多出来的数量自动改成库存盘盈。收货只接受确认且未关闭的采购单；供应商、仓库、商品/buy_enabled必须有效，itemType不能与冻结内容冲突。单位换算/步长变更不重算已确认合同，按冻结值接收；GST登记状态变化则拒绝，要求重确认新合同计价政策。

reference必填、最长200字，**公司＋供应商下不区分大小写唯一**，防止不同员工、不同键或另一采购单重复录同一送货记录。一张本系统验收单只对应一张PO；同一送货凭证跨多PO的接收须先整理可追溯的独立分项参考，不支持在一次命令中跨PO验收。不能为了重录同一批货随意换参考号。

同员工、同路由、同幂等键/内容重放原成功结果；同键不同内容409。不同键使用旧采购版本、重复参考号、超收、已关闭单409。失败不会留下成功键，排除期间/科目/估值问题后可原键重试。并发两次接收同一PO只有一个当前版本成功；另一次应刷新版本及余量再判断。

业务日期固定为公司澳洲时区当前日并要求开放会计期间。客户端不能覆盖业务日期、仓库、单价、总额或科目；本批不提供追溯库存收货和重算历史移动均价，避免把迟录收货错误地改变已经发生的销售成本。

## 计价与会计

订单行net = `round(quantity × unitCost,2)`，tax按冻结税率估计。分批收货按累计原采购数量分摊原net及tax，最后一批吸收尾差。可抵扣时valuationAmount=net，不可抵扣时valuationAmount=net+tax；不对每批重新定价。

- STOCK：增加目的仓库on_hand及stock_values.value，保留reserved，借Inventory、贷GRNI。
- NON_STOCK/SERVICE：表示有权限人员确认已接受消耗品或服务，借PURCHASE_EXPENSE、贷GRNI，不创建库存。默认费用映射新增5100；运费等服务行不会自动分摊为其他商品落地成本。
- QUARANTINE仓库保留数量/价值但可售量为0；后续转仓/报损需独立流程。

GRNI默认沿用2100，Inventory沿用1200，按有效公司科目映射过账；每条暂估保留供应商party、来源验收行、借方/GRNI科目及Journal ID。不产生AP 2000、进项GST 1300或银行变动，也不产生进项GST/BAS归属。免费货仍记录数量及0额暂估轨迹并校验期间，不写零金额Journal。

收货同事务锁采购单→公司/期间/主数据→按商品排序的库存余额及成本池。数量与价值一起增加，新移动平均成本由剩余价值/基础数量得到；与销售出库、销售退货共用同一余额锁，不能丢失并发成本。原销售预留不变。全新SKU/仓库自动建立0余额/价值来源；已有正库存却无成本拒绝混入，需先通过受控期初估值对账。零库存却有残余价值同样拒绝。

采购收货行保留本次数量、估计税额、实际暂估计价金额以及入库后数量/价值，供后续供应商账单匹配。011起GRNI查询accruedAmount为原暂估减已匹配账单冲减后的余额；行amount仍为原暂估，outstandingAmount为未冲减额。未匹配数量及金额见/accounting/grni/unmatched；AP与进项GST见供应商账单模块。

## 关闭余量

```json
{"reason":"Supplier cannot deliver the remaining quantity"}
```

关闭草稿或从未收货的PO，注册状态为CANCELLED；部分/全部已验收的PO保留已收记录与CONFIRMED注册状态，采购状态为CLOSED，未收部分显示closedQuantity且openQuantity=0。不会回退库存或撤掉已有GRNI。采购退货与财务对冲使用013专用流程，不通过关单抹除历史。

## 数据库与边界

010新增purchase.orders、order_lines、receipts、receipt_lines及accounting.grni_items五表，共90张业务/基础表，另有迁移历史。所有新表强制公司RLS、公司复合外键；收货供应商/仓库必须匹配原PO。确认后订单内容冻结，验收/暂估及已过账注册记录不可变。API无直接写表权限，受限definer命令和延迟一致性检查保证数量、来源、成本和GRNI完整提交；审计、Outbox及幂等同事务。001—009不改写。

本批没有供应商账单/付款/预付、采购退货、收货更正、外币、折让重估、复杂落地成本、电子PO发送或供应商系统联调。采购unitCost不自动从销售价取值；资料来源、GST可抵扣分类和实际验收由有权限人员确认。

成本分类依据：[AASB 102购买成本](https://standards.aasb.gov.au/aasb-102-mar-2020)。GST凭证边界参考[ATO凭证要求](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/what-records-do-i-need-to-keep-for-gst)（2026-10-24核对）。本批没有生成GST申报结果。
