# Keycloak 部署与 Java 接入准备

2026-11-06 更新：用户已授权直接在测试服务器 Docker 部署并优先使用本地 IP。Keycloak 已运行于 **https://192.168.10.174:18443**，使用独立数据库容器和开发 CA，TLS/ready/realm/客户端检查通过。完整地址、凭据位置、CA 信任、开发命令、备份、生产配置与切换见 [部署记录](DEPLOYMENT.md)。三端真实登录和手机号双标识仍未联调。

本页下方说明的是 `compose.yaml` 生产配置模板及前一阶段准备；实际开发部署使用 `compose.development.yaml`、`manage-development.py` 和 `api.development.env.example`。开发 DB 例外仅限独立容器内网；生产模板仍要求 verify-full TLS。

## 生产模板配置

- 两个 realm：htt-staff（管理 Web、销售 App），htt-customer（客户门户）。三个公共客户端，授权码 + PKCE S256，不配置客户端密码、不启用隐式流/密码直授/服务账户。
- 员工两个客户端的 access token audience 都为 htt-staff-api；门户为 htt-portal-api。Java 验证 realm issuer、RS256、audience、有效期并解析本库绑定；client/realm/Keycloak roles 均不直接授予业务权限。
- realm 不导入用户、密码、公司、角色授权或默认业务管理员。邮箱可作登录标识；登录表单仍是账号 + 密码。手机号与邮箱同账户双标识、规范化/验证/找回尚未实现，不宣称模板天然支持手机号别名。前端跳转/回调改动必须另行确认。
- 自助注册和密码找回暂关闭；verifyEmail=true，尚无 SMTP。正式开户/邮箱验证与恢复流程需要落实后才能开放真实登录，不能批量伪造已验证邮箱。
- 直接 HTTPS，HTTP 关闭，固定完整 hostname；没有配置不可信代理头。默认宿主机只绑定环回；管理端口 9000 仅映射环回。要供手机访问，先落实内网 DNS、可信证书、私网绑定和管理路径隔离。
- 独立 htt_keycloak PostgreSQL 数据库和专用账号，不能复用 htt_management、验证库、ERPNext 库/Redis。启动脚本拒绝其他库名和 postgres 账号，并要求 PostgreSQL verify-full TLS。现有 PostgreSQL TLS 尚未确认可满足此模板，不能直接指向服务器现有连接运行。
- Docker secrets 传入 DB 密码、临时 bootstrap 密码、TLS 密钥；入口脚本运行时读取，不放 Compose environment 值或命令参数。宿主机文件需私有存放，并让镜像实际运行 UID 可读；Compose bind secrets 的权限需部署时实测。
- 2 CPU / 2 GiB 是待验证的单节点资源上限，不是十万同时在线容量承诺。Keycloak 自有缓存不因部署 Redis 自动迁移至 Redis；API 的权限校验仍每请求重新读取。

## 文件和填写顺序

1. `.env.example` → 私有 `.env`：填写完整 hostname、三个确切 callback、Web origin、镜像版本及真实 digest、私有 secret 文件路径；不能使用 `.invalid`、REVIEWED_* 或通配回调上线。官方当前版本参考 [下载页](https://www.keycloak.org/downloads)；实际部署时重新核对补丁和 digest，不使用 latest。
2. 提供匹配域名的 TLS fullchain/key、PostgreSQL CA；用户设备与 Java 信任相应 CA。不要用跳过证书校验或 HTTP 解决内网接入。
3. 单独准备 htt_keycloak 库/账号并验证 TLS，不在本轮执行 SQL；Keycloak 启动会修改自己的表，所以本模板不能用于试探业务主库。
4. 核对 `realms/*-realm.json`：Keycloak 原生支持环境变量占位符，首次启动导入；已有同名 realm 将跳过，不会因为改了文件就自动更新既有客户端。后续变更应经过受控管理流程。
5. `api.env.example` 为 Java 已有 HTT_* 配置的对应标识。认证保持 false，待 V3/V4 目标库及显式账户/权限/数据范围就绪并完成实际 E2E 后再开启；Spring 不自动读取此文件。

在专用生产部署目录、补齐输入后才执行以下命令；本轮没有执行这些生产命令：

```sh
docker compose --env-file .env -f compose.yaml config --quiet
docker compose --env-file .env -f compose.yaml up -d
# 停止仅本栈，保留身份库；不使用 down -v 或删除数据库回退。
docker compose --env-file .env -f compose.yaml stop
```

镜像启动使用 start 而非 start-dev；未构建 optimized 镜像，首次启动可能较慢。生产发布前要固定镜像 digest、执行真实 realm 导入/密码流程/PKCE/令牌/健康检查、备份恢复和升级验证，再决定构建优化镜像。此模板不等同于已验收生产部署脚本。HTTPS 证书到期、DB 连接、健康/指标与日志告警也需接入运维。

管理员 bootstrap 只用于首次受控初始化。部署验收中应建立实名运维账户/MFA、删除临时 bootstrap 账户并收回/轮换 secret；后续日常部署移除 bootstrap 变量/secret 前需调整模板并验证，不长期使用临时管理员。业务管理员仍需在 Java 授予 MANAGEMENT、order:create 及范围，禁止自动映射。

## 验证与回退

前一阶段执行了本地静态检查与 Java 构建。后续本轮已实际完成开发 Compose 启动、realm 导入和管理登录检查，详见部署记录；仍不代表业务用户登录、手机真机或 Java 全链路联调通过。

本轮上述 3 项 Java 模板检查和 Bash 语法检查通过；另外实际运行入口脚本的 5 项负向检查：HTTP hostname、业务主库名、未验证 PostgreSQL TLS、postgres 账号、缺失 secret，均在启动服务前返回拒绝。未连接数据库或调用 kc.sh 成功路径；这些结果不能替代容器验收。

真实验收还需：浏览器/手机 DNS 与证书、实际 issuer/JWKS、员工双客户端/门户 audience 隔离、错误 token/算法拒绝、账户映射、禁用/撤权/退出已有 JWT 失效策略、手机号/邮箱流程、密钥轮换、IdP 不可用。Keycloak 管理台禁用不会自动撤销 Java 已签发 JWT，必须补齐同步/维护流程，不能仅缩短过期时间冒充即时撤销。

回退：本轮删除新增模板并还原文档即可，无远程状态。未来部署回退先停本栈，保留并备份独立身份库；Keycloak 升级可能改 schema，禁止旧镜像直接读升级后的库。恢复数据库备份与匹配版本应在隔离环境演练。realm JSON 导出不是完整 DB/会话备份。

依据：[容器与入口脚本](https://www.keycloak.org/server/containers)、[导入、占位符及限制](https://www.keycloak.org/server/importExport)、[固定 hostname](https://www.keycloak.org/server/hostname)、[TLS](https://www.keycloak.org/server/enabletls)、[客户端和 audience](https://www.keycloak.org/docs/latest/server_admin/index.html)。
