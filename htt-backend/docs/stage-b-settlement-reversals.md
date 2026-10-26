# 客户收款与预收核销：撤销和重新核销

025仅修改htt-backend，澳洲/AUD/公司营业日口径；原001—024不改，三个客户端未改，正式库未迁移。

## 操作口径

原收款、付款分配、预收核销及凭证均保持不可变。撤销生成反向凭证，重新核销生成关联新单；原单保持POSTED，查询派生有效状态。全部为账务录入更正，不发起银行交易；实际已退款的资金仍由退款流程保护。

收款更正按整笔处理。通常使用一步`reallocate`，原收款撤销和新分配同事务完成，银行净额与客户整体信用占用不变。也可先撤销错误录入，再关联重核销；两步间原收款已失效，应收及信用占用按真实撤销结果恢复。更正可能暴露已超限余额，系统如实恢复应收，之后新订单仍受额度检查。

预收核销解除按整笔AA处理，恢复同额应收和可用预收，净信用占用不变；随后使用原apply接口重新核销。仍限原预收来源订单行、冻结税码和GST口径，可重分配到同订单行的其他发票。部分更正可用新的较小核销单组织，不删除原分配行。

## API

路径前缀`/api/v1`；员工JWT、公司上下文、`Idempotency-Key`必需，成功201。所有新写入还需`accounting.receipts.read`、`accounting.receivables.read`及客户范围，SQL命令再次校验有效成员和权限。

| 方法与路径 | 用途 | 新权限 |
|---|---|---|
| POST `/customer-receipts/{id}/reverse` | 撤销整笔错误收款，RCR编号 | accounting.receipts.reverse |
| POST `/receipt-reversals/{id}/reapply` | 对原资金关联重新核销 | accounting.receipts.reapply + accounting.receipts.write |
| POST `/customer-receipts/{id}/reallocate` | 原子撤销并重新核销 | reverse + reapply + receipts.write |
| POST `/advance-applications/{id}/unapply` | 整笔解除预收核销，AAU编号 | accounting.advances.unapply |
| POST `/customer-advances/{id}/apply` | 使用恢复的可用预收重新核销 | 现有accounting.advances.apply |
| GET `/receipt-reversals/{id}` | 反向单、原分配、GST和替代收款关联 | accounting.receipts.read |
| GET `/advance-unapplications/{id}` | 解除凭证、原分配和GST | accounting.receipts.read |

新三项写权限默认仅ADMIN/FINANCE，OFFICE原收款/核销写权限不隐含撤销权；读写权限或客户分配撤销后，原幂等键也不能绕过授权。

撤销和解除请求：

```json
{"reference":"CORRECTION-1042","reason":"Correct verified allocation error"}
```

重新核销请求：

```json
{
  "reference":"REPLACEMENT-1042",
  "reason":"Correct verified allocation error",
  "allocations":[{"invoiceLineId":"<invoice line UUID>","amount":110.00}],
  "advances":[]
}
```

一步`reallocate`使用同一结构，另加`reversalReference`作为RCR参考号。重新核销沿用原客户、含税总额、支付方式和银行科目，仅允许更改合法的发票/订单预收分配；新分配加预收之和必须等于原金额。不能跨客户、跨公司，银行映射后来改变也保留原银行账户。新收款参考号需唯一，原参考号保留。

参考号1—200字、原因1—2000字；每类最多50个不同目标行，显式正金额，最多2位小数。重新核销复用原收款的容量、订单预收和税务校验。反向/重新核销使用当前开放营业日期，来源日期不能晚于更正；原账期无需重开。原子的任一步失败均完整回滚。

返回：reverse为`{reversal,allocations,gstAdjustments}`，unapply为`{unapplication,allocations,gstAdjustments}`，重核销为`{receipt,reversalId}`。原收款详情/列表增加`settlementStatus=ACTIVE/REVERSED`；详情增加reversalId/originalReceiptId。原AA详情增加applicationStatus和unapplicationId；客户预收列表available按有效核销计算，保留原金额和历史来源。

每原收款仅一个RCR，每RCR仅一个关联替代收款，每AA仅一个AAU。替代收款以后仍需更正，可按新收款继续追加更正链；原键重放只返回原交易结果，不重新激活失效分配。重新核销及预收重apply需新键、新参考号。

## 资金与下游保护

发票净结算=有效收款/预收核销－实际退款＋有效客户贷项转入－有效转出；贷项可用资金、收款容量、退款、归档与对账均使用该口径。

原资金若已被贷项转用或退款，撤销/解除后会使发票净结算为负则409，先处理下游转用；退款本身不被撤销。其他有效资金可替代同发票资金，但各行结算必须非负。收款含预收时，先解除仍有效的AA；预收已实际退款的收款不能通过RCR再释放一次资金。已撤销收款的预收不可再次apply或退款。

## GST与总账

发票现金制归属按当前有效净结算累计重算，差额记当日不可变GST调整，消化0.01尾差；NON_CASH不重复确认原发票/贷项税。历史分配仍保留，CASH税余额以原税记录加更正累计，NON_CASH容量使用有效分配，避免多次撤销/重核销重复累计历史税。

AAU按原AR与预收负债反向过账；CASH恢复原AA消耗的预收税份额，并将原发票归属按当前余额重算，原核销中的税务舍入凭证效果一起处理。重新apply考虑有效已核销/已退款税额，累计消耗不超原预收税。解除后再次apply的调整使用当前期间，保留原实际收款来源。

RCR使用原银行/AR/预收负债账户。预收GST只冲回尚未清算/调整的部分；NON_CASH已随开票清算的税保留，不能简单整笔取反原收款GST。CASH发票收款撤销只改变销项归属子账，发票已记销项GST总账不重复冲回。原收入、库存、成本及正式发票均不改。

## 并发与事务

按相关订单排序锁定，再锁客户和信用投影，与原开票、收款、贷项抵扣、退款共用锁边界。一步更正预先锁原和新目标全部订单，避免持客户锁再反向等待目标订单。幂等、编号、反向单、替代收款、AR/预收/GST、审计和Outbox同事务；重复键一次执行、异内容冲突、晚期失败可原键重试。

三张新表FORCE RLS、复合FK、唯一原单撤销/重新核销、不可变及延迟凭证/来源/余额/GST校验。对账保留原库存/AP/总账检查并接入有效AR/预收，新增更正金额和负资金检查。

本批不含实际银行退款撤销、供应商付款/预付核销撤销、自由税额调整、银行对账或完整BAS。阶段B其余事项仍按原验收清单保留。


## 验证

新增69项专项、024旧库升级参数；最终专项及全部旧版本升级91项通过。本机与独立Docker/Linux最终各1073项全部通过（11单元、1062真实PostgreSQL集成；集成集分四个进程），0失败/跳过、进程均退出0。最终Release构建0警告/错误，API/Worker/迁移工具双环境发布通过。详见[验证记录](verification.md)。


## 027退款兼容更新

027补齐客户退款录入撤销与更正。退款撤销后恢复的有效资金可用于原收款撤销、预收核销或贷项转用，竞争同一资金仍受余额锁保护；保留原业务取消和库存动作。本文上一批客户银行退款录入撤销缺口由027补齐，供应商退款撤销及银行对账仍待后续。见[退款更正](stage-b-customer-refund-corrections.md)。
