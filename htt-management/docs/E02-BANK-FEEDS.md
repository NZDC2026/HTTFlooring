# E02 可配置澳大利亚银行 feed

2026-10-23。用户确认尚未开通银行 feed 服务，先完成可配置代码；保持本地架构，仅在桌面程序运行时同步。本轮实现 Basiq AU v3 Open Banking 适配器、OS 保护配置、托管授权链接、账户发现/映射、增量取数与待审导入。业务数据库结构仍为 31；独立 feed 日志版本为 1。不部署独立后台，不内置任何真实 key 或银行账号。

## 范围与真实服务待验收

入口 `/banking/feeds`，从页面目录、银行 CSV/工作台和设置能力页可进入。管理员维护提供方配置；banking.write 用户授权取数并拥有映射；banking.read 用户可查看。所有权限在可信主进程再次检查。会话被动检查不延长空闲时间，只有映射所属用户登录、权限仍有效且程序运行时才处理。

本轮退出条件是用户要求的可配置接入代码与本地模拟验收。未开通真实服务，未调用真实银行授权、未读取真实交易，也未完成银行/提供方外部验收。E02 仍标记为“部分完成，真实服务待开通验收”。适配器通过不代表所有澳大利亚银行、企业/联名账户都可连接；需在提供方确认目标银行、账户、CDR 授权和应用服务资格。当前不支持 web connector、NZ、非 AUD、支付执行或自动云端同步。

## 开通后操作

1. 在 Basiq 控制台建立对应 sandbox 或 production 应用，并预先建立 provider user，设置提供方验证所需手机号。当前应用不自动创建 provider user，也不收集网银用户名、密码或验证码。
2. 管理员在 Bank feeds 填写 API key 和该 user ID，确认环境并明确启用。两种环境使用提供方同一个 API 域名；production 选项是本地隔离标签，不能验证 key 实际环境，必须从控制台取得正确环境的 key。系统不会将本地 sandbox 标签当作真实服务端证明。
3. 具有 banking.write 权限的用户明确确认联系提供方，申请托管授权链接并在浏览器中打开。主进程只允许 connect.basiq.io HTTPS 链接；银行授权由用户在提供方页面完成。授权可能触发验证短信。已有有效链接优先重用；超时后重启先查原链接，不静默反复 POST。
4. 授权完成后，明确确认“发现账户”。核实 provider account、末四位、机构、本地 AUD 银行、初始日期和银行时区，再建立映射。初始日期不能早于本地银行期初或晚于业务当天。
5. 每 15 分钟或点击 Sync now 取数，先形成 REVIEW 批次。逐页审查全部行、疑似 CSV 重复和排除项，填写至少 10 字符原因并明确确认，才进入现有 unmatched 银行流水工作台。原有规则只提供分类审查结果，不会因 feed 导入自动入账。

本地暂停只停止取数，不撤销银行/提供方的授权。需要撤销时由用户在银行或 Basiq 管理；本应用下次取数发现 revoked/expired、未同意 transaction.detail、连接非 active/已过期或账户不可用时停止并提示。已保存历史不因撤销而自动删除。

## 取数与日期契约

仅固定调用 au-api.basiq.io，禁止 HTTP 重定向、外部主机或换 user/path 的分页。API key 按官方契约直接作为 Basic 值交换 SERVER_ACCESS token；短期 token 只在主进程内存中保留，认证错误后清除。OS safeStorage 不可用或 Linux basic_text 后端时不能保存凭据；空 key 保留旧 key，解密失败必须本机重配。

每次取数先检查有效用户同意与 transaction.detail 权限，再检查实际 Open Banking 连接状态/到期和账户成员关系。通过账户 ID、机构、币种、连接 ID 对齐，跨账户响应拒绝。请求只读该映射账户；提供方快照可能滞后，界面显示 provider lastUpdated，fetched through 只表示已查询的日期边界，不证明银行已实时更新或账目已核对。

只导入 posted，pending 不写入本地银行流水，仅保留本轮排除数量。金额使用十进制字符串转精确分值，验证出入方向，不猜测符号；零金额、超精度、无效日期和币种拒绝。日期型值保留原日；时间戳按映射明确选择的澳大利亚银行时区转换，避免使用账套当前 Auckland 时区。API 请求在两侧扩展一天，再按映射日期范围过滤，避免 UTC/DST 跨日遗漏。请以实际银行 statement 复核时区。

每次从上次完整取数日期向前重叠七天；长时间关闭程序后从该位置补取到今天，重叠稳定 ID 去重。更早的延迟/更正不能靠七天窗口自动发现；对历史缺口，先完成旧批次审查、停用/退役映射，再显式选择历史起始日建立新映射。每次最多 20 页、每页 500 行；达到分页循环/容量上限时整轮失败，不推进进度。需要缩小初始范围后分段回补或使用 CSV。

