# 阶段C：银行流水、收付款匹配与对账

本批仅涉及 htt-backend，按澳洲公司时区及 AUD 分处理。034 为新增迁移；001—033 保持不变。上线前需按既有迁移流程备份、预演，本文不代表生产迁移已执行。

## 已实现范围

- CSV 或 JSON 整单原子导入，保存来源内容与 SHA-256；CSV 保留导入原文，JSON 保留规范化流水行，单头元数据另存。期初余额 + 全部带符号流水 = 期末余额；校验日期、金额、列结构、编码、行数与文件大小。
- 同文件重放返回原导入，银行交易 externalId 按公司/银行账户防重；无 externalId 的同日同金额记录保留并提示疑似重复，不擅自合并。
- 银行流水匹配已经过账的 BANK 总账明细，支持部分金额、一条流水匹配多笔账款、一笔账款拆分至多条流水。候选按剩余金额、日期和来源文本排序；不同公司、账户、资金方向、未来账款及超额分配拒绝。
- 匹配、解除匹配、完成对账、重新打开、作废导入都有权限、幂等、版本、审计与事务保护。匹配不生成收付款，也不重复改变 AR/AP、信用额度或 GST。
- 第一期必须明确分配此前已清算的账款，净额等于银行期初余额；其他历史账款列为未达。后续期间必须连续且承接上期余额。
- 全部银行流水匹配后核验：账面余额 − 未达存款 + 未达付款 = 银行期末余额。对账结果、匹配关系和未达明细保存不可变快照。
- 完成对账后，拒绝向已对账截止日及以前插入新的银行总账分录（包括收付款撤销）。需先重开最新一期；较早期间需逐期重开。旧对账快照保留，重开不会删除原会计分录。

## API

以下路径均加 `/api/v1`。查询默认每页25条，最大100；写操作使用 `Idempotency-Key`，除导入外还需当前流水单版本 `If-Match`。

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/bank-accounts/{id}/statements/import` | JSON 导入 |
| POST | `/bank-accounts/{id}/statements/import-csv` | 原始 UTF-8 CSV 导入 |
| GET | `/bank-accounts/{id}/statements` | 流水单目录 |
| GET | `/bank-statements/{id}` | 单据、版本、分页行与匹配历史 |
| GET | `/bank-statements/{id}/source` | 授权读取原文件 |
| GET | `/bank-statement-lines/{id}/candidates` | 可匹配账款，可传 q/page/pageSize |
| POST | `/bank-statement-lines/{id}/matches` | 部分或批量匹配 |
| POST | `/bank-matches/{id}/release` | 整组解除匹配 |
| POST | `/bank-statements/{id}/reconcile` | 核验并完成对账 |
| POST | `/bank-reconciliations/{id}/reopen` | 重开最新有效对账 |
| POST | `/bank-statements/{id}/void` | 作废无有效匹配的未完成导入 |
| GET | `/bank-reconciliations/{id}` | 原对账与匹配/期初/未达快照，支持分页 |
| GET | `/bank-accounts/{id}/cash-clearing` | 已过账资金明细及可用/未达金额 |

JSON 导入：`reference,fromDate,toDate,openingBalance,closingBalance,lines`；行包含 `date,amount,description,reference?,externalId?`。金额正数表示银行入账，负数表示银行出账；日期 ISO。银行余额必须显式提供，不能以缺省零代替。

CSV 请求 `Content-Type: text/csv`，查询参数为 `reference,fromDate,toDate,openingBalance,closingBalance`。固定列 `date,amount,description`，可选 `reference,externalId`；支持 BOM、CRLF、带引号逗号/换行/双引号，日期支持 ISO 和澳洲 dd/MM/yyyy。金额使用小数点，不含货币符号或千位符。单次上限2 MiB、5000行，期间日期差最多366天且不得超过公司当天。不自动猜测各银行导出列；可先转换到本模板。

匹配请求：`{"reference":"MATCH-1","reason":"核对回单","allocations":[{"journalLineId":"uuid","amount":22.00}]}`；金额均为正的分配绝对值。对账请求：`reference,reason,openingAllocations?`，期初分配也用 journalLineId/amount。解除、重开、作废请求包含 reference/reason。reference 在对应动作类型的公司内唯一。

## 权限与并发

新增 `accounting.bank_statements.read/import/match/reconcile/reopen/void`，ADMIN、FINANCE 默认授予。所有接口还同时要求 `accounting.banks.read` 和 `accounting.ledger.read`；写操作需对应动作权限，缓存重放仍重新授权。OFFICE 的银行选项权限不足以访问流水或原文件。停用银行可以处理历史对账，现金账户不导入银行流水。

12张新表强制公司 RLS、公司复合外键；财务事实 append-only，应用角色没有直接 DML 权限。每个银行账户使用事务锁；现金过账也取得相同锁，并在等待后重查对账截止日。总账分录涉及多个银行时按账户排序加锁。乐观版本防止同单覆盖，延迟约束检查金额容量、外部ID、对账链与快照。

## 本批边界

未接真实银行 feed、网银凭证或支付发起。未实现自动创建手续费/利息、混合收支净额匹配、跨币种及汇兑、自动核销发票/账单、银行专用格式适配或客户端页面。手续费等需先通过受控业务流程正确入账，再按实际同方向资金分录匹配；不能靠对账把差额直接抹平。原始文件含敏感银行信息，访问复用财务权限；生产备份加密、留存期限及容量压测仍需部署验收。

本批完成不等于整个阶段C完成；其他财务报表、税务申报及后续范围继续按原规划。
