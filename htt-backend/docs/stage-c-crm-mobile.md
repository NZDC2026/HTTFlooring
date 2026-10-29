# C04：CRM草稿、移动同步、通讯录和名片导入

当前扩展：045已接入Note/展板/拜访、CRM附件和门店地图刷新，见[C05接口](stage-c-collaboration.md)。本页保留044草稿/导入的原契约；DRAFT字段保持兼容，新增entityType项见C05。

本包实现阶段C的C04后端切片，新增044迁移；不修改客户门户、销售/库管App或管理财务客户端。S-21、S-43及S-20的服务端链已建立；S-22仍需C05/C06接入Note、拜访和Task等对象，S-30的本地缓存/呈现及真实设备授权另验。整个阶段C仍未完成。

## 草稿和独立办公室审核

销售可创建 `CUSTOMER`、`BRANCH`、`CONTACT` 草稿。门店/联系人必须关联已存在、当前可访问的客户；联系人可关联同客户的有效门店。客户/公司、所有者和种类创建后不变；其他销售不可读写。办公室须同时具备新审核权限、customers.write和customers.all，且不能批准自己的草稿。

状态为 `DRAFT → SUBMITTED → APPROVED/REJECTED`；草稿可删除为DELETED，不能恢复旧版本。已提交数据不被静默编辑；拒绝后需要创建新草稿重新提交。审批以版本为前提，在一个事务中建正式主数据、初始化客户信用投影、将新客户分配给原销售，并记录审核来源和增量事件。新客户信用额度为0，账期采用审批时锁定的公司默认值；信用/非默认账期仍走原有专门维护权限，不接受销售自带的财务字段。共享供应商主体的联系人仍需suppliers.write。

审核会再次检查ABN、AU地址/州/邮编、联系方式、同客户门店和潜在重复。客户按编号/名称/ABN，门店按同客户编号/名称，联系人按同客户姓名/Email/任一电话或手机检查；历史AU电话格式和+61统一比较。重复只提示已有ID，不自动合并身份，不跨授权范围显示其他客户。并发审批只有一次落正式资料；发现重复可拒绝草稿并采用现有资料。

## 移动同步契约

仅同步CRM草稿，不接收离线开票、收付款或出库命令。正式主数据使用原有授权API和版本查询；C05/C06后续对象需要逐项接入，不能因为有变更表就宣称全CRM已同步。

1. 客户端生成稳定设备UUID，注册到当前公司/当前账号；不可认领其他人的设备。设备可撤销，撤销后不能重放注册、推送或读取。
2. 每个设备的操作使用独立UUID及从1开始连续递增的sequence。操作仅 `CREATE/UPDATE/SUBMIT/DELETE`；UPDATE等带期望version，CREATE带稳定草稿UUID和完整规范化数据。一次HTTP只提交一项操作，设备本地按队列顺序发送。
3. 相同operationId、设备序号和规范化请求用不同HTTP键重放，返回同一结果；更换内容、重用序号或跳号为409。业务版本冲突以HTTP200、`status: CONFLICT`持久记录并消耗序号，附serverVersion；客户端刷新后用新operationId/下一个序号解决，不能覆盖服务器版本。APPLIED带draft。
4. 初次拉取 `after=0`，清空该同步域的旧缓存；返回 `items`、`nextSequence`、`auth`、`hasMore`和 `cursorExpiresAt`。后续传after和auth，页面1—100条；游标是公司事件序号，会越过不可见事件，空items但hasMore为true时仍继续拉取。不得将nextSequence当设备推送sequence。
5. 公司head行在变更前锁定，序号随事务提交，避免较晚提交的低序号被漏掉。事件和操作日志不可变，删除输出tombstone及空data；旧更新/重放不会复活已删除或已批准草稿。设备游标30天过期，after=0会更换设备epoch；授权/客户分配变化、重置旧游标、过期或超前游标返回409，须丢弃本同步域缓存并从0重建。服务端目前保留完整事件历史，不做会导致缺失tombstone的清理。
6. 权限和目标客户在幂等缓存之前重查，等待head锁后再查；已撤权设备/客户无法借旧响应取回资料。公司head短事务串行化换取明确提交顺序；大规模多销售负载需实测，未以集成测试声称生产吞吐。

## API

统一前缀 `/api/v1`、有效身份、`X-Company-Id`。命令需要Idempotency-Key；普通草稿PUT/提交/删除/审核需要If-Match，移动操作使用body.version。

