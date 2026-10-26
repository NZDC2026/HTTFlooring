# 阶段B：供应商贷项跨账单抵扣与解除

023支持同公司、同供应商及原party的可用贷项跨账单抵扣，以及整笔解除抵扣。实物收货来源与独立费用来源共用该流程。仅改htt-backend，三个客户端未改；正式数据库未迁移。

## 可用金额与创建

现有贷项已自动冲减原账单。原账单未付部分不能再拿到另一张账单重复抵扣；可转移的是已付/已核销后形成、尚未退款或转用的AP借方余额。金额同时受该贷项行剩余额及原账单行真实可退余额限制。一张贷项的多行可分配到多张其他账单，目标必须有足够未付AP；不能跨供应商/party、跨公司或抵扣回原账单。

`POST /api/v1/supplier-credits/{creditNoteId}/apply`

```json
{
  "reference": "VENDOR-OFFSET-1042",
  "reason": "Verified supplier agreement to offset other bills",
  "lines": [
    {"creditLineId": "<source credit line UUID>", "billLineId": "<target bill line UUID>", "amount": 55.00}
  ]
}
```

员工JWT、公司上下文、`Idempotency-Key`及 `purchase.credits.apply` / `purchase.credits.read` / `purchase.bills.read` 必需。新增apply/unapply权限默认仅ADMIN/FINANCE；已有贷项创建或退款权限不隐含抵扣和解除权。

每单1—50个不同贷项行/目标账单行组合；amount为显式正数含税金额，最多2位小数。可部分抵扣，一行贷项可分多目标；系统对重复出现的源/目标累计检查，不能借不同组合超额。参考号1—200字，原因1—2000字；同供应商抵扣参考号trim并忽略大小写后唯一。业务日为公司当天，必须有开放期间且不得早于原贷项/目标账单。

成功201 `{application,lines,gstAdjustments}`，正式编号SCA。`application.applicationStatus=APPLIED`。新单据借原目标AP、贷原来源AP，双方带原party，不写银行、费用、库存、GRNI或虚构付款。两边原AP科目分别冻结，即使后来映射不同仍按各自原账户过账。

## GST

每边独立沿用原账单冻结的GST口径、可抵扣税及Input/Deferred账户，不把来源贷项税额直接复制到目标：

- NON_CASH：原账单和贷项已确认进项GST，抵扣/解除不再重复确认该边GST。
- CASH：来源资金转出相当于已付贷项余额的结算，目标资金转入形成该账单结算；按变化后的净已结算额重算原账单的累计可归属GST，差额记原Input/Deferred及不可变GST调整明细。
- 未形成超额已付时，累计GST为 `round(剩余可抵扣税 × 净已结算额 / 剩余含税额,2)`，剩余含税额为0时为0。仍有待退款超额时，累计GST为剩余可抵扣税加已贷项税额按待退款余额占已贷项含税额的累计比例分摊，并限定在原可抵扣税范围内。
- 来源/目标可以是不同冻结口径或不同可抵扣分类。不可抵扣/免税目标不产生抵扣；可抵扣目标按自身税务事实处理。0.01尾差由累计法消化。

解除按当时余额重新计算GST，不直接取反原税额。后续付款、贷项或退款可能改变舍入归属，简单反向原分录会留下错误税额。所有调整归属新抵扣/解除业务日，保留原付款、核销、税务来源日期和记录。这里实现既有账务框架内的GST子账处理，不包含完整BAS申报。

## 整笔解除

`POST /api/v1/supplier-credit-applications/{applicationId}/unapply`

```json
{"reference": "OFFSET-CORRECTION-1042", "reason": "Verified allocation correction"}
```

需要 `purchase.credits.unapply` 及上述两项read权限和幂等键。成功201 `{unapplication,lines,gstAdjustments}`，正式编号SCU；一次完整撤回原抵扣单全部分配，借原来源AP、贷原目标AP，恢复可用贷项和目标未付额。原SCA保持POSTED、不可变，查询状态派生为UNAPPLIED；SCU通过冲销链接指向原SCA凭证。部分金额可先创建较小SCA；本批不逐行删除或部分解除同一SCA。

若目标结算资金已被退款或再次转用，解除后会使目标净已结算额为负，则409拒绝，不凭空恢复来源资金。下游转用可先解除下游再解除上游；实际已退银行款不能靠解除抵扣撤销。其他真实付款/核销可替代目标可用结算资金，但解除后仍须保证余额非负。解除期间必须开放，不得早于原抵扣日；原账期不被重开或改写。

同一SCA只允许一个SCU。原键重放不重复解除；已解除后重放旧抵扣键也不会重新激活。重新抵扣需新命令、新键和新参考号。抵扣和解除参考号各自独立命名空间。

## 查询与兼容

- `GET /supplier-credit-applications/{id}`：原抵扣、分配、原GST调整及当前解除指针/状态。
- `GET /supplier-credit-unapplications/{id}`：解除凭证、原分配及本次GST调整。
- `GET /supplier-credits/{id}/applications?page=1&pageSize=50`：沿用统一分页边界，返回该贷项的抵扣历史。
- `GET /supplier-credits/{id}`：行新增appliedAmount、unallocatedAmount、availableApplyAmount；refundableAmount与availableApplyAmount为同一受限可用额，不能直接把未分配名义贷项全额当可用资金。
- `GET /supplier-bills/{id}`：行增加creditReceivedAmount、creditUsedAmount，outstandingAmount / netPaidAmount / refundableAmount包含当前有效抵扣。paidAmount仍只表示真实付款/预付核销，未制造银行付款。
- `/accounting/ap`、进项GST及GST归属查询沿用原接口；抵扣/解除在GST明细分别标为CREDIT_APPLICATION/CREDIT_UNAPPLICATION。

现有付款和预付核销只允许结算抵扣后的剩余AP。退款额度扣除当前抵扣占用，同一贷项不能既退又抵；解除返还的余额可再抵扣或实际退款。解除不会恢复已用预付款、删除原付款或反转银行流水。

## 可靠性与边界

新增credit_applications、credit_application_lines、credit_unapplications三表，共126张业务/基础表、23个迁移；001—022原文件不变。公司RLS/复合FK、不可变源/反向事件、唯一参考和唯一解除、延迟来源/金额/AP/GST凭证校验保护。账单余额视图保留旧列顺序，追加抵扣明细；贷项和退款共用可用余额算法。审计/Outbox新增事件已由Worker识别。

抵扣、付款、预付核销、退款及解除共用供应商锁，AP按ID排序锁定；多目标不足时全部回滚。编号、凭证、GST、分配、解除事件、冲销链接、审计和成功幂等响应同事务；校验或晚期失败可原键重试。授权在缓存前重新检查，接口及SQL均验权限，跨公司资料不返回。

财务一致性查询增加抵扣行合计、解除金额、贷项容量及资金非负检查；原AP与GL检查自动包含有效抵扣。测试覆盖两种原贷项来源、四种GST口径组合、退款/付款/核销与抵扣/解除并发、下游依赖、混合税务行、真实不同账户、失败回滚及旧库升级。

本批不含客户贷项跨发票抵扣、真实付款/预付款核销撤销、银行退款撤销、自由税额/价格调整、外币或跨供应商净额结算。其余阶段B事项继续按验收矩阵保留。
