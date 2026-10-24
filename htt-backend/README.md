# HTT Backend

澳洲 HTT Flooring 三端统一后台。阶段 A 基础及主数据、阶段 B 报价到订单、仓库交接、销售开票、客户收款、退货贷项、采购收货与财务过账；独立于 `ledgerone-api`，现有三个客户端无需修改。

技术：.NET 10 LTS / ASP.NET Core、PostgreSQL 17、EF Core 10 / Npgsql。模块化单体，API、Worker、迁移工具独立进程。

## 已实现

- 113张业务/基础表及16个版本化迁移，另有迁移历史表；涵盖公司、身份授权、客户/供应商/门店/联系人、商品单位、定价税码、会计、编号、审计、幂等、Outbox、附件与审批基础结构。
- OIDC JWT验证；Cognito access token模式验证`token_use=access`及`client_id`。未配置身份服务时没有开发后门，受保护接口保持锁定；生产配置缺失时拒绝启动。
- 公司选择、数据库RLS、复合外键、销售客户范围过滤、显式接口权限；API/Worker强制使用受限数据库账号。
- 客户创建/查询/状态更新（版本冲突保护），商品及单位创建/查询，基础资料/科目/税率查询，客户协议/促销价格解析，审计查询。
- 金额十进制字符串输出、AU ABN校验、整包面积换算、GST含税/未税舍入基础；禁止客户端控制权威金额。
- 幂等请求与业务/审计/Outbox同事务；并发同键只执行一次，异内容同键冲突。
- 阶段B报价草稿/版本提交、正式Q/SO编号、不可变快照、办公室审批转单、信用检查、库存预留及取消释放。通过受控owner CLI分别初始化数量和对应期初价值。
- 销售分批开票、INV编号、AR/收入/GST过账、未开票承诺按含税额释放、发票/应收/GST查询；显式GST登记配置与现金制快照。见[开票流程API](docs/stage-b-invoicing.md)。
- 客户收款、订单预收款、分批应收核销、信用额度释放、CASH收款日GST归属及NON_CASH预付GST清算。见[收款流程API](docs/stage-b-receipts.md)。
- 销售原成本退货（可售/隔离）、贷项/Adjustment Note、客户/预收退款、库存/收入/AR/GST对冲与批次追溯。见[退货退款API](docs/stage-b-returns.md)。
- 采购草稿/PO确认、分批验收、库存数量/价值与GRNI原子过账，支持不可抵扣GST资本化、非库存费用和关闭未收余量。见[采购收货API](docs/stage-b-purchasing.md)。
- 内部会计过账函数：来源版本、开放期间、两位小数、借贷平衡、控制科目party校验、唯一过账与不可变账簿。没有公开手工Journal接口。
- 财务只读一致性检查：库存流水/数量/估值/预留、在途、客户信用投影、AR/AP/预收预付/GRNI/采购退货清算与GL控制核对；逐实体差异、统一快照、权限及有界明细，见[一致性API](docs/stage-b-reconciliation.md)。停用仓库/商品或禁售商品的库存查询保留实物量，可售量为0。
- Outbox并发领取、60秒租约、指数退避、5次失败后停止自动重试，未知事件不伪装成功。

本次已补齐客户、门店/联系人、供应商、商品/单位/分类、区域/仓库及标准价/客户价/促销/底价维护，含停用、版本、幂等、审计和细分权限。路由、请求示例与权限矩阵见[主数据维护API](docs/master-data-api.md)。

阶段B收口结论：已交付核心交易/账务切片通过隔离账套回归；原v2阶段B整体验收尚未通过。PDF/邮件/附件、回收站、客户门户授权库存等B需求仍未交付；三个客户端未联调、正式库未迁移。当前统一状态见[验收报告与剩余事项](docs/stage-b-acceptance.md)，逐项原需求见[116条验收矩阵](docs/requirements-acceptance.md)。历史切片说明中的旧待办不是当前全项目清单。

详细边界见[阶段A交付说明](docs/stage-a.md)。这不是已完成的销售/仓库/财务ERP。阶段B第一批报价提交、办公室转单、信用及库存预留已实现，见[销售流程API](docs/stage-b-sales.md)。仓库分批拣货、提货/发运、库存扣减和成本原子过账已实现，见[仓库流程API](docs/stage-b-warehouse.md)。销售开票、应收/GST与承诺释放已实现，见[开票流程API](docs/stage-b-invoicing.md)。客户收款、预收核销与现金GST归属已实现，见[收款流程API](docs/stage-b-receipts.md)。退货/贷项/客户退款及来源冲销已实现，见[退货退款API](docs/stage-b-returns.md)。采购订单、采购收货与暂估已实现，见[采购收货API](docs/stage-b-purchasing.md)。供应商账单、精确收货匹配、GRNI冲减、AP与进项GST已实现，见[供应商账单API](docs/stage-b-supplier-bills.md)。供应商付款、预付款核销、AP余额和现金制进项GST归属已实现，见[供应商结算API](docs/stage-b-supplier-payments.md)。采购退货、供应商贷项/退款及库存/AP/GST冲销已实现，见[采购冲销API](docs/stage-b-purchase-returns.md)。仓间直接调拨、库存盘点、盘盈盘亏及报损已实现，见[库存控制API](docs/stage-b-inventory-control.md)。在途发运、分批接收、实际退回及财务短收处理已实现，见[在途调拨API](docs/stage-b-transit-transfers.md)。价格差异调整、独立预付税票、完整BAS及云端基础设施待后续实现。

## 目录

