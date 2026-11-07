# customer-portal 接口迁移进度

2026-11-07。来源为customer-portal/docs/backend-analysis/api-catalog.md（30项候选）及page-api-mapping.md；它们不是30条已确认服务端API。当前客户端接入业务API仍为0。本轮只实施CTX-002，旧.NET六条路径逐项核验，不迁移未确认财务写流程。

## 本轮唯一切片：CTX-002

| 项目 | 事实/契约 |
| --- | --- |
| API | GET /api/portal/v1/branches |
| 前端实际调用 | 无HTTP调用；LoginPage.tsx → data/localAccount.ts本地登录，App.tsx本地守卫。矩阵P02指定CTX-001之后选择CTX-002/003，本轮不伪造调用文件 |
| 旧实现 | htt-backend/src/Htt.Host.Api/Portal/PortalEndpoints.cs:31；src/Htt.Infrastructure/Database/Migrations/018_customer_portal.sql的portal.branches |
| 请求DTO | PortalBranchContext：companyId/grantId来源于两个请求头；门户Bearer。无Path/Query/Body |
| 响应DTO | CustomerBranches(customerId,grantId,items,dataAsOf)；Branch(id,code,name,addressLine1,suburb,state,postcode,country) |
| 数据归属 | 公司→客户→门店；身份库限定函数返回本人grant明确branchIds；CRM只读同公司/客户授权行 |
| 权限 | CUSTOMER身份/成员、branch:read、有效客户grant；不按客户端/角色字符串推断 |
| 兼容 | 原字段/排序/空列表；GUID D/N/B/P/X；Controller内400/403/503/500旧错误；旧300次/分钟的空429；认证沿用ADR-0005 |
| 当前状态 | 已完成后端实现与验收；客户端未接入，功能默认关闭 |

实现/文件/回退详见 [本轮计划](../plans/customer-portal-branches.md)。前端尚未接线；真实客户数据、code/address/country、身份绑定和权限配置完成后才可启用开关。

## 逐条进度（只更新本轮已验证范围）

| 矩阵ID | API/能力 | 状态 | 剩余事项/测试证据 |
| --- | --- | --- | --- |
| AUTH-001～005 | 登录/退出/恢复/改密 | 阻塞 | Keycloak开发服务已有；精确回调、手机号/邮箱和账号生命周期未完整验收，非本轮切片 |
| APP-001 | 贸易账户申请 | 阻塞 | 真实提交/审核/邀请范围待确认，不能把本地存储当服务端申请 |
| CTX-001 | GET /api/portal/v1/me | 未完成 | Java已有身份基础接口；完整CTX-001契约迁移验收不在本轮，不冒充新增完成 |
| CTX-002 | GET /api/portal/v1/branches | 已完成 | 18项HTTP、3项限流和真实PG/HTTP切片通过；92项普通/15项PG构建成功 |
| CTX-003 | GET /api/portal/v1/warehouses | 未完成 | 仓库范围关系及查询尚未迁移；不由region推断 |
| ACC-001 | 账户资料 | 阻塞 | 联系人/区域/账户归属投影待确认 |
| ACC-002 | 修改联系人 | 阻塞 | 联系人白名单归属和并发写规则待确认 |
| ACC-003 | 账户汇总 | 阻塞 | 贷项/应收余额口径存在冲突，不擅自建立财务流程 |
| CAT-001～004 | 元数据/系列/集合目录 | 未完成 | 矩阵为候选契约，待逐切片迁移 |
| CAT-005 | GET /api/portal/v1/products/{id} | 未完成 | 旧已有候选；客户可见性/价格等投影尚未迁移 |
| CAT-006 | GET /api/portal/v1/products/{id}/availability | 未完成 | 统一库存V5及内部读取已存在；门户授权API未迁移 |
| CAT-007 | 商品销量趋势 | 阻塞 | 日期区间/净销量口径待确认 |
| CAT-008 | GET /api/portal/v1/products | 未完成 | 旧已有候选；授权目录分页/过滤待迁移 |
| INV-001～002 | 客户发票列表/详情 | 阻塞 | 财务读模型与余额口径需确认，当前仅本地样例 |
| RET-001～002 | 退货列表/详情 | 未完成 | 本轮不涉及 |
| RET-003～005 | 退货提交/撤销/确认贷项 | 阻塞 | 正式审核和操作人规则未确认；员工确认不是门户默认权限 |
| CRD-001～003 | 贷项查询/抵扣 | 阻塞 | 贷项/应收政策和操作人未确认 |

“未完成”表示尚未移植或未验收；“阻塞”表示涉及未确认契约/业务决策，不是基础设施故障。其余候选没有因为目录/表存在就标成完成。

## CTX-002测试证据

| 要求 | 自动化覆盖 |
| --- | --- |
| 成功 | 严格旧JSON、字段/排序；真实PG/RLS、只读REPEATABLE_READ、no-store；Accept=text/plain仍返回JSON |
| 非法输入 | 缺上下文、非法/全零/缩写UUID、重复头样式；400；D/N/B/P/X格式成功 |
| 未登录 | 无Bearer、URL token、错误audience401；真实HTTP匿名拒绝；禁用身份沿用ADR-0005的401 |
| 跨客户 | 同公司A/B互换Grant、跨公司、COMPANY grant、同客户未绑定门店均不扩大范围；假角色头不授权 |
| 异常状态 | 撤权/Grant撤销/客户归档403；门店全停用200空数组；缺code和存储/事务503；未知500；旧限流429 |

`.cache/portal-branches-final-verify.log`记录92项普通/15项PG零失败、错误、跳过及JAR成功。真实PG用例只以测试公钥替代IdP取钥，未替换HTTP、身份仓储、审计或RLS；不等于真实Keycloak/浏览器联调。测试数据/审计已清理。

发布前置尚未完成：真实code/address/country、公司/客户/Grant导入、branch:read分配、目标库V6、前端回调与请求接线。本轮未迁移主库/部署API。多实例全局限流与其他门户API共享预算后续统一，当前只保留CTX-002单实例旧策略。
