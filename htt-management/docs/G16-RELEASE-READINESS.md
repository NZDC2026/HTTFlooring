# G16 发布准备与本地运行诊断

更新：2026-10-23。**本地实现、macOS arm64 隔离演练及 x64/Rosetta 补充验证完成；G16 正式交付验收仍未关闭。** 本机没有有效签名身份；远程 CI、macOS Developer ID 签名/公证、Windows 签名和原生安装、Intel Mac 实机运行尚未验收；Windows x64 未签名 NSIS 包已在本机交叉构建并通过结构检查。保留 schema 31、版本 0.1.0 和本地架构，不接入后台或自动更新服务。

## 已实现

- Node 24.19.0、pnpm 11.25.0、直接依赖精确版本和锁文件固定。`pnpm install --frozen-lockfile` 是构建入口，不在发布时升级依赖。全新临时目录安装及 Electron 44.5.1 启动通过；共享 node_modules 的旧安装不是唯一验证来源。
- Git 仓库根目录的 `.github/workflows/desktop.yml` 对管理端执行冻结安装、Electron 显式安装、文档/表格检查、build、完整 test 和未签名目录包检查。矩阵为 macOS arm64、macOS Intel 和 Windows x64。**文件已安装到真实仓库根目录，尚未推送或运行远程 job**。托管 runner 镜像仍随服务更新，不宣称逐字节可复现。
- `.github/workflows/signed-release.yml` 只接受人工触发的现有版本标签，分别使用 `desktop-release-macos`、`desktop-release-windows` 环境凭据；只上传候选产物，不建 tag、不公开发布、不执行付款。
- `pnpm release:signed` 检查标签与 package 版本/HEAD 一致、构建前工作树干净、运行环境、签名凭据及 Developer ID 身份。未满足即失败。正式配置强制签名，macOS 开启 Hardened Runtime、JIT entitlement、公证，并包含本地 OCR helper 的签名。Windows SHA256 签名。构建后实际验证 macOS codesign、Gatekeeper 和 app stapled ticket / DMG 完整性，或 Windows Authenticode。
- 每次正式构建使用全新 candidate 目录，防止把旧安装包混入本次结果。输出 SHA256SUMS 和 release-manifest，包含版本、commit、工作树状态、运行环境及锁文件/安装包摘要。历史 dist-electron 已被 Git 跟踪，构建后允许其生成文件差异；其它源码差异会拒绝候选产物。发布前仍要求整个工作树干净。
- 默认打包保留显式 Demo/未签名标记。`release-tools/scripts/finalize-release.sh` 已改为正式门禁入口，不能再用 unsigned internal demo 冒充发布。

## 本地诊断与监控

原生 **Help → Local diagnostics…** 显示版本、日志是否可写及本次会话告警，可打开日志目录，无需给渲染进程新增文件系统权限。日志在独立档案目录 `diagnostics/operations.jsonl`，当前文件加两代轮转，每代约 256 KiB；另有一个小型 session.json 标记。目录创建权限 0700，文件 0600（Windows 实际访问控制以用户档案 ACL 为准）。

固定事件码覆盖启动/就绪/正常退出、上次异常退出、渲染进程退出、无响应/恢复、加载失败、主进程异常、PDF 输出失败和周期扫描停止。异常主进程锁定会话并以非零码退出，不继续在未知状态写账。周期扫描停止后由管理员检查档案、备份并重启，不静默自动重试。

日志不接收任意错误对象、消息、URL、用户名、凭据或业务 payload；不接外部遥测。业务审计仍在 Security settings，不能用运行日志替代财务审计。日志不可写会在诊断窗口显示 unavailable，不阻止业务；日志会轮转，运维需要在复现后及时留存。session 告警是线索，不证明数据已损坏。无外部实时告警、SLA 或集中监控，本地使用者负责检查并提供脱敏日志。

遇到 previous-unclean-exit / renderer-gone / main-exception，先正常退出、保全业务档案和备份，重启并核对业务状态；反复出现或 checksum/恢复阻止时停止业务写入，由 ADMIN 从已验证备份预览恢复。不要删除档案重建数据。

## 安装、升级与回退规程

1. 升级前用 ADMIN 导出并校验业务备份；正常退出后保全完整用户档案及旧安装包。业务备份不包含本地账号/密码/审计，因此不能替代完整档案的离线保全。
2. 核对发行 manifest/安装包 SHA256、签名和系统信任后安装。首次先用独立合成档案验证登录、数据/附件、OCR（仅 macOS）、输出及恢复。
3. 本轮实际从本地 DMG 挂载、复制至临时安装目录，使用旧构建建立的独立档案登录；导出备份、原生选择预览/确认恢复、重启，核对全部 repositories/storage 与基线一致，并保留原文件副本。
4. 回退演练使用保留的旧 G13 本地构建。新旧均为 0.1.0/schema 31，恢复后旧构建重新登录可读取且业务内容一致；**这只是同结构本地构建替换，不是正式版本升级或跨结构降级证明**。
5. 若未来新版本迁移结构，旧程序必须使用与其结构兼容的升级前备份/完整档案。不要直接把新结构数据库交给旧程序，也不要手工降低 schemaVersion。恢复需 ADMIN 预览、明确确认和重启。新结构拒绝/迁移失败保留原字节等保护见现有 8D 回归。

