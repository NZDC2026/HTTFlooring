> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G13 本地票据识别

完成范围：macOS 桌面、本地英文单张供应商发票。沿用本地可信主进程和费用草稿流程，不新增后台或外部识别服务。

## 处理链

1. Supplier document capture & review 的 Select and recognize original 打开主进程文件选择器。只读取所选普通文件，拒绝链接、目录、路径注入及扩展名/签名不符。
2. 最多 10 MB 的 PDF、PNG、JPEG 进入本地 Apple Vision accurate 识别。PDF 必须可解锁且为 1–10 页；每页缩放渲染后识别；图像限单张、40 百万像素并按方向缩放。保留页号、文本、置信度和引擎标识。
3. 主进程保留完整原件字节、名称、类型、长度、SHA256、可信创建人/时间和识别结果。库总量限 50 MB；原件不可修改或从界面删除，纳入正常业务备份/恢复。
4. 规则解析建议发票编号、日期、到期日、净额、税额、总额；金额须为明确标签和小数，日期支持 ISO 与澳大利亚日/月/年。冲突值保留为候选，不擅自选择；缺失、低置信度和疑似非 AUD 均提示复核。识别置信度不是会计准确率。
5. 用户显式应用无歧义建议，人工选择供应商、费用科目和税码并录入费用行。**不自动识别行项目、匹配供应商或推断科目，不做汇率换算。**可修改字段，但原始文本和原件保持。
6. Calculate & review source 仍调用主进程金额计算，显示原票与计算净/税/总额，检查算术和供应商发票参考重复。必须人工勾选确认后才能 Create reviewed expense draft。
7. 创建正常 DRAFT，记录不可变 originalSource ID/名称/SHA256，并在 intake notes 保留原票声明金额。普通编辑、批准、过账保留 originalSource，源库仍可恢复/导出；后续编辑不证明与原件金额一致。批准与过账沿用现有独立流程。

同一文件按 SHA256 去重，重新选择直接恢复原件，不重复识别。相同原件即使改参考编号，也不能创建第二个有效 intake；已取消草稿或已作废原账单允许重新准备。供应商/参考编号重复检测继续覆盖手工、CSV、识别三条入口。原件选择可从 Resume preserved original 继续，草稿详情也可导出原件。

## 权限与恢复

识别、识别文本读取、原件导出和转草稿使用 `purchases.bill`，与原费用准备权限一致。无权角色看不到 OCR 文本/字节。renderer bootstrap 只含允许读取的元数据与文本，不含原件 base64；读取原件另经主进程授权。文件选择前检查权限，导出对话框后再次检查会话，禁止写入活动档案目录。来源记录及费用创建均由 BusinessHost 原子命令提交；失败回滚，操作 ID 重试保留同一结果，冲突内容拒绝。

持久化升级为 **31**。旧档案升级前留备份，新增空 captureSources，不更改旧账簿。备份验证检查字节/类型/大小/哈希、识别结构、唯一原件/操作及草稿原件引用，拒绝孤立链接和版本降级掩盖证据。备份校验不把 OCR 文本当作会计事实；所有金额继续人工复核并由现有主进程计算。

## 构建和平台

`vite build` 的 local-capture-ocr 插件调用 `scripts/build-capture-ocr.mjs`，用 Xcode Command Line Tools 编译项目自己的 `native/CaptureOCR.swift`，合并为 arm64/x86_64 通用可执行文件。产物在 dist-ocr，electron-builder 将其复制到 Resources/ocr。运行时不需要 Swift 编译器，主进程通过固定助手路径和独立临时目录执行，不接受 renderer 可执行路径；45 秒超时，2 MB 输出限制，临时文件 finally 清除。

Windows 或缺少助手时明确报不可用，可继续手工/CSV；没有宣称 Windows OCR、手写、多语言、复杂表格或所有票据模板都已完成。英文标签之外、负数贷项、外币或复杂票据需人工处理，现有贷项流程另行使用。签名、公证、Windows 发布仍属 G16；全角色/全状态视觉验收仍属 G15。

实现依据：[Apple VNRecognizeTextRequest](https://developer.apple.com/documentation/vision/vnrecognizetextrequest)。该接口返回识别文本及候选置信度；字段解析和会计复核由本项目完成。

## 验证

实际项目最终完整回归：**150 个测试文件、2002 项全部通过，0 失败、0 跳过，251.37 秒**，比 G12 新增 23 项。TypeScript、Vite renderer/main/preload 及通用 OCR 助手生产构建通过。定向 9 文件/60 项通过。首轮旧 IPC mock 缺少 Electron app 导出导致 17 项失败，补齐 mock 后完整重跑通过；同时补测原件导出在保存对话框后重新检查会话。详细证据见 `acceptance-20261021/evidence.json` 的 g13FollowUp。

真实助手合成样本：PNG、JPEG、双页扫描 PDF 均提取 OCR-2026-001、2026-10-23、到期 2026-11-22、净 100、税 10、总 110。十一页 PDF 和损坏图像拒绝，空白 PDF 返回无文本并由入库流程阻止保存。原生文件选择器完成双页 PDF 识别、应用建议、人工费用分配、匹配金额复核、明确确认并创建 DRAFT revision 1。导出原件逐字节相同；业务 storage 未改变，repositories 只有 captureSources/expenseBillDrafts 改变，没有过账或付款。

自动测试覆盖标签/金额/日期/置信/冲突解析、可信保存/投影、同字节去重、草稿原件绑定与后续编辑保留、重复及金额门槛、权限、失败回滚、重启/幂等、损坏备份/引用与版本迁移、原生路径/链接/目录拒绝、取消、活动档案保护及对话框后会话到期拒绝。

未签名 macOS arm64 目录包实际生成并原生登录：Resources/ocr 内通用助手识别 JPEG 成功，重启后既有 DRAFT revision 1 与 PDF 原件链接保留。x64 助手已交叉编译但未在 x64 机器运行；没有声称完成正式签名或跨平台发布。

完整回归后，最后一处界面保护使权限丢失时不再显示组件缓存的识别文本；实际项目定向 7 文件/178 项（6.06 秒）及最终生产重构建通过。
