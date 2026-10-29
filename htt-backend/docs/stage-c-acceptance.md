# 阶段C后端收口核查与实施顺序

核查日期：2026-10-29；实现截止：044_crm_mobile_drafts.sql（W-06/C04增量）。结论：**已交付的财务核心切片有验收记录，但原阶段C后端整体尚未完成，不能签署“阶段C完成”。**

039逐行核查后，已交付C01/040、C02/041，042完成C03，本批完成W-06/043及C04/044服务端切片和测试并更新 htt-backend 文档，不修改 customer-portal、htt_flooring_app、htt-management 或 ledgerone-api，不执行生产迁移/关账。原需求中的建议、估时及待确认条款作为核查材料，不是本轮开发或发送通知的授权。

## 核查口径和来源

1. 按原《HTT-AU-需求追踪矩阵-v2.md》116条逐行映射，选择原阶段为 C、B/C、C/D 的 **39条**；未把编号为 C-01 等的客户门户行误当阶段C。矩阵原文SHA-256：`48ab6b6784016ba164e688543f93cf3339bbea0973e43388f48edce77d7e0b91`。
2. 阶段边界沿用《HTT-AU-后台与数据库设计-v2》§13；重点复核§7.5激励、§7.6净销售事实/同步、§11运行目标和§14故障场景。原材料只读。工作簿摘要和原始116行映射沿用[总矩阵](requirements-acceptance.md)的来源记录，本轮未重新解析或修改xlsx，未重新估算人日。
3. 逐项对照当前 API 注册与端点、001—044迁移、测试源文件、各批文档和[既有验收记录](verification.md)。存在通用表、Outbox、备注字段、账龄或PDF任务，不等于对应CRM/对账单/通知业务已实现。
4. 状态是**服务端能力状态**：后端已实现／部分实现／未实现。客户端、真实外部服务、生产运行验收单列，不把客户端未接入作为否定已完成后端的唯一理由，也不凭单元/集成测试宣称已上线。
5. C/D整行保留D范围；本轮指出其C切片缺什么，Bank Feeds、工资报表和阶梯激励不迁入C。后续关闭C切片时，整行仍可能因D功能保留“部分实现”。

[机器可读核查记录](stage-c-audit.json)保存原行号/编号/功能/优先级/阶段/边界、当前状态、证据和实施包，以及本轮检查的src/tests文件摘要。总矩阵仍保持116行、原编号和原阶段。

## 当前结果

| 统计对象 | 后端已实现 | 部分实现 | 未实现 | 合计 |
| --- | ---: | ---: | ---: | ---: |
| 本次核对的原阶段C相关整行，含B/C及C/D | 9 | 8 | 22 | 39 |
| 总矩阵全部原行，另外含排除3行 | 32 | 47 | 34 | 116（含排除3） |

第二行的另刷新跨阶段R052/R054，其余75条沿用此前阶段判断，本轮没有重新签署A/B/D验收；历史增量应结合其阶段基线阅读。以上是需求行计数，**不是完成率**。一条R040包含五类核心报表，不能与单一小功能按行数等权换算工时。追加GST/BAS、关账及仓管补充项不计入这39条，见后文。

同时修正旧汇总与逐行表不一致的问题：旧正文写21/37/55/3，核对旧表实际为23已实现/46部分/44未实现/3排除；039核查更新后为25/46/42/3；040完成R029后为26/46/41/3；041完成R027后为27/46/40/3；042完成R019/R055并将R054标部分后为29/46/38/3；044完成S-20/S-21/S-43，S-22/S-30改部分后为32/47/34/3。没有通过手工修改汇总来推算进度。

039核查状态变更：R026未实现→部分实现；R028未实现→后端已实现；R040部分实现→后端已实现。040增量：R029未实现→后端已实现，R026的人工分类/拆分记账切片完成。041增量完成R027规则/例外；R026的C切片完成，整行仍因D Feeds保留部分实现。042完成R019客户对账单及R055保留模板，R041采购/往来/库存/银行切片交付，跨阶段R054的本期导出标部分。其余C行也已刷新范围说明，移除银行档案、银行对账、现金流及账龄“完全未实现”的旧判断。

044增量：W-06补充分货位盲盘/复盘审批；S-20/S-21/S-43服务端链完成，S-22/S-30同步基础已实现但完整对象/设备缓存仍部分。C05/C06/C07/C08/C09及跨阶段依赖仍待实施。真实OCR和客户端状态独立列示。

### 已完成后端切片和明确边界

