# HTT Management 全流程验收与缺口清单

验收日期：2026-10-21。当前项目版本 0.1.0，G17 后持久化结构版本 31；原始审查快照为版本 23。

## 进度更新

- **G01 已完成**：Dashboard 已接入共享对账链和已导入流水校验，异常时显示待复核，不采信清除标记或最后对账日期，实际余额保持。详见 [G01 验证记录](G01-DASHBOARD-BANK-EVIDENCE.md)。
- **G02 已完成**：报价和直接销售订单/发票已保存明确取价时刻及时区，促销按开始包含/结束排除，主进程核算及历史快照验证通过。详见 [G02 验证记录](G02-PRICING-INSTANT.md)。
- **G03 已完成**：新增多项来源汇总、唯一既有结果绑定和完整采购过账元数据的受控批量修复，包含独立审批、旧计划留存、摘要失效、回滚／重启和审计。详见 [G03 验证记录](G03-SOURCE-REPAIR.md)；冲突或缺少原始财务证据仍保持阻止。
- **G04 已完成**：仅 ADMIN 可预览并永久清理五类已回收且无引用的草稿；清理前自动验证完整备份，保留审计、原编号及创建请求，整批回滚／重启重试已验证。已过账单据继续作废／冲销。详见 [G04 验证记录](G04-RECYCLE-PURGE.md)。
- **G05 已完成**：发票／费用／银行周期模板支持本地到期扫描、原日期顺序补跑、20 条上限、权限隔离、持久化错误队列和显式重试。自动生成只到草稿，银行草稿另经人工审核／批准／过账。详见 [G05 验证记录](G05-RECURRING-AUTOMATION.md)。
- **G06 已完成**：银行规则支持复合条件、银行范围、明确优先级、同优先级冲突阻止、导入时自动保存待审核分类、批量预览／撤回和审计。人工过账前重新核对来源、规则与重复风险，不自动过账。详见 [G06 验证记录](G06-BANK-RULES.md)。
- **G07 已完成**：优先支持 CommBank／CommBiz 自平衡 ABA，供应商批次与整批未付工资净额的预览、独立审批、固定文件导出／作废、本地付款登记／冲销和恢复保护已接通；不执行银行支付。详见 [G07 验证记录](G07-BANK-INSTRUCTIONS.md)。
- **G08 已完成**：工时接入授权项目与版本快照，时薪／薪资及雇主供款成本从冻结工资分录归属项目，保留未分配、反向冲销和历史名称，阻止重复手工分配。详见 [G08 验证记录](G08-PAYROLL-PROJECTS.md)。
- **G09 已完成**：本地 PNG 校验／规范化存储、权限与版本审计、销售／采购单据及报表品牌快照已接通，独立 HTML／PDF 保留历史图片。详见 [G09 验证记录](G09-BRANDING.md)。
- **G10 已完成**：独立采购期限／付款偏好设置接入新采购单、库存及费用账单，保留来源快照，权限、并发、失败回滚和重启已验证。详见 [G10 验证记录](G10-PURCHASE-SETTINGS.md)。
- **G11 已完成**：独立报表默认口径／银行币种偏好／表头／金额精度接入支持的页面和输出；每份报表声明实际口径，生成副本冻结设置，权限、并发、重启及打印已验证。详见 [G11 验证记录](G11-REPORT-SETTINGS.md)。
- **G12 已完成**：逐表声明列、跨页选择、完整筛选导出及权限；七类配置状态支持主进程预览、版本校验、原子批次、幂等和审计。详见 [G12 验证记录](G12-TABLE-CAPABILITIES.md)。
- **G13 已完成（macOS 本地英文票据范围）**：图像/扫描 PDF 识别、原件及置信文本留存、字段建议与人工复核、重复阻止及正常费用草稿已接通；不自动入账。详见 [G13 验证记录](G13-LOCAL-DOCUMENT-RECOGNITION.md)。
- **G14 已完成**：当前能力/文档索引统一，60 份文档标明时点；真实入口、目录权限、全局环境与演示说明已收口，旧预览隔离并加入链接/依赖图检查。详见 [G14 验证记录](G14-CURRENT-GUIDANCE.md)。
- **G15 本地验收基线已完成**：七角色×210路由自动矩阵、流程状态测试索引及23项真实原生用例分别记录；修复报表/菜单/银行入口权限和窄屏页头。详见 [G15 范围与证据](G15-DESKTOP-ACCEPTANCE.md)，不把自动渲染写成人工全状态点验。
- **G16 部分完成**：固定环境/精确依赖、仓库根目录 CI、正式签名门禁、有限轮转诊断日志及 macOS arm64 未签名 DMG 安装/同结构替换/恢复/回退演练完成；补充完成 Windows x64 NSIS 交叉构建、三目标包结构检查、x64/Rosetta 登录及 OCR 实测，并修复 Windows 误带 Mac helper 和翻译模式识别失败。无有效签名身份，远程 CI、Windows/Intel Mac 原生运行及正式签名/公证验收仍未关闭。详见 [G16 发布准备](G16-RELEASE-READINESS.md)。
- **G17 已完成**：财务总控纳入同日库存到 GL，金额差额和完整性失败计入总状态；审查链接保留日期，错误显示不可用金额，主进程关账拦截及审计保持。详见 [G17 验收记录](G17-INVENTORY-FINANCE-CONTROL.md)。
- 当前待关闭工作包：**1 项本地交付验收，3 项外部边界**。原始审查快照保留；CSV currentStatus/followUp 记录进展。G16 正式发布验收仍未完成。

