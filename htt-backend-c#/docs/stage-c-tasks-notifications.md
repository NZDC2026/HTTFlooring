# C06 Task、提醒、消息中心与推送

仅 htt-backend；澳洲公司时区及AUD保持。046迁移，001—045及依赖锁文件不改。现有三个客户端不修改；不执行生产迁移或真实推送。该切片完成不代表整个阶段C完成。

## Task与授权

- `POST /api/v1/crm/tasks`：`{id,data:{title,assigneeId,description?,customerId?,branchId?,priority?,dueAt?,reminderAt?}}`。ID由客户端稳定生成；priority为LOW/NORMAL/HIGH/URGENT，默认NORMAL；UTC带偏移时间，提醒必须不晚于截止时间。
- `GET /crm/tasks`：assigneeId/customerId/state/dueBefore/page/pageSize；稳定按dueAt、createdAt、ID排序，每页最多100。`GET /crm/tasks/{id}`、`/history`。
- `PUT /crm/tasks/{id}`：完整TaskDetails，必须If-Match；客户/门店创建后不可变。创建者或办公室管理员可维护正文及改派；原负责人失去访问时，历史、消息和推送一起隐藏。
- `POST /crm/tasks/{id}/start|complete|cancel|reopen|delete`。OPEN→IN_PROGRESS→COMPLETED；OPEN/IN_PROGRESS可完成或取消；COMPLETED/CANCELLED可重开；删除为终态tombstone。负责人可开始/完成；取消/重开/删除只允许创建者或办公室管理员。删除清除当前正文；受控历史不再提供，旧幂等响应不能复活正文。
- `GET /crm/task-assignees?customerId=&q=&page=&pageSize=`只返回当前公司活跃、具备Task读写权限的userId/displayName；客户任务还要求双方都在当前客户范围内。不暴露登录主体或认证目录。
- 创建者、负责人、办公室管理员可以查看，同时必须保有当前客户权限。customerId为空支持仓库等内部任务；关联门店必须属于该客户且有效。跨公司不可访问。新负责人只能看到其当时也获授权的历史快照。
- 默认ADMIN/OFFICE/SALES/FINANCE/WAREHOUSE/PROCUREMENT/PRICING_MANAGER具备Task读写、个人通知及推送订阅；只有ADMIN/OFFICE具备tasks.manage。新增权限不授予仓管客户或草稿权限。

所有写接口要求Idempotency-Key；Task及消息写入带If-Match。关注、偏好、订阅首次使用`If-Match: "0"`，之后使用GET返回version。先检查当前授权，再查幂等缓存，数据库锁后再检查。业务、历史、同步、消息、推送作业及审计同事务提交；外部发送由独立Worker执行。

## 消息、提醒和行动中心

- `GET /crm/messages?unread=&page=&pageSize=`：仅本人收件箱、当前来源授权及有效期内的消息；返回unreadCount和items。`GET /crm/messages/{id}`；`PUT /crm/messages/{id}/read {read:true|false}` 支持版本/幂等/同步。办公室管理员也不能读取他人收件箱。
- Task创建/修改/完成/取消/重开向当前负责人和创建者产生消息，排除操作者并去重。消息只保存事件、来源ID/version及已读状态，不复制Task/Note私密正文；详情始终重新访问来源。
- `GET|PUT /crm/notes/{id}/follow`：PUT `{enabled}`，仅本人显式关注、当前可读的有效Note。修改Note时仅通知仍有权限的关注者，排除操作者；PRIVATE不扩散。取消关注停止未发送Note推送，历史消息仍按来源权限可读。
- Worker每15秒扫描最多50条到期Task。按Task/提醒代次唯一落地reminder_deliveries；并发扫描不会重复。完成/取消/删除不生成新提醒；改派、改截止/提醒、重开开启新代次。撤权接收者记SKIPPED；重新授权不自动补发该代次，需重设提醒或重开。时间判定以数据库时钟为准，部署须保持主机/数据库时钟同步。
- `GET /crm/action-centre`：授权任务的未完成/逾期/未来7天计数、本人未读消息，以及最多100条到期/未来7天AR/AP关注项目。后者要求accounting.reports.read，AR另外遵循客户范围；按公司当地日期及既有不可变往来变动/GL过账日计算未清余额，更多项目使用既有账龄API。不会另建应收应付余额，不自动催收、付款、生成税务或会计凭证。
- 消息90天逻辑有效期；客户端按expiresAt清理失效消息并在打开来源时重新鉴权。物理归档与生产保留策略需部署时单独配置。

## 同步

`POST /crm/mobile/devices/{device}/task-operations {operationId,sequence,id,action,version?,data?}`，action使用CREATE/UPDATE/START/COMPLETE/CANCEL/REOPEN/DELETE。同一设备与C04草稿、C05协作共用连续序号和operation UUID；冲突返回HTTP200/CONFLICT并消费序号，授权失败不消费。成功返回APPLIED/entity。跨HTTP幂等键重放也不重复业务效果；不可见ID冲突不泄露版本或正文。

