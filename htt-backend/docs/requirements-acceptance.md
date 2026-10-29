# 原需求逐行验收矩阵（后台范围）

初验日期：2026-10-24；阶段C逐行刷新：2026-10-29（截至044；W-06及C04增量）。仅核查并修改 htt-backend；现有三个客户端均未联调/修改。来源中的建议和待确认内容视为参考，不自动执行，也不重新承诺人日。

原工作簿：`HTT%E4%B8%89%E7%AB%AF%E7%B3%BB%E7%BB%9F_%E5%88%A0%E5%87%8F%E4%B8%8E%E6%96%B0%E5%A2%9E%E5%8A%9F%E8%83%BD_%E5%B7%A5%E6%97%B6%E9%87%8D%E4%BC%B0_20261017.xlsx`；SHA-256 `c06eb26520401892f61655de601cb9e8e53eeddb439050259f8d6b32bffa28e1`。读取4个sheet，逐项工时重估A2:Q117共116条；保留优先级、增删边界及新功能验收口径。

阶段沿用原《HTT-AU-后台与数据库设计-v2》§13和《HTT-AU-需求追踪矩阵-v2》；并未把C/D未实现功能改列成B缺陷，也未删除B未交付项。原文件只读，未修改。

原v2矩阵SHA-256：`48ab6b6784016ba164e688543f93cf3339bbea0973e43388f48edce77d7e0b91`。

本次当前结论以[阶段C收口核查](stage-c-acceptance.md)及[39条机器可读记录](stage-c-audit.json)为准：刷新原阶段C/B-C/C-D相关39行，另更新跨阶段R052/R054，其余75行保留此前阶段判断，后续增量说明仍需结合相应阶段基线阅读。C/D行不得因D缺项直接判定整个C切片失败，也不能因C子功能完成将整行标全完成。

状态定义：后端已实现=该行约定的服务端能力有实现及对应测试/交付说明，不表示客户端完成；部分实现=仅满足一部分；未实现=表预留或未开发；排除=原需求边界明确排除。没有工时加权“完成率”。证据文件均相对本目录，测试索引见verification.md及stage-b-acceptance.md。