## 原始验收结论

**本地核心业务主链具备实现与回归证据，但不能宣布原始需求全部完成或正式上线验收通过。** 本次对照管理财务端 54 条模块需求逐条建立映射：本地范围已验证 31 条；部分实现 20 条；外部接口未接入 1 条；交付验收未完成 2 条。这些是模块粒度的范围分类，不是完成百分比，也不是独立流程数量。

确认的收口清单为 **17 个本地功能/质量/交付工作包、3 个外部连接边界**。外部边界不要求本轮接入后台；实现了本地替代流程不等于完成原表中的外部通信要求。年度结转等扩展另外列出，不混入原表未完成数量。

完整附件：[54 条需求映射](acceptance-20261021/requirements.csv)、[20 项缺口与外部边界](acceptance-20261021/gaps.csv)、[验收证据与复现结果](acceptance-20261021/evidence.json)、[1550 项测试清单](acceptance-20261021/test-cases.json)。

## 本次实际执行

- 在实际项目重新运行完整测试：**122 个测试文件，1550 项通过，0 失败，0 跳过，170.17 秒**。JSON 中的 199 是嵌套测试组，不是文件数。
- TypeScript、Vite renderer、Electron main/preload 生产构建通过。大分块提示仍为警告。
- 核查现有路由、主进程命令授权、Repository/Service、持久化/审计和测试证据。每条需求的相关测试在 `requirements.csv`，所有本次运行用例在 `test-cases.json`。
- 额外在一次性代码副本中运行两个诊断复现：Dashboard 异常对账信任、日期促销取价。复现结果进入 `evidence.json`；诊断没有作为正常通过测试加入实际项目，也没有修复这两项。
- 原生 Electron 使用合成档案完成客户审核以及对账/关账/反关账/重启链。实际业务档案未用于测试；只在测试档案里新增客户、期间和对账记录，原分录逐项比对不变。
- 成功生成 macOS arm64 未签名目录应用包，保存在临时目录，不发布、不替换用户安装。打包版本原生登录、Dashboard 3010.00/零未清除、期间 OPEN/三条历史读取已确认。首次操作有一次较长的工具等待，启动性能未独立测定。其余平台与正式发行仍待验收。
- 本轮只交付验收文档和证据，没有悄悄把发现的问题标成已修复。自动化通过只证明用例覆盖的行为，不能抵消原始需求缺项。

## 需求基线和范围

原表：[完整系统功能需求与开发周期评估.xlsx](/Users/chandler/Documents/HTTFlooring/完整系统功能需求与开发周期评估.xlsx)，`管理财务端需求!A2:I55`，并交叉检查核心业务规则及共享能力。文件 SHA256：`c03cf90f0eb92d0e4cb13d7b926d365226529747ac2e8e193566dd7788a82ff1`。旧路径已失效，使用用户确认的 Documents/HTTFlooring 路径；原表未修改。

“本地范围已验证”表示现有本地实现的支持范围与相关自动测试吻合；不表示这条需求所有跨端、外部连接和桌面状态已验证。销售 App、客户门户、移动地图/通讯录/离线同步及三端服务的数据隔离不属于当前管理端桌面实现。当前架构仍为本地可信主进程，不新增独立后台。

