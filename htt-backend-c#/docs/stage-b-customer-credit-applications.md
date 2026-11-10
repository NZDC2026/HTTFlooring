# 客户贷项跨发票抵扣与解除

024支持同公司、同客户及原party的实际可用信用余额转移与整笔解除，仅改htt-backend；三个客户端未改，正式库未迁移。澳洲/AUD/公司本地营业日口径沿用现有系统。

## 余额规则

原贷项已自动减少原发票。未收款的贷项不能再抵另一张发票；可转移的是已收款或预收核销后形成、尚未退款/转用的AR贷方余额。每行同时受贷项剩额和原发票真实可退结算额限制，目标须是同客户另一张已过账发票且有未付额。

例：原发票110、实收110、贷项110，可将110抵其他发票；原发票110、实收0、贷项110，可转移额为0。抵扣源发票AR借记、目标发票AR贷记，分别使用原发票AR账户及party，不生成虚假银行收款，不改原付款/预收/退款记录，不再记收入、库存、成本或GST总账。

客户总应收、未开票承诺、可用预收及信用额度在抵扣/解除时均不改变：原贷项已释放信用，转移不得再次释放；解除也不得再次占用。银行退款仍受客户总净信用余额约束，并额外保护已确认订单的信用资金，防止退款造成超额度。

## API

以下路径均以`/api/v1`开头。写入需要员工JWT、公司上下文和`Idempotency-Key`。

`POST /sales-credit-notes/{creditNoteId}/apply`

```json
{
  "reference": "CUSTOMER-OFFSET-1042",
  "reason": "Customer confirmed allocation",
  "lines": [
    {"creditLineId": "<source credit line UUID>", "invoiceLineId": "<target invoice line UUID>", "amount": 55.00}
  ]
}
```

需要`sales.credits.apply`、`sales.credits.read`、`accounting.receivables.read`及客户访问范围。每单1—50个不同源/目标行组合，可部分、多行、多目标；累计检查源和目标容量。金额显式为正含税金额、最多2位小数；参考1—200字、原因1—2000字。同客户抵扣参考trim并忽略大小写后唯一。源贷项和目标发票必须已过账、不晚于当前营业日；当日账期必须开放。

成功201，返回`{application,lines,gstAdjustments}`，正式编号`CCA-`，`application.applicationStatus=APPLIED`。

`POST /customer-credit-applications/{applicationId}/unapply`

```json
{"reference": "CUSTOMER-OFFSET-CORRECTION-1042", "reason": "Correct allocation"}
```

需要`sales.credits.unapply`及上述两项read权限和客户范围。成功201，返回`{unapplication,lines,gstAdjustments}`，编号`CCU-`。整笔恢复原分配，写反向AR及凭证链接；原CCA保留POSTED，不可变，派生状态为UNAPPLIED。每CCA只允许一次解除。小额部分抵扣可建独立CCA；本批不提供同一CCA的部分解除。

目标若已退款或再次转用，解除会使净结算为负则409拒绝；先解除下游转用，实际银行退款须按独立规则处理。解除使用当前开放账期和当日业务日，不重写原账期。

查询：

- `GET /customer-credit-applications/{id}`：原分配、GST明细、当前解除状态。
- `GET /customer-credit-unapplications/{id}`：解除凭证、原分配和本次GST明细。
- `GET /sales-credit-notes/{id}/applications?page=1&pageSize=50`：分页抵扣历史，含解除指针。
- 原贷项行增加`refundedAmount`、`appliedAmount`、`unallocatedAmount`、`availableApplyAmount`，保留旧`unrefundedCredit`字段。
- 原应收查询保留真实paid/credited/refunded，增加creditReceived/creditUsed，outstanding/creditBalance按有效净结算计算。

新增写权限默认仅ADMIN/FINANCE。重复角色初始化不把这两项财务权限赋给OFFICE；原贷项创建权限不隐含抵扣权限。查询需要贷项读取和客户范围。公司RLS及SQL命令再次校验成员、权限、客户；门户身份不能调用员工接口。读取权限或客户分配撤销后，旧幂等键也不能返回原结果。

## GST与现有流程

每边沿用原发票的冻结GST口径和税额，不将来源税额复制给目标。NON_CASH原发票/贷项已确认销项GST，抵扣/解除不重复确认；CASH按转移后各发票行累计净结算额重算，差额记不可变gst_adjustments，归属新业务日。现有销售侧在开票时已记GST总账，CASH变化只调整归属子账，不再次借贷GST总账。

净结算不超过贷后剩余含税额时，累计归属为`round(剩余税额 × 净结算 / 剩余含税额,2)`，分母0时归属0；超额待退款部分按原已贷项税额与含税额比例累计分摊，整体不超过原税额。解除依据当前余额重算，不能简单取反原税额；后续收款/贷项/退款可能改变0.01舍入。

真实收款和预收核销仅能结算抵扣后的未付额；使用现有advance规则和原业务来源。贷项、退款继续考虑有效转入/转出；未参与转移的原退款保持原累计舍入。已抵扣资金不能再次退款；解除不恢复已消费预收，不撤销真实收款/退款。库存退货和服务贷项共用本流程，不新增库存动作。

## 事务和一致性

抵扣与解除按顺序锁相关订单、客户和信用投影，与现有收款/开票/贷项/退款使用同一串行化边界。幂等、正式编号、单据、分配、AR凭证、GST、审计和Outbox同事务；失败全部回滚，可用原键重试。不同键竞争同一资金只能在容量内成功。解除后重放旧抵扣键不会重新激活，需要新键/参考重新抵扣。

三张新表FORCE RLS、复合FK、不可变；唯一参考、唯一解除和延迟来源/金额/账户/凭证约束。对账使用含有效转移的AR余额，保留库存、AP及原投影检查，并新增抵扣/解除合计、贷项容量、资金非负检查。活动抵扣涉及的发票不能归档，解除后仍需满足原合法归档规则；恢复不重复过账。

## 范围

本批不含自由金额/税额贷项、真实收款或预收核销撤销、银行退款撤销、外币/跨客户结算、银行账户选择或完整BAS申报。R018仍为部分实现，阶段B其余事项保留在验收矩阵。


## 验证

新增66项客户专项及1项023旧库升级，旧版本升级共21项通过。最终本机和独立Docker/Linux各1003项通过（11单元、992真实PostgreSQL集成；完整集成集分四个进程），0失败/跳过、进程均退出0；构建0警告/错误，API/Worker/迁移工具双环境Release发布通过。详见[验证记录](verification.md)。


## 025兼容更新

025已补客户收款录入更正及预收核销解除/重核销。贷项可用资金只包含有效收款/核销，原有转用或退款若导致解除后资金为负则先处理下游；客户总信用不被重复释放。见[收款更正](stage-b-settlement-reversals.md)。本文上一批范围说明中的收款/预收核销撤销缺口由025补齐；实际银行退款撤销仍待后续。

## 029金额/税额贷项兼容

客户金额贷项与原数量贷项共享原发票净额/税额容量和AR/信用/GST、可抵/可退余额；AMOUNT行无数量/实物退货，不影响库存和成本。后续数量贷项只冲减剩余货款及税额，避免重复冲减。收款、预收核销、抵扣/解除和退款/退款更正继续按有效净结算处理，参见[独立净额/税额贷项](stage-b-customer-amount-credits.md)。