| 能力 | 实现及证据 | 本轮判定边界 |
| --- | --- | --- |
| 银行基础 | 033银行档案/默认账户/四类收付款账户选择；BANK证据组 | 是B/C共用基础，040已补通用收支及转账；041补规则/例外；银行Hub聚合及Feeds仍欠项 |
| 流水导入/匹配/对账 | 034 CSV/JSON、防重、部分/多对多匹配与解除、连续对账、未达、差额严格为0、冻结和最新期重开；BANK | R028后端已实现；040补科目/GST分类和多科目拆分、创建来源凭证并原子匹配；041补规则/例外；R026仍留D Feeds |
| 五类核心财务报表 | 033 GL/TB；035 P&L/BS及历史AR/AP账龄；036直接法现金流、活动分类、银行/GL核对；039结转后报表保护；REPORT、GST_CLOSE | R040按原行P&L/BS/CF/TB/GL已完成。现金制GST不等于现金制利润表；经营报表R041仍部分实现。收藏/报表包属于D；通用导出归R052/R054，法定模板/间接法不是本轮自行新增的R040阻塞条件 |
| GST/BAS内部编制 | 037 Simpler、038 Full标签及G1—G20底稿、accounts/worksheet、分类、期间定版/外部申报登记/重开、税额GL独立核对；GST_CLOSE | 用户追加切片已交付；登记外部申报不等于向ATO发送。IAS/PAYG、专用GST业务及实际申报接入另列，不据此声称完整税务系统 |
| 会计关账和年结 | 039月结/倒序重开、年度损益结转及原年末日期关联反向凭证、库存/往来/GL/GST/BAS核对；GST_CLOSE | 用户追加切片已交付。历史CLOSED无证据不能直接年结；不自动关账，不在本轮执行正式迁移 |

039后的既有记录为：两平台各1784项全量回归通过；最后两项边界修复后，两平台各111项受影响测试通过（75关账、36升级），最终用例清单1786项。这是此前实施批次的证据，**039文档核查未重跑；040当批全量结果、041本批针对性回归另见verification.md各批记录**。

## 原需求逐行核查

实施包 C01—C09 见后文；D 表示原后续阶段保留。表中的“部分实现”可能只包含共用基础，具体尚缺的C业务必须完成后才能关闭该切片。