## 原生桌面操作记录

### 客户审核闭环

1. 从页面目录进入 Customer & contact review，创建合成客户草稿，保存为 Pending revision 1。
2. 刷新重复比较，确认无匹配，填写依据并批准。显示 Approved revision 2 和可信操作者/时间。
3. 从结果打开客户主数据，显示 CUST-0006、测试邮箱和原有账期；重启并重新登录后，客户仍在列表。

### 银行对账与期间闭环

1. 创建 2026-10-01 至 2026-10-20 的合成期间。首次预检显示 BANK_NOT_RECONCILED。
2. 银行登记簿保留四条行，包括两个内部抵销行；对账选择区只有两个真实流水。
3. 输入期末余额 3010.00。未勾选时差额 3010.00，勾选第一笔后差额 10.00，全部真实流水勾选后差额 0.00，才能完成对账。
4. 保存 BREC-2026-0001。再次关账预检通过：5 笔分录，借贷各 8873.75；先 CLOSED，再填写原因反关账为 OPEN。
5. 重启后 Dashboard 显示 0 未清除、最后对账 2026-10-20；期间 OPEN、历史 3 条。原始分录与测试前完全一致。

这两条是本次新做的原生交互闭环。其它模块的业务验收依据是本次全量自动化与代码核查，不能写成所有角色、所有页面都重新人工点过。

## 54 条需求映射

