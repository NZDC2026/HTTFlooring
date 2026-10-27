# 阶段B后端基线最终验收（2026-10-27）

**验收状态：本文件列明的阶段B后端基线验收通过。**

冻结版本在本机及独立Docker/Linux各1453项测试全部通过（11单元、1442集成，0失败、0跳过）；97项专项、Release构建和三宿主发布通过。详细证据见[verification.md](verification.md)。

本次验收对象是 htt-backend 的阶段B后端基线：在下面列明的 API、状态机和交易范围内，能够完成销售/采购/仓管及资金闭环，保留可追溯凭证，保证库存、往来、信用、GST 与总账一致。它不代表原116条需求全部交付，也不代表三个客户端或生产环境已验收。用户此前明确三个客户端暂不修改，本次继续遵守。

来源保持原[116条需求矩阵](requirements-acceptance.md)、澳洲v2阶段划分和历批接口文档；工作簿中的估时、建议不作为执行指令。未重写来源文件，未把C/D功能改作B阻塞项，也未把原清单中保留事项擅自标为完成。

## 本次关闭的后端范围

| 范围 | 关闭条件/实现边界 | 主要自动验收证据 |
|---|---|---|
| 主数据、价格与权限 | 客户/门店/联系人、供应商、商品/单位、仓库、价格；公司及客户/仓库授权隔离 | MasterDataApiTests及权限/协议专项，详见完整测试类清单 |
| 报价/办公室直接订单 | 草稿、提交、正式编号、办公室审批转订单/直接订单、信用检查、库存预留 | QuoteOrderTests、DirectOrderTests、SalesPermissionTests、SalesConcurrencyTests |
| 仓管履约与实物明细 | 拣货/取消、交接/发运、库存及COGS、货位/批次流水、可选少拣原因及照片、扫码协议 | FulfilmentTests、WarehouseDetailTests；同货位多行发运、盘点凭据锁等待回归 |
| 销售及客户资金 | 发票、AR/GST、收款/预收、核销/解除/重核销、数量和金额税额贷项、跨发票抵扣、退款及原账户撤销/更正 | InvoicingTests、ReceiptTests、ReturnTests、AmountCreditTests、CustomerCreditApplicationTests、SettlementReversalTests、CustomerRefundCorrectionTests、BankLedgerTests |
| 采购及供应商资金 | PO/收货、成本/GRNI、匹配及独立费用账单、实际价差、AP/进项GST、付款/预付/核销、退货/金额税额贷项/跨账单抵扣、退款及原账户撤销/更正 | PurchasingTests、SupplierBillTests、ExpenseBillTests、PurchaseAdjustmentTests、SupplierPaymentTests、PurchaseReturnTests、ExpenseCreditTests、CreditApplicationTests、SupplierSettlementReversalTests、SupplierRefundCorrectionTests、BankLedgerTests |
| 库存控制 | 直接及在途调拨、分批收货/短收、盘点差异及报损、成本和对应GL | InventoryControlTests、TransitTests、ReconciliationTests |
| 文档与生命周期 | QUOTE/INVOICE/PO PDF和邮件任务；当前允许实体的私有扫描附件；草稿软删/恢复和已过账单据合法冲销保护，恢复不重记账 | DocumentDeliveryTests、DocumentProtocolTests、DocumentTrashTests |
| 门户后端 | 独立认证方案、客户/门店/仓库 grant、商品搜索/详情与多仓可售、脱敏 | PortalTests；不含真实身份服务及客户端邀请/登录续期联调 |
| 员工搜索与设置 | 客户/门店/联系人/电话Email、SKU/名称/条码搜索，客户价格库存聚合；默认账期/报价有效期/配送模式和编号配置 | DiscoverySettingsTests；不是CRM最近访问/区域协作或模板设计器 |
| 银行账户与收付选择 | 独立BANK GL科目、账户档案/默认、脱敏选项；四类收付选择账户、原资金账户冲销与重核销 | BankLedgerTests；不含银行流水/Feeds、匹配和对账 |
| 基础财务查询 | 单快照GL明细/运行余额、凭证来源追溯、基础试算平衡和原库存/往来/GL控制核对 | BankLedgerTests、ReconciliationTests；不含完整财务报表包 |
| 可恢复及升级 | 写命令权限、幂等、并发、失败回滚；旧库升级保留原始单据/凭证/金额和银行FK；原迁移及锁文件摘要保持 | DatabaseTests、MasterDataUpgradeTests及各模块专项 |

银行账户与查询接口细节见[033说明](stage-b-bank-ledger.md)。完整测试类与最终数量以[verification.md](verification.md)本批记录为准，不以“有表/有路由”代替业务验收。

## 明确保留事项

| 分类 | 保留内容 | 对本次结论的影响 |
|---|---|---|
| 三端及真实服务 | customer-portal、htt_flooring_app、htt-management 的页面/契约及端到端联调；真实 OIDC/Cognito/邀请与续期；真实邮件、扫描器、相机/扫码硬件验收 | 后端基线可验收，原阶段B完整端到端验收仍未完成 |
| 已知深化限制 | 最近访问/区域CRM筛选、模板设计器；更多附件实体及已履约/已收货归档；强制照片/少拣原因门槛、分货位盲盘/复盘；采购运费分摊、验收前独立税票、纯价值减值和复杂批次计价 | 继续保留原需求归属；本轮没有交付，也不以现有基础接口冒充这些能力。新增交易种类需后续专项 |
| 阶段C/D | 银行流水导入/拆分/匹配/对账、Feeds、完整银行register；完整P&L/BS/CF/账龄与报表包；销售协作、激励、工资/STP、Recurring等 | 不纳入本次B后端基线的关闭条件 |
| 生产运行 | 真实历史期初迁移及核对、BAS/IAS核验、正式身份/权限配置、容量/安全、CI/CD、监控、备份恢复及回滚演练 | 未执行正式迁移或生产上线，不能据自动测试宣称已上线可替换MYOB |

旧库存未分配、盘点后分配；批次/货位追踪沿用原SKU/仓库移动平均成本，采购差异按用户确认的在库/已售规则处理。银行资料从旧GL保留为LEGACY，实际资料需要财务确认后补录。全部为明确的迁移/计价边界，而非隐藏自动修复。

## 最终判定方法

1. 冻结实现，构建与发布API、Worker、迁移宿主。
2. 原销售、采购、库存、资金与GST全量回归；完整销售/采购验收路径进一步使用非默认银行账户，逐步检查一致性。
3. 新银行/GL/TB专项及003—032旧库升级；核对银行账户ID保留、不伪造银行资料、原迁移摘要不变。
4. 本机与独立Docker/Linux运行完整测试集，任何失败/跳过/异常退出均不得签署通过。
5. 交付前核对目标初始摘要，保留先前未提交工作；仅写htt-backend。交付后按SHA-256逐文件确认。

**通过时的准确表述是“本文件列明的阶段B后端基线验收通过”；原需求全量完成、三端联调、真实服务和生产上线分别验收。**
