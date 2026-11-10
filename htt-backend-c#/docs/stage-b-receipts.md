# 阶段B：客户收款、预收核销、信用与GST归属

仅修改htt-backend。所有交易为AUD，账簿/分配精确到分。支持部分收款、多张发票行一次收款、同一笔款项一部分付发票/一部分预付、多次预收和分批核销。预收必须绑定已确认订单行，税码/金额来自冻结订单，不默认把未知款项、真正担保押金或银行手续费当成普通预收。

## API

路径前缀 `/api/v1`；所有接口需要JWT和X-Company-Id，按公司及客户授权过滤。POST必需Idempotency-Key，成功时业务、账簿、审计、Outbox和幂等结果一起提交。收款和核销都是新建不可变交易，不需If-Match；数据库锁和可用余额校验控制并发。

| 方法与路径 | 用途 | 权限 |
|---|---|---|
| POST `/customers/{id}/receipts` | 录入实际已收款并分配 | accounting.receipts.write |
| GET `/customer-receipts/{id}` | 收据、分配及新预收明细 | accounting.receipts.read |
| GET `/customers/{id}/receipts?page=1&pageSize=25` | 客户收款记录 | 同上 |
| GET `/customers/{id}/advances?page=1&pageSize=25` | 预收原金额、GST及可用余额 | 同上 |
| POST `/customer-advances/{id}/apply` | 核销到来源订单行的发票行 | accounting.advances.apply |
| GET `/advance-applications/{id}` | 核销明细 | accounting.receipts.read |
| GET `/customers/{id}/receivables` | 原有应收查询，新增每张发票paid/outstanding | accounting.receivables.read |
| GET `/accounting/gst-attributions?from=YYYY-MM-DD&to=YYYY-MM-DD&customerId=...` | GST归属审计，半开区间，最长366天，分页 | accounting.gst.read |

默认ADMIN/FINANCE拥有收款、核销、查询和GST归属读取；OFFICE拥有收款/核销/查询，GST归属独立查询限财务权限。SALES/WAREHOUSE不获财务收款权限。自定义无customers.all角色仍须客户分配，SQL definer命令再次验证成员及权限。

收款请求：amount须严格等于allocations+advances。各列表最多50条，不得重复目标行。invoiceLineId为**发票行**，orderLineId为**订单行**；明细分配让混合税码发票可分别核销，不能仅凭发票总额猜测税码。客户端不能控制银行/应收/预收/GST科目、税额或信用投影。

```json
{
  "amount":"110.00",
  "method":"BANK_TRANSFER",
  "reference":"BANK-TRANSACTION-123",
  "receivedOn":"2026-10-24",
  "allocations":[{"invoiceLineId":"uuid","amount":"55.00"}],
  "advances":[{"orderLineId":"uuid","amount":"55.00"}]
}
```

method限BANK_TRANSFER/CARD/CASH；reference必填、最长200字，使用银行流水ID或受控收款编号，**公司内不区分大小写唯一**，防止不同操作员/幂等键重复录同一笔钱。渠道数据源应在reference加命名空间。所有渠道均为人工核对后录入实际资金，当前统一使用BANK映射；不代表已接入银行或支付网关，CARD手续费/在途结算不在本批。

receivedOn可省略，默认公司澳洲时区当前日；不能未来日期，必须在开放会计期间。现金制可记录真实早于发票的收款日；非现金制直接发票收款若早于发票日期会拒绝，要求先核对是否属于此前已触发整笔GST的预付款，避免隐瞒早期税点。

预收只能针对当前已确认、尚未开票且未被其他预收覆盖的订单金额；超过余额不自动转成不明客户贷项。已全额开票时应直接分配发票。核销同一预收必须进入同一订单行生成的发票，不能自动挪到其他合同/税码/客户。跨订单调款和退款待专用流程；有未核销预收的订单不能整单取消。

```json
{
  "reference":"APPLY-123",
  "allocations":[{"invoiceLineId":"uuid","amount":"55.00"}]
}
```

核销reference同样公司内不区分大小写唯一。相同员工/路由/幂等键/内容重放原成功响应；同键异内容409。另一个键重复银行参考号/核销参考号409；超收/超核销409。锁冲突允许原键重试；事务失败不留下成功键或部分账簿。两个不同真实收款编号可以部分支付同一张发票，但合计不能超过其余额。

## 余额和信用

- 直接收款：借Bank、贷AR（客户party），应收投影减少实收分配金额。
- 预收：借Bank、贷Customer Advances（gross），可用预收增加gross，已有应收不覆盖。
- 核销：借Customer Advances、贷AR，应收与可用预收同额减少。

客户信用仍按 `max(0, AR + 未开票承诺 − 可用预收)`。预收到账已经降低暴露；之后核销只转换余额形态，**不能再次释放同一笔信用**。旧导入AR/预收投影保持不变；没有可追溯预收记录的历史投影不能凭空拿来核销，需要后续受控余额导入/对账流程。

应收明细paid来自不可变payment_allocations，outstanding为原始发票应收减paid，不编辑旧receivable_items。支持冻结客户收款。新订单能用释放后的额度，但客户状态/信用策略仍由原报价转单流程检查，不因收款自动解冻。