| 原表行 | 模块 | 当前结论 | 范围与缺口 |
|---|---|---|---|
| 2 | Identity & Business | 本地范围已验证 | 本地用户、角色、主进程权限、成本字段隔离、审计与配置；三端统一服务另列边界。  |
| 3 | Accounting Engine | 本地范围已验证 | 复式记账、源业务入账、期间锁及反关账；年度结转属于另列扩展。  |
| 4 | Tax Engine | 本地范围已验证 | 税码、含税/未税、历史税率及科目/报表映射已接通；不是电子税务申报。  |
| 5 | Dashboard | 部分实现 | 指标和任务读取本地账簿；异常历史对账仍可被看作已清除，已复现。 G01 |
| 6 | Contacts | 本地范围已验证 | 客户供应商主数据、默认字段与CSV导入导出已接通；审核创建客户已桌面验证。  |
| 7 | Products & Inventory | 本地范围已验证 | 库存/服务商品、买卖限制、补货参数、库存成本与估值已接通；参数不自动生成采购。  |
| 8 | Customer Pricing | 部分实现 | 客户专属价、折扣及促销时间戳引擎具备；单据只有日期时按UTC零点取价，日内促销链不足。 G02 |
| 9 | Unit Conversion | 本地范围已验证 | 包与面积双向换算、整包限制和原始覆盖快照具备自动化证据。  |
| 10 | Contact Hierarchy | 本地范围已验证 | 客户/门店/联系人层级、会计收件人及单据快照已接通。  |
| 11 | Quotes | 部分实现 | 报价状态、转订单及本地版本/PDF准备已接通；实际邮件送达未接入。 E01 |
| 12 | Sales Orders | 本地范围已验证 | 订单独立状态、后台授权创建、发货及转发票已接通。  |
| 13 | Invoices | 部分实现 | 发票、税额、附件、历史及本地PDF准备已接通；邮件送达缺失。 E01 |
| 14 | Customer Payments | 本地范围已验证 | 部分/多发票收款、余额、幂等与反向处理已有本地闭环。  |
| 15 | Recycle Bin | 部分实现 | 仅五种合格草稿软删除/恢复；没有永久清理，已入账单据保留作废/冲销。 G04 |
| 16 | Credits & Refunds | 本地范围已验证 | 贷项、核销、退款、实物退货、订金应用及退款已形成受控本地闭环。  |
| 17 | Customer Statements | 部分实现 | 客户对账单和本地打印/PDF已有；邮件发送未接入。 E01 |
| 18 | Bills | 本地范围已验证 | 采购收货账单与费用/服务账单、税额、附件及作废已接通。  |
| 19 | Purchase Orders | 本地范围已验证 | 采购单、收货、账单匹配与本地单据输出已接通。  |
| 20 | Supplier Payments | 本地范围已验证 | 部分/多账单付款、付款通知和批次本地记账已接通；银行指令另列。  |
| 21 | Debits & Refunds | 本地范围已验证 | 供应商贷项核销、退款、实物退货及预付款回收具备本地闭环。  |
| 22 | Recurring Transactions | 部分实现 | 定期发票/费用草稿可手动生成、暂停/恢复；无后台定时运行或银行交易模板。 G05 |
| 23 | Bank Accounts & Hub | 部分实现 | 银行账户、余额和本地流水已有；真实银行feed状态/连接尚未接入。 E02 |
| 24 | Bank Transactions | 部分实现 | CSV导入、匹配、拆分及分类已接通；外部feed未接入。 E02 |
| 25 | Bank Rules | 部分实现 | 规则保存、启停、匹配及手动应用已有；没有自动分类执行与完整复合规则流程。 G06 |
| 26 | Reconciliation | 本地范围已验证 | 零差额、清除去重、历史链、异常证据、期间锁和恢复均有证据；本次完成桌面对账。  |
| 27 | Money In/Out & Transfers | 本地范围已验证 | 本地收入/支出/银行转账、幂等、期间限制与冲销校验已接通；不会发出真实付款。  |
| 28 | Electronic Payments | 部分实现 | 供应商批次及工资付款本地记录已有；无工资批次银行文件和ABA等银行指令输出。 G07 |
| 29 | Chart of Accounts | 本地范围已验证 | 科目类型/控制保护、银行映射及多子账一致的期初导入已接通。  |
| 30 | Posting Account Mappings (Linked Accounts) | 本地范围已验证 | 销售/采购/工资科目映射及已使用控制账户保护已有。  |
| 31 | Jobs | 本地范围已验证 | 已入账收入/成本分摊、反向继承、项目预算与利润报告已接通。  |
| 32 | General Journal | 本地范围已验证 | 手工分录借贷验证、过账与受控冲销已有；系统分录由源业务拥有。  |
| 33 | Employees | 本地范围已验证 | 员工雇佣、工资、银行、税务、假期和退休金字段及权限已有。  |
| 34 | Pay Items | 本地范围已验证 | 工资项目、津贴/扣款/税/雇主贡献及有边界的AU计算已有；复杂规则需人工复核。 S02 |
| 35 | Pay Runs | 本地范围已验证 | 工资审核、快照、入账、工资单、已支付款记录和冲销已接通；不是全情形法定引擎。 S02 |
| 36 | Timesheets | 部分实现 | 工时审批并入工资计算已具备；TimeRow无项目引用，工时到项目维度未接通。 G08 |
| 37 | Payroll Filing | 外部接口未接入 | 仅申报复核表和外部回执引用；没有STP/SuperStream通信及受理结果。 E03 |
| 38 | Core Financial Reports | 本地范围已验证 | P&L/BS/TB/GL与本地现金工作表已有；现金报表明确单币种及分类边界。  |
| 39 | Operational Reports | 本地范围已验证 | 销售采购净额、AR/AP、工资及银行运营报表使用本地业务数据。  |
| 40 | Custom/Favourite Reports | 本地范围已验证 | 保存结构化条件、允许列顺序、收藏、运行及完整CSV已有；可执行数据集有明确范围。  |
| 41 | Report Packs | 本地范围已验证 | 组合报告、封面目录、排序、CSV和打印保存PDF已有；生成副本不自动归档。  |
| 42 | Uploads & Attachments | 本地范围已验证 | 真实文件、对象权限、版本、预览/导出、回收和备份已有。  |
| 43 | Document Capture/OCR | 部分实现 | 手工/CSV票据金额核对及费用草稿创建已有；自动图片/PDF文字与字段提取未实现。 G13 |
| 44 | Business Settings | 部分实现 | 公司、地址、财年和税设置已有；真实品牌Logo上传到单据/报表的链路未接通。 G09 |
| 45 | Sales Settings | 部分实现 | 销售编号、期限和模板已有；实际邮件、自动催款、在线支付连接未完成。 E01 |
| 46 | Purchase Settings | 部分实现 | 采购编号已有；入口复用财务设置，独立采购默认期限/付款偏好未形成完整保存和应用链路。 G10 |
| 47 | Payroll Settings | 部分实现 | AU工资周期、默认科目与本地银行记录已有；电子申报连接配置未接通。 E03 |
| 48 | Report Settings | 部分实现 | 全局币种/部分报表上下文已有；报表设置复用财务表单，基础/表头/精度默认项未完整落地。 G11 |
| 49 | Global Search | 本地范围已验证 | 授权范围内跨11类记录搜索、条件、分页和源记录导航已有。  |
| 50 | Reusable Data Tables | 部分实现 | 共享表格搜索/排序/分页已有；统一列设置、批量动作和导出契约未齐，部分模块各自实现。 G12 |
| 51 | Notifications & Tasks | 本地范围已验证 | 本地逾期AR/AP、到期任务、跟进与可信完成历史已有；外部推送不是本地能力。  |
| 52 | Import/Export | 本地范围已验证 | 五类主数据CSV映射、验证、原子导入、去重、导出与审计收据已有。  |
| 53 | PDF/Email Templates | 部分实现 | 销售四类单据及PO/付款通知本地不可变版本已有；邮件送达及品牌图片链路未完整。 E01 / G09 |
| 54 | Testing & Security | 交付验收未完成 | 本次122文件1550用例通过并做代表性原生闭环；不是全角色全状态或跨平台发布验收。 G15 / G17 |
| 55 | Deployment & Observability | 交付验收未完成 | 本地备份、审计、原子恢复及macOS arm64目录打包已有；CI/签名/公证/安装升级/Windows发布与监控仍未验收。 G16 |

