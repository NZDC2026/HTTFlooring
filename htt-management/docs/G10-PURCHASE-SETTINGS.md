> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G10 采购设置默认值

G10 本地范围：独立 `/settings/purchases` 页面，采购期限／付款偏好保存、来源继承、历史保留、权限、并发、审计与重启。

## 默认值规则

- 期限为 0–365 整数天；可选“供应商期限优先”或“采购设置期限”。供应商的 0 天有效，不作空值处理。无独立配置时默认供应商优先，备用 30 天。
- 付款偏好支持 BANK_TRANSFER、CARD、CASH、CHEQUE、OTHER；只建议付款方式，不执行支付，不改变银行账号、审批、期间或金额校验。
- 新采购单由主进程获取配置及供应商期限，保存天数、来源、付款偏好和设置版本。修改配置、供应商资料或编辑既有草稿不重写这份快照。
- 库存账单继承采购单快照；未提供到期日时从账单日期计算，明确输入的到期日优先。旧采购单无快照时保留原来的 30 天账单默认路径。
- 费用／服务账单首次保存由主进程记录采购快照；缺少到期日时计算默认值，明确填写的日期保持。编辑、批准、过账和重启都保留首次保存的快照。旧草稿不追填新偏好。
- 新费用账单、供应商单据捕获表单按采购设置／所选供应商初始化日期；切换供应商或单据日期会重算可编辑的到期日。CSV 或源文件已明确的期限仍需人工核对。
- 付款页从单张账单的付款入口进入时使用该账单偏好；普通新付款使用当前采购偏好。混合多账单付款仍由操作员确认统一方式。
- 销售发票期限、税率、含税／未税和编号规则仍由原财务设置管理。采购设置页提供编号设置链接。

## 权限与持久化

沿用 `workspace_settings` 的 Repository／Service／本地事务和快照恢复。采购页面读权限为 `purchases.read`，写权限为现有 `accounting.post`（ADMIN、FINANCE_ADMIN、ACCOUNTANT）。PURCHASING 可使用默认值创建采购单和账单，但不能修改全局默认值；AUDITOR 只读，SALES／WAREHOUSE 无维护权限。

设置维护须提交旧 revision；过期写入拒绝。每次保存留存可信 actor、时间、设置版本及完整 after 快照。写入失败恢复设置和审计；重启读取已提交状态。新增字段是现有记录上的可选字段，沿用快照版本 30；不对旧单据／输出批量回填或改写。恢复时验证期限、付款枚举以及账单与来源快照一致性。

## 验证

实际项目完整回归：140 个测试文件、1882 项测试通过，0 失败／跳过，237.24 秒。生产 TypeScript、renderer、Electron main 和 preload 构建通过，仅保留既有 chunk-size 提示。新增 24 项主进程测试及 1 项路由测试已包含在全量结果内。

见同目录验收清单和 evidence.json 的 g10FollowUp：专项主进程测试覆盖期限策略、零天、来源继承、手动日期、重试、编辑、重启、拒绝权限、并发冲突、失败回滚、旧来源兼容、备份校验和日期边界；路由测试覆盖独立页面与角色控件。

原生 Electron 使用 `/private/tmp/htt-g10-native` 独立合成档案：页面显示采购期限 21 天、CHEQUE 及历史 revision 1；新费用账单从 2026-10-22 自动初始化到期日 2026-11-12。布局清晰，未操作实际业务档案或通过 UI 过账／付款。只读验收前后 repositories 与 storage 完全一致，应用已关闭。
