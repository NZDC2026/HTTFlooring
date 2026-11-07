# 本轮：customer-portal CTX-002 门店列表

2026-11-07。最多一个业务切片，只迁移已存在.NET源码的门店上下文读取。不实施其他门户候选、前端登录、财务或订单写入。

## 矩阵与证据

矩阵实际位于兄弟项目 `customer-portal/docs/backend-analysis/api-catalog.md`，CTX-002；调用顺序见同目录page-api-mapping.md的P02。该目录声明30项能力多数为草案，不能都当已批准HTTP契约。本轮以CTX-002标识跟踪，并以旧PortalEndpoints.cs:31和迁移018的portal.branches输出为契约事实。

当前前端无业务HTTP调用：LoginPage.tsx调用data/localAccount.ts的本地login；App.tsx做本地守卫。CTX-002是矩阵的登录后支撑步骤，尚无实际fetch调用位置或门店选择UI；不会将profile.region当客户/门店授权。

## 本轮接口与DTO

唯一新增接口：GET /api/portal/v1/branches。请求为Bearer、X-Company-Id、X-Portal-Grant-Id，无Path/Query/Body。兼容.NET Guid.TryParse的D/N/B/P/X常见标准形式，拒绝缺失、非法或全零上下文。

响应为CustomerBranches：`{customerId,grantId,items:[{id,code,name,addressLine1,suburb,state,postcode,country}],dataAsOf}`。所有字段沿用旧SQL，不采用矩阵中建议的嵌套address新DTO。按code、id排序，只返回明确授权且ACTIVE的门店，空范围200空数组。suburb映射city、country映射country_code，dataAsOf来自数据库语句时间。

数据所有权：CRM维护客户/门店；identity维护动作/成员/grant与显式branchId集合。identity的限定SECURITY DEFINER函数只返回范围元数据，CRM不直接读IAM表。CRM查询同时固定company/customer/branchIds并使用公司RLS，事务为REPEATABLE_READ/readOnly，审计独立事务保留。

权限：已验证CUSTOMER身份、CUSTOMER成员、branch:read、本人有效非COMPANY grant及有效客户/公司。旧门户的隐含读权限需在新系统显式配置branch:read；本轮不自动分配角色/动作。CUSTOMER范围也只列出grant_branch明确绑定的门店，不扩展该客户其他门店。全停用的BRANCH范围仍可返回200空数组，避免基础身份快照过滤空grant改变旧行为。

## 文件、接口和表边界

- 新增crm/CustomerBranchConfiguration、application/CustomerBranches与ListCustomerBranches、infrastructure/CustomerBranchRepository、api/PortalBranchContext、PortalBranchController、PortalBranchErrors。
- 新增api/PortalBranchRateLimit及测试：旧300次/分钟/issuer+subject、无等待队列、空429；每实例最多100000分区并回收过期项。只接入CTX-002，其他API共享预算在后续网关/HTTP基础设施统一，不增加Redis依赖。
- 新增identity/contract/CustomerBranchScope、identity/CustomerBranchAccess；扩展AccessRepository的限定函数调用、IdentityConfiguration的条件接线；架构测试明确允许此公共权限入口，不公开DAO。
- 新增V6__portal_branch_query.sql：为crm.customer_branch增加真实code及公司/客户内唯一约束；新增identity.portal_branch_scope限定范围函数。V1～V5不改。
- 修改application.yml、.env.example新增HTT_PORTAL_BRANCHES_ENABLED=false；目标库V6、认证和真实授权完成后再启用。
- 测试限定PortalBranchTests、PostgresBaselineIT中的本切片验收及V6断言；更新门户迁移清单、架构/状态/阶段文档。

V6不生成历史code/address/country。授权门店缺这些旧接口必需值时返回503，作为迁移数据未就绪，禁止用UUID/虚构地址补值或悄悄过滤记录。无新增业务写权限；旧表SELECT权限覆盖新增code。

## 兼容层与已批准认证边界

PortalBranchContext适配旧GUID头，DTO/SQL别名适配旧字段。PortalBranchErrors仅作用于本Controller：400 portal_context_required、403 scope_denied、503 database_unavailable/retryable=true、500 internal_error，保留旧code/message/requestId/retryable/nullable fieldErrors形状。成功响应增加no-store，不改payload。

认证层继续采用ADR-0005既有Java规则：缺失/无效JWT、禁用或无法绑定身份为401，统一认证JSON；旧.NET JWT challenge可能没有body、旧SQL身份不可用可能为403。这是此前已采用的身份迁移边界，本轮不修改全局认证/异常策略。只有进入本切片后的上下文、范围及存储错误使用旧接口兼容层。

## 验证与回滚

普通测试用真实RSA验签，受控替换身份/数据仓储，验证成功严格JSON、旧GUID形式、非法/缺失上下文、无登录/错误audience、跨客户grant/公司、空列表、数据源/事务503和未知500。数据库测试只用htt_management_validation或本地Testcontainers，验证实际SQL/RLS/权限撤回及数据迁移缺口；不连接旧库、主库或ERPNext。

命令：mvnw.cmd verify；加载Validation角色后mvnw.cmd -Ppostgres-it -Dhtt.test.database=dedicated verify。测试执行结果完成后归档至门户迁移清单，明确普通替身与真实数据库的区别。

最终结果：92项普通测试（含18项本接口HTTP/兼容/安全、3项限流）、15项真实PG集成测试，零失败/错误/跳过，JAR构建成功。新增PG用例使用真实HTTP、IAM仓储/审计/RLS与RSA token，仅取钥为测试公钥，不连接Keycloak。验证旧字段/排序、跨客户/公司/COMPANY grant拒绝、CUSTOMER grant不扩展、全停用空范围、缺code的503、角色/Grant撤回、客户停用及账户禁用。V6已应用验证库且不可改写。

```powershell
$env:MAVEN_USER_HOME = Join-Path (Get-Location) '.cache/maven'
$env:DEBUG = 'false'
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
. ./scripts/database/Use-DatabaseEnvironment.ps1 -Target Validation -Migration
.\mvnw.cmd -o -B -ntp '-Dmaven.repo.local=.cache/repository' -Ppostgres-it '-Dhtt.test.database=dedicated' verify
```

证据：`.cache/portal-branches-final-verify.log`与target/surefire-reports、failsafe-reports。事后`.cache/portal-branches-inspection.log`核对V1～V6成功，测试账户/成员/角色/grant/客户/门店/访问审计均0行；范围函数归验证库迁移账号，PUBLIC执行授权为0。首轮发现事务代理未明确启用，已显式配置；补齐限流后再次通过完整验收。未修改主库或兄弟仓库。

回滚关闭HTT_PORTAL_BRANCHES_ENABLED，恢复本轮Java/配置差异；保留已应用V6及审计，用新迁移修复，不执行clean/drop或重写历史。没有修改兄弟仓库、部署API或切换前端指向。
