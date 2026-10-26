# 阶段B：单据回收站与草稿生命周期

本批仅修改htt-backend，新增019迁移与一个业务表，累计123张业务/基础表、19个迁移。001—018不改；三个客户端未修改，正式数据库未迁移。

## 删除与恢复的含义

删除是可恢复的可见性操作，不物理删除单据、行、附件、审批记录或账簿，不代替订单取消、退货、贷项或退款。恢复只解除隐藏，保留原单据ID、编号、业务状态、业务版本、原行及附件。它不会重新确认订单、预留库存、扣减库存、产生AR/AP/GST/Journal，或自动重发邮件/PDF。已取消的单据恢复后仍取消；已过账发票原注册状态仍为POSTED，原供应的冲销由关联贷项/退款记录表达，不重写原发票。

可见性保存在`platform.document_visibility`，具有独立递增的lifecycleVersion；业务注册`platform.documents.version`保持原样，原PDF/附件source_version也不因隐藏或恢复失效。原`deleted_at/deleted_by`只作为旧标记保留，新接口不写这两个字段，也不开放永久清空。

## 当前可删除状态与合法冲销规则

| 单据 | 进入回收站的条件 | 被拒绝的情况 |
|---|---|---|
| QUOTE 报价 | 未转换且业务状态与注册状态均为DRAFT | SUBMITTED须办公室先return-to-draft；CONVERTED保留来源追溯，不能因订单取消而伪装成新草稿 |
| SALES_ORDER 销售订单 | 已通过原取消流程CANCELLED、未开票/未发货，库存预留及信用承诺已全部释放，订单预收已退款 | 未取消、已履约/已开票、仍有预收或承诺；删除不会代做取消或释放 |
| INVOICE 销售发票 | 所有行完整数量及含税金额均有合法已过账贷项；非零贷项需原发票→贷项的reversal_links；全部已收/预收核销金额已退款 | 仅已付款/部分贷项/退款未清/仅手改状态均不足；先走既有退货、贷项与退款流程。零金额发票也须数量完整冲销 |
| CREDIT_NOTE 销售贷项 | 当前没有已实现的合法贷项撤销/借项调整流程，已过账贷项始终拒绝删除 | 退款只是清偿客户信用，不撤销该贷项的收入/GST效果，不能因此隐藏仍有效的冲销凭证 |
| PURCHASE_ORDER 采购订单 | DRAFT，或经原关闭流程CLOSED/CANCELLED且从未收货 | 已确认未关闭、已有任何收货；不能以删除绕过收货/暂估/AP/退货链 |

其他单据类型返回422，未开放通用账簿删除。当前销售订单/发票/贷项由现有交易直接确认或过账，没有新增这些类型的草稿创建接口。贷项撤销、已履约订单及已收货采购单的进一步归档规则另列后续事项，本批不创造新的财务冲销方法。

待执行/处理中/重试中或结果UNKNOWN的PDF、邮件任务会阻止删除（409）。先等待并核实任务结果；本批不自动取消外部发送，不提供把UNKNOWN强改为成功/失败的公共入口。SCAN不是外部发件，可继续处理既有私有附件，但隐藏期间不能下载或查看其任务。新任务插入与删除使用同一单据注册行锁，等待锁后的请求会重新检查可见性。

## HTTP契约

员工入口为`/api/v1`，使用员工JWT及X-Company-Id，客户门户JWT不能调用。所有写请求需Idempotency-Key、If-Match和X-Document-Version，并提交非空reason（最多2000字符）。

| 方法/路径 | 权限 | 用途 |
|---|---|---|
| GET `/documents/trash?documentType=QUOTE&page=1&pageSize=25` | documents.trash.read + 原单据读取/范围权限 | 只返回当前用户可读的隐藏单据；无金额、成本或客户敏感快照 |
| GET `/documents/{id}/lifecycle` | 同上 | 读取当前可见性、两种版本、删除人/时间及最近原因 |
| POST `/documents/{id}/trash` | documents.trash.write + trash.read + 原业务写权限/范围 | 软删除 |
| DELETE `/documents/{id}` | 同上 | 软删除别名，同样需要JSON原因 |
| POST `/documents/{id}/restore` | documents.trash.restore + trash.read + 原业务写权限/范围 | 只恢复可见性 |

GET lifecycle示例：