```text
src/Htt.SharedKernel          业务错误、ABN等少量共享规则
src/Htt.Modules.Foundation    主数据模型、十进制计算
src/Htt.Infrastructure       EF查询、SQL迁移、事务、权限解析、幂等
src/Htt.Host.Api             HTTP、认证、范围/权限、基础API
src/Htt.Host.Worker          Outbox基础消费者
src/Htt.Host.Migrations      显式迁移与受控公司初始化CLI
tests/Htt.UnitTests          税额、ABN、单位边界
tests/Htt.IntegrationTests   真实PostgreSQL、JWT、权限、并发/回滚
infra                        仅用于本地环境的角色初始化
```

## 本地启动（Docker）

需要Docker Compose。复制配置，替换三个开发密码，使用URL安全字符避免连接串分隔符歧义：

```sh
cp .env.example .env
# 编辑 .env 后启动；不会创建任何云资源
docker compose up --build -d
docker compose logs migrate
curl http://localhost:5080/health/live
curl http://localhost:5080/health/ready
```

数据库默认只绑定本机55432，API只绑定本机5080；有端口冲突时修改`.env`。`htt_app`、`htt_worker`登录角色只在**全新本地数据卷第一次启动**时由init脚本创建，修改`.env`不会自动轮换现有角色密码。

迁移是独立任务，API不会自行创建或修改表。可以安全重复执行`docker compose run --rm migrate migrate`，已应用文件校验和改变会失败。生产使用单一发布迁移任务，禁止把owner凭据注入API。

## 初始化真实公司及管理员

先在Cognito/实际OIDC提供商创建用户，取得正确issuer和subject，再执行owner CLI；主体名称、ABN和时区用实际值。没有“第一个注册用户自动管理员”逻辑。

```sh
docker compose run --rm migrate bootstrap \
  --name 'HTT Flooring' \
  --timezone Australia/Sydney \
  --issuer 'https://your-verified-issuer' \
  --subject 'actual-user-subject' \
  --abn 'your-valid-11-digit-abn'
```

初始化创建一个新公司并打印ID；此命令**不是按名称幂等的**，每执行一次创建一个主体，确认参数后只执行一次。预置AUD、AU、7月财年、当前财年12个半开月度期间、最小科目表、GST/FRE/N-T税码、单位和标准价目表。样例科目需由实际业务校核后启用正式交易。

`.env`中配置`HTT_AUTHORITY`及`HTT_AUDIENCE`，Cognito设`HTT_AUTH_MODE=Cognito`且audience填写App Client ID；普通OIDC使用`Oidc`及API audience。身份服务必须HTTPS。开发环境可查看`/openapi/v1.json`。

```sh
curl -H "Authorization: Bearer $HTT_ACCESS_TOKEN" \
  http://localhost:5080/api/v1/me
curl -H "Authorization: Bearer $HTT_ACCESS_TOKEN" \
  -H "X-Company-Id: $HTT_COMPANY_ID" \
  http://localhost:5080/api/v1/foundation
```

`/me`只返回已验证身份的有效公司成员关系；不会因为传了`X-Company-Id`就授权。写入必须提供`Idempotency-Key`，状态更新还必须提供`If-Match: "1"`等当前版本。

## 本机SDK开发

安装.NET 10 SDK，配置`ConnectionStrings__Database`为htt_app连接串、`ASPNETCORE_ENVIRONMENT=Development`，然后：

```sh
dotnet restore Htt.Backend.sln --locked-mode
dotnet build Htt.Backend.sln --no-restore
dotnet run --project src/Htt.Host.Api --no-restore
```

迁移工具使用独立的`HTT_MIGRATION_CONNECTION`环境变量。Worker使用自己的`ConnectionStrings__Database`，用户名须为htt_worker。不在仓库保存密码或访问令牌。

## 测试

只跑单位测试：

```sh
dotnet test tests/Htt.UnitTests
```

完整测试可使用隔离测试Compose；只访问名为`htt_test`的本地测试库，与普通开发库不同。测试Compose不暴露数据库端口。它会在测试库留下独立随机公司作为测试证据：

```sh
docker compose -f compose.test.yaml --env-file .env up --build --abort-on-container-exit --exit-code-from tests
docker compose -f compose.test.yaml --env-file .env down
```

已有独立测试库时，设置`HTT_TEST_OWNER_CONNECTION`、`HTT_TEST_APP_CONNECTION`、`HTT_TEST_WORKER_CONNECTION`后运行`scripts/verify.sh`。测试库名必须包含`test`，集成测试缺少配置会明确失败，不会跳过并给出虚假全绿。

测试owner还需在隔离测试服务上具有CREATEDB权限，以运行旧版001—003到004的真实升级测试；该权限不得授予API/Worker。

验证覆盖：主数据完整维护、字段错误、客户/仓库/价格范围、独立信用/底价权限、旧库升级，以及空上下文RLS与跨公司查询、复合外键、税率重叠、借贷不平衡回滚、重复过账、期间拒绝、凭证不可改、8个并发幂等提交、Outbox租约、真实签名JWT/audience与未授权身份拒绝、销售范围/写权限、乐观版本、失败建品回滚、价格有效期和底价。

## 数据库演进与部署

SQL迁移是数据库结构的唯一权威。EF Core用于映射与查询，受控SQL用于关键事务/锁/约束；**不使用EnsureCreated，也不额外运行另一套EF自动迁移**。已有迁移只读，新变更新增编号SQL；迁移工具按SHA256校验并以数据库advisory lock防并发迁移，每个文件一个事务。

本地Compose不是生产AWS部署。上线前仍需Cognito真实接入、实际授权配置、TLS/域名、RDS Multi-AZ、备份恢复演练、密钥管理、告警/OTel后端及生产压测。当前健康检查和JSON日志可用于后续运维集成，不代表已达到设计中的SLO/RPO/RTO。
