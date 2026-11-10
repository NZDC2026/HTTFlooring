# 阶段A主数据维护API

所有路径以`/api/v1`开头。接口不依赖三个客户端改动；真实OIDC身份仍按README配置。本次只补主数据，不增加报价、订单、出入库或财务交易命令。

## 请求约定

- `Authorization: Bearer <access token>`和`X-Company-Id: <company UUID>`必需。请求体不接受公司、操作者、角色或任意表名作为授权依据。
- POST必须有`Idempotency-Key`。PUT为完整替换可维护字段，必须同时有幂等键和`If-Match: "当前version"`，不是仅发送变化字段的PATCH。
- GET返回`version`供后续更新。已有客户状态PATCH保留，同样要求版本及幂等键。
- 金额、数量和比例以十进制字符串返回；输入兼容JSON数值与不带千位分隔符的十进制字符串。金额最多8位小数、库存换算6位、信用额度2位。价格amount和客户完整更新中的creditLimit/paymentTermsDays必须显式提供，缺省不会偷偷当成0。
- 时间输入ISO 8601带时区；服务端统一UTC比较，区间为`[start,end)`。税率业务日期按公司时区解析。
- 列表使用`page`（默认1）、`pageSize`（默认25，最大100），稳定排序；包含停用记录以支持管理与恢复。价格解析只使用有效且启用的规则。
- 主数据无DELETE接口。用客户/供应商/商品状态或`active:false`停用。联系人门店关联集合可替换，旧集合保存在同事务审计中。
- 错误常用：400缺幂等键/无效请求、403权限不足、404资源不在授权范围、409重复/版本/幂等冲突、422字段或区间/业务约束错误、428缺版本。字段校验错误有`fieldErrors`；失败不留下成功幂等记录。

## 路由与维护内容

| 路由 | 操作 | 授权 |
|---|---|---|
| `/customers` | 原有GET/POST | customers.read / customers.write；初始信用/非默认账期另需credit.write |
| `/customers/{id}` | GET、PUT资料/状态/信用额度/账期 | customers.read / customers.write；数据限授权客户 |
| `/customers/{id}/status` | 原有PATCH | customers.write；解除ON_HOLD另需credit.write |
| `/customers/{customerId}/branches` | GET列表、POST | customers.read / customers.write，验证客户范围 |
| `/customers/{customerId}/branches/{id}` | GET、PUT | 同上，禁止把门店转到另一客户 |
| `/customers/{id}/contacts`、`.../{contactId}` | GET列表/详情、POST、PUT | customers.read / customers.write，验证客户及门店归属 |
| `/suppliers`、`/suppliers/{id}` | GET列表/详情、POST、PUT | suppliers.read / suppliers.write |
| `/suppliers/{id}/contacts`、`.../{contactId}` | GET列表/详情、POST、PUT | suppliers.read / suppliers.write |
| `/regions`、`/regions/{id}` | GET列表/详情、POST、PUT | warehouses.read / warehouses.write |
| `/warehouses`、`/warehouses/{id}` | GET列表/详情、POST、PUT | warehouses.read / warehouses.write，读写均检查仓库范围；创建另需warehouses.all |
| `/uoms`、`/uoms/{id}` | GET列表/详情、POST、PUT | catalog.read / catalog.write |
| `/product-categories`、`.../{id}` | GET列表/详情、POST、PUT | catalog.read / catalog.write |
| `/products`、`/products/{id}` | 原有GET列表/POST；新增GET详情/PUT | catalog.read / catalog.write |
| `/products/{id}/units`、`.../{unitId}` | GET列表含版本/状态、POST、PUT | catalog.read / catalog.write |
| `/pricing/price-lists` | GET，读取STANDARD及统一含税口径 | pricing.manage.read |
| `/pricing/standard-prices`、`.../{id}` | GET列表/详情、POST、PUT | pricing.manage.read / pricing.write |
| `/pricing/customer-prices`、`.../{id}` | GET列表/详情、POST、PUT | pricing.manage.read / pricing.write，另检查客户授权范围 |
| `/pricing/promotions`、`.../{id}` | GET列表/详情、POST、PUT含明细集合 | pricing.manage.read / pricing.write |
| `/pricing/floors`、`.../{id}` | GET列表/详情、POST、PUT | pricing.floor.read / pricing.floor.write，与普通价格权限分开 |
| `/pricing/resolve` | 原有GET，根据客户及商品单位解析当前价 | pricing.read，按授权客户过滤，不返回底价 |

## 默认角色

新增权限自动补入现有ADMIN；新增公司使用同一版本化种子策略。不会给SALES增加主数据写权限，也不会给WAREHOUSE增加全仓范围。

