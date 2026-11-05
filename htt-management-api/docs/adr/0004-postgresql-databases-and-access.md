# ADR-0004：主库、独立验证库与迁移账号分离

日期：2026-11-05。状态：已采用。

## 背景

用户已提供 PostgreSQL 地址和初始化凭据，明确授权配置为主库并创建所需数据库及表。服务器同时部署 ERPNext；其共机关系不代表需要共享数据库或接入业务数据。本机没有可用 Docker，因此使用专门创建的验证库完成迁移和数据库行为验收。

## 决定

在 `192.168.10.174:5432` 创建独立 `htt_management` 主库和 `htt_management_validation` 验证库，各有独立迁移/应用账号。只对新 HTT 资源进行操作，保持其他库、账号、ERPNext 与服务配置不变。

主库只应用在验证库验收过的迁移；测试禁止使用主库。专用验证模式要求显式选项、固定目标、角色名和用途标记，不成为 Docker 测试失败时的隐式回退。

应用仅拥有当前只读主数据需要的权限；独立迁移角色拥有数据库和 schema，不用 postgres 运行应用。Flyway 从启动自动迁移改为启动仅校验，显式 Maven 命令执行迁移。保留 `ddl-auto=validate`，禁用 clean 和自动 baseline。现有配置中的 Flyway `enabled=true` 表示启用校验组件，不表示应用有 DDL 权限。

首批只建立 9 张已确认用途的主数据表，不建立未确认财务表或空业务 Java 模块。通过公司复合外键、索引、检查约束和 RLS 保持最基本的数据边界；具体身份认证、RBAC/ABAC 和业务用例仍需后续实现。

角色密码使用随机值，存储在当前 Windows 用户的 DPAPI 加密文件，并通过环境变量传入；提供的初始化管理员密码不落库配置。服务器当前未启用连接 TLS，记录该事实，不擅自更改服务器证书或服务。

## 代价与限制

同一服务器的独立数据库能隔离数据，不能隔离磁盘/CPU/实例故障。测试数据量保持很小，数据库事务和连接有超时。应用池上限初始为 5，实际容量仍需后续测量。

RLS 依赖可信服务设置上下文；它不替代认证，也不防止持有迁移凭据者维护数据。公司成员关系不能被推断成正式订单创建权限。

DPAPI 文件只适用于当前 Windows 用户/机器，不是生产密钥管理方案；后续部署需用环境的秘密管理机制。数据库迁移不可通过撤销 Java 文件回滚，应保留数据并追加经过验证的迁移。

操作步骤、表清单、测试和恢复要求见 [数据库说明](../database.md)。本记录更新 ADR-0001 的“无业务表、等待本机 Docker”阶段状态，不改变其普通构建与本地冒烟模式。

实施验收：两库和四角色已创建，V1/V2 已先在验证库验证再应用主库；22 项普通测试与 5 项数据库集成测试全部通过。只读核对确认两库各 9 张业务表启用 RLS、业务数据为零。主库应用账号实际启动 API 并通过 readiness；临时本地进程已停止，没有部署远程 API 服务。

## 依据

- [PostgreSQL CREATE DATABASE](https://www.postgresql.org/docs/17/sql-createdatabase.html)：建库独立于事务，并用 template0 建立干净数据库。
- [PostgreSQL 权限](https://www.postgresql.org/docs/17/ddl-priv.html)：所有权与访问权限分离。
- [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)：普通角色受策略约束，表所有者和特权角色的行为不同。
- [Flyway Maven](https://documentation.red-gate.com/flyway/reference/usage/maven-goal)：独立 migrate/validate 流程。