原`GET /crm/mobile/devices/{device}/changes`增加TASK及MESSAGE，仍为提交有序共享游标、分页、30天epoch及tombstone；改派/删除引起授权版本变化，旧游标返回409，客户端必须清除CRM缓存并从0重建。历史Task快照同时检查当前权限与当时负责人，已删来源仅提供安全tombstone。Task用户可注册和撤销自己的设备，但不会因此获得草稿、客户协作或地图权限；原DRAFT分支独立检查drafts.read，防止借共享游标越权。

## 推送接口与运行

- `GET|PUT /crm/mobile/devices/{device}/push-subscription`，PUT `{token,platform:"ANDROID"|"IOS"|"WEB",enabled}`；仅本人活跃设备，令牌20—4096字符、无空白/控制字符。只返回设备/平台/启停/version，令牌从不返回或写入审计正文；幂等库只留请求摘要和无令牌响应。公司内令牌用固定32字节SHA256键唯一，避免长令牌索引溢出。
- `GET|PUT /crm/notification-preferences`，PUT `{pushEnabled,tasksPush,notesPush}`；关闭推送不影响消息收件箱。注册令牌本身是显式订阅，客户端仍需获得OS通知权限。
- `GET /crm/messages/{id}/push`查询本人消息的设备作业、状态、次数及安全错误码。
- `POST /crm/push/jobs/{id}/retry {expectedState:"FAILED"|"UNKNOWN",acceptDuplicateDelivery}`；UNKNOWN必须明确true接受可能重复投递，再重试。仅当前收件人、来源/订阅仍有效且总尝试少于5次可执行。客户端不传或保存服务端凭证。

Worker采用FCM HTTP v1及服务账号RS256 JWT换取OAuth令牌；不新增NuGet依赖。配置`Push__ProjectId`、`Push__ClientEmail`、`Push__PrivateKeyPem`，仅部署到Worker的秘密管理，不写仓库；Compose分别使用HTT_PUSH_PROJECT_ID/HTT_PUSH_CLIENT_EMAIL/HTT_PUSH_PRIVATE_KEY_PEM映射，仅Worker接收，PEM须包含真实换行。开启对应FCM API并按官方项目权限配置；iOS APNs与Web权限/服务工作线程由客户端接入阶段处理。

投递为持久队列：PENDING/RETRY→PROCESSING→SUCCEEDED/RETRY/FAILED/CANCELLED/UNKNOWN。两分钟租约、SKIP LOCKED认领、lease token围栏；最多5次，指数退避且尊重服务端Retry-After（最多24小时）。配置缺失明确FAILED；OAuth获取前失败可安全重试；FCM明确429/5xx可重试；UNREGISTERED仅停用相应令牌版本。发送后网络中断/非法成功回执/进程丢失租约进入UNKNOWN，绝不自动重发。

发送前重查当前成员、客户/来源、设备、令牌版本、偏好、已读及提醒代次。已过时作业取消；令牌轮换取消旧代次并迁移尚未发送的PENDING/RETRY，已在途或结果未知不自动复制。仅本人已撤销/停用的旧设备可释放同一令牌给新设备，不能接管他人令牌。

外发提示设置一小时TTL并按HTT更新折叠，避免离线设备长期堆积旧提醒；业务详情仍以消息中心为准。外发文本固定为通用HTT提示，仅带消息/公司/来源opaque ID，不含客户名、Task标题、Note正文。发送前最后检查与真实外部服务间仍存在时间窗口，撤权无法撤回已经在网络中的通用提示；打开业务必须重新鉴权。FCM接受回执仅表示服务端接受，不代表手机展示/用户阅读；推送不承诺exactly-once，消息中心是可查询的持久记录。网络失败不回滚已保存的Task/Note。

官方协议依据：[HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api)、[错误与重试](https://firebase.google.com/docs/cloud-messaging/error-codes)。本批仅模拟HTTP及数据库Worker验证，无真实密钥、FCM发送或手机展示验收。

## 验证与后续

专项覆盖权限/跨公司/当前客户范围、任务状态与版本、历史隐私、删除后的幂等/同步、共享离线序号、并发写/提醒/认领、失败原子回滚、令牌轮换/长令牌/撤销、偏好、已读、UNKNOWN和五次上限、FCM JWT/缓存/错误/退避及行动中心与账龄一致性。准确测试数量与运行环境见verification.md。本轮不修改三个客户端、生产账套及原需求材料。

C07销售事实、C08激励及C09统一工作台仍待实施。C06完成的是后端切片；真实Firebase项目配置、客户端通知授权/深链/本地缓存/弱网展示、APNs/Web及真实设备投递是后续联调条件。
