# E01 可配置邮件、催款与在线收款

2026-10-23。用户确认尚未开通服务，先完成可配置代码；继续使用本地架构，接受仅在程序运行时处理。本轮提供 Resend 邮件与 Stripe Checkout 适配器，不部署独立后台。当前结构版本仍为 31，外部任务使用独立版本 1 日志。

## 当前退出条件与外部验收

本地实现包含管理员配置、OS 保护的凭据、不可变销售/采购 PDF 邮件、客户对账单日期版本与预览、发送与回执状态、原键重试、按发票授权的逾期催款、AUD 托管卡支付链接、付款证据核对以及明确确认后的本地收款入账。入口为 `/documents/communications`，单据准备页、设置页和工作区目录提供链接。

真实账户未开通。本轮测试全部使用合成数据和模拟提供方，未发送真实邮件、创建真实支付链接或收取款项。域名验证、实际邮件送达、Stripe 账户权限、真实支付、退款/拒付、费用和银行 payout 的外部验收仍待配置后进行。E01 的外部边界因此保持部分完成，不能据本地测试宣布实际服务已上线。

## 配置与权限

管理员在通信页填写 Resend key、已验证的发件邮箱；Stripe secret/restricted key、成功/取消 HTTPS 页面，并明确勾选启用。默认均关闭。Stripe 默认 test，只有明确选择 LIVE 且 key 模式相符才能配置 live。固定调用 api.resend.com 和 api.stripe.com，不接受可配置请求主机；托管支付页面必须是 checkout.stripe.com 的 HTTPS URL。重定向被禁止。成功页只负责用户返回，不是付款证明。

密钥经 Electron safeStorage 加密，只有系统保护可用时才能保存；Linux basic_text 后端不接受。界面不返回密钥，空 key 保留原值。迁移设备导致解密失败时，重新填写每个启用服务的新 key；不得清空任务日志。更换发件人、key 或 Stripe 模式会阻止旧任务自动使用新账户，需要先在原提供方核对。

邮件队列要求 documents.prepare 和对应 sales.read / purchases.read，checkout 与收款要求 sales.payment；管理员配置要求 users.manage。后台轮询使用被动会话，不延长空闲会话。仅任务/催款策略所属用户登录且仍有权限时处理；换用户、退出、离线或关程序时停止。页面查看权限不授权发送。

## 邮件与重试

发送前展示所选已保存版本和固定收件人，并要求明确确认。主进程重新核对当前来源版本和状态，生成本地 PDF，检查格式及 5 MB 上限。正文、主题、收件人、PDF 和摘要落盘后才访问提供方。客户对账单必须明确选取日期范围且客户有唯一有效会计联系人；快照保留期初、逐条借贷/余额和期末金额，预览与发送使用同一固定版本，数据/联系人变化后必须重新准备。后续联系人修改不替换旧收件人；草稿、作废、取消或已变更来源不允许发送。准备/打印/发送本身不更改单据业务状态或账务。

QUEUED → PROCESSING → ACCEPTED 表示请求已被提供方接受。只有回执 DELIVERED 才显示送达；退信、投诉、抑制及失败分别显示。ACCEPTED 不能作为已送达的证明。回执轮询约每 15 分钟；自动轮询范围为创建后 30 天。状态较旧时可由原任务用户刷新。退信/投诉/抑制地址停止新的邮件与催款；修正来源收件人并准备新版本后再审查。

网络超时及非法响应视为结果不确定；进程重启恢复原任务与原 Idempotency-Key，最多五次自动尝试。首次尝试后 23 小时停止 POST 并进入 UNCERTAIN，早于提供方 24 小时保留边界，禁止换键盲重发。同来源不确定任务阻止另建发送任务。必须在提供方后台核对该固定任务键；当前不提供绕过不确定状态的“强制重发”。这类任务需保留原档案等待人工核对，不能靠恢复旧备份重发。

## 运行时催款

对每张已开具未付发票单独授权，必须有保存的 accountingEmail 与有效到期日。最多五个 0–90 天逾期节点。恢复运行时只处理最新已到节点，不补发全部历史阶段；每张发票每天最多一个催款任务。已付款、作废、余额为零、等待验证付款、正在发送或结果不确定时停止。每次生成当前余额的 PDF 版本，未经过时即重用固定阶段键。策略可以随时由所属用户停用。程序不运行期间不发送，也没有云 webhook 或全天调度服务。

