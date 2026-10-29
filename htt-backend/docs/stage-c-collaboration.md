# C05：客户协作、拜访、地图、展板和CRM附件

仅修改htt-backend，新增045迁移。S-05/S-06/S-09—S-14和S-29约定的服务端链在本包交付；真实Google服务、手机定位/相机、导航拉起和本地缓存需客户端联调。C06 Task/消息、C07销售事实、C08激励和C09聚合仍待实现，整个阶段C未完成。

## 数据及人员边界

Note、展板和拜访采用统一的版本化CRM对象，保留种类、公司、客户、门店、原作者、状态和不可变变更历史。不是财务单据，不改变库存、往来余额或总账。所有公司业务外键及产品/门店检查绑定同公司；门店必须属于目标客户，新建时须有效。对象的客户、门店、作者、种类和关联产品创建后不换，换对象建新记录。

- Note为纯文本，1—10000字；TEAM对当前获分配客户且具协作读权限的人员可见；OFFICE只对原作者及具办公室管理权限且有客户范围的人员可见；PRIVATE仅原作者且仍有客户权限可见，ADMIN也不隐式越过个人私有。编辑由作者或有管理权限且能读取该Note的办公室人员执行。
- 历史按版本保存，分享后不会把旧私有版本开放给新读者。改变分享范围或删除会增加ACL版本，使旧设备游标失效；须清空同步域缓存后从0重建。重建时不再提供已不可见的旧正文。
- 展板归门店，记录标题、放置时间、可选商品及说明，状态DISPLAYED/REMOVED。放置时间规范化为UTC，移除须说明原因并保留历史；商品/放置时间不改，替换板件以移除旧记录、创建新记录表示。展板记录不等于库存出库或固定资产会计；本包不会凭照片扣减库存。
- 拜访必须由用户发起。记录同一作者的OPEN→CLOSED或CANCELLED会话；同公司每个用户最多一个OPEN会话，跨设备也成立。其他销售不能读取其定位历史；办公室管理人员在客户范围内可看历史及取消未结束会话。只有原访客可签退，办公室取消明确记录原因，不伪造签退或定位。
- 签到和签退均须显式给出纬度、经度、精度及设备采集时间；精度1—1000米，采集时间在过去7天至未来5分钟范围内，签退不早于签到。另存服务端接收时间。离线重放遵循当前权限和同一会话版本；这些是客户端报告的证据，不是后台验证过的真实到场或薪资考勤。

默认ADMIN/OFFICE拥有7项新权限，SALES拥有读/写Note/写展板/写拜访/地图读，FINANCE/WAREHOUSE/PROCUREMENT不自动取得协作权限。新权限：crm.collaboration.read、crm.notes.write、crm.boards.write、crm.visits.write、crm.collaboration.manage、crm.maps.read、crm.maps.manage。管理权限仍受客户范围和私有可见性限制，不授予成本或财务字段读取权。

## API和版本

统一前缀`/api/v1`，有效身份、X-Company-Id；命令带Idempotency-Key，普通更新/签退/取消/移除/删除带当前If-Match。创建使用稳定UUID。数据采用现有金额/小数JSON契约，坐标最多7位小数。

| 方法及路径 | 输入/说明 |
| --- | --- |
| GET `/crm/collaboration` | kind、customerId、branchId、ownerId、state、from/to、page/pageSize；from/to按服务端创建时间、半开区间筛选 |
| POST `/crm/collaboration` | `{id,kind,customerId,branchId?,data}`，kind为NOTE/BOARD/VISIT |
| GET `/crm/collaboration/{id}` | 当前授权视图，已删除404 |
| GET `/crm/collaboration/{id}/history` | 当前授权及历史版本可见性双重筛选 |
| PUT `/crm/collaboration/{id}` | 完整Note或展板data；不能编辑拜访定位 |
| DELETE `/crm/collaboration/{id}` | Note/展板逻辑删除；不能删除拜访历史 |
| POST `/crm/collaboration/{id}/checkout` | `{checkOut:{latitude,longitude,accuracyMetres,capturedAt},notes?}` |
| POST `/crm/collaboration/{id}/cancel` | OPEN拜访，`{reason}` |
| POST `/crm/collaboration/{id}/remove` | DISPLAYED展板，`{reason}` |

NOTE data：`{text,visibility:"TEAM"}`。BOARD data：`{title,placedAt,productId?,description?}`。VISIT创建data：`{checkIn:{latitude,longitude,accuracyMetres,capturedAt},purpose?}`。服务端接收时间、状态、作者和历史由后台设置，不能通过payload覆盖。

客户读权限、写权限、当前目标范围和对象可见性在幂等缓存前重查，等待公司head锁后再查。相同键相同请求重放；异内容同键、过期版本和不合法状态返回冲突。业务对象、附件登记、历史、同步事件、审计/Outbox和幂等结果属于同一事务，审计失败不会留下半完成对象。

## 接入C04同步

新增`POST /crm/mobile/devices/{device}/collaboration-operations`，输入`{operationId,sequence,id,action,kind?,customerId?,branchId?,version?,data?}`。action为CREATE/UPDATE/DELETE/CHECKOUT/CANCEL/REMOVE。与C04草稿共用同一个设备连续sequence、operationId唯一约束、提交有序head和操作结果日志；不要为新路径另起一个序号。

C04的`/changes`继续输出原DRAFT项（仍有draft字段），新项带entityType和entity字段：NOTE、BOARD、VISIT、ATTACHMENT、BRANCH_GEO。删除为tombstone。附件事件只带ID/父对象/扫描或撤销状态，地理编码事件只要求刷新门店，不把照片字节或Google坐标复制进不可变历史。无既有客户的CUSTOMER草稿附件通过DRAFT刷新事件通知。

