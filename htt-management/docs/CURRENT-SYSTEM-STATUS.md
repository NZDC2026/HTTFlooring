# 当前系统能力与开发入口

更新：2026-10-23，S02–S04 本地扩展。管理财务端采用 Electron 可信主进程和本地 Repository/Service/Mock/持久化架构，结构版本 **33**；没有独立后台。

本文与[当前工作包进度](WORKFLOW-ACCEPTANCE-20261021.md)是当前范围入口。[文档索引](DOCUMENTATION-INDEX.md)标明阶段记录及替代说明；历史文件中的“尚未实现”、版本号和测试数只代表当时交付，不能据此重复开发。54 条原需求分类保留在原审查快照，currentStatus/followUp 记录后续收口，不能把测试通过率当作需求完成率。

## 有效业务入口

| 业务 | 当前入口 | 实际行为与边界 | 详细记录 |
|---|---|---|---|
| 导航 | `/workspace`、`/search`、`/search/records` | 目录按当前角色过滤，记录搜索按业务权限投影。目录中所列业务页均使用本地实现。 | [记录搜索](RECORD-SEARCH.md) |
| 销售与采购 | `/sales`、`/purchases` | 报价、订单、发票、收货、账单及退款/核销沿用源业务状态和权限。直接单据有独立草稿/批准/入账。 | [直接单据](DIRECT-DOCUMENTS.md)、[财务闭环](FINANCE-CLOSURE.md) |
| 日内促销 | `/inventory/promotions` | 明确取价时刻/时区，保留历史快照，不在后台重算旧单。 | [G02](G02-PRICING-INSTANT.md) |
| 实物退货与预收预付 | `/sales/customer-returns`、`/purchases/supplier-returns`、`/sales/customer-deposits`、`/purchases/prepayments` | 原件来源、数量/金额、库存、贷项/核销及冲销由各自流程控制。 | [客户退货/订金](CUSTOMER-RETURNS-AND-DEPOSITS.md)、[供应商退货](SUPPLIER-RETURNS.md)、[预付](SUPPLIER-PREPAYMENTS.md) |
| 银行与期间 | `/banking`、`/banking/import`、`/banking/workbench`、`/accounting/periods` | 本地流水导入、匹配、分类、对账、关账和反关账；不连接真实银行 feed。 | [G01](G01-DASHBOARD-BANK-EVIDENCE.md)、[关账证据](BANK-CLOSE-EVIDENCE.md) |
| 银行规则与指令 | `/banking/rules`、`/banking/instruction-files` | 规则分类保持待审核；CommBank/CommBiz ABA 有独立审批及版本，下载文件不执行银行付款。 | [G06](G06-BANK-RULES.md)、[G07](G07-BANK-INSTRUCTIONS.md) |
| 工资与项目 | `/payroll`、`/payroll/timesheets`、`/payroll/filing`、`/accounting/jobs` | 澳大利亚本地工资、工时、项目成本及申报复核记录；不是所有工资情形的法定引擎，不传送 STP/SuperStream。 | [AU 工资](AU-PAYROLL.md)、[G08](G08-PAYROLL-PROJECTS.md) |
| 文件附件 | `/documents`、`/documents/attachments`、`/documents/upload` | 实际原件字节、版本、业务链接、权限和恢复纳入业务备份，已不是文件名示例。 | [附件](BUSINESS-ATTACHMENTS.md) |
| 单据输出 | `/documents/delivery` | 销售四类、采购单和付款通知的本地不可变版本、HTML/PDF 和品牌快照；不会自动邮件送达。 | [销售输出](DOCUMENT-OUTPUT.md)、[采购输出](PURCHASE-OUTPUT-AND-RECOVERY-GUIDANCE.md)、[G09](G09-BRANDING.md) |
| 票据识别 | `/documents/capture` | macOS 英文 PDF/PNG/JPEG 本地 OCR、原件/置信文本保留、字段建议与金额复核，再转费用草稿；Windows 保留手工/CSV。人工分配供应商、行项目、科目和税码，不自动入账。 | [G13](G13-LOCAL-DOCUMENT-RECOGNITION.md) |
| 周期与任务 | `/automation/recurring`、`/tasks` | 本地到期扫描、错误队列及显式重试；生成草稿，不绕过批准。 | [G05](G05-RECURRING-AUTOMATION.md)、[任务](ACTION-CENTRE.md) |
| 报表与设置 | `/reports/library`、`/reports/saved`、`/reports/packs`、`/settings/purchases`、`/settings/reports` | 实际报表口径和冻结输出、独立采购及报表默认设置；不把现金/权责口径改名冒充不同计算。 | [G10](G10-PURCHASE-SETTINGS.md)、[G11](G11-REPORT-SETTINGS.md) |
| 表格与批量 | 各登记簿 | 完整筛选导出、可见列与跨页选择按适用契约；七类配置可审核批量改状态，不提供通用财务批量过账。G14 移除旧预览后，表格清单为 148 处，37 个完整登记簿。 | [G12](G12-TABLE-CAPABILITIES.md)、[当前逐表清单](acceptance-20261023/table-capabilities.csv) |
| 安全与恢复 | `/settings/security`、`/accounting/financial-recovery` | 本地用户/审计/备份及有证据、审批、回滚和幂等保护的定向修复；冲突或缺原始证据仍阻止。 | [G03](G03-SOURCE-REPAIR.md)、[回收站 G04](G04-RECYCLE-PURGE.md) |