## 统一缺口登记

优先级是本次建议顺序，原需求优先级另保留在 requirements.csv。缺口记录按工作包收口；后续只能在补齐验收条件并留下证据后关闭，不以新增页面或测试总数增长代替完成。

### G01 Dashboard历史对账证据（本地缺口，P1）

- 现状：financeOverview.ts直接汇集历史清除ID，没有调用共享对账链验证；复现difference=1的记录仍显示0未清除与最后对账日期。
- 验收退出条件：Dashboard复用可信链证明，异常时显示待复核且不信任清除标记；保留原始账簿金额。
- 证据：[src/features/dashboard/data/financeOverview.ts](../src/features/dashboard/data/financeOverview.ts)

### G02 日内促销与单据取价时间（本地缺口，P1）

- 现状：显式时间戳10:00命中09:00–18:00活动价45，日期同天却按UTC零点返回50；单据传documentDate。
- 验收退出条件：定义并保存取价时刻及时区，检验开始/结束边界和历史快照；不能无声重算旧单。
- 证据：[src/features/business-workspace/configurationState.ts](../src/features/business-workspace/configurationState.ts), [src/features/sales/data/salesPricingService.ts](../src/features/sales/data/salesPricingService.ts)

### G03 多缺陷与非银行定向恢复（本地缺口，P1）

- 现状：目前定向动作主要覆盖银行孤立问题；缺绑定、冲突来源、多个财务错误及部分销售/采购异常仍依赖有效备份。
- 验收退出条件：补充有明确前后证据的源业务修复；独立审批、摘要失效、回滚、重启与审计需验证；不以重放或平账掩盖。
- 证据：[electron/security/targetedFinancialRepair.ts](../electron/security/targetedFinancialRepair.ts), [docs/TARGETED-FINANCIAL-REPAIR.md](../docs/TARGETED-FINANCIAL-REPAIR.md)

### G04 回收站范围与永久清理（本地缺口，P1）

- 当前状态：**已完成（2026-10-22）**。以下现状保留为原始审查快照；实现、保留边界和验证见 [G04](G04-RECYCLE-PURGE.md)。

- 现状：实际仅五类合格草稿可回收恢复；无原表要求的Admin永久清理，不能声称Invoice/Order/Credit全部删除闭环。
- 验收退出条件：明确可清理非财务对象及引用边界，加入Admin限制、审计、备份与原子批次保护；保留已过账作废/冲销。
- 证据：[docs/DOCUMENT-RECYCLE-BIN.md](../docs/DOCUMENT-RECYCLE-BIN.md), [electron/security/documentRecycleRepository.ts](../electron/security/documentRecycleRepository.ts)

### G05 周期业务自动执行（本地缺口，P2）

- 当前状态：**已完成（2026-10-22，本地桌面范围）**。以下现状保留为原始审查快照；定时扫描、停机补跑、错误队列、银行模板及验证见 [G05](G05-RECURRING-AUTOMATION.md)。

- 现状：只能手动生成发票/费用草稿，无后台调度、银行交易模板；暂停恢复和幂等已有。
- 验收退出条件：实现本地到期扫描、停机补跑策略、错误队列、顺序/幂等；生成仍经过正常审批。
- 证据：[docs/RECURRING-TRANSACTIONS.md](../docs/RECURRING-TRANSACTIONS.md), [src/features/recurring](../src/features/recurring)