| 源行/编号 | 系统及功能 | 原优先级/范围状态 | 原阶段 | 本次结论 | 证据 | 边界/剩余事项 |
|---|---|---|---|---|---|---|
| 2 / R002 | 管理/财务端：Business/company, users, roles, permissions, audit log, global settings | P0 / 保留 | A | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-a.md](stage-a.md) | OIDC校验、成员解析、RBAC/行范围和审计已实现；真实身份提供商联调、成员/角色分配及完整全局设置管理未交付。 |
| 3 / R003 | 管理/财务端：Double-entry ledger, journal engine, posting rules, periods, balances | P0 / 保留 | A | 部分实现 | [stage-b-reconciliation.md](stage-b-reconciliation.md)；[stage-a.md](stage-a.md) | 自动Journal、开放期间保护、不可变过账及控制一致性已实现；完整期初迁移、期间关闭管理流程和余额报表未交付。 |
| 4 / R004 | 管理/财务端：Tax codes, GST calculation, inclusive/exclusive tax, reporting mappings | P0 / 保留 | A | 部分实现 | [stage-b-invoicing.md](stage-b-invoicing.md)；[stage-b-supplier-payments.md](stage-b-supplier-payments.md) | AU税码、金额计算、CASH/NON_CASH归属及冲销已实现；完整BAS/IAS、税务申报版本及独立预付税票未交付。 |
| 5 / R005 | 管理/财务端：KPIs, income/expense charts, financial position, tasks/up-next | P1 / 保留 | C | 未实现 | [stage-c-financial-reports.md](stage-c-financial-reports.md)；[stage-c-cash-flow.md](stage-c-cash-flow.md) | 可复用P&L/BS/现金流查询；没有经营Dashboard/KPI聚合入口。 收入费用图表、财务概览和tasks/up-next统一口径。 实施包：C09。详见[本次C核查](stage-c-acceptance.md)。 |
| 6 / R006 | 管理/财务端：Customers, suppliers, customer→multi-branch→multi-contact, contact roles, accountant phone/email, financial defaults, import/export | P0 / 部分缩减 | A | 部分实现 | [master-data-api.md](master-data-api.md) | 客户供应商、多门店、多联系人、会计联系方式维护已实现；批量导入导出未交付。 |
| 7 / R007 | 管理/财务端：Products/services, buy/sell settings, stock, valuation, reorder settings, sales unit & pack↔m² conversion | P0 / 部分缩减 | A/B | 部分实现 | [stage-b-inventory-control.md](stage-b-inventory-control.md)；[stage-b-transit-transfers.md](stage-b-transit-transfers.md) | 商品/服务、单位换算、库存及移动均价已实现；补货执行、批次/货位与完整商品搜索未交付。 |
| 8 / R008 | 管理/财务端：库存成本字段按角色控制 | P0 / 保留 | A | 后端已实现 | [stage-b-warehouse.md](stage-b-warehouse.md)；[stage-b-inventory-control.md](stage-b-inventory-control.md) | 普通仓库查询隐藏成本；财务成本读取独立授权。附件/导出尚未开放，不能据此认定这些未来入口已验证。 |
| 9 / R009 | 管理/财务端：客户主体关联多个门店，每门店多个联系人及会计联系方式 | P0 / 保留 | A | 后端已实现 | [master-data-api.md](master-data-api.md) | 客户多门店、多联系人、跨门店关联及会计联系方式维护和范围校验已实现。 |
| 10 / R010 | 管理/财务端：每客户单独产品价格 | P0 / 保留 | A | 后端已实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 标准/客户协议价格维护、有效期及版本；报价由后台解析。 |
| 11 / R011 | 管理/财务端：活动特价按开始/结束时间自动生效失效 | P0 / 保留 | A | 后端已实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 活动按服务器时刻及[start,end)查询生效，无需依赖定时器。 |
| 12 / R012 | 管理/财务端：按商品维护包/桶/m²等销售单位及换算 | P0 / 保留 | A | 后端已实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 商品单位、换算、基础单位及整包/步长校验已实现。 |
| 13 / R013 | 管理/财务端：Quote CRUD, status, PDF/email; sales creates Quote only; back office converts approved Quote to Sales Order | P1 / 保留 | B | 部分实现 | [stage-b-sales.md](stage-b-sales.md)；[stage-b-documents.md](stage-b-documents.md) | 报价草稿、提交/修订/审批已实现；017补正式版本PDF/邮件及单据附件；019补报价草稿回收站，见stage-b-trash.md。 |
| 14 / R014 | 管理/财务端：Sales Order CRUD, fulfilment/status, created from approved Quote/back office, convert to Invoice | P1 / 保留 | B | 部分实现 | [stage-b-sales.md](stage-b-sales.md)；[stage-b-direct-orders.md](stage-b-direct-orders.md)；[stage-b-trash.md](stage-b-trash.md) | 020补办公室直接正式建SO，与报价转单共用编号/信用/预留；分批履约/开票/取消已实现，019补取消后回收站。确认订单不开放任意编辑；完整变更流程与客户端联调仍未交付。 |
| 15 / R015 | 管理/财务端：Invoice CRUD, lines, GST, attachments, PDF/email, history/status; back-office controlled | P0 / 保留 | B | 部分实现 | [stage-b-invoicing.md](stage-b-invoicing.md)；[stage-b-returns.md](stage-b-returns.md)；[stage-b-documents.md](stage-b-documents.md) | 开票快照/AR/收入/GST及来源冲销已实现；017补PDF/邮件及附件；019补合法冲销后可见性回收站，已过账不开放任意CRUD。 |
| 16 / R016 | 管理/财务端：Record/allocate partial & multi-invoice payments, balances | P0 / 部分缩减 | B | 后端已实现 | [stage-b-receipts.md](stage-b-receipts.md) | 人工核实客户收款、部分/多发票分配、预收核销、余额/信用释放已实现；025补收款撤销、关联重核销/一步更正、预收整笔解除及重新核销，兼容贷项/退款及GST，见[收款更正](stage-b-settlement-reversals.md)。在线支付按源边界排除。 |
| 17 / R017 | 管理/财务端：Invoice/Order/Credit删除进入回收站 | P0 / 保留 | B | 部分实现 | [stage-b-trash.md](stage-b-trash.md) | 019补草稿软删除/恢复、取消订单、合法完整贷项/退款发票的隐藏及文件联动；恢复不重新记账。已过账贷项无合法撤销/借项流程时必须保留，不能以退款代替撤销；客户端交互及进一步归档规则仍未接入。 |
| 18 / R018 | 管理/财务端：Credit notes, apply credit, refunds, ledger/bank posting | P1 / 保留 | B | 后端已实现 | [stage-b-returns.md](stage-b-returns.md) | 实物退回、关联原发票贷项、退款及原账冲销已实现；024已补同客户可用贷项跨发票抵扣及整笔解除、应收/额度保护及销项GST归属，兼容原收款/预收核销/退款，见[客户贷项抵扣](stage-b-customer-credit-applications.md)。027补客户退款撤销及金额/合法来源更正、AR/信用/销项GST及原收款/预收核销/贷项抵扣兼容，见[退款更正](stage-b-customer-refund-corrections.md)。029补关联原发票行的独立净额/税额贷项，支持只调税、纯金额折让，兼容原AR/信用、收款/预收核销、贷项抵扣及退款；累计受原净额/税额上限保护，见[金额贷项](stage-b-customer-amount-credits.md)。不包含脱离原发票的无来源贷项、借项补收或银行账户模块。 |
| 19 / R019 | 管理/财务端：Generate, print/PDF/email statements | P2 / 保留 | C | 后端已实现 | [stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)；[verification.md](verification.md) | 042客户合并门店的过账日对账单、AR业务/GL独立核对、预收款单列、不可变快照、多页PDF、授权邮件及失败/未知结果保护。 本行约定后端切片无新增欠项；客户端合并入口和真实投递/生产另验。 实施包：C03已完成。 |
| 20 / R020 | 管理/财务端：Bill CRUD, supplier invoice, lines, GST, attachments/status | P0 / 保留 | B | 部分实现 | [stage-b-supplier-bills.md](stage-b-supplier-bills.md) | 已实现收货精确匹配、GRNI/AP/GST及原单贷项；021补独立费用账单、费用/AP/进项GST及共用付款/预付核销，见stage-b-expense-bills.md。022补原费用贷项、退款与费用/AP/GST冲销。费用草稿CRUD、自由价格/税额差异流程及账单附件管理仍待后续。 |
| 21 / R021 | 管理/财务端：PO CRUD, delivery, convert to bill | P1 / 保留 | B | 后端已实现 | [stage-b-purchasing.md](stage-b-purchasing.md)；[stage-b-supplier-bills.md](stage-b-supplier-bills.md)；[stage-b-documents.md](stage-b-documents.md) | PO草稿、确认、分批收货、精确匹配账单及关闭余量已实现；017补正式PO的PDF/邮件与附件，仍只接受精确匹配。 |
| 22 / R022 | 管理/财务端：Allocate payments, partial/multiple bills, remittance | P0 / 部分缩减 | B | 后端已实现 | [stage-b-supplier-payments.md](stage-b-supplier-payments.md) | 人工核实付款、多账单分配、预付核销和现金制进项GST已实现；026补付款撤销/关联重核销/一步更正、预付整笔解除及重新核销，兼容原供应商贷项抵扣/退款，见[供应商结算更正](stage-b-supplier-settlement-reversals.md)。汇款通知/打印按源边界排除。 |
| 23 / R023 | 管理/财务端：Supplier debits, apply debit, supplier refunds | P1 / 保留 | B | 后端已实现 | [stage-b-purchase-returns.md](stage-b-purchase-returns.md)；[stage-b-credit-applications.md](stage-b-credit-applications.md) | 原收货退货、来源贷项、供应商/预付退款已实现；022补独立费用账单来源的金额贷项、退款及费用/AP/GST冲销，见stage-b-expense-credits.md。023已补同供应商/party可用贷项跨账单抵扣及整笔解除，含AP/GST、权限、幂等和并发；限制实际未退款/未转用余额，目标已退款或转用导致资金不足时拒绝解除。 028已补供应商退款撤销、关联替代及一步金额/合法来源更正，兼容有效AP/预付余额、付款撤销/核销与供应商贷项抵扣及进项GST，见[退款更正](stage-b-supplier-refund-corrections.md)。 |
| 24 / R024 | 管理/财务端：Templates, schedules, auto-generate invoices/bills/transactions | P2 / 保留 | D | 未实现 | — | Recurring模板/调度/自动生成未实现；原矩阵属D。 |
| 25 / R025 | 管理/财务端：Accounts, balances, feeds status, attention items | P0 / 保留 | B/C | 部分实现 | [stage-c-bank-rules.md](stage-c-bank-rules.md)；[stage-c-general-banking.md](stage-c-general-banking.md) | 033银行档案/默认账户/收付选择；034现金明细、可匹配和未达数据已交付。041新增按银行/期间分页的规则例外及待确认建议。 C银行Hub统一余额/关注聚合；D真实Feeds连接状态。 实施包：C09、D。 |
| 26 / R026 | 管理/财务端：Import/feed transactions, categorise, match, split | P0 / 保留 | C/D | 部分实现 | [stage-c-bank-rules.md](stage-c-bank-rules.md)；[stage-c-general-banking.md](stage-c-general-banking.md) | 034导入/防重/匹配及解除，040人工分类/拆分写入，041版本化规则自动匹配、解释预览、受控执行与例外查询。 D真实自动Bank Feeds；本行C导入/分类/拆分/匹配切片已交付，客户端与生产另验。 实施包：D。 |
| 27 / R027 | 管理/财务端：Condition/action rules, enable/disable, auto-categorisation | P1 / 保留 | C | 后端已实现 | [stage-c-bank-rules.md](stage-c-bank-rules.md)；[stage-c-general-banking.md](stage-c-general-banking.md) | 041字面条件及金额范围、科目/GST比例动作、版本/优先级/启停、命中解释、预览快照、建议确认/自动执行分权及例外分页；复用C01过账/匹配及期间保护。 本行约定后端切片无新增欠项；AUTO为显式授权触发，不包含导入即后台过账、外部Feeds及客户端联调。 实施包：C02已完成。 |
| 28 / R028 | 管理/财务端：Statement reconciliation, transaction selection, difference=0 completion | P0 / 保留 | C | 后端已实现 | [stage-b-bank-ledger.md](stage-b-bank-ledger.md)；[stage-c-bank-reconciliation.md](stage-c-bank-reconciliation.md) | 034连续银行对账、首期清算/未达、差异严格为0、冻结快照、最新期重开及闭期现金保护。 本行后端切片无新增欠项；真实银行格式/客户端/生产另验。 实施包：已交付切片。详见[本次C核查](stage-c-acceptance.md)。 |
| 29 / R029 | 管理/财务端：Spend money, receive money, account transfers | P1 / 部分缩减 | C | 后端已实现 | [stage-c-general-banking.md](stage-c-general-banking.md)；[stage-c-bank-reconciliation.md](stage-c-bank-reconciliation.md) | 040通用Receive/Pay、流水分类及成对银行账户转账；来源/GL/GST独立核对、原日冲销、两账户对账及期间保护。 本行约定后端切片无新增欠项；不恢复已删独立Spend/Transfer页面，客户端与生产另验。 实施包：C01已完成。 |
| 30 / R030 | 管理/财务端：Payment batches, supplier/wage payments, bank export | P1 / 部分缩减 | 排除专用功能 | 排除 | — | 需求增删与边界!6:7排除电子付款批次/银行文件/支票/汇款通知，不作为欠交功能。 |
| 31 / R031 | 管理/财务端：Account hierarchy/types, bank accounts, opening balances | P0 / 保留 | A | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-reconciliation.md](stage-b-reconciliation.md) | 默认COA/控制科目、受控库存期初及控制核对已实现；完整COA维护、AR/AP/银行历史期初迁移未实现。 |
| 32 / R032 | 管理/财务端：Default GL account mappings for sales/purchases/payroll posting | P0 / 保留 | A | 部分实现 | [database-schema.md](database-schema.md) | 自动科目映射种子及业务校验已实现；独立维护/版本管理API、工资映射未实现。 |
| 33 / R033 | 管理/财务端：Job/project tracking and profitability dimensions | P2 / 部分缩减 | 不启用独立模块 | 排除 | — | 原矩阵不启用独立Jobs/Time Billing；其他项目核算需新增业务定义。 |
| 34 / R034 | 管理/财务端：Journal CRUD, debit/credit validation, posting | P0 / 部分缩减 | A，删手工界面 | 后端已实现 | [stage-a.md](stage-a.md)；[stage-b-reconciliation.md](stage-b-reconciliation.md) | 自动分录、借贷平衡、期间和来源/幂等检查已实现；按源边界不建设手工Journal CRUD。 |
| 35 / R035 | 管理/财务端：Personal/employment/pay/bank/tax/leave/super details | P1 / 保留 | D | 未实现 | — | 员工工资/税务/养老金档案未实现；D。 |
| 36 / R036 | 管理/财务端：Earnings, allowances, deductions, leave, taxes, contributions | P1 / 保留 | D | 未实现 | — | 工资项目和AU计算服务映射未实现；D。 |
| 37 / R037 | 管理/财务端：Periods, employee calculation, review, record, journal posting | P1 / 保留 | D | 未实现 | — | 工资计算/审批/锁定/Journal未实现；D。 |
| 38 / R038 | 管理/财务端：Hours, pay items, jobs, import into pay run | P2 / 保留 | D | 未实现 | — | Payroll Timesheets未实现；不恢复Time Billing；D。 |
| 39 / R039 | 管理/财务端：STP equivalent / NZ Payday Filing integration layer | P2 / 保留 | D | 未实现 | — | 仅保留澳洲STP方向；工作簿中的NZ Payday字样不适用。AU申报服务未接入；D。 |
| 40 / R040 | 管理/财务端：P&L, Balance Sheet, Cash Flow, Trial Balance, GL | P0 / 保留 | C | 后端已实现 | [stage-c-financial-reports.md](stage-c-financial-reports.md)；[stage-c-cash-flow.md](stage-c-cash-flow.md)；[stage-c-gst-bas.md](stage-c-gst-bas.md)；[stage-c-full-bas.md](stage-c-full-bas.md)；[stage-c-period-close.md](stage-c-period-close.md) | 033—036及039已提供P&L、BS、直接法CF、TB、GL；包含历史账龄及年结后利润/权益保护。 完成原行五类核心后端报表；通用导出归R052/R054，收藏/报表包归D的R042/R043；客户端和生产另验，不倒推新增法定模板/间接法为本行阻塞。 实施包：已交付切片。详见[本次C核查](stage-c-acceptance.md)。 |
| 41 / R041 | 管理/财务端：Sales, purchases, receivables/payables, payroll, banking | P1 / 保留 | C/D | 部分实现 | [stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)；[verification.md](verification.md) | 既有财务/账龄/现金流，042补采购事件、AR/AP历史及预收预付、在库/在途和银行经营报表，白名单过滤、总计分页及冻结CSV导出。 C07销售事实/净销售经营报表及D工资报表；真实规模和客户端另验。 实施包：C07、D。 |
| 42 / R042 | 管理/财务端：Filters, columns, saved reports/favourites | P2 / 保留 | D | 未实现 | — | 收藏/自定义报表未实现；D。 |
| 43 / R043 | 管理/财务端：Multi-report packs, cover/TOC, PDF generation | P2 / 保留 | D | 未实现 | — | 报表包、封面/目录/PDF未实现；D。 |
| 44 / R044 | 管理/财务端：Upload/preview/delete, entity attachments, document inbox | P1 / 保留 | B | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-documents.md](stage-b-documents.md) | 017补QUOTE/INVOICE/PURCHASE_ORDER私有PDF/PNG/JPEG附件上传、扫描、版本绑定、撤销和授权下载；仓管交接照片、其他单据/实体附件、云存储接入未完成。 |
| 45 / R045 | 管理/财务端：Receipt/bill extraction and assisted creation | P3 / 延期候选 | 候选P3 | 未实现 | — | 管理端票据OCR是候选P3，未实现；不得因此删除C销售名片OCR。 |
| 46 / R046 | 管理/财务端：Business details, address, financial year, GST, logo | P0 / 保留 | A | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-invoicing.md](stage-b-invoicing.md) | AU/AUD/ABN、财年、时区、GST种子/受控CLI已实现；完整公司地址/logo与管理设置未交付。 |
| 47 / R047 | 管理/财务端：Numbering, terms, templates, email, reminders, online payment config | P1 / 部分缩减 | A/B | 部分实现 | [stage-b-sales.md](stage-b-sales.md)；[stage-b-documents.md](stage-b-documents.md) | 事务编号/账期及017默认PDF/邮件模板已实现；办公室编号/模板配置界面未交付；在线支付/独立催收仍按原边界排除。 |
| 48 / R048 | 管理/财务端：Numbering, defaults, payment terms/preferences | P1 / 保留 | A/B | 部分实现 | [stage-b-purchasing.md](stage-b-purchasing.md) | 默认采购编号/账期和映射已实现；完整可维护采购设置API未交付。 |
| 49 / R049 | 管理/财务端：Pay cycles, defaults, banking, filing config | P1 / 保留 | D | 未实现 | — | 工资配置未实现；D。 |
| 50 / R050 | 管理/财务端：Basis, currency, headers, number formatting | P2 / 保留 | D | 未实现 | — | 独立报表口径/页眉/格式设置未实现；D。 |
| 51 / R051 | 管理/财务端：Cross-entity search by number/name/reference | P2 / 保留 | D | 未实现 | — | 跨实体搜索未实现；D。 |
| 52 / R052 | 管理/财务端：Search/filter/sort/pagination/columns/bulk/export | P0 / 保留 | A起贯穿 | 部分实现 | [master-data-api.md](master-data-api.md) [stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)；| 列表稳定分页与部分过滤已有，042补本期经营报表白名单过滤/分页和受控导出；其他列表完整搜索排序、列选择、批量和导出契约仍未完成。 |
| 53 / R053 | 管理/财务端：System reminders, due items, action centre | P2 / 部分缩减 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 审计/Outbox及文档作业状态已有基础，不构成业务行动中心。 业务到期提醒、Task待办及消息行动中心；独立自动发票催收仍排除。 实施包：C06、C09。详见[本次C核查](stage-c-acceptance.md)。 |
| 54 / R054 | 管理/财务端：CSV import mapping/validation/errors + data exports | P1 / 保留 | A起贯穿 | 部分实现 | [stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md) | 042已实现四类经营报表冻结CSV及受控下载/重试；通用主数据CSV映射、预览、逐行错误及其他业务导入导出仍未完成。 |
| 55 / R055 | 管理/财务端：Invoice/quote/PO/statement/remittance document generation | P1 / 部分缩减 | B/C | 后端已实现 | [stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)；[verification.md](verification.md) | 既有报价/发票/PO版本化PDF与邮件，042补客户对账单冻结模板、PDF与邮件，复用私有文件和租约重试。 原保留模板后端已齐；Remittance及专用收据模板仍按原边界排除，客户端和真实服务另验。 实施包：C03已完成。 |
| 56 / R056 | 管理/财务端：Unit/integration/E2E, permission tests, financial regression, security hardening | P0 / 保留 | 全阶段 | 部分实现 | [verification.md](verification.md)；[stage-b-acceptance.md](stage-b-acceptance.md)；[stage-b-documents.md](stage-b-documents.md) | 真实PostgreSQL权限/幂等/并发/财务回归及017文档/协议/重试专项已实现；客户端E2E、真实外部身份/发件服务及生产安全/容量验收未完成。 |
| 57 / R057 | 管理/财务端：CI/CD, environments, backup, logging, monitoring, release | P0 / 保留 | A起贯穿 | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-documents.md](stage-b-documents.md) | Docker/迁移/健康检查/日志/测试脚本及017PDF运行时镜像已验证；正式CI/CD、云部署、监控告警、备份恢复和真实扫描/发件运营未验收。 |
| 58 / S-01 | 销售端：销售人员登录 | P0 / 保留 | A | 部分实现 | [stage-a.md](stage-a.md) | 员工JWT及DB成员权限校验已实现；真实身份提供商、移动登录联调未完成。 |
| 59 / S-02 | 销售端：销售工作台 | P1 / 保留 | C | 未实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 授权客户、报价、订单查询可复用。 销售客户/Task/拜访待办工作台聚合。 实施包：C09。详见[本次C核查](stage-c-acceptance.md)。 |
| 60 / S-03 | 销售端：按客户名、编号、门店、联系人、电话或Email搜索；支持最近访问、区域/状态筛选。 | P0 / 保留 | A/B | 部分实现 | [master-data-api.md](master-data-api.md) | 客户名称/编号搜索及授权范围已实现；跨门店/联系人/电话/email搜索、最近访问、区域筛选未实现。 |
| 61 / S-04 | 销售端：查看客户主体、关联门店及各门店多个联系人；显示姓名、职位、电话、Email、地址、销售负责人和会计联系人。 | P0 / 保留 | A/B | 部分实现 | [master-data-api.md](master-data-api.md) | 客户、门店、多联系人/会计联系方式查询已实现；销售负责人展示/完整聚合接口未实现。 |
| 62 / S-05 | 销售端：客户Notes | P0 / 保留 | C | 未实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 单据备注和业务设置notes不是客户Note对象。 客户Note CRUD、可见范围、历史、附件及同步事件。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 63 / S-06 | 销售端：展板信息 | P1 / 保留 | C | 未实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 现有客户/门店资料可复用。 门店展板放置记录、状态及照片/附件。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 64 / S-07 | 销售端：查看当前客户对应的产品价格；支持标准价、逐客户专属价、活动特价及最终销售价。 | P0 / 保留 | A/B | 后端已实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 授权客户价格解析，支持标准/客户/活动与最终价；客户端展示未联调。 |
| 65 / S-08 | 销售端：订单摘要 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 授权客户订单列表及详情已实现；客户端摘要展示未联调。 |
| 66 / S-09 | 销售端：客户地图 | P0 / 保留 | C | 未实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 门店地址已保存，无客户地理编码/地图范围API。 授权客户坐标、地理编码作业及精度/失败状态。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 67 / S-10 | 销售端：地图筛选 | P1 / 保留 | C | 未实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 普通客户搜索不是地图筛选。 客户/门店区域、状态等地图筛选及范围隔离。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 68 / S-11 | 销售端：地图导航 | P1 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 无导航适配服务契约。 授权坐标/地址导航契约；设备拉起导航属于后续客户端联调。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 69 / S-12 | 销售端：Check-in | P0 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 无拜访会话或签到命令。 Check-in、客户/门店、操作者、时间、位置精度和幂等。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 70 / S-13 | 销售端：Check-out | P0 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 无拜访状态机。 Check-out与同一拜访状态/版本/并发约束。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 71 / S-14 | 销售端：拜访历史 | P1 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 审计列表不能代替拜访记录。 授权拜访历史、办公室共享、附件与时间筛选。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 72 / S-15 | 销售端：创建Task | P0 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | Outbox是基础设施，不是Task业务表和创建接口。 Task对象、负责人、关联客户、截止时间与审计。 实施包：C06。详见[本次C核查](stage-c-acceptance.md)。 |
| 73 / S-16 | 销售端：Task列表 | P0 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 没有Task查询API。 角色/负责人/客户范围过滤及稳定分页列表。 实施包：C06。详见[本次C核查](stage-c-acceptance.md)。 |
| 74 / S-17 | 销售端：完成/更新Task | P0 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 没有Task状态机。 更新/完成、版本、幂等、变更历史及并发测试。 实施包：C06。详见[本次C核查](stage-c-acceptance.md)。 |
| 75 / S-18 | 销售端：Task/Note推送 | P1 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 文档邮件适配和Outbox不代表移动Task/Note推送。 通知收件人、设备令牌、投递作业、重试去重及真实提供商验证。 实施包：C06。详见[本次C核查](stage-c-acceptance.md)。 |
| 76 / S-19 | 销售端：系统消息中心 | P2 / 保留 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 没有业务消息/已读记录。 授权消息中心、游标/分页、已读/未读与同步。 实施包：C06。详见[本次C核查](stage-c-acceptance.md)。 |
| 77 / S-20 | 销售端：销售扫描客户名片，识别姓名、公司/门店、电话、Email并生成联系人草稿。 | P1 / 保留 | C | 后端已实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044私有名片图片、扫描/OCR作业、HTTPS网关适配、重试/租约、姓名/公司/门店等建议及人工确认联系人草稿，复用独立办公室审核。 真实OCR网关合同/识别质量及手机拍照联调另验；不自动建公司或合并客户。 |
| 78 / S-21 | 销售端：手工新增客户、门店或联系人，并关联到已有客户主体。 | P1 / 保留 | C | 后端已实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044销售客户/门店/联系人草稿、目标客户/门店授权、重复建议、版本审核、一次生成正式数据及客户信用初始化/默认账期/销售分配。 三个客户端接入及业务UAT另验；正式信用与非默认账期仍沿用既有专门权限。 |
| 79 / S-22 | 销售端：移动端Note、Task、拜访、客户/门店/联系人草稿及通讯录导入结果同步到管理平台。 | P0 / 保留 | C | 部分实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044设备操作UUID/连续序号、提交有序增量、tombstone、冲突、游标过期/重置、撤权及通讯录/名片生成的草稿同步。 C05 Note/拜访/展板与C06 Task/消息对象逐项接入及C09办公室聚合；移动端联调未做。 |
| 80 / S-23 | 销售端：销售通过SKU、名称、条码快速查询商品库存。 | P0 / 保留 | B | 部分实现 | [stage-b-sales.md](stage-b-sales.md) | 员工商品分页/按productId库存读取已实现；SKU/名称/条码快速搜索接口未完成。 |
| 81 / S-24 | 销售端：门店/仓库库存 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md)；[stage-b-reconciliation.md](stage-b-reconciliation.md) | 授权仓库实物/预留/可售及dataAsOf已实现；停用可售错误本批修复；客户端展示未联调。 |
| 82 / S-25 | 销售端：从客户/门店详情进入库存时自动展示该客户实际销售价格及当前有效活动价。 | P0 / 保留 | B | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 价格解析和库存查询分别可用；无客户上下文的库存+价格聚合接口，三个客户端未接入。 |
| 83 / S-26 | 销售端：销售从客户+门店+商品创建Quotation，录入包数或m²、价格、折扣、备注。 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 客户/门店报价、数量或面积输入、后台定价/折扣/备注及底价权限已实现；客户端录入未联调。 |
| 84 / S-27 | 销售端：报价列表/详情 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 授权报价列表/详情/状态已实现。 |
| 85 / S-28 | 销售端：报价草稿与提交 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 草稿、提交、正式编号、不可变快照和修订已实现。 |
| 86 / S-29 | 销售端：照片/附件 | P2 / 保留 | B/C | 部分实现 | [stage-b-documents.md](stage-b-documents.md)；[stage-b-warehouse-locations.md](stage-b-warehouse-locations.md) | QUOTE/PICK及供应商单据私有扫描附件已有授权访问。 C Note/展板/拜访/草稿等CRM实体附件绑定、撤销及离线上传关联；不把现有文件底座当已完成。 实施包：C05。详见[本次C核查](stage-c-acceptance.md)。 |
| 87 / S-30 | 销售端：弱网缓存 | P2 / 保留 | C | 部分实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044后端CRM草稿离线操作契约：设备序号、重放、版本冲突、30天游标、权限变更重置和删除保护；财务/出库无离线命令。 客户端本地缓存、弱网呈现/恢复及实机验证；C05/C06新对象同步后续补齐。 |
| 88 / S-31 | 销售端：销售数据隔离 | P0 / 保留 | A起贯穿 | 后端已实现 | [stage-a.md](stage-a.md)；[stage-b-sales.md](stage-b-sales.md) | 公司及销售授权客户隔离，成本另授权；未来接口仍须单独验证。 |
| 89 / S-32 | 销售端：操作记录 | P0 / 保留 | A起贯穿 | 部分实现 | [stage-a.md](stage-a.md) | 已交付命令的操作者/请求/版本及审计已实现；移动设备上下文、业务日志聚合未完整交付。 |
| 90 / S-33 | 销售端：销售端直接创建Invoice | OUT / 保留 | 排除 | 排除 | [stage-b-invoicing.md](stage-b-invoicing.md) | 销售不能直接创建Invoice，权限测试覆盖；源优先级OUT覆盖保留标签。 |
| 91 / S-40 | 销售端：Quotation草稿编号策略 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 草稿UUID不占正式号；提交事务编号、重试同号。 |
| 92 / S-41 | 销售端：Quotation编号配置 | P1 / 保留 | A/B | 部分实现 | [stage-b-sales.md](stage-b-sales.md) | 公司级序列及前缀已实现；办公室编号规则配置API未交付。 |
| 93 / S-42 | 销售端：Quotation提交失败保护 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 提交失败事务回滚、幂等摘要、草稿保留与结果查询已实现。 |
| 94 / S-43 | 销售端：销售员授权后从手机通讯录选择联系人导入 | P0 / 保留 | C | 后端已实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044只接受授权选择结果及consentReference、1—100人规范化/批内和正式去重预览、选择确认及一次落草稿、独立审核链。 手机OS授权和联系人选择由客户端实现并联调；后端不把consent文本当设备授权完成证明。 |
| 95 / S-44 | 销售端：同一客户/老板名下关联多家店面 | P0 / 保留 | A/B | 后端已实现 | [master-data-api.md](master-data-api.md) | 同一客户关联多门店及跨主体校验已实现。 |
| 96 / S-45 | 销售端：一个门店维护多个不同联系人 | P0 / 保留 | A/B | 后端已实现 | [master-data-api.md](master-data-api.md) | 多联系人及门店关联集合维护、会计联系人用途已实现。 |
| 97 / S-46 | 销售端：Quotation包数与m²双向换算 | P0 / 保留 | A/B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 包/m²权威输入、向上整包、覆盖面积和步长校验已实现；客户端交互未联调。 |
| 98 / C-01 | 客户端：客户登录 | P0 / 保留 | A/B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018完成独立JWT受众/外部身份绑定、上下文选择；真实OIDC/Cognito应用、邀请/登录页面及续期联调待交付。 |
| 99 / C-02 | 客户端：库存查询入口 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018提供门户库存入口所需上下文及仓库API；客户端入口页面未接入。 |
| 100 / C-03 | 客户端：商品搜索 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现门户SKU/名称/条码字面搜索；客户端搜索界面未接入。 |
| 101 / C-04 | 客户端：商品列表 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现分页列表与脱敏字段契约；客户端展示未接入。 |
| 102 / C-05 | 客户端：商品详情 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现授权商品详情、公开描述、分类/单位/换算/条码；商品图片及客户端展示未接入。 |
| 103 / C-06 | 客户端：实时可售库存 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现只读语句快照的授权可售量和dataAsOf；不承诺未来库存，客户端展示未接入。 |
| 104 / C-07 | 客户端：多仓库库存 | P1 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现门店显式多仓授权、合法零库存及同快照汇总；客户端未接入。 |
| 105 / C-08 | 客户端：库存状态 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018按公开阈值派生三种库存状态；客户端展示未接入。 |
| 106 / C-09 | 客户端：筛选与排序 | P1 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018实现分类/库存状态筛选及SKU/名称/可售量排序白名单；客户端未接入。 |
| 107 / C-10 | 客户端：客户数据隔离 | P0 / 保留 | A起贯穿 | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018完成客户/公司/门店/仓库与商品受众隔离HTTP专项；真实客户端身份联调未完成。 |
| 108 / C-11 | 客户端：库存API集成 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018已提供专用库存API及真实HTTP契约测试；Dart/TS客户端联调未交付，三个客户端未改。 |
| 109 / C-12 | 客户端：异常与空状态 | P0 / 保留 | B | 部分实现 | [stage-b-portal.md](stage-b-portal.md) | 018覆盖空商品/合法零库存、401/400/403/404/422及no-store；客户端异常/缓存呈现和真实服务故障联调未交付。 |
| 110 / R110 | 管理/财务端：客户返点规则与结算 | P1 / 新增 | C/D | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 原发票/贷项/退款可追溯，但没有返点政策或计提结算对象。 C固定比例/固定额政策版本、未税净销售事实、计提/审批/锁期/结算及关联冲回；D阶梯规则。 实施包：C07、C08、D。详见[本次C核查](stage-c-acceptance.md)。 |
| 111 / R111 | 管理/财务端：销售代表分红/佣金 | P1 / 新增 | C/D | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 成交来源与收付查询不代表佣金归属或计提。 C基础佣金/销售归属快照及审批结算；回款/毛利按独立规则验收，D阶梯；不解释为股东分红或自动工资付款。 实施包：C07、C08、D。详见[本次C核查](stage-c-acceptance.md)。 |
| 112 / R112 | 管理/财务端：客户×产品销量趋势分析 | P1 / 新增 | C | 未实现 | [stage-c-financial-reports.md](stage-c-financial-reports.md)；[stage-c-cash-flow.md](stage-c-cash-flow.md) | P&L按科目汇总，非客户×SKU销售事实和曲线。 客户/门店/SKU/期间未税净销售、基础单位数量、同环比及截止点。 实施包：C07。详见[本次C核查](stage-c-acceptance.md)。 |
| 113 / R113 | 管理/财务端：办公室统一客户视图 | P1 / 新增 | C | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md) | 办公室正式客户、多门店联系人、报价/订单和价格库存聚合可查。 CRM Notes/拜访/展板/Task/趋势整合及字段成本权限。 实施包：C05、C06、C07、C09。详见[本次C核查](stage-c-acceptance.md)。 |
| 114 / R114 | 销售端：客户产品销售曲线（销售端） | P1 / 新增 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 没有共用净销售趋势API。 复用R112事实，按销售授权客户过滤；上期0显示无可比。 实施包：C07。详见[本次C核查](stage-c-acceptance.md)。 |
| 115 / R115 | 销售端：返点/佣金展示（授权范围） | P1 / 新增 | C | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 没有返点/佣金数据源或查询授权模型。 本人佣金/状态、额外授权客户返点、对其他人员/成本字段的隔离。 实施包：C08。详见[本次C核查](stage-c-acceptance.md)。 |
| 116 / R116 | 销售端：客户销售资料办公室同步完善 | P1 / 新增 | C | 部分实现 | [C04接口与边界](stage-c-crm-mobile.md) | 044销售草稿与办公室审核、冲突、同步增量、正式客户/门店/联系人完善和销售归属已实现。 C05 Note/拜访、C06 Task等移动对象及C09办公室统一视图仍待实现。 |
| 117 / R117 | 管理/财务端：返点与佣金结算回归测试 | P1 / 新增 | C/D | 未实现 | [阶段C核查及缺项证据](stage-c-acceptance.md) | 现有退货/贷项/付款回归不是激励模块回归。 C基础规则的来源去重、版本切换、归属、退货与贷项只净冲一次、跨期调整/锁账/结算权限；D阶梯专项。 实施包：C08、D。详见[本次C核查](stage-c-acceptance.md)。 |