目录与实际设置路由使用同一权限元数据；采购设置读取为 purchases.read。目录不是覆盖全部源记录状态的验收清单。核心主导航、详情路由、独立权限仍由 router 和主进程检查。

## 当前未关闭范围

G15 本地验收基线完成后，本地待关闭工作包为 **G16 正式签名/公证、远程 CI 与跨平台发布验收（本地发布准备和可执行验证已实现）**。外部边界仍为 E01 邮件/送达等通信、E02 银行 feed、E03 电子税务/工资申报；本地输出或登记外部参考不等于完成外部连接。

独立销售 App、客户门户、跨端/多用户同步，及 Time Billing、Activity Billing、Fixed Assets 不在当前管理端 V1 验收范围。年度结转等扩展按原验收另列，不混入已关闭工作包。

## 开发时的范围判断

先读本文和 currentStatus/followUp，再核对业务实现与最近专项记录。G01–G14 的关闭不表示所有角色、数据状态、平台或外部服务已验收。旧静态页文件、旧测试数和旧表格数量只作为阶段证据。

`src/features/page-previews/catalog.ts` 现在仅提供当前路由元数据；previewRoutes 显式分派真实页面，未知映射保持不可用而非退回可操作样例。legacyCatalog/previewModel 只保留旧原型回归夹具，不进入应用依赖图。共享 CSV 独立在 src/lib/csv.ts。运行 `node scripts/current-guidance.mjs --check` 校验文档分类、链接与历史模块隔离；运行逐表清单检查校验有效表面。

演示向导 `/demo` 读取当前档案，并非沙盒；链接页可能保存业务记录。重启向导只重置其检查清单，不撤销交易或恢复种子记录。全局环境标记说明本地业务数据和外部服务未连接，不再把所有页面称作 Mock Data。

G15 的[本地验收基线](G15-DESKTOP-ACCEPTANCE.md)分别记录七角色路由、业务状态回归和真实原生用例；不将自动渲染当作所有组合的人工点验，也不替代 G16 正式发布。

G16 的[发布准备记录](G16-RELEASE-READINESS.md)列出固定环境、仓库根目录 CI、正式签名门禁、诊断和本机演练。正式发布条件仍未满足，不将未签名安装包或同结构回退称作正式发布验收。

G16 补充验证：Windows x64 内部 NSIS 交叉构建和三种目标包结构检查通过；x64 桌面在 Rosetta 下登录/读取/OCR 已实测，Windows 误带 Mac OCR 及翻译模式 OCR 调用已修复。正式签名、公证、远程 CI、Windows 原生安装和 Intel Mac 实机仍待验收。

[G17 库存财务总控](G17-INVENTORY-FINANCE-CONTROL.md)已完成：同日库存到 GL、差额/完整性失败计入总状态、日期审查链接和不可用提示均接通，主进程关账拦截仍独立执行。

[E01 可配置外部服务](E01-EXTERNAL-SERVICES.md)已提供 Resend/Stripe 配置、发送及回执、运行时催款、支付核实与确认入账。未开通账号，真实邮件/支付验收仍未完成；只在程序运行且所属用户登录时处理，业务备份不包含独立通信日志/凭据。

E01 验证：生产构建通过，162 个测试文件、3576 项测试通过；39 项直接覆盖 E01。桌面合成档案与实际 PDF 生成已验证，不能替代真实提供方验收。

[E02 银行 feed](E02-BANK-FEEDS.md)已提供 Basiq AU 配置/授权、映射、分页增量/去重、待审导入与恢复保护。沿用现有本地工作台，不自动入账或完成对账；未开通真实账号，提供方/银行验收仍待完成。

E02 本地验证：生产构建通过，165 个测试文件、3633 项测试通过；原生合成待审批次已通过审查导入，未自动生成分录。真实银行与服务提供方验收继续待完成。

[E03 工资申报](E03-PAYROLL-FILINGS.md)已实现内部 YTD 准备、补充身份/分类、不可变报表/声明、连接器边界、未知结果查回、匹配回执及本地恢复保护。**没有生产 STP/SuperStream 适配器，不能启用正式发送。** 服务商合同、完整字段映射、产品注册/认证与真实验收继续待完成，E03 保持部分完成。

E03 本地验证：生产构建通过，168 个测试文件、3703 项通过（62 项直接覆盖 E03），原生合成工作台验收通过。没有实际申报或划款，也没有生产服务商适配器；E03 外部边界继续待完成。

[S01 年结](S01-YEAR-END.md)已接通整年预检、自动验证备份、损益转留存收益、年结锁、同日受控撤销和重结。总账/试算表保留结转，损益表排除结转及撤销；历史经营损益与总权益保持正确。旧档案迁移至结构 32，不补造年结。

S01 验证：生产构建通过，170 个测试文件、3742 项通过（28 项年结及 3 项生产模式仓库归属测试）；原生年结、撤销、期间锁和审计员只读验收通过。

[S02–S04](S02-S04-LOCAL-WORKFLOWS.md)新增复杂工资配置与离职结算、FIFO 前瞻切换/成本层和客户 Notes 持久化。Award/法定权益全面自动判断及独立销售系统远程同步不包含在本次本地实现；结构 33 迁移保留旧历史。