| 原行/编号 | 原功能 | 原优先级/阶段 | 当前后端状态 | 已有能力；仍缺事项 | 证据 / 实施包 |
| --- | --- | --- | --- | --- | --- |
| 5 / R005 | KPIs, income/expense charts, financial position, tasks/up-next | P1 / 保留 / C | 未实现 | 可复用P&L/BS/现金流查询；没有经营Dashboard/KPI聚合入口。 **待补：**收入费用图表、财务概览和tasks/up-next统一口径。 | REPORT、GAP / C09 |
| 19 / R019 | Generate, print/PDF/email statements | P2 / 保留 / C | 后端已实现 | 042客户合并门店的过账日对账单、AR业务/GL独立核对、预收款单列、不可变快照、多页PDF、授权邮件及失败/未知结果保护。 **待补：**本行约定后端切片无新增欠项；客户端合并入口和真实投递/生产另验。 | DOC、REPORT / 已交付切片 |
| 25 / R025 | Accounts, balances, feeds status, attention items | P0 / 保留 / B/C | 部分实现 | 033银行档案/默认账户/收付选择；034现金明细、可匹配和未达数据已交付。041新增按银行/期间分页的规则例外及待确认建议。 **待补：**C银行Hub统一余额/关注聚合；D真实Feeds连接状态。 | BANK / C09、D |
| 26 / R026 | Import/feed transactions, categorise, match, split | P0 / 保留 / C/D | 部分实现 | 034导入/防重/匹配及解除，040人工分类/拆分写入，041版本化规则自动匹配、解释预览、受控执行与例外查询。 **待补：**D真实自动Bank Feeds；本行C导入/分类/拆分/匹配切片已交付，客户端与生产另验。 | BANK / D |
| 27 / R027 | Condition/action rules, enable/disable, auto-categorisation | P1 / 保留 / C | 后端已实现 | 041字面条件及金额范围、科目/GST比例动作、版本/优先级/启停、命中解释、预览快照、建议确认/自动执行分权及例外分页；复用C01过账/匹配及期间保护。 **待补：**本行约定后端切片无新增欠项；AUTO为显式授权触发，不包含导入即后台过账、外部Feeds及客户端联调。 | BANK / 已交付切片 |
| 28 / R028 | Statement reconciliation, transaction selection, difference=0 completion | P0 / 保留 / C | 后端已实现 | 034连续银行对账、首期清算/未达、差异严格为0、冻结快照、最新期重开及闭期现金保护。 **待补：**本行后端切片无新增欠项；真实银行格式/客户端/生产另验。 | BANK / 已交付切片 |
| 29 / R029 | Spend money, receive money, account transfers | P1 / 部分缩减 / C | 后端已实现 | 040通用Receive/Pay、流水分类及成对银行账户转账；来源/GL/GST独立核对、原日冲销、两账户对账及期间保护。 **待补：**本行约定后端切片无新增欠项；不恢复已删独立Spend/Transfer页面，客户端与生产另验。 | BANK / 已交付切片 |
| 40 / R040 | P&L, Balance Sheet, Cash Flow, Trial Balance, GL | P0 / 保留 / C | 后端已实现 | 033—036及039已提供P&L、BS、直接法CF、TB、GL；包含历史账龄及年结后利润/权益保护。 **待补：**完成原行五类核心后端报表；通用导出归R052/R054，收藏/报表包归D的R042/R043；客户端和生产另验，不倒推新增法定模板/间接法为本行阻塞。 | REPORT、GST_CLOSE / 已交付切片 |
| 41 / R041 | Sales, purchases, receivables/payables, payroll, banking | P1 / 保留 / C/D | 部分实现 | 既有财务/账龄/现金流，042补采购事件、AR/AP历史及预收预付、在库/在途和银行经营报表，白名单过滤、总计分页及冻结CSV导出。 **待补：**C07销售事实/净销售经营报表及D工资报表；真实规模和客户端另验。 | REPORT、BANK、CRM_BASE / C07、D |
| 53 / R053 | System reminders, due items, action centre | P2 / 部分缩减 / C | 未实现 | 审计/Outbox及文档作业状态已有基础，不构成业务行动中心。 **待补：**业务到期提醒、Task待办及消息行动中心；独立自动发票催收仍排除。 | GAP / C06、C09 |
| 55 / R055 | Invoice/quote/PO/statement/remittance document generation | P1 / 部分缩减 / B/C | 后端已实现 | 既有报价/发票/PO版本化PDF与邮件，042补客户对账单冻结模板、PDF与邮件，复用私有文件和租约重试。 **待补：**原保留模板后端已齐；Remittance及专用收据模板仍按原边界排除，客户端和真实服务另验。 | DOC、REPORT / 已交付切片 |
| 59 / S-02 | 销售工作台 | P1 / 保留 / C | 未实现 | 授权客户、报价、订单查询可复用。 **待补：**销售客户/Task/拜访待办工作台聚合。 | CRM_BASE、GAP / C09 |
| 62 / S-05 | 客户Notes | P0 / 保留 / C | 未实现 | 单据备注和业务设置notes不是客户Note对象。 **待补：**客户Note CRUD、可见范围、历史、附件及同步事件。 | CRM_BASE、GAP / C05 |
| 63 / S-06 | 展板信息 | P1 / 保留 / C | 未实现 | 现有客户/门店资料可复用。 **待补：**门店展板放置记录、状态及照片/附件。 | CRM_BASE、GAP / C05 |
| 66 / S-09 | 客户地图 | P0 / 保留 / C | 未实现 | 门店地址已保存，无客户地理编码/地图范围API。 **待补：**授权客户坐标、地理编码作业及精度/失败状态。 | CRM_BASE、GAP / C05 |
| 67 / S-10 | 地图筛选 | P1 / 保留 / C | 未实现 | 普通客户搜索不是地图筛选。 **待补：**客户/门店区域、状态等地图筛选及范围隔离。 | CRM_BASE、GAP / C05 |
| 68 / S-11 | 地图导航 | P1 / 保留 / C | 未实现 | 无导航适配服务契约。 **待补：**授权坐标/地址导航契约；设备拉起导航属于后续客户端联调。 | GAP / C05 |
| 69 / S-12 | Check-in | P0 / 保留 / C | 未实现 | 无拜访会话或签到命令。 **待补：**Check-in、客户/门店、操作者、时间、位置精度和幂等。 | GAP / C05 |
| 70 / S-13 | Check-out | P0 / 保留 / C | 未实现 | 无拜访状态机。 **待补：**Check-out与同一拜访状态/版本/并发约束。 | GAP / C05 |
| 71 / S-14 | 拜访历史 | P1 / 保留 / C | 未实现 | 审计列表不能代替拜访记录。 **待补：**授权拜访历史、办公室共享、附件与时间筛选。 | GAP / C05 |
| 72 / S-15 | 创建Task | P0 / 保留 / C | 未实现 | Outbox是基础设施，不是Task业务表和创建接口。 **待补：**Task对象、负责人、关联客户、截止时间与审计。 | GAP / C06 |
| 73 / S-16 | Task列表 | P0 / 保留 / C | 未实现 | 没有Task查询API。 **待补：**角色/负责人/客户范围过滤及稳定分页列表。 | GAP / C06 |
| 74 / S-17 | 完成/更新Task | P0 / 保留 / C | 未实现 | 没有Task状态机。 **待补：**更新/完成、版本、幂等、变更历史及并发测试。 | GAP / C06 |
| 75 / S-18 | Task/Note推送 | P1 / 保留 / C | 未实现 | 文档邮件适配和Outbox不代表移动Task/Note推送。 **待补：**通知收件人、设备令牌、投递作业、重试去重及真实提供商验证。 | GAP / C06 |
| 76 / S-19 | 系统消息中心 | P2 / 保留 / C | 未实现 | 没有业务消息/已读记录。 **待补：**授权消息中心、游标/分页、已读/未读与同步。 | GAP / C06 |
| 77 / S-20 | 销售扫描客户名片，识别姓名、公司/门店、电话、Email并生成联系人草稿。 | P1 / 保留 / C | 后端已实现 | 044私有名片图片、扫描/OCR作业、HTTPS网关适配、重试/租约、姓名/公司/门店等建议及人工确认联系人草稿，复用独立办公室审核。 **待补/联调：**真实OCR网关合同/识别质量及手机拍照联调另验；不自动建公司或合并客户。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 78 / S-21 | 手工新增客户、门店或联系人，并关联到已有客户主体。 | P1 / 保留 / C | 后端已实现 | 044销售客户/门店/联系人草稿、目标客户/门店授权、重复建议、版本审核、一次生成正式数据及客户信用初始化/默认账期/销售分配。 **待补/联调：**三个客户端接入及业务UAT另验；正式信用与非默认账期仍沿用既有专门权限。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 79 / S-22 | 移动端Note、Task、拜访、客户/门店/联系人草稿及通讯录导入结果同步到管理平台。 | P0 / 保留 / C | 部分实现 | 044设备操作UUID/连续序号、提交有序增量、tombstone、冲突、游标过期/重置、撤权及通讯录/名片生成的草稿同步。 **待补/联调：**C05 Note/拜访/展板与C06 Task/消息对象逐项接入及C09办公室聚合；移动端联调未做。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 86 / S-29 | 照片/附件 | P2 / 保留 / B/C | 部分实现 | QUOTE/PICK及供应商单据私有扫描附件已有授权访问。 **待补：**C Note/展板/拜访/草稿等CRM实体附件绑定、撤销及离线上传关联；不把现有文件底座当已完成。 | DOC / C05 |
| 87 / S-30 | 弱网缓存 | P2 / 保留 / C | 部分实现 | 044后端CRM草稿离线操作契约：设备序号、重放、版本冲突、30天游标、权限变更重置和删除保护；财务/出库无离线命令。 **待补/联调：**客户端本地缓存、弱网呈现/恢复及实机验证；C05/C06新对象同步后续补齐。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 94 / S-43 | 销售员授权后从手机通讯录选择联系人导入 | P0 / 保留 / C | 后端已实现 | 044只接受授权选择结果及consentReference、1—100人规范化/批内和正式去重预览、选择确认及一次落草稿、独立审核链。 **待补/联调：**手机OS授权和联系人选择由客户端实现并联调；后端不把consent文本当设备授权完成证明。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 110 / R110 | 客户返点规则与结算 | P1 / 新增 / C/D | 未实现 | 原发票/贷项/退款可追溯，但没有返点政策或计提结算对象。 **待补：**C固定比例/固定额政策版本、未税净销售事实、计提/审批/锁期/结算及关联冲回；D阶梯规则。 | GAP / C07、C08、D |
| 111 / R111 | 销售代表分红/佣金 | P1 / 新增 / C/D | 未实现 | 成交来源与收付查询不代表佣金归属或计提。 **待补：**C基础佣金/销售归属快照及审批结算；回款/毛利按独立规则验收，D阶梯；不解释为股东分红或自动工资付款。 | GAP / C07、C08、D |
| 112 / R112 | 客户×产品销量趋势分析 | P1 / 新增 / C | 未实现 | P&L按科目汇总，非客户×SKU销售事实和曲线。 **待补：**客户/门店/SKU/期间未税净销售、基础单位数量、同环比及截止点。 | REPORT、GAP / C07 |
| 113 / R113 | 办公室统一客户视图 | P1 / 新增 / C | 部分实现 | 办公室正式客户、多门店联系人、报价/订单和价格库存聚合可查。 **待补：**CRM Notes/拜访/展板/Task/趋势整合及字段成本权限。 | CRM_BASE / C05、C06、C07、C09 |
| 114 / R114 | 客户产品销售曲线（销售端） | P1 / 新增 / C | 未实现 | 没有共用净销售趋势API。 **待补：**复用R112事实，按销售授权客户过滤；上期0显示无可比。 | GAP / C07 |
| 115 / R115 | 返点/佣金展示（授权范围） | P1 / 新增 / C | 未实现 | 没有返点/佣金数据源或查询授权模型。 **待补：**本人佣金/状态、额外授权客户返点、对其他人员/成本字段的隔离。 | GAP / C08 |
| 116 / R116 | 客户销售资料办公室同步完善 | P1 / 新增 / C | 部分实现 | 044销售草稿与办公室审核、冲突、同步增量、正式客户/门店/联系人完善和销售归属已实现。 **待补/联调：**C05 Note/拜访、C06 Task等移动对象及C09办公室统一视图仍待实现。 | CRM_MOBILE / C04（S-22/R116后续C05/C06/C09） |
| 117 / R117 | 返点与佣金结算回归测试 | P1 / 新增 / C/D | 未实现 | 现有退货/贷项/付款回归不是激励模块回归。 **待补：**C基础规则的来源去重、版本切换、归属、退货与贷项只净冲一次、跨期调整/锁账/结算权限；D阶梯专项。 | GAP / C08、D |

