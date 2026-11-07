# Keycloak与本地Swagger开发认证

2026-11-07。用户批准下一步真实测试账户绑定及本地Swagger检验。

## 范围与兼容

- 修改platform/config/OpenApiConfiguration、platform/security/SecurityConfiguration，仅development profile开放文档GET并声明员工/客户OAuth2授权码流程，业务仍需Bearer。
- CurrentUserController两条me和PortalBranchController仅增加文档安全声明，不改变方法/路径/DTO或授权。
- 新增application-development.yml、scripts/Start-Development.ps1，用Main和专用CA truststore启动本机8080；默认配置、local冒烟和生产profile不变。
- 新增deploy/keycloak/development-login.py：仅固定测试realm中的htt-api-swagger独立客户端、4个标记账户，不改三端已有客户端、SMTP或全局realm认证策略。公开客户端、PKCE S256、精确localhost/127.0.0.1回调，不开启密码grant/隐式流程/服务账户。
- DemoData/Use-DemoData增加bind/unbind，映射验证过的issuer/subject到现有内部DEMO账户；不新增权限、表或Flyway版本，不从邮箱推断身份，不覆盖冲突映射。
- 新增DevelopmentDocumentationTests及本文/开发说明，更新README/STATUS/数据库与演示说明。

内部依赖：Swagger跳转Keycloak登录 → 授权码+PKCE → access token → Java固定JWKS/issuer/audience校验 → Main identity.external_identity → 现有RBAC/ABAC和CRM门店查询。无Java密码接口或前端修改。手机号双标识与三端正式接入不在本轮。

## 验证与回退

先普通定向测试、Validation种子bind/unbind/remove，再完整verify（普通+dedicated PG），通过后绑定Main演示身份。真实邮箱密码登录以受信任TLS和授权码PKCE获取token，再只读验收两个me、本人门店、跨公司403、无认证/错误realm401；不在Main进行账户禁用、权限修改等故障测试。真实认证会正常追加访问审计，不将其伪装成无写入。

回退先停本地development应用，在Main执行 `Use-DemoData.ps1 -Target Main -Action unbind -DevelopmentData` 立即使映射不可用；独立脚本disable仅停用4个demo用户和2个swagger客户端，不删除身份库或三端客户端。随后不用development profile启动。单在Keycloak停用/退出不保证Java已有JWT立即失效，必须解除Java绑定或同步撤销。保留审计及schema，不覆盖历史迁移。

证据在docs/development-login.md和STATUS更新；协议脚本验证不等于真实浏览器点击和三端E2E、手机号验证/找回、生产证书或容量验收。

实际结果：定向20项通过；最终94普通/15真实PG、JAR通过。Validation的seed/bind/unbind/remove通过；Main绑定四个公开subject成功。真实Keycloak四账户邮箱密码+PKCE、Java/Main四me、本人门店、跨公司403和匿名/错误realm401均通过；password/token未输出或下载。Main新增正常访问审计，无撤权/禁用故障测试。Swagger实测3条路径、持久化关闭。8080被现有进程占用，未停止，增加精确8081备用回调并用本轮应用验收。浏览器CA未自动导入，用户按说明手动操作。