事务先按UUID排序锁定涉及的来源订单，再锁客户/信用投影，与开票/取消保持一致；同客户的收款、核销、开票和新订单信用决策串行更新投影。源发票/预收不可变，原金额减累计分配即余额，没有另一个可被单独改坏的paid字段。

## GST及清算

现金制发票收到部分款项时，按发票行冻结税额累计比例分摊：

`本次GST = round(发票行GST × 累计已付 / 发票行gross, 2) − 之前分配GST`

最后一笔吸收尾差，不简单对混合税码总收款统一除以11。GST归属使用真实receivedOn。仅有现金制发票而未收到钱时不产生现金归属。

普通预付款本身属于已识别供应的对价，在**收款日**归属：CASH只按已收比例；NON_CASH首次普通预付会触发仍未开票供应的完整GST，后续预付不重复触发。这里沿用订单行冻结的税额/税码；不是根据收款时商品当前税率重算。

预付GST分录同时借GST Advance Clearing、贷GST Output。此资产为已经记税但尚未开票清算的税额，预收负债仍保留gross。默认新增1400资产映射GST_ADVANCE_CLEARING、2300负债映射CUSTOMER_ADVANCES；原BANK/AR/GST Output映射继续沿用，必须有效。未登记GST的含税供应拒绝普通预收。

- CASH核销时，原预收归属转成对应发票付款的追溯链接，仍是原收款日；ADVANCE_TRANSFER为负向转出，ADVANCE_APPLIED为正向转入，不能只加正数。清算原预付GST对应的资产及重复的控制科目金额，最终不会因开票/核销多记GST。
- NON_CASH在开票生成GST明细时自动清算此前预付已计税部分；发票GST归属只记尚未计入的差额。核销不再计GST。
- CASH部分发票/尾差可能导致核销分摊与原预收分摊相差一分，系统在**原收款日**生成调整和清算，不挪到核销期。若原期间已关闭且需要真实税额调整，整次核销拒绝，要求按正式税务更正流程处理；重开原期间后可原键重试。无税额变化的追溯链接可在原期关闭时正常核销，报税总额保持不变。

每条归属保留receipt、advance、invoiceLine、来源单据、basis、taxCode、原归属日期与金额。GST归属查询是**税额审计明细**，amount表示该事件的现金/转分类金额，NON_CASH不等同整笔BAS销售额；本批没有BAS申报、G1完整计算、已申报批次冻结、担保押金Div99、税制切换、退款/冲销或复杂GST调整。008对可识别的旧NON_CASH发票补入发票税额来源；旧CASH发票不伪造收款。存在预收记录后CLI不能直接改变GST登记/basis，需后续受控过渡。

参考ATO：[现金/非现金预付款与担保押金归属](https://www.ato.gov.au/law/view/document?locid=%22gst%2Fgstr20062%2Fnat%2Fato%22&pit=20200401000001)、[现金制GST](https://smallbusiness.taxsuperandyou.gov.au/goods-and-services-tax/accounting-for-gst-on-a-cash-basis)（2026-10-24核对）。

## 数据库与验证

008新增6表：accounting.customer_receipts、customer_advances、advance_applications、payment_allocations、gst_attributions、advance_gst_clearings。业务/基础表共78张，另有迁移历史；001—007不改写。所有新表强制公司RLS、复合公司外键、不可变保护，API无直接写权限；RC/AA单据过账后注册信息不可修改。延迟约束校验收款分拆、核销合计、客户一致性及未超额分配。

覆盖真实PostgreSQL中的部分收款、部分核销、现金/非现金预付、分摊尾差、原日期归属、关账、税码/科目错误、信用转换不重复释放、同键和跨键/员工重复参考号、竞争最后发票/预收余额、不同发票共享AR投影、取消与预收竞争、角色/公司/客户隔离、直接数据库函数授权、不可变记录和晚期故障整单回滚。升级覆盖003—007到008。


## 后续009进展

客户及预收退款、贷项、退货和GST调整已实现，见[退货退款流程](stage-b-returns.md)。本篇“退款待后续”是008交付时的边界。当前预收/发票可用余额会扣除退款和贷项；GST归属接口同时合并不可变gst_adjustments。旧原收款记录保持不变。


## 025后续：撤销与重新核销

收款和核销历史保持不可变，新增RCR收款录入更正、关联重核销和一步原子更正；AAU整笔解除原预收核销后，原apply接口可用新键/参考重新分配。查询新增有效状态、反向关联及有效预收余额；旧幂等重放不会重新激活旧资金。完整规则、GST和权限见[收款更正](stage-b-settlement-reversals.md)。

## 029金额/税额贷项兼容

客户金额贷项与原数量贷项共享原发票净额/税额容量和AR/信用/GST、可抵/可退余额；AMOUNT行无数量/实物退货，不影响库存和成本。后续数量贷项只冲减剩余货款及税额，避免重复冲减。收款、预收核销、抵扣/解除和退款/退款更正继续按有效净结算处理，参见[独立净额/税额贷项](stage-b-customer-amount-credits.md)。