## 证据索引

### BANK

范围说明：[stage-b-bank-ledger.md](stage-b-bank-ledger.md)；[stage-c-bank-reconciliation.md](stage-c-bank-reconciliation.md)；[stage-c-general-banking.md](stage-c-general-banking.md)；[stage-c-bank-rules.md](stage-c-bank-rules.md)。

实现入口：[BankingEndpoints.cs](../src/Htt.Host.Api/Accounting/BankingEndpoints.cs)；[BankReconciliationEndpoints.cs](../src/Htt.Host.Api/Accounting/BankReconciliationEndpoints.cs)；[GeneralBankingEndpoints.cs](../src/Htt.Host.Api/Accounting/GeneralBankingEndpoints.cs)；[BankRuleEndpoints.cs](../src/Htt.Host.Api/Accounting/BankRuleEndpoints.cs)。

测试源码：[BankLedgerTests.cs](../tests/Htt.IntegrationTests/BankLedgerTests.cs)；[BankStatementTests.cs](../tests/Htt.IntegrationTests/BankStatementTests.cs)；[GeneralBankingTests.cs](../tests/Htt.IntegrationTests/GeneralBankingTests.cs)；[BankRuleTests.cs](../tests/Htt.IntegrationTests/BankRuleTests.cs)。

### REPORT

