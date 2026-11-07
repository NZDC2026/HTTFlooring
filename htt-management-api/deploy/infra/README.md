# HTT RabbitMQ / Redis 部署与运行

2026-11-06。此目录提供 Linux 单节点部署基础，含测试和生产 TLS 配置；不是十万在线容量承诺，也不是跨主机高可用集群。Java 暂未接入 Redis；它不会自动接管 Keycloak 会话或业务权限。

## 文件与前置条件

| 文件 | 职责 |
| --- | --- |
| manage.py | init、preflight、up、check、stop、backup；仅操作固定 HTT Compose 项目 |
| compose.yaml | 独立卷、网络、健康检查、持久化、资源与日志限制、secret 文件挂载 |
| compose.test.yaml | 环回地址上的独立测试端口 |
| compose.production.yaml | RabbitMQ/Redis 双向 TLS，管理界面始终环回绑定 |
| container/*.sh | 启动、凭据读取、TLS 文件权限和 Redis 认证 CLI |
| run-notification-tests.sh | 在目标 Linux Docker 主机的受限 Maven 容器内运行临时 Testcontainers |
| tests/tls_smoke.py | 使用明确测试 CA 的生产配置正向/负向验证；测试后停止服务 |
| tests/AmqpProbe.java、tests/amqp_probe.sh | 测试证书下的真实 Java AMQP 双向 TLS、发布确认和 vhost 隔离探针 |

要求 Linux、Docker Engine/Compose、Python 3、OpenSSL；路径使用不含空格的绝对路径。已在 Ubuntu 26.04.1、Docker 29.9.2、Compose 5.6.1 验证。脚本不安装/升级 Docker，不改防火墙或全局 sysctl，不重启已有服务。

两个项目名固定为 htt-infra-test 与 htt-infra-production；容器、卷与网络带 HTT 标签。项目名与非 HTT 容器冲突、端口占用、空间/内存不足、TLS 错误时拒绝继续。修改/备份有同环境进程锁。镜像在初始化时拉取并解析为 digest，此后 up 不追逐浮动标签；实际 digest 在私有状态的 release.json/.env。

## 测试环境初始化

将本目录复制到专用位置，例如服务器 `/home/eric/htt-management-infra/deploy/infra`；不要复制任何已有 `.state`。用户需要有 Docker 权限。

```bash
cd /home/eric/htt-management-infra/deploy/infra
python3 manage.py init test
python3 manage.py preflight test
python3 manage.py up test
python3 manage.py check test
```

init 不覆盖已有状态或轮换密码；再次运行会拒绝，避免与持久卷中的账号失配。秘密和备份保存在 `.state/test/`，目录 0700、原始凭据文件 0600，不在 Git 中。不会打印生成密码；不复用 SSH、PostgreSQL 或 ERPNext 凭据。

| 服务 | 用户 | 默认测试地址（服务器本机） |
| --- | --- | --- |
| RabbitMQ AMQP 0.9.1 | htt_app，vhost htt-notifications | 127.0.0.1:5678 |
| RabbitMQ 管理界面 | htt_ops | 127.0.0.1:15678 |
| Redis | htt_app，仅允许 htt:* 键 | 127.0.0.1:16379 |

原始密码分别在 `.state/test/secrets/rabbitmq-app-password`、`rabbitmq-admin-password`、`redis-app-password`、`redis-admin-password`、`redis-health-password`。通过受控终端/秘密管理获取，不粘贴到日志、Git、连接 URL 或聊天。Compose 的非秘密 .env 不含密码；RabbitMQ 定义和 Redis ACL 只保存密码散列。

从开发机访问使用 SSH 转发，SSH 口令由 SSH 交互读取：

```bash
ssh -N -L 5678:127.0.0.1:5678 -L 15678:127.0.0.1:15678 \
    -L 16379:127.0.0.1:16379 eric@192.168.10.174
```

这时开发机使用 localhost 对应端口，Java RabbitMQ 设置 host=127.0.0.1、port=5678、username=htt_app、virtual-host=htt-notifications，密码单独注入。测试环回连接是明文；它只能经本机/SSH 使用，不把端口改为公网明文。当前 backend 通知功能仍默认关闭，身份/业务模板/权限配置需单独完成。

## 正式生产部署

在目标生产主机上复制此目录，不复用测试状态、测试 CA 或测试密码：

```bash
cd /opt/htt/deploy/infra   # 示例，实际使用已准备且可写的专用目录
python3 manage.py init production
# 从内部 PKI/秘密管理安装下列真实证书和私钥，再 preflight/up。
python3 manage.py preflight production
python3 manage.py up production
python3 manage.py check production
```

初始化默认候选镜像为 RabbitMQ 4.3 management Alpine、Redis 8.6 Alpine，自动固定下载时的 digest。可用 init 的 --rabbitmq-image / --redis-image 指定审核过的 tag/digest；升级需审查兼容性、先备份和隔离验证，不编辑已运行数据库后盲目换回旧镜像。

需要安装到 `.state/production/tls/` 的文件：

| 文件 | 要求 |
| --- | --- |
| ca.crt | 可信 CA/证书链；不要把 CA 私钥放入此目录或容器 |
| rabbitmq.crt / rabbitmq.key | 服务器证书/匹配私钥，serverAuth，正确 SAN |
| redis.crt / redis.key | 服务器证书/匹配私钥，serverAuth，正确 SAN |
| ops-client.crt / ops-client.key | 运维与健康检查的 clientAuth 证书；业务应用使用独立客户端证书 |

私钥用受保护文件提供，不能交互解密；目录 0700、私钥 0600。预检查验证严格 X.509 链、用途、至少 24 小时剩余有效期、匹配公钥及服务器名。生产只启用 RabbitMQ AMQPS 与 Redis TLS，并要求客户端证书；管理界面仍仅环回地址，使用 SSH 通道访问。

默认服务别名/证书名为 htt-rabbitmq、htt-redis。若使用真实域名，将状态 .env 的 RABBITMQ_TLS_NAME、REDIS_TLS_NAME 改为证书 SAN 对应名称，并让客户端使用相同名称。HTT_BIND_ADDRESS 默认 127.0.0.1；跨主机时显式设置本机私网 IPv4，并在云网络/主机防火墙仅允许应用来源。脚本拒绝公网或通配绑定，不自动开端口。

默认生产主机端口是 AMQPS 5671、Redis TLS 16380、环回管理界面 15679；可用 init 的 --rabbitmq-port/--redis-port/--management-port 覆盖。Compose 内部应用可显式加入该 HTT 专用网络并使用 htt-rabbitmq:5671、htt-redis:6379。不要加入 ERPNext 的网络或复用其 Redis。

Java RabbitMQ 后续需设置 spring.rabbitmq.ssl.enabled、key-store/type/password、trust-store/type/password，并保持 validate-server-certificate/verify-hostname 为 true；对应 PKCS12 密钥与信任库从 PKI 生成，通过秘密管理注入。不能通过关闭验证解决证书错误。Redis 客户端还未进入本项目，后续接入需 TLS、ACL、过期与权限缓存失效设计。

## 资源、持久化与运行边界

| 配置 | 测试 | 生产基础默认值 |
| --- | --- | --- |
| RabbitMQ 容器内存/CPU 上限 | 1 GiB / 1 核 | 4 GiB / 2 核 |
| RabbitMQ 内存水位/磁盘空闲水位 | 512 MiB / 1 GB | 2 GiB / 8 GB |
| Redis 容器内存/CPU 上限 | 512 MiB / 0.5 核 | 2 GiB / 1 核 |
| Redis maxmemory | 128 MiB | 768 MiB |

Redis 留出 AOF 重写/fork、客户端与碎片空间，AOF everysec，noeviction；达到上限会拒绝新增写入，不随意淘汰可能用于安全状态的数据。若需要可淘汰业务缓存，应单独设计实例/策略，不能与关键会话数据混用。Redis maxmemory 不等于容器总内存上限。

RabbitMQ 使用独立持久卷、稳定节点名、用户/vhost/资源前缀权限。htt_app 没有管理标签，默认 guest 不保留；Redis 关闭 default 用户，并分离应用、运维、仅 PING 健康用户。两服务只读根文件系统，必要运行目录 tmpfs，日志轮转，文件描述符上限 65536。Erlang cookie 保存在自己的数据卷，不能复制到其他独立节点共享使用。

这些数值是可调基础配置；十万在线仍需实际登录/刷新/API/长连接流量模型、压测和多实例设计。单台服务器、单个 RabbitMQ 节点和单 Redis 都存在主机级故障点；生产高可用需独立节点、quorum 成员规划、Redis 故障转移以及独立备份存储，不能把单机 Docker 当高可用。

主机内核参数、存储加密、监控/告警与备份外送需由运维按主机规划配置；脚本不更改共享服务器全局参数。验收应监测 RabbitMQ 内存/磁盘报警、队列堆积、Outbox DEAD/延迟、Redis 写拒绝和 AOF 状态。

## 备份、停止和恢复

```bash
python3 manage.py backup production          # RabbitMQ 定义 + Redis RDB，不含排队消息
python3 manage.py backup production --cold   # 短暂停本项目两服务，另备份两个完整数据卷，再恢复运行
python3 manage.py stop production            # 只停止本项目，保留卷、状态和凭据
```

备份目录 `.state/<环境>/backups/<UTC时间>/` 含定义、Redis RDB、冷备份卷归档（如选用）及 SHA256 manifest；文件 0600。按块计算校验，不把整个大归档读入内存。没有 manifest 或校验失败的目录不能用于恢复。备份可能含业务内容、令牌或密码散列，需要加密外送和访问限制；本机备份不抵御主机丢失。

RabbitMQ 在线导出定义不能恢复排队消息；灾难恢复应使用冷备份卷或通过业务 PostgreSQL Outbox/Inbox 核对补发。冷备份前先暂停相关应用 worker/生产者，并规划与 PostgreSQL 的一致恢复点；脚本只控制自身 RabbitMQ/Redis，不会擅自停止业务应用或 PostgreSQL。

恢复流程：校验 manifest 和归档、使用匹配 digest/稳定节点名准备隔离目标、停止目标服务、仅向已核实为空的目标卷恢复归档、安装对应秘密与真实证书，再启动检查。不要向运行中的 broker 覆盖文件，不在非空卷上直接解包，也不运行全局 prune、down -v 或重置其他项目。RabbitMQ cookie/节点名、Redis ACL 与应用凭据要一致；若轮换凭据则同时更新应用与管理配置。当前交付自动化备份和保留卷停止，灾难恢复需按此流程单独演练，未声称完成生产灾难恢复验收。

若启动新版本失败，先保留卷及日志。纯配置问题可恢复上次已审查配置后重新 up；涉及存储格式升级不能只换旧镜像，需按产品升级/恢复文档从匹配备份恢复，禁止盲目降级。

## 通知真实容器测试

```bash
# 在 Docker 所在 Linux 主机执行。仅运行受信任源码；Docker socket 等同 Docker 管理权限。
sh deploy/infra/run-notification-tests.sh /absolute/htt-management-api-checkout
```

runner 使用 Maven Wrapper、Java 21、2 核/2 GiB，挂载自身 Maven 缓存与宿主机 Docker socket；Linux host 网络与 127.0.0.1 override 使现有本机 Docker 安全校验仍成立。测试自己创建临时 PostgreSQL/RabbitMQ，结束清理；不连接 5432 的现有库。不会开放 Docker TCP 或关闭测试的目标校验。

可用 HTT_TEST_RABBIT_IMAGE 指定已审核 digest，HTT_TEST_RUNNER_IMAGE 指定构建镜像；默认 tag 在拉取后解析 digest。普通运行只执行 notification-it 编译和 6 项 Failsafe 用例；报告在源码 target/failsafe-reports。缓存卷 htt-notification-it-maven-cache 可保留，无需重复下载。

## 本次实测

192.168.10.174 已运行 htt-infra-test，所有发布端口仅在环回；现有 PostgreSQL、ERPNext 等容器没有被本流程操作。生产 TLS 配置使用独立测试 CA 做正向、缺客户端证书的负向测试和冷备份，通过后停止。该状态带 .tls-smoke-only 标记，普通 production up 会拒绝重启，不能把冒烟证书用于真实生产。

通知 Testcontainers 的 6 项真实 broker 测试全部通过；本地普通 verify 56 项通过。此前专用 PostgreSQL 11 项结果仍保留，本轮没有访问该服务数据库。TLS/冷备份冒烟通过不代替正式证书、生产灾难恢复和容量验收。

可在空的、仅环回生产配置上用 `python3 tests/tls_smoke.py --allow-test-ca --java-probe` 重做冒烟；--java-probe 需要先运行通知容器测试以填充 Maven 缓存。已有测试状态且服务已停时可显式增加 --replace-test-certificates 重做测试证书。脚本拒绝在已有真实证书状态执行，CA 私钥保存在未挂入服务的测试私有目录。该命令仅用于测试，不能用来生成正式生产证书。

参考：[RabbitMQ 生产配置](https://www.rabbitmq.com/docs/production-checklist)、[Redis 内存限制](https://redis.io/docs/latest/develop/reference/eviction/)。实际记录见项目 docs/notification.md 和部署日志。
