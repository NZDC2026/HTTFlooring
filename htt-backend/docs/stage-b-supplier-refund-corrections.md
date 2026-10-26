# 供应商退款撤销与更正

028仅改htt-backend，按澳洲/AUD和公司营业日处理。001—027保持不变，三个客户端未改，正式库未迁移。

## 业务和资金口径

供应商退款是供应商实际退回本公司的银行收款。此功能更正已核实银行记录的账务录入，不发起银行交易或自动退回/追回实际资金。

原退款、付款、分配、贷项、采购退货、费用、库存和总账记录保留。每原退款可追加一次SFR整笔反向单，原退款保持POSTED但refundStatus变为REVERSED；替代退款另建SR并关联原退款与SFR。每SFR至多一个替代退款，替代退款以后可继续追加更正链。

支持先reverse后关联correct，或一步原子correct。每次整笔撤销原记录，替代金额显式正数、最多两位小数，可增可减且须符合当前可退余额。可改同供应商的另一贷项行或预付款，不能跨供应商/公司；替代退款沿用原银行科目，即使当前BANK映射已变。来源AP、预付和Input/Deferred科目沿用各原交易，不改为当前映射。

贷项退款撤销借原AP、贷原银行，恢复同额AP借方余额及可退/可抵资金；预付退款撤销借原预付资产、贷原银行，恢复可用预付。它们均不会虚构一笔新的实际付款，也不会重新冲回费用、库存、成本、GRNI或采购退货。

## API

路径前缀/api/v1，员工JWT和公司上下文。新写命令需Idempotency-Key。成功201。

| 方法与路径 | 功能 | 权限 |
|---|---|---|
| POST /supplier-refunds/{id}/reverse | 整笔撤销并生成SFR | purchase.refunds.reverse |
| POST /supplier-refunds/{id}/correct | 同事务撤销并录入替代退款 | reverse + correct + refunds.post |
| POST /supplier-refund-reversals/{id}/correct | 已有SFR关联替代退款 | correct + refunds.post |
| GET /supplier-refund-reversals/{id} | 查询反向单、关联替代退款及GST差额 | purchase.refunds.read |

reverse/correct权限默认仅ADMIN/FINANCE，旧退款post权限不隐含授权。所有新写操作还需purchase.refunds.read、purchase.bills.read；API在幂等缓存前重验权限和公司/来源关系，SQL再次校验有效成员、权限和供应商归属。现有供应商权限在公司内生效，不新增未实现的员工供应商分配机制。

reverse请求：

```json
{"reference":"SUPPLIER-REFUND-REV-1042","reason":"Correct verified incoming refund entry"}
```

一步correct请求：

```json
{
  "reversalReference":"SUPPLIER-REFUND-REV-1042",
  "reference":"SUPPLIER-REFUND-CORRECT-1042",
  "reason":"Correct verified refund amount",
  "amount":55.00,
  "creditLineId":"<supplier credit line UUID>",
  "advanceId":null
}
```

对SFR的correct省略reversalReference，其他字段相同。creditLineId与advanceId恰选一个；reference为1—200字，reason为1—2000字，trim后处理。公司内SFR参考号忽略大小写唯一，替代退款使用新的退款参考号。日期固定当前开放营业日，不早于原退款/SFR；不改变原日期和原账期。

reverse返回{reversal,gstAdjustments}；correct返回{refund,reversalId}。原退款列表增加refundStatus；详情增加refundStatus、reversalId、originalRefundId。SFR查询含replacementRefundId，保留完整更正链。

## 进项GST

CASH贷项来源按撤销后的当前有效净结算、剩余应付/可抵税和原账单GST事实，累计重算目标应归属税，与当前税余额的差额写入不可变GST调整并在原Input/Deferred过账。税务凭证持有日继续约束归属日期，不把另一来源的税率、可抵扣资格或公司当前GST口径复制过来。

0.01尾差可能已由后续退款、付款、核销或抵扣消耗，撤销税差不能机械取反原退款gstAmount；原退款税为0时，撤销也可能恢复0.01。后续替代退款使用有效金额及当前累计税余额，连续更正不会累计重复消费历史退款或重复抵税。

NON_CASH按原账单和贷项已确认进项税，不因银行退款撤销再次确认。供应商预付款在原模型中未独立确认进项税，预付退款及撤销均不额外产生GST；后续核销到真实账单时再按该账单原口径确认。

## 兼容、事务及并发

有效退款视图统一参与bill_line_balances、supplier_credit_line_balances、supplier_advance_balances、预付核销、原付款撤销与对账。撤销恢复的资金可继续付款/预付核销或贷项抵扣；资金被重新使用或原付款已撤销后，替代退款须重新通过当前余额检查，不能重复退回同一笔资金。

同供应商资金动作共用供应商行锁，AP来源锁沿用现有顺序；因此退款撤销、更正与付款撤销、预付核销、贷项抵扣在同一资金边界串行校验。同键并发只执行一次，异内容冲突；不同键重复撤销或重复替代由唯一原单/反向单关联拒绝。旧退款键重放不会重新激活已撤销记录。

一步correct中的SFR、新退款、银行/AP/预付/GST分录、正式编号、审计、Outbox和幂等结果同事务，失败全部回滚并可原键重试。新表FORCE RLS、公司复合FK、不可变触发器；延迟校验原单/金额/供应商/银行、逐账户party精确分录、GST来源和非负有效余额。原退款已有按来源查询索引，新增反向GST索引。

对账保留库存/在途、AR/AP/预收/预付/GRNI、往来party及全部原GL检查，增加原退款与SFR金额一致性检查。

本批不含自由金额/税额贷项、银行账户选择、银行对账、实际银行资金操作或完整BAS；阶段B其余欠交仍见原验收清单。

## 验证

新增79项退款专项和027旧库升级参数，专项与全部25项旧版本升级共104项通过。本机与Docker/Linux完整回归各1305项通过（11单元、1294集成），0失败/0跳过；Release构建0警告/0错误，三宿主发布通过。详细证据见[验证记录](verification.md)。
