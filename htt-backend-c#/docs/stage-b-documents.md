# 阶段B：单据PDF、邮件与私有附件

本批支持QUOTE、INVOICE、PURCHASE_ORDER三类单据。正式报价、已开票发票、已确认采购订单可生成PDF并邮件发送；三类单据的草稿/正式版本可上传附件。所有操作仍在htt-backend，三个客户端未改，未执行正式库迁移或发送真实客户邮件。

## API与请求

公共前缀`/api/v1`，有效JWT及`X-Company-Id`必需。所有POST须`Idempotency-Key`；新建PDF、邮件及上传须`If-Match: "当前单据version"`；任务重试/附件撤销分别用任务/文件当前version。金额/数量沿用十进制字符串。

| 路由 | 行为 | 基础权限 |
|---|---|---|
| POST `/documents/{id}/pdf` | 无请求体，冻结单据快照并返回202及job id；同单同版本仅一个PDF任务 | documents.pdf.request |
| POST `/documents/{id}/emails` | 固定PDF、收件人、正文及附件后入队，返回202 | documents.email.send及对应类型send权限 |
| POST `/documents/{id}/attachments?fileName=...` | 原始文件字节请求体，Content-Type为application/pdf、image/png或image/jpeg；返回202、file id、scan jobId、PENDING、version及sha256 | documents.attachments.write |
| GET `/documents/{id}/files` | 分页列出未撤销文件的名称、来源版本、类型、校验和、状态；不输出object_key或字节 | documents.files.read |
| GET `/files/{id}/content` | 再次验证权限、扫描状态及SHA-256，响应强制attachment下载、no-store、nosniff与CSP sandbox | documents.files.read |
| POST `/files/{id}/revoke` | 软撤销附件，后续下载/新邮件不可用；原字节及审计保留 | documents.attachments.write；非本人上传另需files.manage |
| GET `/documents/{id}/jobs` | 分页查看kind、state、版本、尝试次数、下次时间、文件/提供商回执、错误码 | documents.files.read |
| GET `/document-jobs/{id}` | 查看单任务，可用于轮询 | documents.files.read |
| POST `/document-jobs/{id}/retry` | 仅当前FAILED任务，正文`{"reason":"故障已修复"}`；重试原不可变输入 | documents.jobs.retry及原操作/单据权限 |

列表默认page=1/pageSize=25，最大100，稳定排序。接口只返回已接受任务；PDF生成/邮件接受结果必须查任务，不能把202当已发送或已生成。失败事务不留下成功幂等记录或孤立文件。

邮件正文示例（id替换为真实UUID）：

```json
{
  "pdfJobId":"完成的同单同版本PDF任务UUID",
  "to":["customer@example.com"],
  "subject":"Your HTT quotation",
  "message":"Please find your quotation attached.",
  "attachmentIds":["扫描通过的同单附件UUID"]
}
```

收件人1—10个明确邮箱地址，规范化、去重并排序；不接受显示名/任意邮件头。subject上限200且禁止控制字符，正文纯文本上限10000。PDF自动附加，额外最多5个已验证、未撤销的同公司同单据上传附件；总附件字节不超过15 MiB。不能用别的单据PDF/附件ID绕过权限。需要修正收件人/正文时创建新的明确发送请求，不能改写已入队载荷。

文件上传采用raw body，非multipart；fileName需URL编码。文件限1字节—10 MiB，验证名称、后缀、MIME及签名；禁止路径/控制字符和HTML/SVG等主动内容类型。签名检查不是完整格式解析或无恶意保证；上传后必须由ClamAV扫描。扫描未配置、故障或恶意结果均不提供下载。

## 权限与数据范围

