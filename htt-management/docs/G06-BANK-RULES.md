> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G06 银行规则自动分类

完成日期：2026-10-22（Pacific/Auckland）。沿用本地可信主进程、Repository、持久化和审计，不连接独立后台。

## 规则、优先级与自动范围

`/banking/rules` 已接入实际规则定义、复合条件编辑、分类预览、分类凭据及撤回。规则仍保存在原 workspace_bank_rules，保留原 ID、版本和配置审计。

每条规则支持 1–20 个条件，选择 All conditions（AND）或 Any condition（OR）。字段包括 Description、Reference、Payee、绝对 Amount、Direction、Date；文本支持 Contains／Equals／Starts with／Ends with／Not contains，金额与日期支持 Equals／At least／At most／Between（包含边界）。文本忽略大小写及首尾空格；金额仅接受整分且范围有序，日期严格 YYYY-MM-DD。Direction 为 MONEY_IN／MONEY_OUT。银行范围可选 All 或指定账户。

优先级为 0–999，数字小者先。只考虑 Active 且 Enabled 的匹配规则；最高优先级若有多条匹配，即使会计动作相同，也返回 Conflict，不以 ID 顺序猜测。较高优先级的手动规则或无效动作不会被较低优先级自动规则绕过。

自动分类须逐条规则明确选择 Yes，旧规则默认 No。仅对当前导入命令实际新增的流水行执行；重复导入不重复分类，新增或修改规则不会偷偷重分类既有流水。自动分类保存的是待审核的科目／税码建议与完整来源凭据，流水仍为 UNMATCHED，不新增分录、收付款、实际银行指令或已清除状态。冲突、无匹配和受阻行保留未处理，可从预览查看具体原因，不自动降级选规则。

Payee 来自可选导入字段／CSV 映射，不能由 Description 冒充。缺失 Payee 不满足其负向条件；AND／OR 中其他条件仍按所选逻辑执行。带银行 ID 的同一流水若 Payee 改变，作为冲突拒绝；无 ID 的新流水在有 Payee 时将其纳入导入身份，旧无 Payee 流水保留原导入键。

## 预览、批次与重复保护

一次选择最多 100 条未处理流水，Preview bank classification 返回 Ready／Conflict／Blocked／No match、胜出规则及解释，不保存分类或过账。保存要求 banking.write、至少三字符原因、同一可信操作者、五分钟内及未变化的完整业务摘要。来源、规则、期间或其他业务状态改变后必须重新预览。整批所有行都须 Ready；任一冲突、无匹配、状态改变或已有未撤回分类拒绝整批，原分类保持。

应用凭据保存操作 ID、整批指纹、预览摘要、可信操作者／时间／原因、自动／人工来源，以及流水和规则的内容摘要与分类结果。相同请求跨重启返回原凭据，不追加分类；同一操作 ID 不能用于不同请求。尚未提交的预览不跨进程保存。

自动分类与导入位于同一个 BusinessHost 原子命令：自动分类写入后异常时，导入流水及分类凭据一起回滚。人工批次同样由主机整批提交。持久化提交无法确认时阻止新写入，重启后根据实际持久化结果重试，不能猜测或重复处理。

## 保护与人工过账

分类必须满足：流水未处理、银行及其 GL 活跃、流水不早于开户日、未在已完成对账区间、期间可写、财务异常门禁通过、对方为活跃可手工过账的费用／收入科目、税码活跃。AR/AP、银行间转账、资产／负债控制科目必须走各自来源流程。

如果同一银行账簿已存在截至该流水日、同方向且同金额的已过账银行来源，返回 Blocked 并提示先核对原来源。这是保守的重复风险保护：即使金额相同的来源实际无关，也需要用户人工核对，而不会自动创建第二笔现金记录。

在 statement workbench 点击 Review，只有来源和规则仍有效的保存分类才载入科目／税码。使用保存分类过账时，主进程在提交当刻再次检查规则、来源、期间和重复风险；新出现同金额来源或规则修改后不能使用旧分类过账。随后调用原 bankStatementRepository.post、财务写入门禁和期间保护，并保留原入账／对账链。相同过账请求不重复产生分录。用户明确修改拆分时走原手工分类流程并承担正常审核责任；分类税码在人工过账时使用当前有效税配置，不冻结税额或自动过账。

未过账分类可填写原因 Withdraw，追加撤回凭据，不删除历史，不修改分录或流水。已处理流水不允许借“撤回分类”逆转账务，须走原撤销匹配／原日期纠错冲销及对账限制。原日期撤销再分类后，旧来源摘要失效，不重新载入原分类。

## 权限、迁移与备份

读取与预览要求 banking.read；保存规则、应用、撤回与过账要求 banking.write。ACCOUNTANT／AUDITOR 可以读取和预览，不可写；SALES／PURCHASING／WAREHOUSE 无银行读取视图。页面按钮之外，主进程独立校验权限、输入、操作者及摘要，不接受 renderer 注入自动标记、规则动作或操作者。

快照升级至 schema 27，新增 bankRuleApplications.receipts；合法 schema 26 及更旧快照迁移为空凭据表，旧单条件规则仍可读取／建议且自动关闭。新复合规则或分类凭据不得冒充旧结构版本。正常备份包含规则、来源、分类与撤回历史；恢复验证来源和动作引用、批次指纹、唯一行、应用／撤回顺序及摘要格式。保留迁移前备份，完整业务恢复沿用 Data protection 预览／恢复／重启流程。

## 验证记录

新增纯条件与真实主进程集成测试覆盖全部比较边界、错误参数、AND／OR、银行范围、优先级冲突、自动选择限制、Payee 导入身份、无分录副作用、预览／撤回、批次原子性、过期／重启／不同操作者、角色隔离、税码／科目／期间限制、已有账簿来源、人工过账重试与纠错、提交确认失败、来源／分录／凭据回滚、旧快照迁移及损坏证据拒绝。路由测试检查管理与只读控件。

实际项目 `/Users/chandler/Documents/GitHub/HTTFlooring/htt-management` 完整回归：134 个测试文件、1743 项测试全部通过，0 失败，207.28 秒。新增纯条件 25 项、主进程集成 29 项及 1 项角色／页面用例；保留原财务、周期自动化、回收站等完整用例。规则详情历史显示随后补做最终界面完善，并在实际项目重跑 129 项页面／角色路由测试通过。最终 TypeScript、Vite renderer 和 Electron main/preload 生产构建通过；Vite 既有大分块提示仍为警告。

执行命令：`tsc -b && vite build`；`node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev`。Node 24 沿用已验证的 no-maglev 运行方式。

原生 Electron 使用 `/private/tmp/htt-g06-native` 独立合成档案：登录、查看三条件自动规则和自动导入凭据、选择 Fuel／Coffee 两行预览，确认同优先级 Fuel 冲突而 Coffee Ready；输入原因后整批保存仍禁用。截图检查说明、禁用按钮和凭据布局可读。进入 statement workbench，Office 来源保持 UNMATCHED，Review 正确载入 Operating Expenses、110 和 GST，并显示保存分类的过账前复核提示。未在 UI 执行入账；实际来源、账务及分类仓库逐项比对与验收前快照完全一致。人工过账、重试、关账阻止、冲销及失败回滚由真实主进程集成测试验证，未使用真实业务档案。

历史分类使用过的税码，在规则改用其他税码后仍禁止重命名，防止审计／备份出现悬空引用；相关测试已通过。规则详情保留可读的规则变更历史，显示操作者、时间、原条件、优先级、自动选项及动作。
