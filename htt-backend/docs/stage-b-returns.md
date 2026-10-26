# 阶段B：销售退货、贷项、客户退款与冲销

只修改htt-backend。所有操作新建不可变来源交易及对冲分录，不删除原发运、发票、收款或Journal。支持分批退货、分批贷项、部分退款及预收款退款。金额/成本/税额均来自冻结来源，客户端不传回库成本、自由贷项金额、科目或GST。

## API与权限

所有路径前缀 `/api/v1`，要求JWT、X-Company-Id。POST必需Idempotency-Key；这些是新增的不可变交易，不需If-Match，数量/余额由同一订单和客户锁校验。已存在的开票命令仍使用订单当前版本，退货/贷项会增加订单版本。

| 方法与路径 | 作用 | 权限 |
|---|---|---|
| GET `/warehouse/orders/{id}/returnable` | 出库movement ID、原数量、已退数量及匹配发票行（不含金额） | inventory.returns.read，来源仓库范围 |
| POST `/sales-orders/{id}/returns` | 仓库接收并检验退货、原成本入库、未开票数量取消 | inventory.returns.write，来源/目的仓库范围 |
| GET `/warehouse/returns/{id}` | 退货来源、去向、数量、原因，不返回成本/售价 | inventory.returns.read，两仓库范围 |
| GET `/sales-invoices/{id}/creditable` | 可贷数量及未开贷项退货行 | sales.credits.read，客户范围 |
| POST `/sales-invoices/{id}/credit-notes` | 来源发票的贷项/Adjustment Note | sales.credits.write，客户范围 |
| GET `/sales-credit-notes/{id}` | 冻结来源身份、原因、金额、未退款贷项金额 | sales.credits.read，客户范围 |
| GET `/sales-invoices/{id}/credit-notes` | 该发票贷项列表 | 同上 |
| POST `/customers/{id}/refunds` | 记录已核实对外退款及相关冲销 | accounting.refunds.write，客户范围 |
| GET `/customer-refunds/{id}`、`/customers/{id}/refunds` | 退款来源/金额/参考号 | accounting.refunds.read，客户范围 |

ADMIN全权限；WAREHOUSE可在分配仓库接收退货，无财务贷项/退款权限；OFFICE可退货及贷项、读取退款，不能记录付款；FINANCE可贷项及退款，不自动获得仓库操作权；SALES仅可读取授权客户贷项。SQL命令也再次校验有效成员、仓库或客户权限，不能绕过HTTP权限直接写账表。

## 退货

```json
{
  "warehouseId":"uuid",
  "disposition":"RESTOCK",
  "reason":"Customer returned inspected goods",
  "lines":[{"stockMovementId":"uuid","quantity":"1","invoiceLineId":"uuid"}]
}
```

quantity为原销售单位（例如BOX），正数、最多6位小数并满足原步长；每批1—50个不同movement/invoice组合。stockMovementId是实际出库成本流水；原本没发运就不能退库，同一movement累计基础数量不能超过原出库。

必须明确处置：RESTOCK只进入active SELLABLE仓库，表示有权限人员已确认可再销售；QUARANTINE只进入active QUARANTINE仓库，可售量为0。目的仓库可以不同于来源仓库，两者都须授权。隔离货后续质检、报损、转仓待专用流程，不自动当成零价值或可售货。

已开票数量必须提供匹配invoiceLineId。累计退货不能超过该发票数量；财务之后用返回的退货行ID开贷项。未开票数量省略invoiceLineId，会永久取消对应已交付未开票数量并释放信用承诺，不生成虚构发票/收入冲销；存在未核销预收时须先退款处理资金，不能仓库直接吞掉客户款项。已开票数量不能伪装为未开票退货。

回库成本按**原出库流水**累计分摊：`round(原成本 × 累计退基础数量 / 原出基础数量,2) − 之前已退成本`。最后一批吸收尾差，全部退回严格还原原成本，不采用当前移动平均价。回库增加目的仓库on_hand及value，不倒退原预留消耗、不重新预留、也不自动生成补发。目标已有库存却未估值时拒绝混入；空目的仓库可用退货单作为成本池来源。

分录借原Inventory、贷原COGS，保留原出库批次关联。库存回库与成本分录、取消承诺、税务清算、审计/Outbox/幂等结果同事务。原订单行的“已开票＋未开票退货”共用累计订单金额分摊预算，防止交替开票/退货造成金额尾差或重复开票。

## 贷项通知单

```json
{
  "reason":"Supply cancelled after accepted return",
  "lines":[{"invoiceLineId":"uuid","quantity":"1","returnLineId":"uuid"}]
}
```

每批1—50个不同发票行；一张贷项只对应一张发票。STOCK必须有已收到且同发票行的returnLineId，且该退货剩余未贷数量足够。SERVICE/NON_STOCK不入库，省略returnLineId，由财务确认取消供应。本批为按数量取消/退货贷项，不提供任意金额返利、自由折让或重开发票工具。

net/tax按原发票行累计已贷数量分摊，最终严格等于原发票金额。借原Revenue、借原GST Output、贷原AR（客户party），不会再扣库存或恢复未开票承诺。金额为0的贷项仍消耗数量并保留来源，不能用来制造可退现金。科目以原分录为准，原科目停用时失败而非偷偷换科目。

返回的文档包含原发票号、发行方/买方冻结身份、原因、净额/GST差额及数量。原税务发票返回ADJUSTMENT_NOTE标题，否则CREDIT_NOTE；这是后台文档数据，不等同已生成PDF或已发送客户。