| 角色 | 默认业务范围 |
|---|---|
| ADMIN | 公司内全部阶段A权限；仍是受限API角色，不是数据库owner |
| OFFICE | 公司全部客户维护、商品维护、普通价格维护、仓库只读；无底价和信用变更权限 |
| PROCUREMENT | 供应商/联系人、商品、区域和仓库维护；无客户及定价维护权限 |
| FINANCE | 全客户维护/信用/账期/解冻、供应商只读、会计及审计读；无底价或普通价格维护权限 |
| PRICING_MANAGER | 全客户只读、商品只读、普通价格和底价维护 |
| SALES | 授权客户及其门店/联系人只读、商品只读、对应客户价格解析；不能枚举客户协议价格表或底价 |
| WAREHOUSE | 授权仓库只读、商品与基础资料只读；不因角色名称自动获得全仓范围 |

本次不开放成员/角色分配管理API（属于身份接入工作）；实际成员关系和客户/仓库授权仍由受控配置建立。业务角色名称只是默认策略，接口始终检查权限码和行范围。

## 重要校验

- AU门店必须有州/地区与四位postcode，保留前导零；非AU地址仍支持两位国家代码。客户/供应商ABN检查格式和校验和；名称、代码、电话、Email、账期、金额精度均校验。
- 联系人可关联同一客户多个门店。跨客户/跨公司门店引用拒绝，整次写入回滚。联系人party、门店客户及产品基础单位不可改父级。
- 同一party兼客户及供应商时，维护共享名称/联系人需要两种维护权限及客户范围，防止借供应商接口绕过客户隔离。已关联客户门店的联系人通过客户接口维护。
- 启用引用的检查会持有事务共享锁，防止校验后被并发停用。商品需保留换算为1的启用基础单位；不能关闭该基础单位。商品单位一旦被任意价格规则引用，换算和步长锁定；停用不删除历史。
- 仓库用途SELLABLE/QUARANTINE/TRANSIT创建后不可改，库存重分类留给后续库存交易处理。
- 标准价与客户价启用区间由数据库排他约束阻止重叠；可先结束旧区间再创建相邻区间，或明确停用旧规则后替换。更新不会偷偷覆盖另一条规则。
- 固定金额的标准/客户/活动价写入时检查底价。折扣规则以及后续底价调整仍由价格解析最终把关；提高底价可能使既有价格进入“需办公室处理”，不会自动抬价。
- 规则的客户和商品单位不可改归属；需要转对象时停用旧规则、新建另一规则。底价同单位只有一条记录，停用后通过PUT重新启用。
- 促销PUT整体替换启用明细，最多100个不同单位；移除项目仅标记inactive。促销头与明细、审计及幂等结果一次提交，任一无效项全单回滚。
- 所有价格在当前STANDARD价目表AUD/含税口径内比较；本次不提供更改整套含税口径的接口，以免把既有金额重新解释。未来多币种/多价目表属于显式扩展。

## 示例

创建门店（POST `/customers/{customerId}/branches`）：

```json
{"code":"SYD-01","name":"Sydney store","addressLine1":"10 Example Street","suburb":"Sydney","state":"NSW","postcode":"2000","country":"AU","active":true}
```

创建联系人（POST `/customers/{customerId}/contacts`）：

```json
{"name":"Accounts Contact","email":"accounts@example.com","phone":"+61 2 9000 0000","mobile":null,"jobTitle":"Accounts","isAccounting":true,"active":true,"branchIds":["actual-branch-uuid"]}
```

建立标准价（POST `/pricing/standard-prices`；先通过商品单位查询获取ID）：

```json
{"productUnitId":"actual-unit-uuid","amount":"69.50","effectiveFrom":"2026-10-24T00:00:00+11:00","effectiveTo":null,"active":true}
```

建立客户固定价（POST `/pricing/customer-prices`）：

```json
{"customerId":"actual-customer-uuid","productUnitId":"actual-unit-uuid","method":"FIXED_PRICE","fixedPrice":"65.00","discountPercent":null,"effectiveFrom":"2026-10-24T00:00:00+11:00","effectiveTo":null,"active":true}
```

改为折扣规则时，使用`method: DISCOUNT_PERCENT`、`fixedPrice: null`及`discountPercent: "10"`。PUT需发送完整请求并携带新幂等键及当前If-Match；成功返回`{id,version}`，重放相同请求仍返回第一次的版本结果。

开发环境完整路径与DTO见`/openapi/v1.json`。示例中actual-...需替换为真实UUID；不会自动创建演示价格或客户。

## 升级与剩余边界

执行现有迁移CLI或Compose migrate即可从001—003升级到004，旧迁移摘要保持不变。AU地址约束为NOT VALID，旧版不完整地址不会阻止升级，但编辑旧地址时必须补齐有效字段。不要手工改迁移历史或旧SQL文件。

本次覆盖上述维护接口、权限和校验，不包含图片上传/病毒扫描、公司税务口径修改、正式财务交易、库存可售量、角色分配UI、云服务接入或三个客户端联调。对主数据的停用不等于已经实施后续订单/库存业务；阶段B仍需按交易状态建立相应限制。