- 文件/任务操作除基础权限外，还重新检查实际单据权限：QUOTE要求sales.quotes.read及授权客户；INVOICE要求sales.invoices.read及授权客户；PURCHASE_ORDER要求purchase.orders.read和purchase.cost.read，避免经PDF或附件绕过采购成本权限。
- EMAIL再要求sales.quotes.send、sales.invoices.send或purchase.orders.send。默认SALES仅可发送授权客户报价，不能发送发票或采购订单。发票发送默认ADMIN/OFFICE/FINANCE；采购单发送默认ADMIN/FINANCE/PROCUREMENT。这些新增send权限不能取代既有单据读取/客户范围权限。
- 默认ADMIN/OFFICE/FINANCE/PROCUREMENT/SALES获得通用文件、PDF、邮件、重试权限；仍受上述单据范围约束。WAREHOUSE没有这些默认权限。files.manage仅ADMIN/OFFICE/FINANCE/PROCUREMENT。
- 下载、列表、任务查询和幂等请求重放均重新检查当前授权。Worker处理PDF/邮件时也重新检查请求人的活动成员及单据权限；撤销客户授权后，已知文件ID/缓存响应不能继续获取字节。
- 只支持上述三类单据，其余类型返回明确422；仓管交接照片、产品媒体、供应商账单附件等仍需各自的业务范围和权限接入，不因本批附件表可用而视为完成。
- 上传者仅可撤销自己上传的附件，管理权限可撤销他人附件；生成的PDF作为不可变历史产物，不提供附件撤销接口。单据/成员/客户授权仍可撤销访问。

## PDF与快照

PDF请求在持有单据共享锁时核对version、正式编号与状态，读取现有单据/行快照；报价和PO的发行方信息在输出请求时冻结，发票使用开票时issuer_snapshot。请求保存完整不可变JSON、templateVersion=1与源version，后续主数据更改不回写PDF输入。没有正式编号的草稿不能生成或发送正式PDF。

Worker使用受控ReportLab脚本生成A4 PDF，包含单据类型/编号、公司/ABN、客户或供应商、业务日期与适用到期/交期、SKU/名称、交易数量/单位、单价含税方式、净额、GST税率/金额、含税总额及备注。金额来自冻结明细并验证合计，不重新计价或重记账。多页重复表头/页脚，长文本换行；不执行HTML、外部URL或用户进程参数。

PDF只有一个成功文件，存储后字节与SHA-256固定；重试不改变旧成功产物。正式数据范围内的普通拉丁字符/重音由嵌入TrueType字体支持；其他字形须配置覆盖对应字符的TTF。发现不支持字形直接失败，不输出黑框/乱码。模板定制、logo配置及草稿预览本批未提供。

文件名采用安全单据号加`-v{sourceVersion}.pdf`。发票标题沿用原INVOICE/TAX_INVOICE，税票发行方ABN/登记及买方名称缺失时拒绝渲染。真实企业模板及税务业务仍需上线前核对，本批不涉及BAS/IAS。

## 持久化、队列和失败处理

017新增file_contents、file_assets、document_jobs、document_job_attempts四表，共117张业务/基础表。复用files/file_links，保留001—016摘要。

本批文件存储后端为私有PostgreSQL bytea，适用于明确有10 MiB上限的当前交付：元数据、字节、SHA、单据链接、扫描任务及审计同事务，不产生磁盘孤儿或跨实例共享目录问题。字节不可UPDATE/DELETE，延迟约束核对hash/size/link；文件大小会增加数据库/备份体积。S3/预签名上传、云密钥管理和大文件分片未实现，不宣称已部署云端文件服务。

document_jobs是专用持久化工作outbox；请求、输入及审计/事件同事务。原通用Outbox仅消费诊断事件，实际PDF/扫描/邮件由DocumentWorker处理，不把打印日志当邮件成功。Worker不能直接读取文件/业务表，只能通过固定search_path、租约token约束的definer函数领取和完成工作；API不能领取Worker任务。

状态：QUEUED→PROCESSING→SUCCEEDED；可重试故障进入RETRY，单轮最多5次；永久错误或耗尽进入FAILED。每次尝试保留开始/完成/结果，手动重试保留同任务、原payload和totalAttempts，仅重置单轮attempts。自动退避约30/60/120/240/480秒。任务独占领取使用SKIP LOCKED和2分钟租约，旧token不能读输入或提交结果；外部调用和子进程均有短超时。