| 路径 | 方法/输入 |
| --- | --- |
| `/crm/drafts` | GET授权分页及state筛选；POST `{id,kind,customerId?,data}` |
| `/crm/drafts/{id}` | GET；PUT完整data；DELETE草稿 |
| `/crm/drafts/{id}/submit` | POST |
| `/crm/drafts/{id}/duplicates` | GET重复建议ID，不自动合并 |
| `/crm/drafts/{id}/review` | POST `{approve,reason}` |
| `/crm/mobile/devices` | POST `{deviceId}` |
| `/crm/mobile/devices/{device}` | DELETE撤销当前账号设备 |
| `/crm/mobile/devices/{device}/operations` | POST `{operationId,sequence,id,action,version?,kind?,customerId?,data?}` |
| `/crm/mobile/devices/{device}/changes` | GET `?after=0&pageSize=100`，后续传auth |
| `/crm/contact-imports` | POST `{customerId,consentReference,selectedContacts:[data...]}` |
| `/crm/contact-imports/{id}/confirm` | POST `{rows:[0,2]}`，选中的预览行号 |
| `/crm/cards/{customer}` | POST multipart `file`，返回202作业 |
| `/crm/cards/jobs/{id}` | GET本人OCR状态及建议，无原图/租约/提供商密钥 |
| `/crm/cards/jobs/{id}/retry` | POST，仅FAILED |
| `/crm/cards/jobs/{id}/confirm` | POST经人工修正的联系人data，生成待提交草稿 |

完整data字段：name、code、abn、email、phone、mobile、jobTitle、addressLine1、suburb、state、postcode、branchIds。仅对应种类字段生效；CLIENT CUSTOMER用name作为legalName，BRANCH国家固定AU。忽略与种类无关字段不是授予更新正式数据或财务数据的权力。JSON金额继续沿用项目契约。

## 通讯录选择结果

客户端负责系统授权及用户选择，只上传选中1—100人和可追踪consentReference；后端不读取整部手机通讯录，也不把该文本当成已完成设备授权的证明。Email转小写，澳洲本地10位电话转+61，保留有效国际号码/分机。预览显示规范化数据、批内重复和已有联系人建议；确认重新检查当前权限及正式重复，整批只创建草稿，不直接生成联系人。销售逐个修改/提交，办公室再审核。一次预览只能确认一次；同键重放返回原草稿ID，不重复导入。

## 私有名片与OCR适配

只接受当前客户下、用户选中的PNG/JPEG，文件名/MIME/签名一致、最大10 MiB。原图保存在受限card_jobs，app无直接读取/修改权限，没有公开文件URL或原图下载。Worker专用definer函数认领、读取和完成，先ClamAV扫描；不干净为REJECTED且不可手动重试。扫描或OCR未配置明确FAILED，可在修好配置后人工重试。

Worker环境 `CardOcr__Endpoint`/`CardOcr__ApiKey`，compose对应HTT_CARD_OCR_ENDPOINT/HTT_CARD_OCR_API_KEY；只向管理员配置的HTTPS网关发送，不接受用户URL、不跟随重定向。POST JSON `{operationId,contentType,content:<base64>}`，Bearer密钥只在Worker。网关返回 `{name,email?,phone?,mobile?,jobTitle?,organization?,storeName?}`，仅允许这些建议字段进入结果，branchIds由后台设为空，外部字段不能形成财务命令。30秒预算、16KB响应限制；429/5xx/连接和超时可重试，其他拒绝或不合法结果为FAILED。OCR作业无财务副作用，最多5次自动尝试，指数退避；2分钟租约，超时重认领，旧token不能完成。权限在执行前和完成时复核，期间撤权不保存识别结果。

公司/门店识别值只作为建议。用户在已有授权客户下人工修正并确认联系人，之后仍需提交/办公室审核；不会自动新建公司、分店或合并客户。联系人尚不确定所属主体时先走客户草稿审核，再上传/确认名片。真实网关合同、识别质量、数据处理约定及真实设备拍照待联调；本批仅用替身HTTP和扫描器验收，没有外发真实图片。

## 权限与验收

新权限 `crm.drafts.read/write/review`、`crm.mobile.sync`、`crm.contacts.import`。ADMIN/OFFICE默认全套，SALES无review；FINANCE、WAREHOUSE、PROCUREMENT默认没有CRM草稿权限。Office审核还需既有customers.all/write，读写联系人仍受客户范围和同主体规则约束。7张公司FORCE RLS表：mobile_heads/devices/drafts/changes/operations、contact_imports、card_jobs，app只有受控函数和必要SELECT，没有新表DML；Worker只有USAGE及3个OCR执行函数，没有CRM表读取权限。

草稿、正式数据、信用初始化、feed、设备序号/操作结果、导入确认、审计和Outbox事务一致；晚期审计失败不留半完成事实。测试覆盖权限/越权、同键/异键/操作ID重放、序号冲突、并发审核/推送、提交顺序、删除/游标过期和撤权、通讯录去重、OCR扫描与重试/租约/输出过滤及事务回滚；最终执行范围见[验收记录](verification.md)。
