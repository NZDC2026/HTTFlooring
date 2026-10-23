> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G03 多缺陷与非银行定向恢复

## 交付范围

在原银行定向修复流程之外，Financial recovery workbench 新增 **Source metadata and compound recovery**。主进程从真实来源推导批量计划，展示来源页面、原值、目标值和证据标识；渲染进程不能提交补丁内容、操作者、结果 ID、分录或过账日期。

支持同批完成：

- 销售发票：从有效收款及贷项核销推导 amountPaid/amountDue 和结算状态。
- 采购账单：从有效付款分配及供应商贷项核销推导 amountPaid/amountCredited/amountDue 和结算状态。
- 客户／供应商贷项：从原核销记录推导 amountApplied/amountAvailable 和结算状态，保留已验证的退款及其记录。
- 未完成的普通 CUSTOMER_PAYMENT、SALES_CREDIT_APPLY、SALES_INVOICE_VOID、SALES_PAYMENT_REVERSAL、SALES_CREDIT_REVERSAL：严格匹配持久化请求及唯一既有结果；缺少绑定时可在独立审批后恢复绑定，并一起关闭已完整实现的操作。多笔有效操作不会再因彼此“未关闭”而形成闭环死锁。含订金应用的付款缺绑定不通过金额反推，仍保留来源专属恢复边界。
- SUPPLIER_BILL 过账元数据：只在 JOURNAL、PURCHASE_ORDER、MATCHES、BILL 四步均已记录，账单、唯一原始分录、PO 累计数量和收货匹配均可证明完成时，将状态恢复 POSTED。保留原 completedSteps，不执行或补做任何步骤。

这是一项受控的来源元数据修复，不是任意错误自动修复器。它不新增或冲销 GL，不改变付款、核销、退款、原单金额、行快照、会计日期、库存、匹配或清除记录；修复人和审批人的记录保存在独立恢复案例中，原单据业务时间戳不被替换；采购过账元数据的 updatedAt 记录本次审核关闭时刻。

## 证据与拒绝条件

预览只做克隆数据的投影，不在预览期间临时写入／恢复业务 Repository。现有工作台命令仍按主进程通用规则记录命令审计和保存当前档案，这不代表预览执行了修复。

每份计划执行前后均检查：

1. 财务缓存和来源副本一致；业务记录、GL 来源、总额及原始／冲销生命周期有效。
2. 收付款原始日期、银行或订金／预付款账户、AR/AP 控制账户和两边金额逐项相符；原始与冲销逐账户净额精确相反。
3. 客户及供应商付款／核销的所属方、引用、正数金额和上限有效；禁止通过截断为零掩盖超额核销。
4. 现有 Sales 一致性检查、备份引用校验、退款记录和订金／预付款校验均通过。
5. AR、AP、库存／GRNI／PPV、订金及预付款与 GL 对账通过。
6. 各待关闭 Sales 操作逐笔验证完整既有结果；只对本批中已经逐笔证明的其他操作投影为已关闭。未知操作不会因同批而忽略。

请求损坏、无唯一结果、错误的已有绑定、同种操作重复认领、错误银行／账户／日期、缺少／冲突 GL、金额不符、无完整步骤的采购、未知来源、退款记录损坏、PO／收货匹配不完整以及其他对账差异仍明确阻止执行。这些情况保留证据并使用现有来源修正或验证备份；不推测缺失历史、不选择非同一重复分录、不新造平账项。原银行缺记录、缺 GL、错误链接及精确重复冲正继续使用原流程，不能混成任意批量补账。

## 提案、独立审批及恢复

- accounting.recover 才能提案、执行和撤回；audit.read 可查看最小必要预览。身份来自可信会话。
- 三项来源／GL／独立业务证据确认、引用和说明均必填。提案及来源请求、结果、旧／新值、证据摘要持久化。
- SHA-256 覆盖完整业务快照及来源操作和其所有复核信息；案例自身元数据不造成自我失效。任一来源、账户、原始分录、期间、核销或来源复核变动都会使审批失效。
- 审批人必须不同于案例全部复核人及本批各来源操作已有的复核人；审批引用不能冒充复核引用。
- 更换过期提案必须使用新引用并重新复核，旧计划完整保留于 repairProposalHistory，旧提案 ID 不能执行。
- 未执行提案仅在实时核验确认来源已经无待修复字段、无其他证明错误时可带原因撤回。未解决来源缺陷不能通过撤回释放写入阻止。撤回不改变来源、不标记执行成功，旧提案保留、案例显示 Withdrawn。
- 整批沿用 financialStateStorage 单元及 BusinessHost 原子提交／失败回滚；所有来源写入后再次核验，再记录操作关闭与案例结果。任何一处失败回滚整批。
- 相同已确认执行返回已保存结果；不同审批不能重放。提交结果不确定时阻止后续命令，重启后区分“未提交的提案”和“已经提交但未确认的修复”，两者均不自动重放交易。
- 结构版本升级为 **24**，保留 schema 23 及更早档案的原记录并按现有迁移备份规则升级。新案例和计划历史不能伪装为旧版本。备份解析验证当前及历史提案、动作／来源绑定、字段白名单、身份分离和唯一提案 ID。

