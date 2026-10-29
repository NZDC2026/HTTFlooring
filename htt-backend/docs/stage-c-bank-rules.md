# 阶段C C02：银行分类规则与例外清单

本批仅修改htt-backend，新增041_bank_rules.sql。001—040和依赖锁文件不改，三个客户端不改，未执行正式迁移。银行来源、凭证、GST、现金流及匹配继续通过[C01](stage-c-general-banking.md)唯一写入链产生；不增加另一套余额或Journal引擎。

## 规则与操作流程

1. 为一个公司银行账户建立RECEIVE或PAY规则。条件为摘要DESCRIPTION或参考号REFERENCE的CONTAINS/EQUALS/STARTS_WITH字面量匹配，不区分大小写；可叠加含端点的正数gross范围。银行、方向、文字及金额条件同时满足才命中。不支持SQL、正则、通配符或脚本。
2. 数字越小优先级越高（1—10000）。预览列出所有命中规则、版本、优先级及条件；只选唯一最高优先级。最高优先级并列则AMBIGUOUS_RULE，禁止任意挑选。停用规则不参与匹配，低优先级不是绕过高优先级错误动作的后备策略。
3. 预览不记账、不匹配、不消耗流水额度。保存15分钟不可变快照，包含规则集版本、流水版本/余额、命中解释、税务/银行/现金范围及科目映射事实、分类建议和本次税票依据。
4. 执行者确认没有前置发票、税额或已记账来源，填写原因。执行重新授权并在锁内重新求值；预览过期或规则/流水/配置变化即409，须新建预览。READY表示预检通过，仍以C01最终校验及提交时的冻结约束为准，不是余额或期间预留。
5. 成功执行通过C01创建来源、逐科目Journal、GST及现金流分类，并原子匹配原流水；成功后可分别查询来源单与预览的executionId。失败整笔回滚，原幂等键可重试；预览保留，当前阻塞原因从例外查询/新预览读取。无另行持久化的失败请求账务事实。

SUGGEST用于授权财务确认建议；AUTO动作的启用、修改和执行均额外要求auto_execute权限，默认只给ADMIN。AUTO表示可由有权限的调用方受控触发规则动作，**本批没有导入即自动过账、后台定时执行、真实Feeds或银行付款**。每条流水仍需独立预览、独立确认、独立幂等请求；不提供长事务批量过账。

## 分类金额和税务

规则分配1—20行，比例为正、最多4位小数，合计100%；按实际流水gross分摊澳分，最后一行承接舍入余数，不能凭比例凭空增加资金。每行明确非控制科目、税码、BAS用途、现金流活动和进项可抵扣比例（默认0，须明确设置才申请抵扣），以及不可抵扣用途的inputTaxedPercent。

标准应税行从含税金额按有效10%税码分离税额，非应税行tax=0。若小金额/比例分拆不能同时满足C01净额和税额澳分约束，列AMOUNT_ROUNDING，禁止自动补差。规则不改变C01的合法税额校验。

PAY抵扣需要**该笔交易**的税票参考和已持有日期，不能把可复用规则说明当每笔税票。NON_CASH持票日必须为业务日；较早发票走既有Bill及付款链，CASH可接受较早已持票日期。现金制/非现金制、部分不可抵扣、Full BAS和现金流继续使用C01快照/过账流程。本批没有新增税务口径或更早发票的归属算法。

禁止将AR/AP、库存、GST、银行及受保护预收/预付/清算映射当规则普通分类科目。不用规则自动推断成对转账，转账继续通过C01专用入口并按两边实际流水匹配。客户/供应商账款应匹配既有资金凭证，不能再次认列收入、费用或GST。

## API

路径加`/api/v1`，按当前授权公司访问。写请求均需Idempotency-Key；PUT规则必须带当前版本If-Match，启停/优先级通过同一个PUT产生新版本，不能覆盖旧版本。预览/来源的实际金额输出为十进制字符串；规则定义的金额范围及比例按请求JSON数值保留，版本为JSON数值。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | /bank-rules?bankAccountId=&page=&pageSize= | 当前规则，按优先级及ID排序，含停用规则 |
| GET | /bank-rules/{id} | 当前版本及完整定义 |
| GET | /bank-rules/{id}/revisions?page=&pageSize= | 不可变历史版本，版本倒序 |
| POST | /bank-rules | 创建规则，201 |
| PUT | /bank-rules/{id} | 编辑、启停或调整优先级，200 |
| POST | /bank-statement-lines/{id}/rule-preview | 保存预览，201；请求taxInvoiceReference?/taxInvoiceHeldOn? |
| GET | /bank-rule-previews/{id} | 历史快照、过期时间、税票依据及执行ID |
| POST | /bank-rule-previews/{id}/execute | 明确确认并执行，201；请求noPriorPostingConfirmed=true、reason |
| GET | /bank-rule-exceptions?bankAccountId=&from=&to=&status=&includeClosed=&page=&pageSize= | 当前例外/可执行队列，纯查询 |