### G06 银行规则自动分类（本地缺口，P2）

- 当前状态：**已完成（2026-10-22，本地待审核分类范围）**。以下现状保留为原始审查快照；复合条件、优先级／冲突、自动分类和验证见 [G06](G06-BANK-RULES.md)。

- 现状：规则用于建议和手动应用，没有完整复合条件及自动执行流程。
- 验收退出条件：明确自动应用范围、冲突优先级、回滚及预览，验证不会重复入账或绕过期间/权限。
- 证据：[src/features/finance-closure/bankStatementRepository.ts](../src/features/finance-closure/bankStatementRepository.ts), [src/features/business-workspace/workspaceRepository.ts](../src/features/business-workspace/workspaceRepository.ts)

### G07 银行指令文件与工资批次（本地缺口，P1）

- 当前状态：**已完成（2026-10-22，本地银行文件范围）**。以下现状保留为原始审查快照；支持格式、流程及明确限制见 [G07](G07-BANK-INSTRUCTIONS.md)。

- 现状：供应商批次导出的remittance CSV不是银行指令；工资付款没有相应批次/银行文件链路。
- 验收退出条件：实现所选银行格式的字段与校验、批准快照/作废/重新导出；记录与实际银行执行分开；用合成样本验文件。
- 证据：[src/features/finance-closure/PaymentBatchPage.tsx](../src/features/finance-closure/PaymentBatchPage.tsx), [src/features/finance-closure/paymentBatchRepository.ts](../src/features/finance-closure/paymentBatchRepository.ts)

### G08 工资工时项目维度（本地缺口，P2）

- 当前状态：**已完成（2026-10-22，本地工资项目成本范围）**。以下现状保留为原始审查快照；分摊口径、恢复和验证见 [G08](G08-PAYROLL-PROJECTS.md)。

- 现状：timeFields没有job/project字段；工时可并入工资，尚不能归入项目。
- 验收退出条件：加入授权项目引用及历史快照，验证工资成本归属与项目报表的去重/反向/重启。
- 证据：[src/features/payroll/data/payrollModel.ts](../src/features/payroll/data/payrollModel.ts)

### G09 公司品牌图片（本地缺口，P2）

- 当前状态：**已完成（2026-10-22，本地静态 PNG 品牌范围）**。以下现状保留为原始审查快照；图片限制、快照及实际 PDF 验证见 [G09](G09-BRANDING.md)。

- 现状：财务表单无真实Logo上传应用；单据输出不加载品牌图片。
- 验收退出条件：本地安全图片存储、权限、快照与PDF/报表应用，验证旧版本不被配置变更覆盖。
- 证据：[src/features/finance-foundation/FoundationPages.tsx](../src/features/finance-foundation/FoundationPages.tsx), [docs/DOCUMENT-OUTPUT.md](../docs/DOCUMENT-OUTPUT.md)

### G10 采购设置默认值（本地缺口，P2）

当前状态：已关闭本地范围，独立设置及源单继承详见 [G10 验证记录](G10-PURCHASE-SETTINGS.md)。下面现状保留为原始审查快照。

- 现状：采购设置路由复用财务设置；未见独立采购期限与付款偏好完整表单/应用链。
- 验收退出条件：字段保存后影响新采购单/账单默认值，源单历史保持；覆盖权限和重启。
- 证据：[src/features/page-previews/previewRoutes.tsx](../src/features/page-previews/previewRoutes.tsx), [src/features/finance-foundation/FoundationPages.tsx](../src/features/finance-foundation/FoundationPages.tsx)

### G11 报表设置默认值（本地缺口，P2）

当前状态：已关闭本地支持范围，实际口径、币种和输出契约详见 [G11 验证记录](G11-REPORT-SETTINGS.md)。下面现状保留为原始审查快照。

- 现状：报表设置路由也复用财务设置；报表基础、表头和精度配置没有完整可操作链。
- 验收退出条件：接通支持的默认项与每份报表输出；不把现金/权责口径混算；旧导出副本保持。
- 证据：[src/features/page-previews/previewRoutes.tsx](../src/features/page-previews/previewRoutes.tsx), [src/features/finance-foundation/FoundationPages.tsx](../src/features/finance-foundation/FoundationPages.tsx)

