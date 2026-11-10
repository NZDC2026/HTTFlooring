# 阶段C C01：通用银行收支、流水分类记账与成对转账

新增040_general_banking.sql，仅修改htt-backend。001—039及依赖锁文件保持；三个客户端及ledgerone-api不改，不执行正式数据库迁移、真实银行付款或真实企业关账。本批是**已结算普通收支和同公司AUD账户间转账**的受控来源流程，不开放任意手工Journal。

## 业务入口及范围

- 通用收入 RECEIVE：银行借方，收入科目贷方；应税收入另贷销项GST。资本投入/借款等不属于销售的收入使用明确EXCLUDED及N-T，只允许合适的非控制资产/负债/权益科目，不充作销售额。
- 通用支出 PAY：费用或非控制资产等借方，符合条件的进项GST借方，银行贷方。不可抵扣税计入原费用/资产成本，部分抵扣金额由财务明确提供；普通固定资产现金购置可用CAPITAL。
- 两个账户转账 TRANSFER：转出账户贷方、转入账户借方，两腿同一来源、同一日期、同一币种和事务；不生成收入、费用、GST或往来核销。
- 流水分类：按该行的银行、方向和日期创建上述RECEIVE/PAY来源，再匹配生成的资金分录；记账和匹配同事务。可分类部分剩余金额，可在一个方向拆为多个分类科目/现金流活动。剩余容量及流水版本在银行锁内重查；不能重复分类已经匹配的资金。
- 原单更正：先解除原分录的全部有效匹配，必要时先按原顺序重开银行对账；在原业务日生成关联反向凭证，保留原始事实。原会计期间/BAS已关闭时先依现有系统规则重开，已年结时先反向年结。更正不是在未来日期任意制造负GST，也不是不同经济事项的退款流程。

客户发票/收款、供应商账单/付款、采购入库、预收预付和原单贷项/退款继续使用原模块。通用分类禁止AR/AP、库存、GRNI、BANK/GST控制科目，以及GST清算/递延、客户预收、供应商预付和采购退货清算的受保护映射；不能绕过子账和信用额度处理。两账户转账使用专用入口，不能把BANK当普通分类科目。

本批记账前要求 `noPriorPostingConfirmed=true`：确认本次结算部分没有前置发票认列、GST申报/抵扣或已记账来源。已经过账的账款应直接匹配，不再创建通用收入/费用。系统不能根据银行摘要判断是否已在外部系统记账，也不按“金额相同”擅自合并不同业务；原始依据由财务确认。

## GST/BAS与现金流

公司须先确认GST登记及口径。每行使用实际有效税码和税率：标准10%及零税场景，金额按澳分校验；不从摘要文字猜测“银行费用一定无GST”。未登记GST只接受明确OUT_OF_SCOPE/EXCLUDED零税编码。040新增保守的零税 `INP-BANK`（INPUT_TAXED）及税率，供财务明确选择银行利息等适当场景；既有同码自定义配置不覆盖。

| 场景 | 税务与报表处理 |
| --- | --- |
| 已结算且没有更早发票/归属事项 | CASH与NON_CASH均按该次业务日期记录；来源保存当时公司口径/登记、税码/税率/科目及明确分类快照 |
| NON_CASH已有较早税票 | 拒绝用本现金来源将GST推迟到付款日；持票日须等于本次业务日，否则使用既有供应商账单及付款流程 |
| CASH较早已持有税票、此次才支付 | 允许早于支付日持票，本次实际结算部分按支付日归属；不能有已入账账单/重复税额来源 |
| 进项抵扣 | `recoverableTax`默认为PAY该行tax，可明确0或部分金额；须在0..tax内且为澳分。要求票据参考及已持有日期，日期不晚于业务日；这是本系统统一保守凭证要求，不宣称所有ATO小额交易都必须同样处理 |
| RECEIVE销售分类 | TAXABLE、EXPORT、OTHER_GST_FREE、INPUT_TAXED或EXCLUDED，须与税码及允许科目类型一致；冻结于行，不受后来税码默认分类改动而被覆盖 |
| PAY采购用途 | CAPITAL、NON_CAPITAL、EXCLUDED；非抵扣用途按inputTaxedPercent分G13/G15，无GST价格计G14；贷款本金等EXCLUDED不进入G10/G11，不凭空产生抵扣 |
| 现金流 | 每行现金总额net+tax按cashFlowCategory分配，默认OPERATING，可明确INVESTING/FINANCING；财务需按实际经济活动选择。两个账户均在现金等价物范围内时转账自动INTERNAL净额为0；只有一边纳入时必须明确boundaryActivity，不能虚称内部现金划转 |

