# 日常开发库统一

2026-11-07。用户明确当前均为开发/测试环境，要求日常使用 `htt_management`，未来生产用一个HTT业务库，通过脚本建立结构。本计划更新此前“演示数据只保留验证库”的安排，不变更自动化测试隔离要求。

## 本轮范围

- 修改 `scripts/database/DemoData.java`、`Use-DemoData.ps1`：显式Main/Validation目标；Main写演示数据需开发用途开关，禁止Main事务演练。
- 新增 `Invoke-DatabaseMigration.ps1`、`prepare-schema.sql`：独立凭据执行Flyway；提供空库平台schema准备脚本。
- 更新 `docs/database.md`、`demo-data.md`、STATUS、README、ADR及索引；不修改业务接口、前端、历史迁移或ERPNext。
- 操作顺序：两库只读盘点 → 验证库完整verify → 验证库迁移入口验收 → Main已验证迁移 → Main演示数据 → Main只读/授权/应用启动验收 → 定向移除验证库人工演示数据。

本轮开始Main为V1/V2且9张业务表全空，Validation为V1～V6及最小演示数据；无需搬运真实交易或覆盖现有记录。V3～V6增量已在隔离库验收，所有脚本保持原校验和。迁移涉及身份授权、通知、库存结构和门店查询函数，不新增任何API；六个权限目录不自动授予真实账户。演示权限保持客户/销售禁止创建正式订单。

## 验证与回退

普通verify和dedicated PG verify只用Validation；Main仅执行已验证迁移、授权开发演示数据维护及应用只读检查。验证环境无须成为生产部署依赖。Main写入前已有空表/迁移清单只读盘点；本次无业务数据需要搬迁或覆盖。生产有数据时必须先做可恢复备份，不能用本次空库操作代替备份演练。

演示数据回退：`Use-DemoData.ps1 -Target Main -Action remove -DevelopmentData`，不删审计，不CASCADE，依赖冲突则整体回滚并人工核查。结构保留，错误用前向迁移修复，禁止clean/baseline/改写脚本。Main迁移失败后先看Flyway history，已提交版本不反向删除；API启动保持validate-only。

后续输入：Keycloak真实开发用户、issuer/subject绑定和本地可信TLS；本轮不假装已完成业务登录。真实库存与财务初始化不在本轮范围。生产只部署一个HTT业务库；Keycloak的专用身份存储属于独立组件，不与HTT业务表强行合并。

## 实际结果

- `mvnw.cmd -o -B -ntp -Dmaven.repo.local=.cache/repository -Ppostgres-it -Dhtt.test.database=dedicated verify`：92普通、15PG，0失败/错误/跳过，JAR成功，日志 `.cache/main-development-verify.log`。
- `Invoke-DatabaseMigration.ps1 -Offline`：先Validation通过，再Main成功从V2升级V6，4项迁移成功，validate 6项成功；未修改脚本。日志 `.cache/development-validation-migrate.log` 和 `.cache/development-main-migrate.log`。
- Main seed/check提交并独立重连检查；Validation remove/rehearse通过且演练全回滚。事后两库各V1～V6；Main保留2公司/2客户/3门店/4账户，Validation只余6个权限目录，没有演示账户/授权或业务数据。
- `prepare-schema.sql`在Validation由非超级迁移owner执行通过（已有platform schema）；未宣称全新生产空库重建已验证。
- 三项拒绝检查通过：Main seed无开发开关、Main rehearse、Java绕过包装脚本但无开发开关；均连接前终止。
- Main应用运行账号以database profile、临时18081端口启动，readiness UP，随后只停止本轮临时进程。认证默认关闭；没有真实Keycloak登录、FCM或新容量验收。
- `git diff --check`通过（仅既有CRLF提示），没有提交/推送或修改兄弟仓库。