## 完整性核对

116源行一一对应，无漏行/重复。按本表当前行状态：后端已实现25；部分实现46；未实现42；排除3。其中本轮重新核对的39条C相关源行：后端已实现2、部分实现8、未实现29；其余77行沿用既有阶段判断，未宣称本轮重新验收。以上均是需求行数量，不是项目完成率。

“需求增删与边界”sheet第2—9行保留基础依赖并排除独立加工、Time Billing、在线支付引导、电子支付/支票/汇款通知、手工Journal UI及Send to Accountant；未把删除页面解释成删除库存入账/底层会计。第10—13行的返点、佣金、趋势、办公室共享均保留并列C/D待办。

“新功能验收口径”第2—6行的规则版本、净销售、归属、授权和重复保护作为后续激励验收条件，当前均未宣称完成；第7行待确认语义保留。概览sheet的人日/复用假设未被当作交付证据。

仓管W-01—W-06为原v2补充，不占116行：仓库范围/采购收货/拣货/出库/来源退货已实现；批次货位、扫码输入协议、少拣原因及交接照片证据尚缺；选定SKU盘点/审核和在途调拨已实现，整仓盲盘/复盘流程未实现。详见阶段B验收报告。

017文档后续：QUOTE/INVOICE/PURCHASE_ORDER输出及附件的最新边界见stage-b-documents.md。上述三类单据可用不代表W-04仓管照片或全部附件实体均已接入，也未改变原B/C/D阶段归属。