范围说明：[stage-c-financial-reports.md](stage-c-financial-reports.md)；[stage-c-cash-flow.md](stage-c-cash-flow.md)；[stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)。

实现入口：[LedgerEndpoints.cs](../src/Htt.Host.Api/Accounting/LedgerEndpoints.cs)；[FinancialReportEndpoints.cs](../src/Htt.Host.Api/Accounting/FinancialReportEndpoints.cs)；[CashFlowEndpoints.cs](../src/Htt.Host.Api/Accounting/CashFlowEndpoints.cs)；[OperatingReportEndpoints.cs](../src/Htt.Host.Api/Accounting/OperatingReportEndpoints.cs)。

测试源码：[FinancialReportTests.cs](../tests/Htt.IntegrationTests/FinancialReportTests.cs)；[CashFlowTests.cs](../tests/Htt.IntegrationTests/CashFlowTests.cs)；[FinancialReportAssertions.cs](../tests/Htt.IntegrationTests/FinancialReportAssertions.cs)；[OperatingReportTests.cs](../tests/Htt.IntegrationTests/OperatingReportTests.cs)。

### GST_CLOSE

范围说明：[stage-c-gst-bas.md](stage-c-gst-bas.md)；[stage-c-full-bas.md](stage-c-full-bas.md)；[stage-c-period-close.md](stage-c-period-close.md)。

实现入口：[BasEndpoints.cs](../src/Htt.Host.Api/Accounting/BasEndpoints.cs)；[PeriodCloseEndpoints.cs](../src/Htt.Host.Api/Accounting/PeriodCloseEndpoints.cs)。

测试源码：[BasTests.cs](../tests/Htt.IntegrationTests/BasTests.cs)；[FullBasTests.cs](../tests/Htt.IntegrationTests/FullBasTests.cs)；[PeriodCloseTests.cs](../tests/Htt.IntegrationTests/PeriodCloseTests.cs)。

### DOC

