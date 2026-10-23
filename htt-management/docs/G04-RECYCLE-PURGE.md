> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G04 回收站范围与永久清理

完成日期：2026-10-22（Pacific/Auckland）。继续沿用本地主进程、Repository、持久化、备份和审计架构，不连接独立后台。

## 退出条件与边界

仅允许 ADMIN 清理已进入回收站的五类未审批、未过账且无关联业务的草稿：Quote、Purchase order、Sales order entry draft、Invoice entry draft、Expense bill entry draft。普通 FINANCE_ADMIN、ACCOUNTANT、AUDITOR、SALES、PURCHASING、WAREHOUSE 均不能准备或执行永久清理。主进程验证角色及 users.manage，不依赖页面按钮。

已发送报价、已批准采购单／录入草稿、已确认销售订单、已过账发票／费用账单、贷项及取消记录不在清理范围；保留既有作废、冲销和审计流程。因此 G04 完成不代表所有 Invoice/Order/Credit 都能物理删除。

任何业务引用都会阻止永久清理，包括周期业务、生成记录、单据输出、导入记录、附件和财务操作日志。附件即使已在附件回收站仍然阻止清理，原文件字节和版本不删除。检查会解析 JSON 编码的操作引用，逐条检查自身集合外的引用，采购源记录与财务缓存必须一致。选中两个彼此引用的对象也不允许级联删除。

## 操作和失败保护

1. 在 `/sales/recycle-bin` 选择最多 100 条回收站草稿，点击 Preview permanent purge。逐项列出可清理状态或阻止原因；预览本身不备份、不清理。
2. 输入至少 10 个字符的原因和准确确认文字 `PURGE N DRAFTS`。五分钟内、同一可信管理员、同一业务数据摘要才能提交。来源内容、生命周期、关联业务或财务操作证据变化后需重新预览；未提交的预览不跨进程重启保存。
3. 主进程先生成完整业务备份到桌面业务档案的 `local-security/recycle-backups/pre-purge-<UUID>.json`。目录权限 0700、文件 0600，经原子写入、读回、快照校验与 SHA-256 摘要后才移除来源。备份不含用户密码或安全档案。
4. 整批清理来源、同步采购缓存并追加 Purged 审计凭据，经 BusinessHost 统一提交。任一来源或收尾失败恢复整批内存及持久化前状态。备份失败不产生清理副作用。已生成的备份保留，即使后续清理失败，也不自动删除。
5. 提交无法确认时阻止后续写入，要求重启。重启后同一请求、同一管理员返回持久化的原凭据，不重复清理或重复生成备份；未提交请求必须重新预览。不同内容不能复用 operation ID。

清理只移除草稿源记录，不制造或修改财务分录、库存或余额。历史回收／恢复事件仍保留，新增凭据包括可信管理员、时间、原因、来源内容摘要、请求摘要、预览摘要、原标识及备份文件名／SHA-256。原报价／采购单编号保留为序列保留项；录入草稿的创建请求 ID 也不能复用。

## 恢复与快照兼容性

永久清理后不能在回收站逐条恢复。保留完整清理前业务备份；管理员可在 Data protection 选择该文件，先预览再恢复整个业务档案并重启。该操作会恢复整份备份状态，不能用于选择性合并后续业务变更。操作系统删除备份文件不由应用自动补建；需按本地备份策略留存。

快照升级到 schema 25。版本 24 及以前的合法快照仍可迁移并保存迁移前备份；永久清理凭据不能伪装为低版本。恢复验证清理生命周期、整批请求指纹、备份凭据格式、来源缺席、引用完整性和原编号／创建请求不复用。历史业务审计原始快照不覆盖。

## 验证

新增 `purgeIntegration.test.ts`，覆盖五类真实来源的清理、备份校验及完整恢复、混合批次、编号与创建请求保留、跨重启重试、六种拒绝角色、另一个管理员消费预览、严格输入、状态与摘要变化、预览过期、附件及已删除附件、JSON 操作引用、备份失败、后续来源失败整批回滚、提交前失败、提交后确认失败、错误快照及 schema 24 迁移。原 18 项回收／恢复集成测试继续通过；页面路由测试检查 ADMIN 控件和 AUDITOR 隐藏边界。

原生 Electron 使用 `/private/tmp/htt-g04-native` 独立合成档案完成登录、页面导航、两条草稿混合预览，确认附件引用阻止整批清理、确认按钮禁用，同时显示可清理草稿及既有 Purged 管理员／时间／原因／备份文件／SHA-256。检查桌面截图，布局和提示可读。原生 UI 未执行永久清理；执行、失败回滚及备份恢复由真实主进程集成测试验证，不使用真实业务档案。

实际项目 `/Users/chandler/Documents/GitHub/HTTFlooring/htt-management` 最终验证：TypeScript、Vite renderer 与 Electron main/preload 生产构建通过；130 个测试文件、1654 项测试全部通过，0 失败，191.19 秒。其中新增 G04 主进程集成测试 26 项，原回收／恢复集成测试 18 项继续通过。Vite 既有大分块提示仍为警告。

执行命令：`tsc -b && vite build`；`node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev`。Node 24 使用 no-maglev 以沿用已验证的测试运行方式。