## 实际证据

[机器记录](acceptance-g16-20261023/evidence.json)包含安装包摘要、旧/新 app.asar 摘要和本地演练观测。完整实际项目 build 通过，155 个测试文件 / 3502 项通过（243.99 秒）。新增 16 项覆盖日志轮转/隐私/不可写/异常退出、签名缺失/版本/标签/环境门禁。最终实际目录专项复核 4 个文件 / 23 项通过，正式配置通过已固定 builder 的 schema 校验，未签名包被真实签名检查拒绝。原生实测异常终止仅作用于明确 PID 的合成档案进程，重新启动诊断窗口确实显示 previous-unclean-exit，随后正常退出。

未执行：正式签名/公证、远程 CI、Windows/Intel Mac 原生安装与恢复、干净机器 Gatekeeper/SmartScreen、真实发布版本迁移。`pnpm release:check` 当前失败是预期结果：没有指定已提交的版本 tag；本机 codesigning identity 查询为 0。它不是构建失败，也不能改为跳过门禁来宣布 G16 完成。

## 正式关闭所需条件

在两个 GitHub Environment 分别配置对应平台的 CSC_LINK、CSC_KEY_PASSWORD；macOS 另需 CSC_NAME（Developer ID Application）、APPLE_ID、APPLE_APP_SPECIFIC_PASSWORD、APPLE_TEAM_ID。不把凭据放进源码、补丁或日志。提交审阅后的全部源码，确定实际发行版本并创建不可覆盖 tag；由发布负责人触发候选构建。CI 的 Secret 环境需设置受保护的审阅规则。

取得真实绿色 job 和签名验证产物后，在 macOS arm64/Intel、Windows 的目标环境执行安装/升级/回退/备份恢复验收并归档版本、摘要和结果。完成这些之前，G16 保持部分完成；G17 库存差异进入财务总控现已完成，见 [G17 验收记录](G17-INVENTORY-FINANCE-CONTROL.md)；E01–E03 外部边界仍未关闭。

本次补丁使用 **HTTFlooring Git 仓库根目录** 相对路径：`.github/…` 和 `htt-management/…`。项目目录已直接更新；再次覆盖时不要解压到 htt-management 子目录内。

配置依据：[electron-builder v26 macOS](https://www.electron.build/v26/docs/mac/)、[v26 Windows 签名](https://www.electron.build/v26/docs/features/code-signing/code-signing-win/)、[Electron 公证](https://github.com/electron/notarize)、[pnpm 构建脚本设置](https://github.com/pnpm/pnpm/blob/main/pnpm11/docs/settings/build.md)。固定在 v26 配置语法，不照搬新版 v27 的签名对象。

## 2026-10-23 补充：跨平台构建与 Rosetta 验证

用户确认目前无发布证书，先完成其余可验证部分。因此继续保留签名、公证、远程 CI 和目标实机验收条件，不生成自签证书代替正式身份。

- 本机实际生成 Windows x64 NSIS 安装包；PE 检查表明业务程序为 x64，NSIS 引导程序为 ia32（安装 x64 payload），证书表为空，仍是未签名内部候选。没有 Windows/Wine 环境，**未执行 Windows 安装、登录、卸载、升级或恢复**。
- 初次交叉打包发现 Windows 包误带 macOS OCR Mach-O 程序。已把 OCR extraResources 限定到 mac 配置；重新构建确认 Windows 包不含该程序，仍提供手工/CSV；Mac arm64/x64 均保留正确架构的 helper 和共享图标。
- 新增 `node scripts/verify-desktop-package.mjs [darwin|win32] [arm64|x64] [应用目录]`。默认检查本机 release 输出，也可指定交叉打包目录。检查实际 PE/Mach-O 架构、ASAR 版本、主进程/页面/preload、共享图标、测试源码隔离和平台 helper 契约。已接入根目录 CI 的目录包检查及正式候选签名验证前置步骤。结构检查不声称通过签名或运行验收。
- 真正 x64 Electron 包通过 Rosetta 在独立合成档案登录、加载 Dashboard 和读取业务。x64 OCR helper 在翻译模式直接执行曾失败，而 arm64 分支识别成功；已按 Apple 的 `sysctl.proc_translated` 标志，仅在确认 x64 进程受翻译时用 `/usr/bin/arch -arm64` 调用随包通用 helper。原生 Intel 或查不到该标志时继续直接调用 helper；保留原有超时、验证和临时文件清理。
- 修复后，真实 x64 Electron 执行实际识别模块得到 1 页/10 行；重新打包的 x64 桌面在原生文件选择器选中合成 JPEG，实际显示原件 SHA256、Apple Vision 引擎、页数及识别建议，原件与证据已持久化。不创建或过账账单。此为 Rosetta 兼容性证据，**不能替代 Intel Mac 实机的系统框架及签名验收**。
- 新增 9 项回归，覆盖 Windows 混入 Mac helper、错误架构/版本、缺 preload、损坏可执行头，以及 Rosetta/原生 Intel/查询失败的识别调用。实际项目 build 通过，完整回归 157 个文件 / 3511 项通过（256.01 秒）。机器记录 crossPlatformFollowUp 保留初次失败与修复结论。

Apple 官方检测依据：[Rosetta translation environment](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment)。代码没有连接独立后台，也没有扩大渲染进程权限。