范围说明：[stage-b-documents.md](stage-b-documents.md)；[stage-b-warehouse-locations.md](stage-b-warehouse-locations.md)；[stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)。

实现入口：[DocumentEndpoints.cs](../src/Htt.Host.Api/DocumentEndpoints.cs)；[DocumentWorker.cs](../src/Htt.Infrastructure/Documents/DocumentWorker.cs)；[DocumentRuntime.cs](../src/Htt.Infrastructure/Documents/DocumentRuntime.cs)。

测试源码：[DocumentDeliveryTests.cs](../tests/Htt.IntegrationTests/DocumentDeliveryTests.cs)；[DocumentProtocolTests.cs](../tests/Htt.IntegrationTests/DocumentProtocolTests.cs)；[WarehouseDetailTests.cs](../tests/Htt.IntegrationTests/WarehouseDetailTests.cs)。

### CRM_BASE

范围说明：[master-data-api.md](master-data-api.md)；[stage-b-search-settings.md](stage-b-search-settings.md)；[stage-b-sales.md](stage-b-sales.md)。

实现入口：[CrmMaintenanceEndpoints.cs](../src/Htt.Host.Api/MasterData/CrmMaintenanceEndpoints.cs)；[DiscoverySettingsEndpoints.cs](../src/Htt.Host.Api/MasterData/DiscoverySettingsEndpoints.cs)；[OrderEndpoints.cs](../src/Htt.Host.Api/Sales/OrderEndpoints.cs)。

测试源码：[MasterDataApiTests.cs](../tests/Htt.IntegrationTests/MasterDataApiTests.cs)；[DiscoverySettingsTests.cs](../tests/Htt.IntegrationTests/DiscoverySettingsTests.cs)；[SalesPermissionTests.cs](../tests/Htt.IntegrationTests/SalesPermissionTests.cs)。

### GAP

逐文件核对 API 注册、全部端点源文件、001—044迁移和测试类目录；通用备注、正式主数据、Outbox及现有单据查询不充当CRM/激励的完整实现。无对应业务入口及状态/事实链时标未实现，不以SQL关键字搜索无命中单独作结论。

实现入口：[FoundationEndpoints.cs](../src/Htt.Host.Api/FoundationEndpoints.cs)；[Program.cs](../src/Htt.Host.Api/Program.cs)；[Program.cs](../src/Htt.Host.Worker/Program.cs)。

### WAREHOUSE

范围说明：[stage-b-inventory-control.md](stage-b-inventory-control.md)；[stage-b-transit-transfers.md](stage-b-transit-transfers.md)；[stage-b-warehouse-locations.md](stage-b-warehouse-locations.md)；[stage-c-statements-operating-reports.md](stage-c-statements-operating-reports.md)。

实现入口：[InventoryControlEndpoints.cs](../src/Htt.Host.Api/Inventory/InventoryControlEndpoints.cs)；[TransitEndpoints.cs](../src/Htt.Host.Api/Inventory/TransitEndpoints.cs)；[WarehouseDetailEndpoints.cs](../src/Htt.Host.Api/Inventory/WarehouseDetailEndpoints.cs)。

测试源码：[InventoryControlTests.cs](../tests/Htt.IntegrationTests/InventoryControlTests.cs)；[TransitTests.cs](../tests/Htt.IntegrationTests/TransitTests.cs)；[WarehouseDetailTests.cs](../tests/Htt.IntegrationTests/WarehouseDetailTests.cs)。

GAP结论来自完整端点/迁移/测试目录交叉核对，而不是仅凭缺少某个文件名。当前未发现Task/Visit/Note/展板/设备同步/净销售趋势/激励的对应业务状态与事实链；正式客户维护、普通备注、单据查询、现金流活动分类及通用Outbox不提升这些缺项的状态。所有“测试”链接是已有测试源码，运行结果仍以verification.md当批记录为准。

## 原清单外的补充项、跨阶段依赖及保留边界

