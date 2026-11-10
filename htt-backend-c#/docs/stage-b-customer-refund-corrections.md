# 客户退款撤销与更正

027仅改htt-backend。澳洲/AUD/公司营业日口径，001—026不改，三个客户端未改，正式库未迁移。

## 口径

原退款、收款、核销、贷项、税归属及凭证均保留。撤销新建CFR反向单，替代退款生成新退款并关联原退款/CFR；原退款保持POSTED，派生refundStatus为REVERSED。全部为已核实银行退款的账务录入更正，不发起银行交易或自动追回实际已付出的款项。

通常使用一步correct，同事务撤销原记录并录入正确金额/合法来源；也可先reverse，再对CFR关联替代退款。每次整笔撤销原退款，替代金额可增加或减少，但必须为正数且符合当前可退资金、客户净信用和额度保护；同客户可改贷项行或预收来源，固定原银行科目，不能跨客户/公司。更正差额体现在原银行净分录，保留完整链。

退款曾附带取消订单时，订单取消、已释放承诺和库存预留保留。撤销退款只恢复资金，不重新开单、不自动预留库存，不撤销已完成退货或贷项。对已取消订单再次退款不会重复执行取消，也不能通过CancelOrder绕过其他订单的资金保护。

## API

路径前缀`/api/v1`；员工JWT、公司上下文、Idempotency-Key必需，成功201。所有新写入还需accounting.refunds.read、accounting.receivables.read及客户范围，SQL再次校验有效成员、权限和客户。新增reverse/correct权限默认仅ADMIN/FINANCE。

| 方法与路径 | 用途 | 权限 |
|---|---|---|
| POST `/customer-refunds/{id}/reverse` | 整笔撤销原退款，CFR编号 | accounting.refunds.reverse |
| POST `/customer-refunds/{id}/correct` | 原子撤销并生成替代退款 | reverse + correct + refunds.write |
| POST `/customer-refund-reversals/{id}/correct` | 关联已撤销原退款，生成替代退款 | accounting.refunds.correct + accounting.refunds.write |
| GET `/customer-refund-reversals/{id}` | 原退款、CFR、GST和替代退款关联 | accounting.refunds.read及客户范围 |

撤销请求：

```json
{"reference":"REFUND-REV-1042","reason":"Correct verified bank refund entry"}
```

一步更正：

```json
{
  "reversalReference":"REFUND-REV-1042",
  "reference":"REFUND-CORRECT-1042",
  "reason":"Correct verified refund amount",
  "amount":55.00,
  "creditLineId":"<customer credit line UUID>",
  "advanceId":null,
  "cancelOrder":false
}
```

对已存在CFR的correct使用同一结构，省略reversalReference。creditLineId/advanceId恰选一个；金额显式正数，最多2位小数，不能超过实际可退额。参考号1—200字、原因1—2000字，trim后使用；同公司反向参考忽略大小写唯一，替代退款须用新退款参考。source校验和客户范围在读取幂等缓存前执行，权限/分配撤销后旧键不能绕过授权。

reverse返回`{reversal,gstAdjustments}`；correct返回`{refund,reversalId}`。原退款详情/列表增加refundStatus=ACTIVE/REVERSED，详情增加reversalId/originalRefundId。CFR查询包含replacementRefundId；原退款金额、GST和日期不改。

每原退款仅一个CFR，每CFR仅一个替代退款；替代退款以后可继续追加更正链。旧键重放只返回原交易，不重新激活失效退款。重新录入使用新键和参考。更正日期为当前开放营业日，不早于原交易；原账期不改。

## AR、预收和信用

贷项退款撤销恢复同额AR贷方余额，恢复客户可用信用及该贷项的实际可退/可抵资金；预收退款撤销恢复同额预收负债和availableAdvances。有效退款视图统一参与发票净结算、贷项剩额、预收核销、收款撤销和对账，不重复释放资金。

恢复资金若已核销、转用、退回或被原收款撤销移除，后续替代退款必须重新通过当前余额检查。新退款不能消耗支持已确认订单的信用/预收资金；贷项退款仍受客户总净信用余额限制。对已取消订单恢复的预收可依法重新退款，不能借此恢复订单或重复占库存。

已归档的原发票或订单需先恢复可见性，再撤销其退款；恢复可见性不会重开已取消订单。归档与退款撤销共用来源锁，避免归档同时隐藏刚恢复的信用资金。

## GST与分录

贷项来源：CASH按撤销后的有效净结算累计重算原发票销项GST归属，差额记当日不可变调整；该侧发票GST总账已在开票记入，不因银行退款撤销再次过账GST总账。NON_CASH原贷项税已确认，不重复恢复原发票或税额。

预收来源：CASH按当前有效核销和剩余有效退款累计重算已退税额，差额恢复到原Output/Clearing科目及预收归属。后续退款或核销可能改变0.01尾差，所以CFR税差可以不同于原退款税额，不能盲目取反。NON_CASH若原退款同时取消订单，已发生的订单取消税务效果保留；保留原归属和原GA，不把保留的业务取消误当银行撤销重新计税。

CFR原银行/AR/预收科目冻结，替代退款仍使用原银行，即使映射后来改变。更正只调整资金、AR/预收及必要GST，原收入、成本、库存、退货、贷项、订单状态和承诺均不反向恢复。

## 事务与并发

原来源和新来源订单按顺序锁定，再锁来源发票、客户和信用投影，和收款、预收核销、贷项抵扣及退款共用锁边界。一步更正中的反向、新退款、正式编号、AR/GST/预收、审计/Outbox及幂等结果同事务；失败全部回滚，可原键重试。同键并发一次执行，异内容冲突；不同键重复撤销/替代由唯一源关联保护。

两张新表FORCE RLS、复合FK、不可变、唯一参考/原单撤销/替代关联及延迟金额/来源/逐账户party分录/GST校验。退款源和GST反向查询补索引。对账使用有效退款，保留客户、供应商、库存与GL全部检查，并增加原退款/CFR金额检查。

本批不含供应商退款撤销、自由金额/税额贷项、银行账户选择、银行对账或完整BAS。阶段B其他事项仍按原验收清单保留。

## 验证

新增73项退款专项及026旧库升级参数，专项与全部24项升级共97项通过。本机与Docker/Linux完整回归各1225项通过（11单元、1214集成），0失败/0跳过。Release构建0警告/0错误，三宿主发布通过。详细证据见[验证记录](verification.md)。

## 029金额/税额贷项兼容

客户金额贷项与原数量贷项共享原发票净额/税额容量和AR/信用/GST、可抵/可退余额；AMOUNT行无数量/实物退货，不影响库存和成本。后续数量贷项只冲减剩余货款及税额，避免重复冲减。收款、预收核销、抵扣/解除和退款/退款更正继续按有效净结算处理，参见[独立净额/税额贷项](stage-b-customer-amount-credits.md)。
