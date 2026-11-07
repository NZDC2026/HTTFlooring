# ADR-0009：门户门店读取兼容迁移

日期：2026-11-07。状态：CTX-002后端实现、92项普通/15项真实PG验收通过；前端未接线/部署。

采用门户矩阵CTX-002编号，以旧.NET PortalEndpoints.cs和018_customer_portal.sql为实际契约。只迁移GET /api/portal/v1/branches，不顺带实现其他候选DTO或未确认财务流程。前端没有HTTP调用，本轮不改登录机制。

CRM按API/应用用例/数据访问分层，投影保留旧JSON；不建通用CRUD接口或重复实体适配。identity通过CustomerBranchAccess及CustomerBranchScope公开范围，限定函数只返回授权元数据，CRM不直接读取IAM表。

只列出所选Grant显式绑定且ACTIVE的门店，不展开CUSTOMER范围内其他门店。所有门店停用时旧列表仍200空数组，因此不能只依赖会省略空BRANCH grant的身份摘要；V6函数在用例事务中重查精确Grant。

branch:read复用既有目录，显式分配取代旧隐含资格，不自动授予角色。数据在只读REPEATABLE_READ中查询，受公司RLS和独立权限审计约束。客户端/角色名不能证明身份或归属。

V6增加真实code，不生成伪编码，必要数据未迁移返回503。保留旧GUID格式、400/403/503/500及单实例300次/分钟的空429；全局认证沿用已批准ADR-0005的401规则。功能默认关闭，开启需认证、V6、真实数据与授权。

回退关闭HTT_PORTAL_BRANCHES_ENABLED、还原Java差异；保留V6并用前向迁移修复，不clean/drop。主库、前端和ERPNext未修改。字段/文件/兼容边界及测试见 [阶段计划](../plans/customer-portal-branches.md) 与 [迁移进度](../migration/customer-portal.md)。