- PDF/扫描租约到期可恢复RETRY；PDF输出和完成状态同事务，旧Worker无法追加重复文件。
- 恶意文件标REJECTED且不能通过重扫变可用；应重新上传经处理的新文件。扫描器未配置是FAILED，可配置后手动重试；临时不可用自动退避，文件保持PENDING。
- 邮件使用Resend HTTPS接口，固定同job id的Idempotency-Key及相同载荷。提供商的幂等窗口为24小时，本系统将自动/手工安全重试限制在首次尝试起12小时；到期进入UNKNOWN，不继续发送。[Resend官方幂等说明](https://resend.com/changelog/idempotency-keys)
- 429/5xx按相同键/载荷退避，4xx拒绝为FAILED；连接中断、超时、409载荷冲突、2xx但无有效回执等标UNKNOWN。邮件PROCESSING租约过期也标UNKNOWN，避免在“可能已接受”时重复发送。
- UNKNOWN不会自动重试，retry接口也拒绝。须由运维在提供商核对结果后处理；本批未提供人工“确认已发送/重新发”接口，不能为了清队列把UNKNOWN改FAILED再盲目重发。
- SUCCEEDED及providerId仅表示服务商已接受邮件，不表示到达收件箱；投递/退信webhook、开信统计、提供商回执查询未接入。[Resend发送及幂等API](https://www.resend.com/blog/engineering-idempotency-keys)
- Worker在发送前重新检查源version、成员授权及每个文件当前可用性；源单修订、授权撤销、附件撤销会阻止调用服务商。发送决定和外部服务没有跨系统事务，已接受邮件不能通过撤销本地权限收回。

## 运行配置

API配置`Documents__MailFrom`（已验证发件邮箱）。Worker配置`Documents__MailApiKey`（Resend API key），凭据只在环境/密钥管理中提供，不入任务载荷或日志。未配置不伪装邮件发送成功，也未在本轮激活真实发件域或发送真实邮件。

ClamAV：Worker配置`Documents__ClamAvHost`及`Documents__ClamAvPort`（默认3310），使用私有网络中的clamd INSTREAM端点；需自行部署引擎并维护病毒库，不向不可信公网开放该端口。未配置时文件不可下载。本批验证真实TCP协议和EICAR结果分支，未部署生产ClamAV或做病毒库运营验收。

Python：Worker的`Documents__PythonExecutable`默认python3；可设置`Documents__FontPath`指向受信任TTF。Docker build及Worker镜像安装发行版python3-reportlab/字体并配置DejaVuSans，API进程不启动渲染子进程。native需自行安装ReportLab；本轮native使用Codex依赖运行时做测试，不将该机器路径写入应用默认值。

Compose对应`.env.example`中的HTT_MAIL_FROM、HTT_MAIL_API_KEY、HTT_CLAMAV_HOST/PORT；文件在数据库中，API与Worker无共享文件卷。单实例Worker顺序处理任务，可按资源规模增加多个Worker，租约/幂等保护多实例竞争；不据此宣称达到生产容量SLO。

## 验证

新增DocumentDeliveryTests和DocumentProtocolTests共50项：三类真实PDF/50行多页、快照冻结、下载头、幂等冲突/并发入队、文件路径/MIME/大小、扫描隔离/恶意拒绝/配置恢复、撤销访问、销售/客户/公司隔离、并发Worker、旧token、邮件未知结果、幂等窗口、5次停止及重试原输入、HTTP幂等载荷和ClamAV逐块字节协议。原Migration升级测试扩至016→017。

样张为测试数据：三类单页加8页长报价，经Poppler渲染逐页检查，并以文本提取核对金额、GST、页码和重音/转义字符；不把未渲染的字节头检查当布局验收。完整本机/Linux回归与发布结果见verification.md最上方本批记录。真实邮件/域名、生产扫描服务、云存储、客户端E2E和生产压测均未验收。