## 测试证据

新增 `src/features/security/sourceMetadataRepair.test.ts` 32 项集成验证，以及 `src/features/financial-repair/SourceRepairPanel.test.tsx` 2 项界面验证：

- 多项 AR/AP 汇总修复，客户和供应商贷项连同真实核销及退款；完整比较除白名单字段外的所有 Repository 不变。
- 缺少付款／贷项核销结果绑定、两笔中断操作一起关闭、错误绑定、等额重复结果、超额核销、原始日期和账户证明。
- 完整采购过账状态恢复、步骤缺失和 PO 数量错误拒绝，库存／FIFO／GL 不变；关闭期间内只修复元数据。
- 权限、独立人员、历史复核人、审批／复核引用、任意补丁和操作者注入拒绝。
- 来源变化后的摘要失效、换提案保留旧计划、撤回未执行提案、当前和历史计划损坏、schema 23 → 24。
- 两个来源写完后的最终记录失败、提交前失败、提交成功但确认失败、重启、幂等执行和可信审计。

原有银行定向恢复回归与新增来源测试曾合并通过 98 项。完整实际项目 build/test 最终结果另记于本文件末尾。

## 原生 Electron 验收

实际生产构建使用隔离合成档案 `/private/tmp/htt-g03-native`，不使用生产业务档案、不连接后台或外部银行：

1. 独立 FINANCE_ADMIN 以 repair.manager 登录，打开 Financial recovery workbench，读取由另一账户提出的 SOURCE-REVIEW-001。
2. 点击 Preview source metadata repair，显示两项修复：发票 55/99/PAID → 0/220/ISSUED；采购账单 88/22/1/PAID → 0/0/220/OPEN，附原始 GL 来源及单据链接。
3. 使用 NATIVE-G03-APPROVAL-001 独立批准，未解决数量从 1 降为 0，保存 Executed source repair，预览无待修复来源字段。
4. 持久化内容确认 schema 24、SOURCE_METADATA_REPAIRED、不同复核／审批账户、两项精确结果及 SHA-256 证据。将批准后快照仅还原白名单旧字段，重算摘要与原提案完全一致；批准后完整快照摘要与保存的 afterDigest 也完全一致，证明其余来源、GL、库存和匹配未变。
5. 完全退出并使用最终构建重启后，Finance controls 显示 **11 项通过、0 失败**，Current financial recovery 未解决为 0。恢复工作台重新预览显示 **Source metadata verified · no repair needed**；展开历史仍有原提案、不同复核人／审批人、完整旧／新值和前后摘要。

## 最终实际项目验证结果

- TypeScript 及 Vite renderer / Electron main / preload 生产构建通过；既有大分块提示仍为警告。
- 最终完整回归：**129 个测试文件，1628 项全部通过，0 失败，0 跳过，181.34 秒**。相对 G02 基线新增 2 个测试文件、34 项测试。
- 命令：`node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev`，沿用当前 Node 24 环境的测试运行方式。
- 首次完整回归有 1 项恢复指引文案兼容测试失败，已保留“禁止猜测结果 ID”的提示并修正；随后完整回归通过。最后补充 GL 结构拒绝及撤回阻断验证后，再次对最终版本运行上述完整回归，结果为 1628 项通过。
- 日志：`/private/tmp/htt-g03-actual-test.log`、`/private/tmp/htt-g03-actual-build.log`；定向 38 项验证记录为 `/private/tmp/htt-g03-final-targeted-test.log`。
- 增量交付仅包含相对 G03 开始基线实际新增／修改的 42 个文件，不含未改源码、依赖、构建产物或合成业务档案。保留已有用户变更，未提交 Git、未连接独立后台。

G03 的受控恢复验收条件已满足；上述缺失／冲突证据边界继续保持阻止，其余工作包按缺口清单继续记录。