018门户后续：C-01—C-12补齐本批后端授权/商品/库存切片；状态仍为部分实现以保留真实身份服务和客户端联调。员工端S-23通用条码搜索不因门户搜索自动完成。

019回收站后续：只改变可见性；原AR/GST/GL控制与来源链不因隐藏丢失。R017保留部分实现，以明确贷项撤销/进一步归档及客户端交互仍未交付，不能将拒绝非法删除描述为完成新财务撤销流程。

020直接订单后续：R014办公室入口已补，共用信用/库存/编号核心，显式DIRECT来源及冻结税务事实；没有新增任意编辑、超信用豁免或新的财务交易。其他B欠交仍按验收表保留。


## 030—032 最新覆盖（2026-10-26）

下列增量覆盖上述历史描述，不把后端完成等同三个客户端端到端完成：

- R018/R020/R023/R025：供应商原账单关联的自由净额/税额贷项及采购实际票面差异，见 stage-b-purchase-adjustments.md；在库调库存、已售计采购价差。银行账户档案仍待后续。
- R047/R048/S-41：编号前缀/下一值、销售/采购账期、报价有效期、默认配送模式可通过权限+版本+幂等API维护。模板设计器、提醒、在线支付未实现。
- S-03：客户名/编号/ABN与门店、联系人/电话/email跨字段搜索已补；门店/联系人独立搜索及客户范围隔离已补。最近访问/区域CRM仍待后续。
- S-23/S-25：SKU/名称/新旧条码搜索及客户库存/实际价格聚合已补，读取不代替成交预留。客户端页面未修改。
- W-03/W-04及基础批次货位：可选少拣原因、位置分配/批次流水、BIN/LOT/产品扫码、PICK私有扫描附件已补；旧库存未分配、盘点后分配。强制相机交接、硬件验证、分货位盲盘/复盘未包含。

