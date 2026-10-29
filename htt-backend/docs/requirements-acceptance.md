# 原需求逐行验收矩阵（后台范围）

初验日期：2026-10-24；029增量核查：2026-10-26。仅核查并修改 htt-backend；现有三个客户端均未联调/修改。来源中的建议和待确认内容视为参考，不自动执行，也不重新承诺人日。

原工作簿：`HTT%E4%B8%89%E7%AB%AF%E7%B3%BB%E7%BB%9F_%E5%88%A0%E5%87%8F%E4%B8%8E%E6%96%B0%E5%A2%9E%E5%8A%9F%E8%83%BD_%E5%B7%A5%E6%97%B6%E9%87%8D%E4%BC%B0_20261017.xlsx`；SHA-256 `c06eb26520401892f61655de601cb9e8e53eeddb439050259f8d6b32bffa28e1`。读取4个sheet，逐项工时重估A2:Q117共116条；保留优先级、增删边界及新功能验收口径。

阶段沿用原《HTT-AU-后台与数据库设计-v2》§13和《HTT-AU-需求追踪矩阵-v2》；并未把C/D未实现功能改列成B缺陷，也未删除B未交付项。原文件只读，未修改。

原v2矩阵SHA-256：`48ab6b6784016ba164e688543f93cf3339bbea0973e43388f48edce77d7e0b91`。

状态定义：后端已实现=该行约定的服务端能力有实现及对应测试/交付说明，不表示客户端完成；部分实现=仅满足一部分；未实现=表预留或未开发；排除=原需求边界明确排除。没有工时加权“完成率”。证据文件均相对本目录，测试索引见verification.md及stage-b-acceptance.md。