```json
{
  "id": "<uuid>",
  "documentType": "QUOTE",
  "number": null,
  "state": "DRAFT",
  "documentVersion": 1,
  "lifecycleVersion": 1,
  "isTrashed": false,
  "trashedAt": null,
  "trashedBy": null,
  "reason": null,
  "changedAt": null
}
```

没有生命周期行时，lifecycleVersion虚拟为1。首次删除后为2，恢复为3，之后每次+1。If-Match必须使用**lifecycleVersion**，X-Document-Version使用**documentVersion**；后者防止把刚被他人修改的草稿按旧视图删除。建议写操作前读取lifecycle，一次获取两个版本。

```http
POST /api/v1/documents/<uuid>/trash
Authorization: Bearer <staff JWT>
X-Company-Id: <company uuid>
Idempotency-Key: <unique command key>
If-Match: "1"
X-Document-Version: 1
Content-Type: application/json

{"reason":"Duplicate draft confirmed with customer"}
```

返回200及当前生命周期对象。恢复时用新幂等键、If-Match: "2"；业务未改变时X-Document-Version仍为1。缺版本428、缺幂等键400、输入/不支持类型422、权限/范围不足403、未知/其他公司单据404、版本/业务资格冲突409。列表只支持上述5种documentType、page 1..10000及pageSize 1..100；默认25，有界分页。

POST trash和DELETE别名采用相同的TRASH命令去重范围。同键同输入返回第一次结果，同键异输入409；重复响应不会重做删除/恢复。若删除后已恢复，再重放旧删除键，响应仍是原操作结果，实际可见性不会再次改变；需要最新状态时重新GET lifecycle。成功命令、审计、Outbox和幂等记录在同一事务内提交；失败全回滚。

## 权限与可见性

ADMIN、OFFICE、SALES、FINANCE、PROCUREMENT默认拥有三个生命周期权限，但仍须满足原业务权限及范围，不能只凭trash权限操作任意类型。报价写入/恢复须草稿所有人或sales.quotes.manage.all，并满足客户范围；销售订单须sales.orders.cancel；发票须sales.invoices.write；贷项须sales.credits.write但仍受上表冲销限制；采购须purchase.orders.write及原仓库授权。只读也核验原单据读取权限；不在授权客户或仓库范围内的条目不会进入列表或totalItems。WAREHOUSE与PRICING_MANAGER默认无回收站权限。

普通报价、销售订单、发票、采购订单列表排除隐藏单据；其详情、编辑、提交/审批、仓库入口及文档输出入口返回404。文件下载和任务详情由数据库再次核验原单据可见性。原AR/GST、审计、会计控制核对和合法冲销链保持完整，不因隐藏业务列表而丢失来源金额；例如隐藏已完整冲销的发票后，其AR来源记录及贷项仍可合法追溯。

数据库新表FORCE RLS与同公司复合外键，htt_app没有可见性表直接修改权限。受控函数检查当前成员、权限及客户/仓库范围；源单据及草稿行修改触发器与可见性操作共用注册行锁，不能通过直接改旧删除字段、编辑隐藏草稿或移动隐藏行绕过。幂等重放也重新核验当前读取、操作及客户范围权限。

原库若已有人工deleted_at标记，会继续隐藏并出现在有权访问的回收站列表；缺少合法生命周期证据时恢复返回409，需要单独审查迁移，不会在019升级中自动清空旧标记或改写已过账注册。本批018→019升级测试保留并核对此情况。

## 升级顺序

019不增加环境变量或数据库登录角色。先在备份副本中演练，用既有迁移工具显式升级至019，再发布匹配的API和Worker；ready探针要求新函数存在。恢复单据使用restore接口，不通过删除生命周期表或改旧注册/账簿来实现。正式库升级、备份恢复和客户端联调未在本批执行。

## 验证与交付范围

DocumentTrashTests覆盖草稿原样恢复、取消订单及预收限制、关闭/收货采购限制、CASH/NON_CASH下付款不等于冲销、完整贷项及退款、退货成本、零金额数量冲销、合法凭证保留、权限及公司/客户隔离、两版本、重复及并发命令、与编辑/提交及文档任务的竞争、附件恢复和失败回滚。前后快照比较注册、源行、库存/成本/预留、信用承诺、AR、GST及GL数据；恢复不产生第二笔业务动作。旧版升级与完整回归结果见[verification.md](verification.md)。

本批不修改客户端或身份服务，不执行正式库迁移、真实邮件发送或银行退款。真实客户端交互、生产容量及备份恢复验收仍需后续实施；阶段B其他欠交按[验收清单](stage-b-acceptance.md)保留。