## 客户退款

```json
{
  "amount":"24.20",
  "reference":"BANK-REFUND-123",
  "reason":"Verified bank refund",
  "creditLineId":"uuid",
  "advanceId":null,
  "cancelOrder":false
}
```

creditLineId与advanceId必须且只能选一个。金额为正数且最多2位小数。reference公司内不区分大小写唯一，防止不同键/员工重记同一笔对外付款。**此接口记录人工核实的已完成退款，不调用银行或支付网关，也不声称已经转账。**业务日期为公司澳洲时区当前日，不支持本批追溯退款日期。

贷项退款同时受三重上限约束：

1. 来源贷项行尚未退款金额；
2. 该发票行实际已收＋已贷−原金额−已退款形成的超付；
3. 客户汇总AR真实净贷方余额。

未付款发票的贷项只抵减欠款，不能退现金。客户仍有其他应收抵占净贷方余额时，不能仅凭一张贷项再退钱。分录借原贷项AR、贷当前BANK，客户AR增加，贷方余额随实际出款消耗；同一余额不能重复退款。

预收退款限原预收减累计核销和退款后的余额。借原Customer Advances、贷BANK，同步减少可用预收。现金制冲减相应预付GST及清算资产。非现金制如果合同仍存续，不因退一笔资金就假设整笔供应取消；尚未开票的已归属GST保留，后续发票或确认取消供应再清算。

若退预收会使现有订单失去必要信用覆盖，普通退款拒绝。可在尚无发运/发票、且本次能退完该订单所有剩余预收的情况下使用cancelOrder=true：退款、释放预留/承诺、取消待拣批次和订单、清除已取消合同的非现金预付GST一起完成。其他场景需先解决信用覆盖；跨合同调款、多来源一次退款及已履约订单整单取消不在该选项中。

## GST、余额与审计

NON_CASH贷项在当前开放调整期记录负GST；CASH需退款的调整在实际退款日记入，不能回写原收款期。仅抵未付部分、无需退款时，按保留款项与剩余供应税额重算现金归属，处理舍入差异。部分退款按来源比例分摊，最后一笔吸收尾差；累计负GST不能虚构超过此前归属。零税/FRE/N-T不产生负税额。

GST调整单独保存在gst_adjustments，既有gst_attributions不改写。原GST归属查询已合并两类事件，须按带符号gst_amount合计；只看原正向表会漏掉退货/贷项/退款调整。预收核销、后续收款和发票开立都已纳入退款/贷项/未开票退货余额，不会重用已退资金或再收已取消的价款。

receivables查询新增credited、refunded、creditBalance；paid保留实际历史分配额，outstanding为`max(0, 原应收−已收−已贷＋已退)`。客户总AR投影同步更新，预收退款减少available_advances；不会把贷项重新加回未开票承诺。原单、原Journal、原税务归属保持不可变，reversal_links记录原/对冲批次关系，允许部分对冲，不等于抹除原交易。

关账后可以在新的开放期间做当前业务调整，不能改写关闭期间原单；本批没有BAS申报/已报税批次工作流、自动法律/税务审核、通用自由Journal冲销、报损、保修换货、自动补发、银行退款联调或PDF/邮件。

参考ATO：[退货等调整事件](https://www.ato.gov.au/law/view/pdf?DocID=GST%2FGSTR200019%2FNAT%2FATO%2F00001&PiT=20180629000001&filename=law%2Fview%2Fpdf%2Fpbr%2Fgstr2000-019c7.pdf)、[现金制调整归属](https://www.ato.gov.au/law/view/pdf?DocId=GST%2FGSTR200012%2FNAT%2FATO%2F00001&filename=law%2Fview%2Fpdf%2Fpbr%2Fgstr2000-012.pdf)（2026-10-24核对）。完整税务申报仍须后续模块处理。

## 迁移

新增009与7表：inventory.sales_returns、sales_return_lines，sales.credit_notes、credit_note_lines，accounting.customer_refunds、gst_adjustments、reversal_links；总计85张业务/基础表，另有迁移历史。所有新表强制公司RLS、公司复合外键、不可变保护；应用角色无直接写权限。009以新版本函数补齐既有开票、收款、核销、信用一致性及预收保护，001—008原文件不改写。


## 024后续：客户贷项跨发票抵扣

原贷项自动减少原发票，实际已结算且尚未退款/转用的信用余额现可转到同客户另一张发票，并可整笔解除。原收款/预收核销及退款继续共用有效余额，已占用资金不能重复退款；存在活动抵扣的发票不能归档。新增apply/unapply权限默认仅ADMIN/FINANCE，OFFICE原贷项创建权限不隐含新权限。详见[客户贷项抵扣与解除](stage-b-customer-credit-applications.md)。


## 027后续：客户退款撤销与更正

客户退款现可通过独立CFR反向单撤销，并关联替代退款或一步原子更正金额/合法来源；历史不改，原订单取消、信用承诺释放和库存动作保留。有效退款金额参与AR/预收/贷项余额，GST按当前余额重算。见[客户退款更正](stage-b-customer-refund-corrections.md)。

## 029金额/税额贷项兼容

客户金额贷项与原数量贷项共享原发票净额/税额容量和AR/信用/GST、可抵/可退余额；AMOUNT行无数量/实物退货，不影响库存和成本。后续数量贷项只冲减剩余货款及税额，避免重复冲减。收款、预收核销、抵扣/解除和退款/退款更正继续按有效净结算处理，参见[独立净额/税额贷项](stage-b-customer-amount-credits.md)。
