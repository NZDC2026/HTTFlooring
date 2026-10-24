# 阶段B客户门户授权与商品库存API

本批只改htt-backend。新增018迁移，旧001—017保持不变。客户门户、销售/仓管端和管理/财务端均未修改；正式数据库未迁移。真实OIDC/Cognito应用、邀请/找回密码与客户端登录跳转需在后续联调中配置，本后台不创建密码或签发客户JWT。

## 身份与数据库边界

客户使用独立OIDC应用受众，API命名认证方案为`CustomerPortal`。员工默认Bearer方案保持独立；客户身份不能取得员工membership，员工身份（包含其他公司的membership）不能被绑定为客户身份。数据库行锁和membership触发器共同防止并发绑定绕过边界。停用的外部身份不会被客户授权操作重新启用，外部issuer/subject及既有显示名也不会被覆盖。

管理员只绑定经过身份服务核实的HTTPS `issuer`与不可变`subject`，不按邮箱自动匹配、不根据客户端提供的customerId授权。授权记录明确绑定一个公司和一个客户，并列出允许的门店以及每个门店允许的SELLABLE仓库。同一外部客户身份可有多个客户上下文，查询必须显式选择一个；每个身份最多100个启用上下文。历史customer_user_grants默认`portal_enabled=false`，不会因升级自动开放。旧记录需要管理员核实身份后显式迁移，不允许直接PUT启用旧占位授权。

门户使用`htt_portal`数据库登录，只允许执行6个白名单读取函数，没有业务表SELECT/UPDATE、员工身份解析或内部辅助函数权限。每个HTTP请求在独立只读事务中执行；SQL内再次验证身份、公司、授权、客户状态、门店及仓库。公司表仍保留FORCE RLS，客户入口没有复用员工CompanySession或开放通用SQL查询。数据库凭据只由后台持有。

## 员工维护API

以下地址以`/api/v1`为前缀，使用员工JWT与`X-Company-Id`。写请求必须提供`Idempotency-Key`；PUT还需`If-Match: "1"`等正整数版本。同键同内容返回原结果，同键异内容409；同版本竞争只有一个成功。事务失败时身份、范围、发布、条码、成功幂等记录及审计一并回滚。

| 方法/路径 | 权限 | 结果 |
|---|---|---|
| POST `/customers/{id}/portal-access` | portal.access.manage + customers.read及客户范围 | 201，授权id及version=1 |
| GET `/portal-access/{id}` | portal.access.read + customers.read及客户范围 | 身份、启用状态及门店仓库范围 |
| PUT `/portal-access/{id}` | portal.access.manage + portal.access.read及客户范围 | 200，全量替换启用状态及范围，版本+1 |
| GET `/portal/catalog/products/{id}` | portal.catalog.write + catalog.write + customers.all | 发布范围、描述、低库存阈值、条码与版本 |
| POST `/portal/catalog/products/{id}` | 同上 | 201，新建显式门户发布 |
| PUT `/portal/catalog/products/{id}` | 同上 | 200，替换发布内容与受众，版本+1 |

默认ADMIN拥有上述权限；OFFICE可读取授权并维护发布，不能创建/修改客户授权；SALES、WAREHOUSE、FINANCE、PROCUREMENT默认不拥有门户维护权限。自定义角色仍需满足组合权限与客户范围。

授权创建请求：

```json
{
  "issuer": "https://your-verified-identity-provider.example",
  "subject": "immutable-external-user-subject",
  "displayName": "Customer user",
  "enabled": true,
  "branches": [{"branchId": "<uuid>", "warehouseIds": ["<uuid>"]}]
}
```

PUT仅接收`enabled`与`branches`，不允许改变身份或客户。`branches`是全量替换；启用时至少一门店，每次最多20门店，每门店1—20个不同可售仓。范围不支持通配符；门店必须属于该客户，仓库必须属于当前公司并启用。停用授权可用`enabled=false, branches=[]`撤回全部访问。

商品发布请求：

```json
{
  "published": true,
  "allCustomers": false,
  "description": "Customer-facing product description",
  "lowStockQuantity": "5.000000",
  "customerIds": ["<uuid>"],
  "barcodes": ["0001234567890"]
}
```

`allCustomers=true`必须配空customerIds，表示明确面向本公司全部已授权客户；否则仅显式受众可见。未发布、空受众、非STOCK、停用或禁售商品不显示。阈值以商品基本单位计，是独立公开库存状态阈值，不暴露内部补货点。每商品最多20条码，公司内唯一，保留前导0，ASCII字母统一大写，允许数字/字母与`.`、`_`、`-`；最多80字符，首字符为数字或字母。条码冲突整笔回滚。受众最多100客户，必须属于当前公司且ACTIVE。