## 支付与入账

只为当前已准备的 AUD 已开具未付发票创建 Stripe 托管 card Checkout；金额为当前剩余金额的精确分值。默认不提供分期、订阅或其他币种。创建链接只进入 OPEN，不登记本地付款。

轮询必须核对 invoice/job metadata、会话 ID、金额、币种、test/live、complete + paid、succeeded intent、实际收款金额，以及 captured/paid、无退款的 charge 和提供方时间。满足条件后仅进入 PAID_REVIEW。原任务用户必须明确选择有效 AUD merchant clearing 银行并确认登记，之后再向 Stripe 获取新证据才调用现有 recordInvoicePayment；金额按 gross，日期采用已验证的 charge 时间并转换业务日期，原权限、期间、余额、恢复及审计检查继续执行。

费用、净 payout、退款、拒付与真实银行到账不自动推定或冲销；需要现有银行对账及人工审查。若本地剩余金额减少、证据不符、已退款、日期/银行失效或期间已关闭，保持人工审查且不入账。每次支付使用固定 financialOperationJournal operationId；账务已提交但外部日志未确认的重启只恢复原收款，不重复建分录。

## 备份、容量与恢复

`integration-journal-v1.json` 与 `integration-secrets-v1.json` 位于桌面 local-security 目录，独立于 business-v1.json。业务导出/恢复不包含这两个文件，避免业务备份倒退重发邮件或收款。必须另外保存完整桌面 profile（系统加密凭据可能不能跨设备解密）；不要删除/重建任务日志或将另一个 profile 的任务日志混用。程序同时存在多个完整副本也可能重复执行；运行副本由部署管理保证唯一。

日志原子写入、校验和与严格结构验证；损坏或配额失败关闭通信处理，保留文件，业务数据仍可使用。容量上限 2000 任务、1000 策略、50 MB；已接受邮件清除附件 base64，仅保留固定摘要、任务元数据和历史。未发送附件仍包含敏感单据，需按完整业务档案保护。当前不自动删除历史任务；达到上限须保存全 profile 后规划审计归档，不能清空历史绕过去重。

若恢复的业务备份缺少已确认的 Stripe 收款或固定 operation 证据，通信处理会停止并提示恢复兼容账务证据，不自动补记。网络中断时只保留本地待处理任务；未知 POST 不当成失败并换键重试。审计记录任务 ID/操作和实际用户，不记录 key 或提供方错误正文。

## 验证

[机器验收记录](acceptance-e01-20261023/evidence.json)保留自动验证与桌面观察边界。实际项目专项 4 文件、179 项通过，其中 39 项直接覆盖 E01；实际项目 `pnpm build` 通过，最终 `pnpm test:ci` 为 **162 文件、3576 项通过**（250.22 秒），无失败。原生隔离档案已验证目录入口、默认禁用、空配置保存和客户对账单预览；实际 Electron 隐藏窗口生成发票/对账单两份单页 A4 PDF，pdfinfo 未发现 JavaScript。模拟测试覆盖配置与权限、PDF/收件人冻结、落盘先于 HTTP、未知结果/重启/23 小时边界、回执、逾期节点、支付证据与确认、真实 BusinessHost 收款/分录、恢复去重和旧账套保护。真实服务、正式签名和各目标操作系统仍需外部验收。

提供方契约：[Resend 发送](https://resend.com/docs/api-reference/emails/send-email)、[查询邮件](https://resend.com/docs/api-reference/emails/retrieve-email)、[幂等键](https://resend.com/changelog/idempotency-keys)、[Stripe 创建 Checkout](https://docs.stripe.com/api/checkout/sessions/create)、[查询 Checkout](https://docs.stripe.com/api/checkout/sessions/retrieve)、[Stripe 幂等请求](https://docs.stripe.com/api/idempotent_requests)。

可复现合成档案：为全新临时目录设置 HTT_ACCEPTANCE_PROFILE，运行 `node --no-maglev node_modules/vitest/vitest.mjs run --config scripts/external-services.config.ts --pool=forks --maxWorkers=1 --execArgv=--no-maglev`，随后以 `--user-data-dir=<该目录> --acceptance-window=compact` 启动桌面程序。夹具拒绝已有 local-security 或非临时目录，不写任何真实服务 key，不进行网络发送。