所有条目的真实客户端、身份服务、外部邮件/扫描服务与生产运行验收仍按原限制保留。见三个新增专项文档及 verification.md。

## 033 最新覆盖（2026-10-27）

银行档案、四类收付账户选择、原账户冲销，以及基础GL/TB/凭证追溯已补。R040完整财务报表仍归C，本次仅交付B依赖的基础查询。原116条状态不因后端基线签署全部改为完成；已知深化限制、客户端与生产验收分别保留，见 stage-b-backend-final-acceptance.md。

## 034 阶段C首批覆盖（2026-10-27）

银行流水 CSV/JSON 导入、已过账收付款的部分/批量匹配、解除匹配、连续期间银行对账、历史未达、最新对账重开及已结期间现金过账保护已补。新增权限、幂等、公司隔离和并发专项，见 stage-c-bank-reconciliation.md 与 verification.md。此为阶段C首批后端范围；银行feed、自动手续费/利息、混合收支净额、跨币种、完整报表/申报及三个客户端不在本批验收范围。历史阶段B验收记录保持其当时范围。

## 035 阶段C财务报表覆盖（2026-10-27）

R040基础利润表、资产负债表与应收/应付账龄后端API已补；采用已过账总账、历史核销/冲销与单语句快照，单列贷项并核对控制科目。现金流量表、BAS及其他完整财务报表、导出、维度、客户端与生产验收仍按原规划保留。准确范围、日期和财年口径见 stage-c-financial-reports.md；测试证据见 verification.md。