| 源行/编号 | 系统及功能 | 原优先级/范围状态 | 原阶段 | 本次结论 | 证据 | 边界/剩余事项 |
|---|---|---|---|---|---|---|
| 2 / R002 | 管理/财务端：Business/company, users, roles, permissions, audit log, global settings | P0 / 保留 | A | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-a.md](stage-a.md) | OIDC校验、成员解析、RBAC/行范围和审计已实现；真实身份提供商联调、成员/角色分配及完整全局设置管理未交付。 |
| 3 / R003 | 管理/财务端：Double-entry ledger, journal engine, posting rules, periods, balances | P0 / 保留 | A | 部分实现 | [stage-b-reconciliation.md](stage-b-reconciliation.md)；[stage-a.md](stage-a.md) | 自动Journal、开放期间保护、不可变过账及控制一致性已实现；完整期初迁移、期间关闭管理流程和余额报表未交付。 |
| 4 / R004 | 管理/财务端：Tax codes, GST calculation, inclusive/exclusive tax, reporting mappings | P0 / 保留 | A | 部分实现 | [stage-b-invoicing.md](stage-b-invoicing.md)；[stage-b-supplier-payments.md](stage-b-supplier-payments.md) | AU税码、金额计算、CASH/NON_CASH归属及冲销已实现；完整BAS/IAS、税务申报版本及独立预付税票未交付。 |
| 5 / R005 | 管理/财务端：KPIs, income/expense charts, financial position, tasks/up-next | P1 / 保留 | C | 未实现 | — | 后端无经营Dashboard/KPI接口；按原矩阵列C。 |
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
| 19 / R019 | 管理/财务端：Generate, print/PDF/email statements | P2 / 保留 | C | 未实现 | — | 客户对账单生成、PDF/邮件未交付；原矩阵属C。 |
| 20 / R020 | 管理/财务端：Bill CRUD, supplier invoice, lines, GST, attachments/status | P0 / 保留 | B | 部分实现 | [stage-b-supplier-bills.md](stage-b-supplier-bills.md) | 已实现收货精确匹配、GRNI/AP/GST及原单贷项；021补独立费用账单、费用/AP/进项GST及共用付款/预付核销，见stage-b-expense-bills.md。022补原费用贷项、退款与费用/AP/GST冲销。费用草稿CRUD、自由价格/税额差异流程及账单附件管理仍待后续。 |
| 21 / R021 | 管理/财务端：PO CRUD, delivery, convert to bill | P1 / 保留 | B | 后端已实现 | [stage-b-purchasing.md](stage-b-purchasing.md)；[stage-b-supplier-bills.md](stage-b-supplier-bills.md)；[stage-b-documents.md](stage-b-documents.md) | PO草稿、确认、分批收货、精确匹配账单及关闭余量已实现；017补正式PO的PDF/邮件与附件，仍只接受精确匹配。 |
| 22 / R022 | 管理/财务端：Allocate payments, partial/multiple bills, remittance | P0 / 部分缩减 | B | 后端已实现 | [stage-b-supplier-payments.md](stage-b-supplier-payments.md) | 人工核实付款、多账单分配、预付核销和现金制进项GST已实现；026补付款撤销/关联重核销/一步更正、预付整笔解除及重新核销，兼容原供应商贷项抵扣/退款，见[供应商结算更正](stage-b-supplier-settlement-reversals.md)。汇款通知/打印按源边界排除。 |
| 23 / R023 | 管理/财务端：Supplier debits, apply debit, supplier refunds | P1 / 保留 | B | 后端已实现 | [stage-b-purchase-returns.md](stage-b-purchase-returns.md)；[stage-b-credit-applications.md](stage-b-credit-applications.md) | 原收货退货、来源贷项、供应商/预付退款已实现；022补独立费用账单来源的金额贷项、退款及费用/AP/GST冲销，见stage-b-expense-credits.md。023已补同供应商/party可用贷项跨账单抵扣及整笔解除，含AP/GST、权限、幂等和并发；限制实际未退款/未转用余额，目标已退款或转用导致资金不足时拒绝解除。 028已补供应商退款撤销、关联替代及一步金额/合法来源更正，兼容有效AP/预付余额、付款撤销/核销与供应商贷项抵扣及进项GST，见[退款更正](stage-b-supplier-refund-corrections.md)。 |
| 24 / R024 | 管理/财务端：Templates, schedules, auto-generate invoices/bills/transactions | P2 / 保留 | D | 未实现 | — | Recurring模板/调度/自动生成未实现；原矩阵属D。 |
| 25 / R025 | 管理/财务端：Accounts, balances, feeds status, attention items | P0 / 保留 | B/C | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-receipts.md](stage-b-receipts.md) | 已有默认Bank总账科目及收付款自动分录；无独立银行账户档案/账户选择、register/Hub，不能把COA当银行模块完成。 |
| 26 / R026 | 管理/财务端：Import/feed transactions, categorise, match, split | P0 / 保留 | C/D | 未实现 | — | 银行流水导入、分类、匹配、拆分和Feeds未实现；原矩阵属C/D。 |
| 27 / R027 | 管理/财务端：Condition/action rules, enable/disable, auto-categorisation | P1 / 保留 | C | 未实现 | — | 银行规则及版本、命中解释未实现；C。 |
| 28 / R028 | 管理/财务端：Statement reconciliation, transaction selection, difference=0 completion | P0 / 保留 | C | 未实现 | — | 银行statement核对、未达及差异零锁定未实现；本批控制一致性报告不是银行对账；C。 |
| 29 / R029 | 管理/财务端：Spend money, receive money, account transfers | P1 / 部分缩减 | C | 未实现 | — | 通用Receive Money、流水分类及成对银行转账未实现；客户收款不能替代通用银行收入；C。 |
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
| 40 / R040 | 管理/财务端：P&L, Balance Sheet, Cash Flow, Trial Balance, GL | P0 / 保留 | C | 部分实现 | [stage-c-financial-reports.md](stage-c-financial-reports.md) | GL/TB、利润表、资产负债表、直接法现金流及历史AR/AP账龄API已交付；法定模板、导出、客户端与生产验收仍待后续。 |
| 41 / R041 | 管理/财务端：Sales, purchases, receivables/payables, payroll, banking | P1 / 保留 | C/D | 部分实现 | [stage-b-invoicing.md](stage-b-invoicing.md)；[stage-b-supplier-bills.md](stage-b-supplier-bills.md) | 有单据、AR/AP/GRNI/GST来源查询；完整账龄/业务报表及导出未交付；C/D。 |
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
| 52 / R052 | 管理/财务端：Search/filter/sort/pagination/columns/bulk/export | P0 / 保留 | A起贯穿 | 部分实现 | [master-data-api.md](master-data-api.md) | 列表稳定分页与部分过滤已实现；完整白名单搜索排序/批量/导出契约未实现。 |
| 53 / R053 | 管理/财务端：System reminders, due items, action centre | P2 / 部分缩减 | C | 未实现 | [stage-a.md](stage-a.md) | Outbox基础消费者不等于业务Task/推送；C。 |
| 54 / R054 | 管理/财务端：CSV import mapping/validation/errors + data exports | P1 / 保留 | A起贯穿 | 未实现 | — | CSV映射/预览/逐行错误和业务数据导出未实现；受控期初CLI不是通用导入。 |
| 55 / R055 | 管理/财务端：Invoice/quote/PO/statement/remittance document generation | P1 / 部分缩减 | B/C | 部分实现 | —；[stage-b-documents.md](stage-b-documents.md) | 017已实现报价/发票/PO固定版本模板、PDF生成及邮件接受回执；statement仍属C待交付；自定义模板管理未提供，Remittance/收据专用模板仍排除。 |
| 56 / R056 | 管理/财务端：Unit/integration/E2E, permission tests, financial regression, security hardening | P0 / 保留 | 全阶段 | 部分实现 | [verification.md](verification.md)；[stage-b-acceptance.md](stage-b-acceptance.md)；[stage-b-documents.md](stage-b-documents.md) | 真实PostgreSQL权限/幂等/并发/财务回归及017文档/协议/重试专项已实现；客户端E2E、真实外部身份/发件服务及生产安全/容量验收未完成。 |
| 57 / R057 | 管理/财务端：CI/CD, environments, backup, logging, monitoring, release | P0 / 保留 | A起贯穿 | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-documents.md](stage-b-documents.md) | Docker/迁移/健康检查/日志/测试脚本及017PDF运行时镜像已验证；正式CI/CD、云部署、监控告警、备份恢复和真实扫描/发件运营未验收。 |
| 58 / S-01 | 销售端：销售人员登录 | P0 / 保留 | A | 部分实现 | [stage-a.md](stage-a.md) | 员工JWT及DB成员权限校验已实现；真实身份提供商、移动登录联调未完成。 |
| 59 / S-02 | 销售端：销售工作台 | P1 / 保留 | C | 未实现 | — | 销售工作台聚合接口未实现；C。 |
| 60 / S-03 | 销售端：按客户名、编号、门店、联系人、电话或Email搜索；支持最近访问、区域/状态筛选。 | P0 / 保留 | A/B | 部分实现 | [master-data-api.md](master-data-api.md) | 客户名称/编号搜索及授权范围已实现；跨门店/联系人/电话/email搜索、最近访问、区域筛选未实现。 |
| 61 / S-04 | 销售端：查看客户主体、关联门店及各门店多个联系人；显示姓名、职位、电话、Email、地址、销售负责人和会计联系人。 | P0 / 保留 | A/B | 部分实现 | [master-data-api.md](master-data-api.md) | 客户、门店、多联系人/会计联系方式查询已实现；销售负责人展示/完整聚合接口未实现。 |
| 62 / S-05 | 销售端：客户Notes | P0 / 保留 | C | 未实现 | — | 客户Notes未实现；C。 |
| 63 / S-06 | 销售端：展板信息 | P1 / 保留 | C | 未实现 | — | 展板资料未实现；C。 |
| 64 / S-07 | 销售端：查看当前客户对应的产品价格；支持标准价、逐客户专属价、活动特价及最终销售价。 | P0 / 保留 | A/B | 后端已实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 授权客户价格解析，支持标准/客户/活动与最终价；客户端展示未联调。 |
| 65 / S-08 | 销售端：订单摘要 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 授权客户订单列表及详情已实现；客户端摘要展示未联调。 |
| 66 / S-09 | 销售端：客户地图 | P0 / 保留 | C | 未实现 | — | 客户地图/地理编码未实现；C。 |
| 67 / S-10 | 销售端：地图筛选 | P1 / 保留 | C | 未实现 | — | 地图筛选未实现；C。 |
| 68 / S-11 | 销售端：地图导航 | P1 / 保留 | C | 未实现 | — | 导航适配未实现；C。 |
| 69 / S-12 | 销售端：Check-in | P0 / 保留 | C | 未实现 | — | Check-in未实现；C。 |
| 70 / S-13 | 销售端：Check-out | P0 / 保留 | C | 未实现 | — | Check-out未实现；C。 |
| 71 / S-14 | 销售端：拜访历史 | P1 / 保留 | C | 未实现 | — | 拜访历史未实现；C。 |
| 72 / S-15 | 销售端：创建Task | P0 / 保留 | C | 未实现 | — | Task创建未实现；C。 |
| 73 / S-16 | 销售端：Task列表 | P0 / 保留 | C | 未实现 | — | Task列表未实现；C。 |
| 74 / S-17 | 销售端：完成/更新Task | P0 / 保留 | C | 未实现 | — | Task更新/完成未实现；C。 |
| 75 / S-18 | 销售端：Task/Note推送 | P1 / 保留 | C | 未实现 | — | Task/Note真实推送未实现；C。 |
| 76 / S-19 | 销售端：系统消息中心 | P2 / 保留 | C | 未实现 | — | 系统消息中心未实现；C。 |
| 77 / S-20 | 销售端：销售扫描客户名片，识别姓名、公司/门店、电话、Email并生成联系人草稿。 | P1 / 保留 | C | 未实现 | — | 名片OCR/草稿确认未实现；C。 |
| 78 / S-21 | 销售端：手工新增客户、门店或联系人，并关联到已有客户主体。 | P1 / 保留 | C | 部分实现 | [master-data-api.md](master-data-api.md) | 办公室主数据正式维护已实现；销售草稿提交/办公室审核流程未实现，SALES无正式主数据写权限；C。 |
| 79 / S-22 | 销售端：移动端Note、Task、拜访、客户/门店/联系人草稿及通讯录导入结果同步到管理平台。 | P0 / 保留 | C | 未实现 | — | CRM移动操作ID同步、游标/tombstone/冲突处理未实现；C。 |
| 80 / S-23 | 销售端：销售通过SKU、名称、条码快速查询商品库存。 | P0 / 保留 | B | 部分实现 | [stage-b-sales.md](stage-b-sales.md) | 员工商品分页/按productId库存读取已实现；SKU/名称/条码快速搜索接口未完成。 |
| 81 / S-24 | 销售端：门店/仓库库存 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md)；[stage-b-reconciliation.md](stage-b-reconciliation.md) | 授权仓库实物/预留/可售及dataAsOf已实现；停用可售错误本批修复；客户端展示未联调。 |
| 82 / S-25 | 销售端：从客户/门店详情进入库存时自动展示该客户实际销售价格及当前有效活动价。 | P0 / 保留 | B | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 价格解析和库存查询分别可用；无客户上下文的库存+价格聚合接口，三个客户端未接入。 |
| 83 / S-26 | 销售端：销售从客户+门店+商品创建Quotation，录入包数或m²、价格、折扣、备注。 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 客户/门店报价、数量或面积输入、后台定价/折扣/备注及底价权限已实现；客户端录入未联调。 |
| 84 / S-27 | 销售端：报价列表/详情 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 授权报价列表/详情/状态已实现。 |
| 85 / S-28 | 销售端：报价草稿与提交 | P1 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 草稿、提交、正式编号、不可变快照和修订已实现。 |
| 86 / S-29 | 销售端：照片/附件 | P2 / 保留 | B/C | 部分实现 | [stage-a.md](stage-a.md)；[stage-b-documents.md](stage-b-documents.md) | 017已实现报价单据附件上传/扫描/授权访问；其他CRM照片及仓管交接凭证流程未接入。 |
| 87 / S-30 | 销售端：弱网缓存 | P2 / 保留 | C | 未实现 | — | 客户端离线缓存及同步协议未交付；C。 |
| 88 / S-31 | 销售端：销售数据隔离 | P0 / 保留 | A起贯穿 | 后端已实现 | [stage-a.md](stage-a.md)；[stage-b-sales.md](stage-b-sales.md) | 公司及销售授权客户隔离，成本另授权；未来接口仍须单独验证。 |
| 89 / S-32 | 销售端：操作记录 | P0 / 保留 | A起贯穿 | 部分实现 | [stage-a.md](stage-a.md) | 已交付命令的操作者/请求/版本及审计已实现；移动设备上下文、业务日志聚合未完整交付。 |
| 90 / S-33 | 销售端：销售端直接创建Invoice | OUT / 保留 | 排除 | 排除 | [stage-b-invoicing.md](stage-b-invoicing.md) | 销售不能直接创建Invoice，权限测试覆盖；源优先级OUT覆盖保留标签。 |
| 91 / S-40 | 销售端：Quotation草稿编号策略 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 草稿UUID不占正式号；提交事务编号、重试同号。 |
| 92 / S-41 | 销售端：Quotation编号配置 | P1 / 保留 | A/B | 部分实现 | [stage-b-sales.md](stage-b-sales.md) | 公司级序列及前缀已实现；办公室编号规则配置API未交付。 |
| 93 / S-42 | 销售端：Quotation提交失败保护 | P0 / 保留 | B | 后端已实现 | [stage-b-sales.md](stage-b-sales.md) | 提交失败事务回滚、幂等摘要、草稿保留与结果查询已实现。 |
| 94 / S-43 | 销售端：销售员授权后从手机通讯录选择联系人导入 | P0 / 保留 | C | 未实现 | — | 通讯录授权选择、预览去重确认及导入未实现；C。 |
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
| 110 / R110 | 管理/财务端：客户返点规则与结算 | P1 / 新增 | C/D | 未实现 | — | 返点规则/计提/审批/结算未实现；C/D。 |
| 111 / R111 | 管理/财务端：销售代表分红/佣金 | P1 / 新增 | C/D | 未实现 | — | 佣金归属/计提/审批/结算未实现；C/D。 |
| 112 / R112 | 管理/财务端：客户×产品销量趋势分析 | P1 / 新增 | C | 未实现 | — | 客户×SKU净销量趋势未实现；C。 |
| 113 / R113 | 管理/财务端：办公室统一客户视图 | P1 / 新增 | C | 部分实现 | [master-data-api.md](master-data-api.md)；[stage-b-sales.md](stage-b-sales.md) | 办公室全客户及报价/订单查询已实现；Notes/拜访/趋势未实现；C。 |
| 114 / R114 | 销售端：客户产品销售曲线（销售端） | P1 / 新增 | C | 未实现 | — | 销售授权客户销量曲线未实现；C。 |
| 115 / R115 | 销售端：返点/佣金展示（授权范围） | P1 / 新增 | C | 未实现 | — | 授权返点/本人佣金展示接口未实现；C。 |
| 116 / R116 | 销售端：客户销售资料办公室同步完善 | P1 / 新增 | C | 部分实现 | [master-data-api.md](master-data-api.md) | 单套正式主数据可由办公室维护；销售CRM资料/拜访/Note同步完善未实现；C。 |
| 117 / R117 | 管理/财务端：返点与佣金结算回归测试 | P1 / 新增 | C/D | 未实现 | — | 返点/佣金去重、跨期冲回/结算专项未实现；C/D。 |

## 完整性核对

116源行一一对应，无漏行/重复。后台状态数量：后端已实现 21；排除 3；未实现 55；部分实现 37。这些是需求行数量，不是项目进度百分比。

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