## 客户只读API

所有路径以`/api/portal/v1`为前缀，使用门户JWT。先调用`GET /me`取得自身启用上下文；其他请求必须带`X-Company-Id`、`X-Portal-Grant-Id`，商品及仓库查询还必须提供`branchId`。请求体、查询参数或其他自报客户ID不会扩大授权。

| 方法/路径 | 返回 |
|---|---|
| GET `/me` | contexts：companyId/name、grantId/version、customerId/code/name |
| GET `/branches` | 当前授权下启用门店及地址 |
| GET `/warehouses?branchId={uuid}` | 当前门店授权的启用SELLABLE仓库id/code/name |
| GET `/products?branchId={uuid}` | 分页商品及授权多仓汇总available/stockStatus |
| GET `/products/{id}?branchId={uuid}` | 公开描述、SKU/名称、有效分类、基本单位、单位换算/数量步长及条码 |
| GET `/products/{id}/availability?branchId={uuid}&warehouseId={optional}` | 授权多仓可售量、总量、库存状态、单位、dataAsOf |

列表可选参数：`search`（最多100字符，SKU/名称/条码，不区分大小写，字面包含匹配）、`categoryId`、`stockStatus=ALL|IN_STOCK|LOW_STOCK|OUT_OF_STOCK`、`sort=sku|name|availability_desc`、`page=1..10000`、`pageSize=1..100`（默认25）。排序最后以id稳定打破平局；不支持任意列排序。页内商品和totalItems来自同一语句快照。跨页请求可能因后续库存变动重新排序，未承诺跨请求冻结分页。

`available=on_hand-reserved`，按基本单位返回十进制字符串，只汇总当前门店授权且启用的SELLABLE仓。隔离仓、在途库存及其他仓不计入；合法仓库尚无该SKU余额时返回0。`OUT_OF_STOCK`表示0；正数不大于公开阈值为`LOW_STOCK`；其余为`IN_STOCK`。每次响应来自同一已提交数据库快照，未提交库存变化不可见；dataAsOf是数据库语句时间，不是缓存版本或库存承诺。报价/订单预留仍须在后端交易时重新检查。

不返回成本、实物量、预留明细、客户信用/财务资料、内部补货点、供应商或会计科目。本批不提供客户价格、订单写入、图片、WebSocket推送或跨仓调拨；商品公开描述由发布维护单独控制。成功响应`Cache-Control: no-store`，不落公共响应缓存。认证失败401；缺少上下文400；身份/授权/客户不可用403；不可见商品/门店/指定仓404；非法筛选422；维护版本/唯一性冲突409。禁止把403/404/503转换成“0库存”。无商品时200空列表，合法仓无库存时200数量0。

GET天然可重复，不要求幂等键，也不创建审计/命令/Outbox。授权或状态撤销在后续查询的语句快照生效；已经开始的查询可按撤销前快照完成，不宣称强行取消在途响应。单次SQL statement_timeout 10秒、lock_timeout 3秒，客户API按issuer+subject限流300次/分钟；未做生产容量压测。

## 配置、升级与验收

新增环境项：`HTT_PORTAL_PASSWORD`、`HTT_PORTAL_AUTHORITY`、`HTT_PORTAL_AUDIENCE`、`HTT_PORTAL_AUTH_MODE=Oidc|Cognito`。Compose映射`ConnectionStrings:PortalDatabase`为htt_portal账号，以及`PortalAuthentication:*`。受众/client_id必须与员工不同，authority必须HTTPS；部分缺失或错误模式拒绝启动。未配置认证时没有开发后门。Cognito额外验证`token_use=access`及独立`client_id`，拒绝ID token。真实身份服务签名发现、密钥轮换、邀请流程与客户端token保存/续期仍需后续真实联调。

新库由infra/init-db.sh创建四种角色。**既有数据库卷不会重跑init脚本**：在部署018前，使用PostgreSQL管理员与libpq环境PGHOST/PGPORT/PGUSER/PGDATABASE/PGPASSWORD运行`infra/prepare-portal-role.sh`，另注入HTT_PORTAL_PASSWORD；随后运行现有迁移CLI。不要把owner/app连接填给门户。变更先在隔离副本演练并备份；本批没有执行正式库升级。

集成测试增加HTT_TEST_PORTAL_CONNECTION，verify.sh显式要求；compose.test.yaml提供独立测试登录。PortalTests覆盖签名/受众/过期/配置、Cognito、角色、客户/公司/门店/仓越权、字段白名单、发布/状态撤回、空库存、预留后库存、幂等/版本并发、授权替换快照和DB最小权限。完整结果见[verification.md](verification.md)。客户端页面/真实身份提供商、容量与恢复验收尚未完成，阶段B整体仍有其他欠交。