## 036 阶段C现金流覆盖（2026-10-27）

R040补齐基础直接法现金流、经营/投资/筹资分类、内部划转剔除、现金范围、未分类/迁移待确认提示及银行/总账核对。历史金额不因分类变更重记账，冲销继承、后续更正复核及并发快照已纳入测试。间接法、合并/外币、法定模板、导出/归档、真实银行feed/BAS、客户端及生产验收仍保留。准确口径及操作见 stage-c-cash-flow.md，证据见 verification.md。

## 阶段C GST/BAS 本批范围（2026-10-28）

已实施 Simpler BAS accounts method 的 G1/1A/1B、原始计税口径与调整标签、税额科目期初/本期/期末独立勾稽、申报期间及冻结修订历史。详情与 API 见 [GST/BAS](stage-c-gst-bas.md)。Full BAS、GST instalments、IAS/PAYG、向 ATO 发送申报及 ATO 结算付款不属于本批，不能据此认定整个阶段C完成。测试与实际验收记录见 verification.md 本批条目。

## 阶段C Full BAS 本批范围（2026-10-29）

已补齐 G2/G3/G10/G11、G1—G20 内部计算表、accounts/worksheet选择及来源分类；保留现金制/非现金制来源、历史 Simpler快照与期间定版/登记/重开流程。开放期间可审计切换方法，冻结保护覆盖采购总额；独立税额GL核对及历史AP采购参考勾稽。详情与未覆盖的专用GST过账、ATO发送及生产验收范围见[Full BAS](stage-c-full-bas.md)，实际验证结果见verification.md本批条目。