新来源扩展既有bas_tax_events、bas_turnover、bas_expected_gl及Full BAS来源派发，保留旧Simpler指纹口径。G1/G2/G3/G4、G10/G11、1A/1B及工作底稿使用来源事件；税额GL独立重建。普通PAY采购参考额另外由对应BANK凭证现金流出重建，再与采购来源总额核对，不拿同一来源合计冒充独立核对。EXCLUDED付款单列排除总额，不能因无GST就混入采购标签。

进项已支付金额在本批立即入账，没有再走供应商AP或现金制延期抵扣投影；不重复计入现有发票/账单、AR/AP账龄或客户信用。cash_flow_lines识别新反向来源，冲销继承原凭证的活动分类。月结底稿和年结经营损益通过既有总账自然包含这些新交易，转账不会增加利润。

税务口径参考：[ATO：非现金制GST归属及税票](https://www.ato.gov.au/api/public/content/0-1e92db95-a75c-4f4e-a3d4-39f43b1a3b25)、[ATO：BAS的现金/非现金口径](https://www.ato.gov.au/api/public/content/0-98e0ef06-57b7-4811-a119-5236f1676a3c)。软件限定为上述已结算、无更早认列事项的切片；特殊税务处理不靠手改汇总标签替代合法来源。

## API与契约

以下路径加 `/api/v1`。所有金额返回十进制字符串，公共字段camelCase。查询按当前授权公司，不能请求其他公司来源；列表默认25、最大100，按业务日及ID稳定排序。写入使用Idempotency-Key；反向用原来源 `transaction.version`（正常POST后为2）的If-Match，分类用当前流水单版本的If-Match。

| 方法 | 路径 | 行为 |
| --- | --- | --- |
| GET | /bank-transactions?bankAccountId=&page=&pageSize= | 来源目录，含反向状态 |
| GET | /bank-transactions/{id} | 原单、分类行、原始快照、反向记录及当前有效匹配ID |
| POST | /bank-transactions | RECEIVE或PAY，成功201 |
| POST | /bank-transfers | 成对转账，成功201；两边之后分别用原银行匹配API核对 |
| POST | /bank-statement-lines/{id}/classify | 原子记账并匹配，成功201 |
| POST | /bank-transactions/{id}/reverse | 原日期一次受控更正，成功200；同键重试返回原结果 |

通用付款示例（UUID使用公司实际银行/科目/税码ID）：

```json
{
  "kind":"PAY",
  "bankAccountId":"00000000-0000-0000-0000-000000000001",
  "occurredOn":"2026-10-29",
  "reference":"BANK-FEE-20261029-1",
  "reason":"依据原始收费凭据确认未入账",
  "noPriorPostingConfirmed":true,
  "taxInvoiceReference":"FEE-INVOICE-1",
  "taxInvoiceHeldOn":"2026-10-29",
  "lines":[{
    "accountId":"00000000-0000-0000-0000-000000000002",
    "description":"实际应税服务费",
    "net":100,"tax":10,"recoverableTax":10,
    "taxCodeId":"00000000-0000-0000-0000-000000000003",
    "basClass":"NON_CAPITAL",
    "inputTaxedPercent":0,
    "cashFlowCategory":"OPERATING"
  }]
}
```

分类请求为同样的reference/reason/noPriorPostingConfirmed/lines及可选税票依据，不接受客户端覆盖银行、方向或日期；If-Match属于流水单。行合计可小于当前未匹配余额，最多50行，所有net须正、tax非负；不同收入/支出不能在同一来源中正负抵销。分类成功后从原流水查询读取新版本；已匹配部分继续保留，余额不足整笔回滚。

转账请求：`fromBankAccountId,toBankAccountId,transferredOn,amount,reference,reason,boundaryActivity?`。两个不同有效同公司AUD账户，amount为正；纯现金内部划转不允许多填boundaryActivity，跨现金等价物范围时必须为OPERATING/INVESTING/FINANCING。两边若均不纳入现金等价物范围，不产生现金流量表现金行，仍保留真实双银行GL。

反向请求：`reference,reason`。不接受任意反向日期，不删除原匹配历史、不删除或改写原单。释放匹配后可更正，再用流水新版本创建正确分类；旧来源、反向及新来源均可追溯。

## 权限、约束与并发

新增 `accounting.bank_transactions.read/post/transfer/classify/reverse`，仅ADMIN/FINANCE默认授予。读取还需banks.read、ledger.read、accounting.gst.read、purchase.input_gst.read；写操作还需banks.use、reports.read、cash_flow.classify及对应动作权限。分类额外需要通用post与bank_statements.read/match。银行匹配/对账权限沿用原模块；不因有OFFICE银行选项权限就允许访问此财务来源。

HTTP返回幂等缓存前重新授权；受控数据库函数独立核查当前权限。跨公司来源404，跨公司/停用/错误科目或税码拒绝。迁移新增3张强制公司RLS表：bank_transactions、bank_transaction_lines、bank_transaction_reversals；累计180张业务/基础表、40个迁移，应用/Worker/门户不能直接写财务事实。

先取得既有GST/BAS共享公司锁，再按银行ID排序取得既有银行对账事务锁，之后核查账户/现金范围和流水版本。与月结/BAS定版独占锁、对账截止保护共用原锁序；转账不按转出/转入顺序加锁。记账、现金流分类、自动匹配、审计、Outbox和幂等结果同事务，末期审计失败也整笔回滚。

来源及分类/反向记录append-only，已POSTED来源单不可随意编辑。延迟证明校验来源类型、日期、唯一批次和逐科目借贷，与来源计划严格一致；反向只允许一次并保持原金额/科目。原普通过账函数仍要求开放会计期间，银行和BAS冻结保护未放宽；不能把posting_kind写成BANK_TRANSFER就绕过真实来源证明。统一reconciliation_checks新增GENERAL_BANK_SOURCE检查，供现有核对/关账使用。

## 验证及保留范围

专项覆盖两种GST口径、应税/零税/进项不可抵扣/部分抵扣/INPUT_TAXED利息收入、Full BAS accounts/worksheet与独立现金GL采购参考、现金流多活动/边界转账、两边银行匹配/零差额对账、原日冲销与年结后重开、角色/撤权/越权、同键重放与并发、异键容量/版本争抢、双向转账锁序、晚期审计失败回滚及银行对账/BAS定版/月结两种先后顺序。实际运行数量以[验收记录](verification.md)C01批次为准。

C02自动条件/动作规则、银行Hub和自动Bank Feeds未交付；本批为人工明确分类，不读取网银、发起付款或自动发件。更早发票/跨期认列、供应商后补税票、关联原单经济退款、进口/反向征税/特殊金融税务等继续走合适原单或后续专项，不能伪装为普通现金来源；正式发票及贷项仍用既有销售/采购流程。多币种、跨公司划款及手续费净额混合方向不含。余额是账务记录，不替代银行授信或资金可用性验证，不作“禁止透支”的外部付款系统。

上线顺序沿用独立040迁移任务→API/Worker，先核实公司GST配置、实际税码及现金等价物范围。API readiness检查新函数；Worker识别四类新审计事件。本轮只在隔离账套验证；真实历史数据、规模性能、备份恢复、正式财务复核及三个客户端页面/设备联调仍需独立验收，C01完成不表示整个阶段C完成。