| 范围 | 当前判断 | 后续处理 |
| --- | --- | --- |
| W-06仓管B/C补充项 | 后端已实现：043分货位/批次冻结、盲盘、独立复盘和审批、保护预留/已拣、原成本/GL过账与位置重分布 | 保留补充ID，不计入116源行；详见[W-06](stage-c-bin-counts.md)。三个客户端、扫码硬件、真实盘点和生产容量另验。 |
| GST/BAS、会计期间关账及年结 | 用户后续明确追加、已交付受限后端切片 | 保留独立验收记录，不捏造工作簿行或增加39行统计。专项税务业务、正式税务过渡及ATO发送需单独定义/验收 |
| R003/R004/R031/R032会计基础 | 台账、税务来源及默认映射可用；039补关账和留存收益配置 | 完整COA/其他映射维护、历史AR/AP/银行期初迁移仍是A/跨阶段依赖。新增C通用交易需显式允许科目/税码映射，不能把留存收益设置当完整科目维护 |
| R052/R054受控导入导出 | 部分列表、银行定格式CSV和当前PDF已存在，不是通用业务导入导出 | 042已补本期四类报告导出契约；完整客户/商品等通用迁移按原跨阶段包保留，不因银行CSV就标完成 |
| R056/R057质量与运行 | 有权限、幂等、并发、财务一致性回归及构建发布记录 | 客户端E2E、真实OIDC/邮件/扫描/推送/地图/OCR服务、CI/CD、容量、安全、监控、备份恢复与生产财务验收单独保留 |
| D及排除项 | D工资/STP、Bank Feeds、阶梯激励、Recurring、收藏/报表包、全局搜索；候选P3管理端票据OCR | 不移入C，也不删除基础返点/佣金或销售名片OCR。电子支付批次/银行文件/支票/Remittance、销售直接开Invoice、Time Billing及独立手工Journal界面仍按原边界排除 |

R029删除的是独立Spend/Transfer页面，不是底层收支分类及成对账户转账。R053保留通用任务提醒，不能据此恢复已排除的独立自动发票催收。R111“分红”按销售激励，不当作股东股息或自动工资转账。

## 剩余事项及实施顺序

下列是基于依赖的后端实施建议，不改变原P0/P1/P2，不承诺人日，C01/040、C02/041、C03/042、W-06/043和C04/044后端切片已实现。W-06和C04后端切片已交付，接续C05—C06；CRM的P0能力在C04—C06持续落实，所有保留C项都需要验收，不能因P2直接删掉。每包均只改后台；设备行为、页面和真实服务另列联调条件。

| 顺序/包 | 关联原需求 | 交付范围与依赖 | 关闭条件 |
| --- | --- | --- | --- |
| C01 通用银行收支、成对转账（040已完成） | R029、R026的会计写入部分 | 已实现通用收入/支出来源单、允许科目/GST、费用/利息合法入账及双账户转账；复用银行档案、会计期间、BAS、银行对账截止保护。分类必须先产生可追溯交易，再匹配流水 | 单一来源一次记账；转账两腿同事务，账户排序锁防死锁；不能重复收入/GST/AR/AP。累计分类/匹配不超原流水，完成全部分拆时总额相等，已结期间拒绝/受控冲销，权限/幂等/重试及并发测试 |
| C02 银行分类规则和例外清单（041已完成） | R027、R026剩余C、R025银行Hub数据 | 已复用C01写入契约，实现版本化条件/动作、优先级/启停、预览命中解释、建议与自动执行分权；提供待分类/待匹配/差额例外查询 | 不对已匹配/已对账事实静默重分类；规则重放不重复建交易；自动执行有独立权限/范围/审计，失败可查询恢复。036现金流分类不充当该功能；D Feeds仍保留 |
| C03 客户对账单及C所需经营报告/导出（042已完成） | R019、R055的C、R041部分；R052/R054依赖 | 复用截止日AR/贷项/核销事实和文档作业；生成客户statement，PDF和授权邮件；补采购/往来/库存/银行报告定义、白名单过滤和受控导出。销售事实报表在C07完善 | 对账单期初+变动=期末且等于截止日AR；不把账龄或发票PDF冒充statement。生成/发送版本可追溯、失败重试不重复记账、下载/邮件隔离；导出与屏幕同权限、同金额口径 |
| C04 CRM草稿、同步基础、通讯录与名片导入（044后端已实现） | S-21/S-22/S-30/S-43/S-20、R116 | 草稿/独立审核、正式主数据/信用初始化、连续操作ID/设备序号、提交有序游标/tombstone/冲突和撤权；授权选择通讯录预览确认；扫描后OCR建议及人工确认 | 见[C04接口](stage-c-crm-mobile.md)和专项测试。真实OCR/手机权限/本地缓存另验；S-22后续Note/Task/拜访对象、R116聚合不在此包冒称完成。 |
| C05 客户协作、拜访、地图、展板与附件 | S-05/S-06/S-09—S-14/S-29、R113/R116部分 | 依赖C04；实现Note可见范围及历史、展板资料/照片、地理编码与授权地图筛选、导航契约、签到/签退会话和拜访历史；绑定CRM附件并接同步事件 | 客户/门店/销售范围和成本字段隔离；并发签到/签退、定位精度/时间、照片扫描与撤销、离线重放和办公室可见性可验证。导航拉起、GPS授权和相机行为列为客户端条件 |
| C06 Task、提醒、消息中心和推送 | S-15—S-19、R053 | 依赖C04同步；建立业务Task/负责人/截止时间/状态历史、行动提醒、消息收件人/已读及投递作业；再接真实推送适配 | 负责人/公司/客户授权正确；状态冲突及并发一次生效；业务保存不依赖推送成功，投递可重试/去重/撤权，已读增量一致；不将Outbox日志充当用户消息 |
| C07 共用净销售事实和趋势 | R112/R114、R041销售/采购统计部分 | 依赖已交付发票/贷项/退款及采购成本事实、C04所需销售归属；建立可重建事实/检查点，按客户/门店/SKU/期间统计并供C08复用 | 发票减财务贷项；实物退回但未开贷项列待处理，不再额外冲一次净销售；只在同一基础单位汇总，跨期/同环比/上期0/归属快照/授权及与GL桥接可核对 |
| C08 基础返点、佣金及授权展示 | R110/R111/R115/R117的C | 依赖C07事实及039期间保护；固定比例/固定额政策版本、计提、审批、锁期、结算链接和差额冲回；按批准政策处理GST/科目/客户贷项或应付关联，不自动银行付款 | 一经济事实仅一份有效计提，改版本不绕过去重；退货+贷项/退款/解除核销/成本后到按批准规则调整，闭期在下一开放期关联更正；本人/额外授权展示不泄漏其他人员。每种回款/毛利口径另验，阶梯留D |
| C09 经营/销售工作台及办公室统一视图 | R005/S-02/R025的聚合、R113/R116余项 | 依赖C02及C04—C08有真实数据；统一客户、Note/拜访/展板、Task、报价/订单、趋势和激励状态，复用财务报表而不另造余额副本 | KPI来源、期间/时区和截止时间明确；办公室/销售/财务/仓库字段范围正确；缓存/分页/同步不改变记账结果。聚合上线不作为补齐缺失底层业务的替代 |