## 阶段C 会计关账与结转本批范围（2026-10-29）

已实现完整财年日历、会计期间预检/关账/倒序重开、库存/在途/往来/总账/GST一致性核对、不可变关账底稿、年度损益结转至留存收益及关联反向凭证。兼容现金制/非现金制 GST 和独立 BAS 期间；月结不清空业务余额，年结不抹除利润表。权限、版本、幂等、事务回滚和两种并发锁顺序覆盖见[关账说明](stage-c-period-close.md)与verification.md。正式数据库迁移、真实企业关账、生产容量/恢复和客户端界面不属于本批，不能据此认定整个阶段C完成。

## 阶段C收口核查（2026-10-29，截至039的历史核查记录）

本轮将034—039能力回填39条C相关原需求，主要更正R026（未实现→部分实现）、R028（未实现→后端已实现）和R040（部分实现→后端已实现）。R040按原行五类核心后端报表判断；通用导出、收藏/报表包分别留在原R052/R054及D的R042/R043，不用这些额外范围倒扣其已交付核心。所有跨阶段边界、待办及优先实施包见[阶段C收口核查](stage-c-acceptance.md)。

前文“030—039最新覆盖”和各切片说明为当批历史，不能按每个历史“未包含”叠加成当前缺项；当前C状态以本次逐行表和stage-c-audit.json为准。GST/BAS及关账作为用户追加的独立验收能力记录，不捏造为新增工作簿源行。此为缺口核查，阶段C后端整体仍未通过最终验收，未新增业务代码或迁移，未重跑/重签已有业务测试。