### G12 通用表格能力一致性（本地缺口，P2）

- 当前状态：**已完成（2026-10-23，本地表格适用范围）**。以下现状保留原始审查快照；逐表适用契约及验证见 [G12](G12-TABLE-CAPABILITIES.md)。

- 现状：共享DataTable仅具备搜索/排序/分页；列设置、批量、导出尚非统一契约，部分页面另行实现。
- 验收退出条件：逐表列出适用能力，补一致的列/批量/完整导出与权限，明确不适用项。
- 证据：[src/components/data-table/DataTable.tsx](../src/components/data-table/DataTable.tsx)

### G13 自动票据识别（本地缺口，P3）

- 当前状态：**已完成（2026-10-23，macOS 本地英文票据辅助提取范围）**。Windows 保留手工/CSV，复杂行项目不自动提取；支持边界、实际识别、打包及回归见 [G13](G13-LOCAL-DOCUMENT-RECOGNITION.md)。

- 现状：目前是手工/CSV录入、原票金额比对和创建费用草稿，没有图像/PDF自动提取。
- 验收退出条件：接通本地或另行批准的识别方案，保留原件、置信/差异复核和重复检测，再转草稿。
- 证据：[docs/SUPPLIER-DOCUMENT-CAPTURE.md](../docs/SUPPLIER-DOCUMENT-CAPTURE.md), [src/features/bill-capture](../src/features/bill-capture)

### G14 过时说明与目录文案（收口工作，P2）

- 当前状态：**已完成（2026-10-23，当前说明与有效入口范围）**。以下现状保留原始审查快照；文档分类、路由/目录收口及真实验证见 [G14](G14-CURRENT-GUIDANCE.md)。

- 现状：旧文档仍把后来已完成的附件、工资、采购输出等写为未实现；部分旧/不可达预览分支仍在源码。
- 验收退出条件：以本报告为当前基线，更新有效入口说明，历史文档加版本/替代链接，避免按旧文重复开发。
- 证据：[docs/BUSINESS-DATA-INTEGRATION.md](../docs/BUSINESS-DATA-INTEGRATION.md), [docs/DOCUMENT-OUTPUT.md](../docs/DOCUMENT-OUTPUT.md), [src/features/page-previews/previewRoutes.tsx](../src/features/page-previews/previewRoutes.tsx)

### G15 全角色全状态桌面验收（验收缺口，P1）

- 当前状态：**本地验收基线已完成（2026-10-23）**。角色/路由、业务回归和原生代表状态分别记录；明确不是所有金额/状态/平台组合逐页人工点验。见 [G15](G15-DESKTOP-ACCEPTANCE.md)。

- 现状：本次完整运行自动化，并完成客户审核和对账/关账/重启原生闭环；未新跑每条路由的所有记录/角色/异常态。
- 验收退出条件：按流程和角色建立桌面用例，涵盖窄屏、原生文件选择/导出、失效会话与失败恢复；记录逐项证据。
- 证据：[docs/STATIC-PAGES-ROUTES.md](../docs/STATIC-PAGES-ROUTES.md), [docs/DESKTOP-VISUAL-ACCEPTANCE.md](../docs/DESKTOP-VISUAL-ACCEPTANCE.md)

### G16 正式发布与可观测性（交付缺口，P0）

- 现状：本次可生成未签名macOS arm64目录包；配置identity=null、hardenedRuntime=false；尚无CI或完整签名/公证/Windows/安装升级验收。
- 验收退出条件：固定依赖和环境，CI构建/测试、签名与公证、安装/升级/回退和备份恢复演练，明确日志与监控方案。
- 证据：[electron-builder.yml](../electron-builder.yml), [package.json](../package.json), [electron/main/index.ts](../electron/main/index.ts)

### G17 库存差异进入财务总控（本地缺口，P1）

- 现状：库存对账在专门报表及关账检查中存在；FinanceControlsSummary没有库存控制项，因此总控全通过不代表库存通过。
- 验收退出条件：加入同一日期的库存到GL控制和审查链接，差额/完整性失败计入总状态；保留关账后端拦截。
- 证据：[src/features/accounting/data/financeControlsService.ts](../src/features/accounting/data/financeControlsService.ts), [electron/security/periodCloseChecks.ts](../electron/security/periodCloseChecks.ts)

### E01 邮件送达、催款与在线支付（外部边界，P1）