基础返点/佣金在C必须保留。规则启用前需把净销售/单位、销售归属、回款或毛利口径、税务和结算科目落到批准政策；未定语义只阻止相应高风险规则启用，不阻止本次文档核查或先完成其他实施包。阶梯“全额跳档/累进分段”仍按原方案留D确认，不能擅自默认。

C04先建立同步基础，不表示到C04时S-22已完成：C05/C06新增对象也须输出变更、删除和冲突。C03报告基础与C07销售事实分工明确，C09只聚合已有事实。C08依赖净销售事实，不应先做一个无法对账的佣金展示页。

## 后端最终收口门槛

- 每条39行的C切片有明确范围、实现入口、独立权限/范围、适用的版本/幂等/失败回滚/并发和验收证据；共享C/D行明确剩余D功能，不能通过改阶段绕过C欠项。
- C01—C03涉及的新交易/导出与库存、AR/AP、信用、现金、GST、GL及银行/会计/BAS期间规则一致；旧关账后不允许静默重写金额。规则或报表不会补“平衡数”掩盖差异。
- CRM同步、任务、位置、附件、OCR/导入和激励分别通过越权、撤权、重放、冲突及删除测试；业务流程可从创建追至合法更正，不把“有路由/有表”作为验收。
- W-06已交付；继续明确A/跨阶段期初、COA/映射、导入导出依赖清单，分开“阻塞C某交易”和“阻塞生产财务替换”；不能以C开发结束宣称真实期初迁移已完成。
- 未来涉及云/设备的能力分别记录“服务端实现”“外部提供商验证”“三端联调”“生产运行”。原设计在线Note/拜访5秒可见、趋势5分钟进入统计、搜索P95≤500ms、命令P95≤1秒及RPO≤5分钟/RTO≤60分钟，均为目标，不是已测结果；按原容量包络实测后才能签署。
- 完成冻结版本的全量后端回归、升级、发布和一致性验收，再签署明确范围的阶段C后端报告。三个客户端暂不动，页面/设备端到端及生产迁移/恢复不得随之自动标完成。

## 本轮文档核查验证

039基线执行静态核查；040—042增量补齐C01/C02/C03实现、测试及文档。文档完整性核对：原116行/编号/阶段不丢失或重复；39条选择精确；6/7/26计数与逐行状态一致；所有证据文件/Markdown本地链接存在；实施包覆盖全部未关闭C相关行且依赖顺序无环；001—041、依赖锁文件及原始只读来源摘要不变；新增040—042及C01—C03对应源代码/测试，更新源码指纹。既有测试运行结论保留原日期和边界，不为文档修改虚构新测试通过数。