## 阶段C C01通用银行记账增量（2026-10-29，截至040）

040补齐通用银行收支、人工流水科目/GST分类及多科目拆分、成对账户转账和原日冲销；兼容银行对账、现金流、现金制/非现金制GST/BAS及会计关账。R029更新为后端已实现，R026人工分类/拆分已交付，自动规则/例外和D Feeds仍保留。当前39条C相关行：3已实现、8部分、28未实现；全部116条：26已实现、46部分、41未实现、3排除。上节039文档核查的未重跑说明为历史记录；本批新增实现和实际全量验证见[接口说明](stage-c-general-banking.md)及[验收记录](verification.md)。三个客户端及生产数据库未改。

## 阶段C C02规则与例外增量（2026-10-29，截至041）

041补齐版本化规则、优先级/启停、解释预览和分权受控执行，以及银行/期间例外清单。R027更新为后端已实现；R026的C分类切片完成，整行因D真实Feeds继续保留部分实现；R025银行Hub聚合仍留C09。当前39条为4已实现、8部分、27未实现；全116行为27已实现、46部分、40未实现、3排除。当前状态以本段及stage-c-audit.json为准，前述040统计为历史；本批实际针对性回归范围见[验收记录](verification.md)，不冒充全套用例重跑。三个客户端及正式数据库未改。

## 阶段C C03对账单及经营报告增量（2026-10-29，截至042）

042补客户对账单生成/PDF/授权邮件及采购、往来、库存/在途、银行经营报表和冻结CSV。R019、R055更新为后端已实现，R041剩C07销售事实及D工资报表；跨阶段R054由未实现更新为部分实现，未把本期CSV导出冒充完整映射导入。C相关39行：6已实现、7部分、26未实现；全116行：29已实现、46部分、38未实现、3排除。其余状态延续，前述批次统计为历史。只改htt-backend，实际验证范围见[验收记录](verification.md)。
