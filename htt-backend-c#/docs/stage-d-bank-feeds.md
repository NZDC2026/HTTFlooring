# D02：Bank Feeds标准网关与沙箱（051）

本次按用户明确选择交付与提供方解耦的标准网关和沙箱测试。**没有签约提供方、真实银行连接或生产凭证；所有连接environment=SANDBOX，liveConnection始终false。** 不把沙箱成功标成真实银行已连接，R025/R026仍为部分实现。

只修改htt-backend，新增051；001—050不变。三个客户端、真实网银、真实支付/发件/申报不操作；未执行生产迁移。

## 授权与运行流程

1. 由受信网关负责银行/聚合商的托管同意流程，并将同意绑定到HTT公司与银行账户。后台只接收不含凭证的opaque grantReference；银行登录密码、OAuth令牌、刷新令牌和银行授权页面不进HTT API或数据库。本批没有银行品牌授权页或真实OAuth适配器；沙箱测试使用进程内受控网关替身。
2. 财务在现有BANK档案下创建连接，指定StartDate与AutoSync。新连接PENDING，自动排入VERIFY；不能由API直接置ACTIVE。开始日期需在2000-01-01至公司当天，且晚于该银行全部非VOID既有流水结束日，避免与手工历史重叠。
3. Worker向固定HTTPS网关验证同意：要求SANDBOX、公司/银行账户绑定、AU银行BSB与完整账号规范值的SHA256指纹、固定remoteAccountId、有限、带明确时区的RFC3339未来consentExpiresAt及ACTIVE。响应不能仅盲目回显请求；网关必须与其同意档案核对。指纹为`sha256(UTF8(bsb + ':' + account_number))`小写hex，只作绑定校验，不当作密码或账户匿名化手段。
4. ACTIVE且同意有效后可人工请求SYNC。AutoSync=true时，Worker每次轮询最多调度50个到期连接；成功后下一次为15分钟后。任何未解决FAILED/UNKNOWN都会阻止该连接自动调度，须通过历史作业受控重试处理。AutoSync是创建时配置，本批不提供运行中切换开关；关闭连接用REVOKE。
5. SYNC只导入银行证据，复用034的银行流水及稳定外部ID；不自动匹配、分类、核销、产生AR/AP、GL或GST。继续通过已有匹配、规则预览/受控执行和对账API处理，不因为“自动feed”绕过040/041审核。
6. REVOKE在本地提交REVOKING并取消/围栏所有未完成作业，立即停止该连接新的导入；再由网关撤销。成功才标REVOKED。即便请求人后来失去导入权限，已经请求的远端撤销仍可完成；处理UNKNOWN的人工操作仍要求当前manage权限。审计和历史流水保留。解除连接不等于作废银行证据，不删除已匹配/已对账内容。

网关未启用时Worker不轮询feed，不发网络请求；API建立的PENDING请求不会被伪造成已连接。没有公开的Webhook或客户端回调能把同意直接激活。

## API及权限

所有路径加`/api/v1`，沿用OIDC、X-Company-Id、no-store、限流、公司RLS及事务。所有读取和动作至少同时要求accounting.bank_feeds.read、accounting.banks.read、accounting.ledger.read、accounting.bank_statements.read。新增read/manage/sync默认仅ADMIN/FINANCE；不授予SALES、OFFICE、WAREHOUSE或门户。

| 方法 | 路径 | 请求/语义 |
|---|---|---|
| POST | /bank-accounts/{bank}/feed-connections | `{grantReference,startDate,autoSync:false}`；需manage与bank_statements.import，201返回连接ID/PENDING/SANDBOX |
| GET | /bank-accounts/{bank}/feed-connections | page/pageSize，含已撤销历史；每页最大100 |
| GET | /bank-feed-connections/{id} | 当前状态/版本、有效同意到期日、自动调度/阻断、同步截止、最近25个作业；不返回grant、指纹、远端账户ID或游标 |
| GET | /bank-feed-connections/{id}/jobs | page/pageSize，全部授权作业历史及totalCount；用于查找较早FAILED/UNKNOWN，字段不包含租约令牌或网关私密数据 |
| POST | /bank-feed-connections/{id}/verify | 再验证PENDING/ACTIVE/EXPIRED同意；需manage+import |
| POST | /bank-feed-connections/{id}/sync | 需sync+import、ACTIVE和未到期同意；只排入一个作业，202 |
| POST | /bank-feed-connections/{id}/revoke | 需manage；本地停止并排入远端撤销，202 |
| POST | /bank-feed-connections/{id}/retry | `{jobId,reason,acknowledgeUnknown:false}`；需manage，非REVOKE还需import；FAILED/UNKNOWN受控重试，UNKNOWN必须明确ack，保留同一operationId |

所有POST必须Idempotency-Key；除创建外还需连接当前If-Match。重放在返回缓存前重新检查当前底层权限，参数变化同键409；版本旧/并发工作409，非法字段422，不可见公司/账户404或权限403。CASH账号对流水不可见，返回404；LEGACY/CARD_CLEARING不能建立新feed。grantReference为8—200位ASCII字母数字/下划线/连字符，永久全局唯一；撤销后需新的同意引用。

连接与命令按既有银行事务锁序列化；同账户一个未撤销连接、每连接一个待处理/处理中/重试/UNKNOWN作业。普通读取不改变余额。Worker在外部调用前及入库时重新检查当前权限、银行身份、同意状态/期限和游标；银行档案修改或撤权可阻止已排队/在途结果落库。工作台银行Hub读取真实本地状态并标SANDBOX_ONLY，仍不宣称LIVE。

## 标准网关v1契约