规则示例（UUID须替换为本公司真实ID）：

```json
{
  "name":"明确的银行服务费",
  "bankAccountId":"00000000-0000-0000-0000-000000000001",
  "kind":"PAY","priority":10,"enabled":false,"executionMode":"SUGGEST",
  "condition":{"field":"DESCRIPTION","operator":"CONTAINS","value":"service fee","minGross":1,"maxGross":500},
  "lines":[{
    "accountId":"00000000-0000-0000-0000-000000000002",
    "taxCodeId":"00000000-0000-0000-0000-000000000003",
    "description":"依据实际收费凭据分类","basClass":"NON_CAPITAL",
    "percent":100,"recoverablePercent":0,"inputTaxedPercent":0,
    "cashFlowCategory":"OPERATING"
  }]
}
```

规则普通列表/历史默认25、最大100；例外默认25、最大25，必须指定银行和最多366天的[from,to)日期范围。按业务日期/流水ID稳定排序，返回hasMore，不执行全量COUNT。索引支持银行日期顺序，单条求值后分页；大数据期间仍需正式容量验收。status不填时排除READY和MATCHED，默认只查OPEN流水单；可明确status=READY查询待确认建议，includeClosed=true纳入历史关闭流水单。列表不保存预览，不影响任何财务金额。

## 例外及恢复

| 状态 | 含义与处理 |
| --- | --- |
| NO_RULE | 没有启用规则满足全部条件；新增/启用或修正规则后重新预览 |
| AMBIGUOUS_RULE | 最高优先级并列；修正优先级或停用冲突规则 |
| PARTIALLY_MATCHED / MATCHED | 已有部分/全部匹配；规则不猜剩余经济事项，部分分类继续用受控C01 |
| SOURCE_ALREADY_POSTED | 原流水已有未冲销C01来源，即使已解除匹配也不再次记账；按原单更正流程处理 |
| EXISTING_CASH_MATCH | 找到同方向、等额、尚可匹配的既有资金分录，先核实并匹配；这只是防重复候选，不宣称同额就是同笔业务 |
| NEEDS_TAX_EVIDENCE / INVALID_TAX_EVIDENCE | 缺少该笔抵扣依据或日期不合条件；补依据新建预览或走原Bill流程 |
| INVALID_ACTION / AMOUNT_ROUNDING | 科目/税码/映射停用、不适用或金额无法合法分拆；财务修正定义/配置，不自动补平 |
| TAX_CONFIGURATION_REQUIRED / BANK_REVIEW_REQUIRED | 公司GST口径或银行/现金等价物范围待确认 |
| ACCOUNTING_PERIOD_CLOSED / BAS_FROZEN / BANK_CUTOFF / STATEMENT_CLOSED | 会计/BAS/银行或流水状态阻止执行；沿既有受控重开/冲销流程处理，不绕过冻结保护 |

规则执行记录不因后来停用、更正或冲销删除。原来源需通过C01解除匹配/重开后原日冲销；不能重复执行同一预览。原始来源、反向和新分类保持追踪，不用修改旧规则历史来重写过去的GST。

## 权限与事务

新增read/manage/preview/execute/auto_execute五项accounting.bank_rules权限；ADMIN默认五项，FINANCE默认前四项，普通销售/办公室/仓库/采购及门户无权访问。规则读还需C01来源读取、银行/总账/GST/进项GST及流水读取权限；写规则与预览分别单独授权，预览权不授予过账权。执行同时要求C01 post/classify、银行匹配及相关现金流/财务权限。HTTP幂等缓存返回前重新授权，数据库函数独立鉴权。

041新增bank_rule_revisions、bank_rule_previews、bank_rule_executions三张强制公司RLS、append-only表；累计183表、41迁移。应用只读这些表，受控函数负责写入；Worker/门户无直接写入和私有初始化权限。执行登记有延迟来源证明，绑定预览、流水和唯一C01来源。

记账锁序为GST/BAS共享公司门→规则集共享门→银行对账锁，再走C01原流程；规则修改取得规则集独占门，因此与已开始的执行串行。没有持有银行锁再反向等待规则锁。关闭/定版竞争继承既有公司门，匹配容量/流水版本继续在原银行锁内复核。规则、预览或执行的审计/Outbox及幂等结果与业务同事务；晚期审计错误全部回滚。无自动重试过账守护进程，调用方按可重试响应使用原键重试。

[验收记录](verification.md)列出本批实际测试数量和范围。规则和预览不是正式财务审批替代；三个客户端、真实Feeds、生产容量/恢复及正式历史数据迁移仍需独立验收。本批不代表整个阶段C完成。
