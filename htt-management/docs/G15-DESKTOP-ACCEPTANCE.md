# G15 本地桌面验收基线

2026-10-23。已完成本文定义的本地验收矩阵。结构版本仍为 31，不新增后台、不改变记账算法。

## 验收方法与边界

“全角色”是 ADMIN、FINANCE_ADMIN、ACCOUNTANT、SALES、WAREHOUSE、PURCHASING、AUDITOR 七个当前角色。“状态”按可复现的授权、只读、正常/空结果、缺失记录/重定向、校验、并发、重复、生命周期、回滚、重启和恢复类别组织，证据标明执行层。它不表示任意数据、角色、金额、业务状态的无限组合，也不表示每个组合均人工点验。

三层证据不能互相冒充：

1. [路由矩阵](acceptance-g15-20261023/route-matrix.csv)：7 × 210 路由，共 1470 次自动组件检查，以及 7 项菜单/银行写入口检查。包含读取、拒绝、空/缺失、重定向。SSR 不运行浏览器 effect，因此仅在测试中给同步 store 提供服务端 snapshot，Navigate 记录目标而不执行跳转。它不是原生视觉检查，也不是每个详情记录已成功加载的证明。
2. [业务用例](acceptance-g15-20261023/regression-cases.json)与[流程状态映射](acceptance-g15-20261023/workflow-matrix.json)：本轮完整业务回归的逐项结果和可追溯 ID。状态类别依据实际测试名称建立索引，空列表不宣称覆盖；财务状态、版本、权限和恢复由真实 BusinessHost/Repository 测试核对，不靠页面渲染猜测。
3. [原生用例](acceptance-g15-20261023/native-cases.json)：本轮通过 CUA 在真实 Electron 窗口执行的 23 项代表性观察，涉及七角色、1100×700 最小桌面和 1440×900 常规桌面、原生文件选择/导出/取消、刷新失效、损坏档案阻止与恢复后重启。只有这些项目标为原生通过，不把其余路由填成人工通过。

这是当前管理端 macOS 本地验收基线。Windows/x64 机器、签名安装升级和跨平台发行仍归 G16；库存差异进入财务总控仍归 G17，不能由本轮通过结果消除。原始外部服务 E01–E03 未连接。旧静态验收的 90 路由和阶段测试数保留为历史记录。

## 发现并修复

| 问题 | 最终行为 | 验证 |
|---|---|---|
| 报表库外层要求销售读取，挡住采购/仓库角色 | 报表库允许当前角色进入，再按各报告权限过滤 | 七角色路由；WAREHOUSE/PURCHASING 原生检查 |
| 工资卡片使用会计权限、仍写 Sample | 使用 payroll.read，说明实际 AU 本地汇总；AUDITOR 不显示 | SALES/AUDITOR/ACCOUNTANT 原生卡片检查 |
| 库存估值/GL 成本报告卡片与路由权限过宽 | 均要求 inventory.cost.read；无权限不展示入口且直接路由拒绝 | 七角色路由；仓库/销售原生报表卡片 |
| 会计期间菜单漏掉会计路径前缀检查 | 无 accounting.read 的角色不再显示期间菜单 | 七角色菜单断言；SALES 原生复测 |
| AUDITOR 银行页面仍提供新增/转账入口 | 无 banking.write 不展示入口，两个新建路由也明确拒绝；账户对账入口及路由独立要求 banking.reconcile | 七角色菜单/银行断言；AUDITOR 原生复测 |
| 最小桌面下长身份、搜索文字和退出按钮挤压换行 | 身份/标题/搜索单行截断，退出保持单行，完整页面标题仍在正文 | FINANCE_ADMIN 最终窄屏原生复测 |

主进程原有命令授权仍是最终写入边界。上述修正收紧界面，不以隐藏按钮代替授权。

## 实际结果

- 实际项目完整回归：**153 文件、3486 项通过，0 失败、0 跳过，245.48 秒**。其中 1477 项是新增路由/菜单矩阵，不能当成 1477 条新增业务闭环。
- 最终相关定向：实际项目 5 文件、1527 项通过，2.83 秒。完整回归后最后的独立对账入口检查和搜索文字截断样式通过该定向回归、最终生产重构建及原生复测；AUDITOR 无对账按钮，ACCOUNTANT 仍可对账。
- TypeScript、Vite renderer/main/preload 和既有本地 OCR 助手生产构建通过；原有大分块提示仍为警告。
- 路由结果按输出文本分为 rendered 375、denied 459、empty-or-missing 500、redirect 136；这是渲染观察分类，不是四类业务记录的独立库存数量。
- 首轮 SSR 测试中 Navigate 没有 HTML 和缺 server snapshot 导致失败；调整测试适配，不将这些服务端渲染限制错误标为 Electron 缺陷。其后 1470/1477 项矩阵通过。原生发现的菜单、银行只读及页头问题另行修复并复测。

正常合成档案在七角色登录/查看、原生备份导出后，repositories/storage 与种子逐项一致。导出的业务备份也一致。另一个独立合成档案只改坏 checksum：登录显示校验失败，选择有效 v31 备份、预览、明确确认后恢复，界面要求重启。宽屏重启后 QA-EMP 员工及全部仓库数据与所选备份一致；取消原生选择不执行恢复。没有使用真实业务档案，没有通过 UI 过账、支付或更改用户权限。

## 复现

应用路由定义在 src/app/routes.tsx，生产 router.tsx 仍使用同一配置；没有复制一套“验收路由”。正常 `pnpm test` 包含角色矩阵。使用同一源代码构建后，下面的工具仅生成新的临时合成档案：

```sh
HTT_ACCEPTANCE_PROFILE=/private/tmp/htt-g15-fresh node --no-maglev ./node_modules/vitest/vitest.mjs run --config scripts/desktop-acceptance.config.ts --pool=forks --maxWorkers=1 --execArgv=--no-maglev
./node_modules/.bin/electron . --user-data-dir=/private/tmp/htt-g15-fresh --acceptance-window=compact
```

夹具工具拒绝非临时目录和已有 local-security 目录，包含明确的公开测试凭据，仅供一次性合成档案；不在普通测试中冒充一个无执行的通过用例，不打包到应用。compact 仅在显式 alternate profile 下生效，只调整窗口尺寸，不绕过认证/权限。

`HTT_ROUTE_EVIDENCE=/private/tmp/route-observations.json` 可导出本轮矩阵观察。完整回归用 JSON reporter 输出结果，再用 `scripts/desktop-acceptance-evidence.mjs <vitest-results.json> <route-observations.json>` 生成流程索引。工具拒绝失败/跳过的回归，不把业务索引当作原生操作日志。
