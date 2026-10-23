> G14 reference status (G15 follow-up, 2026-10-23): This is the G14 delivery record. Current remaining work and later acceptance: [Current status](CURRENT-SYSTEM-STATUS.md), [G15](G15-DESKTOP-ACCEPTANCE.md).

# G14 当前说明与有效入口收口

完成日期：2026-10-23。当前本地范围已关闭，结构版本保持 31。没有新增后台、迁移业务数据或修改账务算法。

## 当前说明

- README 从 React 模板改为项目开发、构建、范围检查及正式发布边界入口。
- [当前系统能力](CURRENT-SYSTEM-STATUS.md)、[工作包进度](WORKFLOW-ACCEPTANCE-20261021.md)和[文档索引](DOCUMENTATION-INDEX.md)组成当前范围入口。60 份 Markdown 分类为 4 份当前说明与 56 份阶段实现/验收记录；后者顶部标明时点及替代/后续链接。旧未实现项、结构版本和测试数留作当时证据，避免当成今日缺口。
- 原 54 条需求审查分类和测试证据不重写；currentStatus/followUp 记录 G14 关闭，需求54仍保留未完成的验收结论。G15/G16/G17 和三个外部边界继续开放。

## 有效入口与旧分支

当前 catalog 仅保留真实业务路由元数据；previewRoutes 显式分派本地页面。删除被更早真实分支覆盖的收退款/银行/导入分支及通用示例回退。未知映射明确不可用，不退回可操作样例。原 PreviewFlows 和通用示例页实现退役；旧字段夹具隔离到 legacyCatalog，旧 previewModel 只供历史回归使用。

共享 CSV 解析、转义和下载原样拆到 src/lib/csv.ts，实际消费者改用该模块，不再因使用 CSV 初始化旧示例状态。历史纯测试保留，它们不是当前业务流程数量。

目录使用真实能力描述，设置路由和目录共用 permission 元数据；采购设置修正为 purchases.read。帮助/能力页明确澳大利亚工资、真实文件、采购输出、CommBiz ABA、macOS 英文 OCR 以及外部服务未连接的边界。

全局标记改为 Local desktop / Local business data · No external services。演示向导明确使用当前本地档案、不是沙盒；链接页能保存数据，重启向导只重置清单，不撤销交易。演示单据链接从当前仓库读取，空账簿不虚构固定示例 ID；勾选检查项本身不提交业务动作。

旧预览的 21 处表格表面退役后，逐表清单为 **148 处，37 个完整登记簿**。这是代码表面数量变化，不是删除 21 条真实业务流程。G12 的原始 169 数字保留为阶段记录。

## 持续检查与验证

`node scripts/current-guidance.mjs --check` 检查全部 Markdown 分类、相对链接、后续文件，以及 renderer/main 的 433 个可达模块不引入退役示例状态/目录/流程。它不声称检查了所有动态业务状态。逐表检查继续独立运行。

- 实际项目完整回归：**152 文件、2009 项通过，0 失败、0 跳过，244.28 秒**。相对 G13 新增 7 项，覆盖目录权限/路由、当前说明/隔离及演示真实数据语义。
- 最终定向：5 文件、155 项，2.31 秒。实际 TypeScript、Vite renderer/main/preload 及通用 OCR 助手生产构建通过，原有分块大小提示仍为警告。
- 原生 Electron 使用复制的合成档案检查目录、帮助、能力卡片、最终全局标签和演示说明；目录和能力卡片桌面布局可读无重叠。未修改权限或执行业务动作。
- 退出后 repositories/storage 与进入前逐项一致；未使用真实业务档案。采购角色目录/路由一致性由 SSR/路由测试验证，未声称所有角色均逐页原生点击。

剩余本地工作包为 G15、G16、G17；G17 是库存差异进入财务总控。外部邮件/在线支付、银行 feed、电子税务工资提交仍未连接。G14 不替代后续全角色、全状态或正式发行验收。