此契约是HTT自定义适配边界，不声称是任何现成银行或CDR提供方的原生API。提供方适配服务必须另实现并通过真实沙箱/实网验收。Worker只调用配置的**一个固定HTTPS endpoint**，不接受来自请求/响应的URL；无重定向、无URL用户信息/查询串/fragment。Authorization Bearer为部署密钥，只注入Worker。超时20秒，响应上限2MiB；证书正常校验，不关闭TLS验证。

请求为POST JSON，带`X-HTT-Gateway-Version: 1`及`Idempotency-Key: operationId`：

```json
{
  "operationId":"<job UUID>","kind":"VERIFY|SYNC|REVOKE",
  "companyId":"<company UUID>","connectionId":"<feed UUID>","bankAccountId":"<BANK UUID>",
  "grantReference":"opaque-sandbox-handle","environment":"SANDBOX",
  "accountFingerprint":"<64 lower hex>","remoteAccountId":null,
  "cursor":"","fromDate":"2026-10-31"
}
```

VERIFY/SYNC成功响应共同字段：

```json
{
  "environment":"SANDBOX","companyId":"<bound company UUID>","bankAccountId":"<bound BANK UUID>",
  "consentStatus":"ACTIVE","consentExpiresAt":"2026-12-01T00:00:00Z",
  "accountFingerprint":"<bound fingerprint>","remoteAccountId":"immutable-remote-account"
}
```

EXPIRED/REVOKED同意也须回传环境及原公司/银行绑定，连接置EXPIRED、关闭AutoSync，不导入。不接受infinity或无时区到期值。尚在授权中可返回PENDING；本批将作业记为失败，待同意完成后人工verify/retry，不以空占位假装激活。

SYNC另含nextCursor；无新完整窗口时statement可缺省或null，不伪造期初/期末余额。无新窗口也可更新游标和最后成功时间；网关须确保游标不跳过未交付完整窗口。需要导入时还必须含稳定batchId及完整statement：

```json
{
  "nextCursor":"opaque-next-cursor","batchId":"immutable-window-1",
  "statement":{
    "fromDate":"2026-10-31","toDate":"2026-10-31",
    "openingBalance":"0.00","closingBalance":"-22.00",
    "lines":[{"date":"2026-10-31","amount":"-22.00","description":"Booked merchant",
      "reference":"bank-reference","externalId":"stable-bank-transaction-1","status":"BOOKED"}]
  }
}
```

一个响应最多一个不可变、完整、已封口的日期窗口，<=5000行、<=366天，不晚于公司业务日期。首窗口fromDate等于StartDate；后续等于上一窗口toDate+1，openingBalance严格等于上次closingBalance。每行必须BOOKED和非空稳定externalId；不收pending、不按同日同金额猜测去重、不通过补平交易修正余额。

新增窗口必须推进游标；全部日期/金额/GST无关的原034约束、opening+sum(lines)=closing、外部ID防重仍执行。原始statement规范JSON及SHA256进入既有来源证据；feed批次另存稳定batchId/hash与原statement引用。同batchId同payload重放只引用原单；改内容、已VOID原单、重复交易ID、手工/其他feed日期重叠、窗口/余额断链均失败，不推进游标。手工导入同样拒绝覆盖feed已占用窗口。游标、证据、批次和作业完成在同一事务内提交；任何校验/入库失败不留下半张单。

提供方若只有滚动增量、缺期初/期末余额、不能封口完整日期或会重写交易，必须先由适配层获得可核验完整窗口/对账单，或另设计待审核的增量证据模型；不能在HTT内猜余额或直接套用此契约。来源修正需明确人工审查/合法证据处理，不能覆盖已匹配/已对账流水。

REVOKE成功只认HTTP成功且`{"environment":"SANDBOX","revoked":true}`。网关必须对固定operationId持久幂等，包括响应丢失后再次调用返回已执行结果，不能每次创建新的授权/撤销副作用。

## 故障与审计

VERIFY/SYNC为可重复的只读拉取，429/5xx/网络超时按指数退避重试（30、60、120、240秒，最多5次尝试）；达到上限FAILED。每次租约90秒，过期读作业可被新租约接管，旧完成无效。REVOKE的超时/网络中断/5xx、格式错误或过期租约进入UNKNOWN，禁止自动重复；429按网关“未接受请求”契约可退避，其他拒绝FAILED。重试沿用job ID和网关幂等键，不更换同一远端操作身份。

未确认的撤销始终保持本地REVOKING。网关密钥/原始响应/账号/游标不进入公开状态、业务outbox或日志；仅记录固定错误码、作业状态和statementId，人工原因进入审计。固定错误码如feed_invalid_result/feed_conflict/feed_access_changed不泄漏提供方正文。

## 配置、测试及剩余条件

Worker环境配置：`BankFeeds__Enabled=false`（默认）、`BankFeeds__Endpoint`、`BankFeeds__ApiKey`；Compose对应HTT_BANK_FEEDS_ENABLED/ENDPOINT/API_KEY，示例中无真实密钥。当前只接SANDBOX响应，不能靠配置改为真实LIVE。

验证采用独立PostgreSQL17和受控HTTP handler/IBankFeedGateway，不调用真实提供方。包含授权/租约/撤权、账户/公司绑定、重复/断链/回滚、自动调度、幂等/并发、UNKNOWN处理以及既有付款→feed→匹配→对账→GL/现金流/GST核对；实际数量和源码摘要见stage-d-02-results.json与verification.md。

剩余：选择并签约AU银行/聚合商、其真实沙箱及托管同意流程、真实授权/账户映射/交易及余额适配、持久网关幂等服务、LIVE启用方案、密钥轮换/撤权处置、真实银行覆盖/限额、监控和历史容量验收、三个客户端授权页面联调与实机测试。尚未执行真实CDR/银行合规或生产验收，真实服务未签约不影响本批沙箱协议交付，也不会被记作真实接入完成。