所有页成功后才保存一批与其完整进度；中途网络错误不保留半批，不推进 checkpoint。瞬态错误指数退避，最多五次失败后暂停；授权/身份/已入库交易改变等问题立即暂停。客户端从不持久化或跟随不受信任的远程 next URL，不输出提供方错误正文或 token。

## 导入、去重与异常

提供方 external ID 使用 Basiq、provider user、环境、远程账户的命名空间加 transaction ID；相同账户中的不同 ID 即使金额相同也保留。相同 ID 日期/金额/描述/引用变化时整轮保持原数据并暂停，交由上游与本地审查，不改写已匹配或入账行。

跨 CSV/手工导入没有统一 provider ID，系统只能提示同银行日期/金额加相同描述或引用的疑似重复，不能保证识别所有重复。原始 evidence 与真正相同金额的两笔交易需要用户判断；不会自动吞掉或自动再入账。可明确排除某行并记录原因；排除决定保存在 feed 日志，后续不反复提出同一行。排除项本身没有本地流水证明，恢复备份后仍应复核原排除理由。

导入前先落盘 IMPORTING，再通过现有 BusinessHost 的 bankStatements.importRows 执行整批原子校验和持久化，保留现有外部 ID 冲突、银行期初、已对账期间及权限保护。成功后保存本地行 ID 和日期/金额/描述/引用摘要；不改变来源单据、现金、分录、核销或对账状态。分类、匹配、GST 分拆、过账及最终银行 reconciliation 继续走已有工作台和期间控制。

程序若在业务文件已保存、feed 尚未确认时中断，重启恢复到 REVIEW；用户确认同一批后，相同 external ID 只恢复原本地行，不重复创建，也不重放分类/分录。不同用户不能接管原用户的批次。

凭据轮换或授权续期后，先在当前配置下发现账户，再明确“Confirm renewal”；只允许原 provider user、环境、远程账户和本地银行身份相同，保留日期/批次历史。更换提供方 user、银行或环境要先将旧批次全部审查完，再退役旧映射并重建。退役不删除历史，不能直接恢复旧映射；重复 provider namespace 的旧行仍参与去重。银行号、GL 链接或期初改变会阻止旧映射继续导入。

## 备份、容量与恢复

`local-security/bank-feed-secrets-v1.json` 与 `bank-feed-journal-v1.json` 独立于业务备份，避免恢复旧业务文件后倒退外部取数/审查进度。需要另存完整桌面 profile；OS 加密的 key 跨设备可能无法解密，必须重新配置。不能删除 feed 日志以“清理重复”。仅保留一份运行档案，多个 profile 副本不具备分布式互斥。

日志原子保存、checksum 和严格结构校验；损坏时只关闭 feed 子系统，保留文件，业务数据不重置。上限 100 映射、500 发现账户、1000 批、每批 10000 行和 50 MB；原始取数页、未遮盖完整账号、银行登录数据和 bearer token 不写入日志。历史行、排除理由和本地导入证据保留，达到上限需保存完整 profile 后安排审计归档，不能直接清空。

若业务恢复后缺少任一已确认的本地导入行或关键数据不同，暂停 feed 并要求先恢复兼容证据。不会因为恢复旧备份自动补进历史流水，从而抹掉原匹配/入账状态。正常的后续工作台匹配、分类和冲销保留原行关键字段，因此不会误报为缺失。

## 验证与契约来源

实际项目 `pnpm build` 通过；`pnpm test:ci` **165 个文件、3633 项通过**（250.21 秒），无失败。其中 49 项直接覆盖 E02，定向六文件/1681 项包含路由与现有页面回归。原生合成档案已验证默认禁用、配置保存、理由和明确确认、COMPLETED 批次及原工作台 UNMATCHED 行；文件比对只改变 bankStatements，分录完全保持。详见 [机器记录](acceptance-e02-20261023/evidence.json)。测试使用合成用户/账户与模拟提供方，真实银行验收仍待服务开通。

契约来源为 Basiq 官方 [OpenAPI](https://api.basiq.io/reference/openapi)、[token](https://api.basiq.io/reference/posttoken)、[accounts](https://api.basiq.io/reference/getaccounts)、[transactions](https://api.basiq.io/reference/gettransactions)、[consents](https://api.basiq.io/reference/getconsents)、[hosted auth link](https://api.basiq.io/reference/postauthlink)、[filters](https://api.basiq.io/reference/collections-filters)、[日期处理说明](https://api.basiq.io/docs/frequently-asked-questions)。

可复现原生夹具：为全新临时目录设置 HTT_ACCEPTANCE_PROFILE，运行 `node --no-maglev node_modules/vitest/vitest.mjs run --config scripts/bank-feeds.config.ts --pool=forks --maxWorkers=1 --execArgv=--no-maglev`，随后使用 `--user-data-dir=<该目录> --acceptance-window=compact` 启动桌面程序。夹具拒绝已有 local-security 和非临时路径，直接建立一张明确标记的合成待审批次，不保存提供方 key、不执行网络取数。合成管理员沿用桌面验收夹具的 qa.admin / Desktop-Acceptance-4821，不能用于真实账号。
