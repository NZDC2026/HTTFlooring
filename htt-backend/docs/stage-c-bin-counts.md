# W-06：分货位盲盘、独立复盘与审批

本包仅在 htt-backend 增加043迁移和API，不修改三个客户端。旧SKU总数盘点保持兼容，新流程按仓库、SKU、货位和批次建立冻结盘点表。后台范围完成；扫码枪、移动页面、现场盘点和真实账套另验。

## 业务流程

1. 仓管选择一个有权限的仓库及1—50个SKU，创建盲盘表。冻结SKU数量、预留、价值、修订号，以及最多500个货位/批次的位置数量、版本、已拣占用和货位版本；包括未分配货位和零数量位置。旧库存沿用未分配货位，不自动猜测真实位置。
2. 初盘人员只看到SKU、货位、批次和自己的录入结果。每个位置必须明确录入实盘数量，包括0，统一为基础单位，最多6位小数。初次提交前可登记选中SKU在新货位/批次发现的库存。
3. 任一货位有差异，必须指定不同于初盘人员的有效仓管独立复盘；最多5轮。复盘人员看不到前人读数、账面数量和成本。没有差异可由独立人员直接审批。任何参与盘点的人员，即使是ADMIN，也不能进入该表财务视图、审批或过账。
4. 有审核权限并具备成本/库存控制权限的办公室财务人员查看冻结数、各轮读数和差异，说明理由，决定继续复盘或批准最后一轮实盘。首次出现的空SKU盘盈必须单独给出经审核的总价值；原有库存按既有成本规则计价。
5. 有过账权限的独立财务人员过账。先复用014的SKU盘盈盘亏及会计规则，再将各位置调到批准的实盘分布。仅货位转移、SKU净额为0时，不生成损益或库存成本。原经济来源不重复记账。

盘点表不会长期锁住仓库。创建、审批和过账使用短事务及统一产品/仓库/余额锁；期间内数量、预留、成本、位置、拣货占用或货位版本发生变化，即拒绝过账，取消后重新盘点，不用旧快照覆盖新交易。已预留/已拣数量不能通过盘亏消耗。过账使用当前公司业务日，必须处于开放会计期间，并遵循既有BAS/关账锁顺序。

## API

统一前缀 `/api/v1`、有效身份和 `X-Company-Id`。命令需要 `Idempotency-Key`；更新命令的 `If-Match` 是新盘点表的 `version`，不是旧单据注册表的版本。

| 方法及路径 | 用途 |
| --- | --- |
| GET `/warehouse/bin-counts?warehouseId=...&state=...&page=1&pageSize=25` | 授权仓库盘点列表 |
| POST `/warehouse/bin-counts` | `{warehouseId,reference,reason,productIds}` |
| GET `/warehouse/bin-counts/{id}` | 按角色及参与情况返回盲盘或审核视图 |
| POST `/warehouse/bin-counts/{id}/positions` | `{productId,binId,lotCode}`，仅初盘提交前 |
| POST `/warehouse/bin-counts/{id}/submit` | `{lines:[{lineId,quantity}]}`，当前轮指定人员 |
| GET `/accounting/bin-counts/{id}` | 独立财务视图，含冻结成本 |
| POST `/accounting/bin-counts/{id}/recount` | `{counterId,reason}` |
| POST `/accounting/bin-counts/{id}/approve` | `{reason,gainValues?:[{productId,gainValue}]}` |
| POST `/accounting/bin-counts/{id}/post` | `{reason}` |
| POST `/warehouse/bin-counts/{id}/cancel` | 创建人或独立审核人员取消未过账表 |

状态：`OPEN → SUBMITTED → RECOUNT → RECOUNT_SUBMITTED → APPROVED → POSTED`，中途可取消；无差异可从SUBMITTED直接批准。所有读数、轮次、决定和位置移动留痕。已过账表不可取消、恢复或修改，后续更正走新的合法库存调整。

新权限为 `inventory.bin_counts.read/capture/review/post`。WAREHOUSE默认读/录，受warehouse_scope约束；FINANCE默认读/审/过，另要求既有成本、库存控制及过账权限；ADMIN具备全权限，仍遵守同表人员分离。旧盘点GET对新表委托同一视图，旧提交/过账接口及数据库约束不允许跳过新流程。

## 数据与验收

新增5张公司强制RLS表：bin_counts、bin_count_lines、bin_count_rounds、bin_count_readings、bin_count_decisions。应用无直接写权限，读数和决定不可变；受控函数、原经济过账、审计、Outbox和幂等结果处于同一事务。晚期审计失败全部回滚。

测试覆盖盘盈/盘亏/零库存、空SKU价值、新货位、净额0位置重分布、独立复盘、管理员盲盘及自审拒绝、角色/仓库/公司隔离、占用保护、成本/位置/修订变化、闭期拒绝、旧路径防绕过、缓存撤权、并发同键/异键一次过账、晚期失败与原键重试。具体计数见[本批验收](verification.md)，不将专项回归称为全量或生产验收。