- 现状：本地模板/准备/PDF并非实际邮件发送、回执、自动催收或在线收款。
- 验收退出条件：需要另定服务与授权、失败重试和业务状态契约；当前不把本地导出当作发送成功。
- 证据：[docs/DOCUMENT-OUTPUT.md](../docs/DOCUMENT-OUTPUT.md)

### E02 银行feed连接（外部边界，P1）

- 现状：CSV和本地银行流水已接通，实时feed/银行连接未接入。
- 验收退出条件：另定提供方和授权、去重/增量/断线恢复；不影响本地手工对账验收。
- 证据：[src/features/finance-closure/bankStatementRepository.ts](../src/features/finance-closure/bankStatementRepository.ts)

### E03 AU电子申报与退休金传送（外部边界，P2）

- 现状：仅本地申报复核及外部引用记录，未连接STP/SuperStream。
- 验收退出条件：另定合适外部服务、申报/更正/最终确认与回执状态，不把复核CSV当申报文件。
- 证据：[docs/AU-PAYROLL.md](../docs/AU-PAYROLL.md)

## 不应重新列为整体未开发

客户/门店/联系人本地审核；客户与供应商实物退货；订金/预收款；供应商预付款；收付款、贷项核销、退款；PO与付款通知本地输出；真实文件附件；项目成本；可执行保存报表及报告包，均已有本地实现和本次相关回归证据。旧文档里相反的“未接通”说明应以本报告和后续专门说明为准。

## 扩展或单独范围

- S01 年度损益转留存收益：本地结转、年结锁、受控撤销及验证已实现，见 [S01 年结](S01-YEAR-END.md)。该扩展与原表期间锁分别记录，不将其假定为原表独立条目。
- S02 已实现可配置复杂工资：异常人工扣税依据、明确工时倍率、参数化休假累计、离职结算和冲销。Award 覆盖/等级及全部法定待遇自动判断仍不作已完成承诺，见 [S02–S04](S02-S04-LOCAL-WORKFLOWS.md)。
- S03 已支持按商品前瞻启用 FIFO：所有仓点零库存/零金额后切换，采购/销售/退货沿用真实成本及 GL 主链；旧成本不重算。
- S04 客户 Notes 已持久化，保留可信作者、来源及幂等外部 ID；独立销售系统的远程同步仍属于跨端集成，不把本地录入称为已同步。
- Time Billing、Activity Billing、Fixed Assets 按已有 V1 范围排除。多用户远程服务、跨端原子编号与数据隔离仍需三端集成阶段；本地单机通过不能证明跨设备并发正确。

## 后续开发顺序和最终验收门槛

1. 第一批：G01 Dashboard 可信对账状态、G02 日内取价、G17 库存总控，同时按 G03 列明可修复异常及仍需备份的边界。
2. 第二批：G07 银行文件/工资批次、G04 合格草稿清理、G08 项目工时；随后补 G05/G06 自动化、G09–G12 设置/品牌/表格，G13 按 P3 处理。
3. 收口：G14 清理过时说明，G15 按角色和状态逐流程原生验收，G16 完成目标平台签名、安装、升级和恢复演练。E01–E03 保持单独集成范围，未经任务授权不实际连接/发送。
4. 发布通过条件：本地已承诺范围没有未处理的阻塞缺陷，原需求变更有明确记录；目标平台安装/升级/回退及全角色关键闭环有证据；新版本全量回归通过。当前未达到此结论。

本报告是统一的当前基线。后续修复应引用 G/E/S 编号和验收退出条件，不再每次使用不确定的“还有几个流程”。

E01 更新：可配置本地代码已实现，见 [E01 接入说明](E01-EXTERNAL-SERVICES.md)。用户确认尚未开通服务、保持本地架构并接受运行时处理。实际送达/支付/外部退款验收仍待账号开通，E01 外部边界继续保持部分完成。

E02 更新：用户确认先完成可配置代码、保持本地运行时处理。[E02 银行 feed](E02-BANK-FEEDS.md)提供 Basiq AU 同意、账户映射、分段取数、去重与待审导入；真实银行账号和服务验收仍未关闭。

E03 更新：用户确认尚未开通服务商，先完成可配置代码。[E03 工资申报](E03-PAYROLL-FILINGS.md)记录已实现的本地准备与连接器框架；不猜测私有 API，默认生产适配器为空，配置/声明均不能越过此门禁。生产集成、认证和真实回执验收未关闭。