版本冲突以200及status=CONFLICT记录并消耗设备序号，客户端用新operationId/下一序号解决；拒绝权限不消耗序号。不得借ID冲突读取不可见对象的serverVersion。公司head在变更前锁定，避免低序号晚提交被漏掉；授权变化、30天设备游标过期或ACL变更返回409，要求清理缓存并从0重建。C06后续Task/通知还要接入，S-22仍部分实现。

## 地图、地理编码和导航

| 方法及路径 | 输入/说明 |
| --- | --- |
| GET `/crm/map/branches` | customerId、state(AU州)、status(客户状态)、geocodeState、hasBoards、q、salesperson、south/north/west/east、page/pageSize |
| PUT `/crm/branches/{branch}/coordinates` | `{latitude,longitude,reason}`，If-Match为门店版本；办公室人工核实坐标 |
| POST `/crm/branches/{branch}/geocode` | If-Match为门店版本，返回202作业；同一门店/地址版本只保留一个作业 |
| GET `/crm/geocode-jobs/{id}` | 当前授权的状态、次数、错误代码 |
| POST `/crm/geocode-jobs/{id}/retry` | 仅失败且仍为当前地址版本的作业 |
| GET `/crm/branches/{branch}/navigation?provider=GOOGLE` | GOOGLE/APPLE，返回编码后的导航URL及是否使用坐标，不替设备拉起应用 |

地图只含当前授权客户的有效门店，不包含信用额度、成本、付款或其他销售的拜访GPS。支持授权范围内客户状态、AU州、展板、销售归属及字面搜索；完整经纬度框可跨日期变更线(west>east)，未定位门店不会混入框内结果。分页保留过滤后的total。没有坐标时导航使用已有授权地址。

坐标绑定门店版本。地址、名称或启停等门店变更都会使旧坐标失效，并发送门店刷新事件；这是偏保守的规则。地图状态LOCATED/UNLOCATED/STALE/PENDING/FAILED，旧坐标不会作为新地址的定位点。现有原始门店lat/lng字段不被自动当作核验过的C05坐标。

Google适配遵循[官方Geocoding请求/响应](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding)：固定HTTPS域名、编码地址和country过滤，密钥仅在Worker `Geocoding__ApiKey`（compose：HTT_GEOCODING_API_KEY）。无密钥明确FAILED、不发请求；20秒预算、64KB响应上限、不跟重定向。429/5xx/配额瞬态/UNKNOWN_ERROR可重试；无结果、多候选、部分匹配、国家不符或非法数据不会静默选坐标。保留ROOFTOP/RANGE_INTERPOLATED/GEOMETRIC_CENTER/APPROXIMATE精度，不把粗略位置标为精确到店。

作业最多5次自动尝试，退避、2分钟租约和旧token拒绝；可修好配置后人工重试。调用前及完成时重新授权并核对门店版本，改地址丢弃结果；人工坐标优先于同版本的晚到自动结果。Geo作业状态变化也发送刷新事件。手工维护门店先取head锁，再锁门店；完成作业遵循相同顺序。

本实现将Google坐标短期缓存30天，过期不再返回，Worker清理过期坐标；同地址过期后可显式再排作业。不可变同步事件不保存提供商坐标。Google结果带Google Maps归属及GOOGLE地图约束，Apple导航不使用Google派生坐标；手工坐标及自有地址可用所选导航。按[服务特定条款§6](https://cloud.google.com/maps-platform/terms/maps-service-terms)及[官方展示归属要求](https://developers.google.com/maps/documentation/geocoding/policies)实施这一默认策略，真实账户的合同、前端展示及数据保留流程部署时另验。本轮使用模拟HTTP和作业适配器测试，没有调用真实Google API。

## CRM私有附件

复用`POST /documents/{id}/attachments?fileName=...`（原始文件请求体、MIME、If-Match）、`GET /documents/{id}/files`、`GET /files/{file}/content`、`POST /files/{file}/revoke`及原扫描/重试作业。Note/展板/拜访/客户资料草稿自动建立CRM专用附件登记；045回填已有草稿登记，不改其内容/版本；每家公司回填后立即执行待检查约束，再切换上下文，保留原BAS/关账约束。CRM类型只允许附件，不允许借通用PDF/邮件接口伪装财务文档。

限10MiB、PDF/PNG/JPEG签名及文件名检查、私有字节与SHA校验、扫描后才可下载。每次列表/下载/上传重放和扫描完成均复核当前父对象权限；草稿仅DRAFT可上传、DELETED不可读，其他CRM已删除不可读。提交前上传的草稿附件在审批后仍受原草稿阅读范围控制，不自动复制到正式客户。已关闭拜访可追加授权附件留痕，不能修改已记录的定位。文件扫描中撤权或撤销不会被标为可下载；附件撤销有同步标记，已下载到设备的字节清理由客户端按撤权契约执行。

## 数据和验证范围

新增5张公司FORCE RLS表：collaboration_objects、collaboration_history、collaboration_changes、branch_geocodes、geocode_jobs；head新增ACL版本。应用只读新表，受控函数执行写入，历史/变更append-only。既有001—044迁移保持原字节，原文件输出函数保持OID/ACL，仅增CRM分支及扫描权限检查。累计202张业务/基础表、45条迁移。

验收包含角色/客户/私有/公司范围、历史隐私、版本/幂等、并发创建/签到/签退/离线操作、删除与撤权、防冲突泄漏、定位必填/范围/时间、展板无库存/GL副作用、地图框/筛选/导航、地址变更/人工优先、Google协议/错误/租约/限次重试、扫描/附件撤销和晚期审计失败回滚；最终数量及兼容性检查见[验收记录](verification.md)。真实客户端、GPS/相机硬件、生产吞吐和真实提供商另验。
