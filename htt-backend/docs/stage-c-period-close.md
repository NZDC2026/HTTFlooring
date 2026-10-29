# 阶段C：会计期间关账、重开和年末结转

本批仅修改 htt-backend，新增 039_period_close.sql。采用澳洲公司配置的时区、AUD 和财年起始月（默认 7 月）。会计月结与 GST/BAS 申报期间分别管理，互相校验；不会代替会计师判断或向 ATO 发送申报。

## 操作流程

1. 检查财政年度与月度期间。缺少年度时创建完整配置财年，系统生成 12 个连续月份。所有日期范围均为 `[from,to)`；结束日当天已经进入下一期。
2. 先运行月结 preflight，处理库存/在途、往来、试算平衡和 GST 差异。按时间从早到晚关账；公司当地日期须已达到期间结束日。
3. 如果相关 BAS 已结束，先完成 BAS 定版或登记外部申报。跨月季度 BAS 尚未结束时，可在该 BAS 保持 OPEN 的情况下关闭前面的月份；季度末须先定版 BAS。必须有完整 BAS 区间覆盖，不能用部分覆盖代替。
4. 未登记 GST 且该期没有 GST 相关来源/BAS 的公司不强制建立 BAS。当前已登记但历史期间尚未适用 GST 时，可显式传 `basNotApplicableConfirmed=true` 并写明原因；存在当期税务来源、发票日期或实际过账日期落在本期的登记采购、或 BAS 区间时不能以此绕过申报管理。该确认进入不可变快照与审计，不修改公司税务登记。
5. 月结保存核对底稿、财务指纹、版本、操作者和原因；不生成分录，也不清空库存、在途、应收、应付、预收预付或信用余额。后期收付款和库存业务仍可正常处理，历史截止日余额保持。
6. 年末全部期间已完成受控关账后，检查年度 preflight，再执行年度结转。系统将本财年收入/费用账户余额对冲至留存收益；不清零资产、负债或原有权益。
7. 历史更正先按倒序重开。已年结的财年先重开年度并生成原年末日期的关联反向凭证，再重开月份；月份按从晚到早重开。相关 BAS 如需改动，须在重开重叠会计期间后再重开 BAS。原底稿和凭证始终保留。
8. 更正完成后重新核对、定版 BAS、月结和年结。新快照/结转使用新修订，不覆盖旧记录。

历史迁移前通过 owner 直接标 CLOSED 的期间不会被伪造为已验收；显示 `legacyUncertified=true`，没有关账证据时不能年结。可使用其当前版本直接执行 close 补做核对和快照。历史状态不会在迁移时自动重开。

## API

以下路径均带 `/api/v1` 前缀。读取需要 `accounting.periods.read`、`accounting.reconciliation.read`、`accounting.ledger.read`、`accounting.bas.read`、`accounting.gst.read`、`purchase.input_gst.read`。ADMIN/FINANCE 默认获得本批权限，销售/办公室/仓库角色不默认获得财务关账权限。受控数据库函数再次核验当前权限。

| 方法与路径 | 用途 / 额外权限 |
| --- | --- |
| GET /accounting/fiscal-years | 年度、状态、版本和当前结转 |
| POST /accounting/fiscal-years | 建立完整年度及 12 个月；periods.manage |
| GET /accounting/periods?fiscalYearId= | 月度期间、版本和快照指针 |
| GET /accounting/periods/{id}/preflight?basNotApplicableConfirmed=false | 当前核对结果、阻塞原因、BAS 覆盖和财务底稿 |
| POST /accounting/periods/{id}/close | 月结；periods.close |
| POST /accounting/periods/{id}/reopen | 重开；periods.reopen |
| GET /accounting/periods/{id}/history | 快照摘要及全部关账/重开事件 |
| GET /accounting/period-close-snapshots/{id} | 原始不可变底稿和财务指纹 |
| GET /accounting/fiscal-years/{id}/preflight | 年度结转计划、损益、留存科目和阻塞原因 |
| POST /accounting/fiscal-years/{id}/close | 年末结转；years.close |
| POST /accounting/fiscal-years/{id}/reopen | 冲销本次年度结转；years.reopen |
| GET /accounting/fiscal-years/{id}/history | 全部结转、关联反向记录及凭证 ID |
| GET /accounting/retained-earnings | 当前留存收益科目和配置版本 |
| PUT /accounting/retained-earnings | 设置留存科目；periods.manage |

权限名简写 `periods.*` / `years.*` 的完整前缀为 `accounting.`。跨公司资源返回 404。

写请求使用 `Idempotency-Key`；除新建年度外，还须传当前 `If-Match: "版本"`。同键同内容重放同一响应，同键改内容冲突；权限检查在返回缓存前执行。所有状态、分录、审计、Outbox 和幂等结果在同一事务提交。

```json
// POST /accounting/fiscal-years
{"label":"FY2025","from":"2024-07-01","to":"2025-07-01"}

// 月结；年结和重开使用相同 reference/reason，但不传 true 的 BAS 确认
{"reference":"CLOSE-2025-06","reason":"库存和往来已核对，BAS 已定版","basNotApplicableConfirmed":false}

// PUT /accounting/retained-earnings
{"accountId":"留存收益科目的UUID","reason":"确认年度利润结转目的科目"}
```

`evidenceId` 月结时指快照，月度重开时指事件，年度动作指结转/反向凭证的来源单据。版本从响应 `entity.version` 读取。preflight 返回 `READY` 或 `BLOCKED` 及机器可读 `issues`，例如 `EARLIER_PERIODS_OPEN`、`BAS_COVERAGE_MISSING`、`ENDED_BAS_PERIOD_NOT_FINALIZED`、`CURRENT_SUBLEDGER_INCONSISTENT`、`HISTORICAL_LEDGERS_UNRECONCILED`、`CLOSED_PERIOD_SNAPSHOT_DRIFT`。GET 只做预检；实际写入取得公司锁后再次检查，不依赖客户端持有的预检结果。

## 核对和会计处理

- 当前一致性检查复用既有库存来源/投影、货位/批次、预留、客户信用、AR/AP、预收预付、GRNI、在途和总账检查；有差异即阻止关账。
- 截止日库存按不可变收发、退货、盘点、报损、调拨、采购价差和期初估值来源重建数量/成本；在途按发运成本减已收货/退回/短收成本单列，与全部 INVENTORY 控制科目核对。期初数量与对应期初估值单采用同一业务生效日；无估值的库存不默认为零成本。
- AR/AP 按事项和实际凭证日期重建截止日余额，逐往来方与控制科目核对。后期核销不会改写旧期欠款。GST 沿用已有现金制/非现金制实际归属及税额 GL 独立核对，不在月结/年结重复归属税款。
- 月结底稿包含经营凭证的期初/本期借贷/期末、库存成本和流量、在途、往来事项、GST 财务数值及勾稽差异。年结/重开凭证通过不可变登记表明确识别，单独显示 `yearEndBridge`，将经营凭证余额桥接到实际含结转的 GL；不能仅凭 posting_kind 字符串隐藏业务分录。
- 年结利润 = 收入贷方净额 − 费用借方净额。盈利贷记留存收益，亏损借记；包含停用但仍有余额的收入/费用科目。净利润为零但科目有余额时仍逐科目结转；完全无活动时记录年度完成证据，不制造空凭证。
- 默认新增 3100 Retained Earnings（EQUITY，非控制科目）及 RETAINED_EARNINGS 映射。既有同码自定义科目不会被改写；不符合默认定义时须显式配置目的科目，年度预检会阻塞。配置缺失、科目停用或类型不符均不结转。
- 利润表排除已登记的年度结转/反向分录，保留经营损益；试算表和总账仍包含真实结转分录。资产负债表的 `currentYearEarnings` 表示尚未结转损益，结转后归零；对应金额进入 `postedEquity`，避免重复累计。资产负债表总权益和利润表历史净利润保持正确。
- 年末专用过账助手不对 htt_app 授权。普通过账仍要求开放期间；仅登记并通过借贷、来源、账户和逐科目金额校验的年结/反向凭证允许在原闭期落账。普通调用不能借用年结名称绕过闭期。

## 事务和并发

复用 GST/BAS 的同一公司事务级读写锁，避免新增跨模块锁顺序。业务事务共享，月结/重开/年结独占，并在锁后核对当前状态和版本。提交时延迟校验关账财务指纹；所有行在同一事务内完成后再比较，允许不改变闭期金额的合法后期处理。数值先规范化再计算 SHA-256，金额显示精度差异不制造漂移。

已关账期间的财务变化会原子失败；公司隔离、受控状态事件、追加证据、注册年结逐行证明及不可变凭证共同保护。再次年结生成新修订；重开只反向一次。后续年度/期间已关闭时，先处理较晚年度/期间。

## 迁移、验证与范围

新增 5 张 FORCE RLS 表：fiscal_year_controls、period_close_snapshots、period_close_events、year_end_closings、year_end_reversals；累计 177 张业务/基础表、39 个迁移。001—038 不改，迁移幂等依照既有校验和机制。API readiness 要求 039 核心函数，Worker 识别本批六类审计事件。

本批在隔离数据库验证，不执行正式数据库迁移或真实关账。部署顺序沿用迁移任务 → API/Worker；上线前核实历史期间、BAS 日历、期初库存估值、留存科目及已有核对差异。真实数据容量、关账长事务性能、恢复演练和客户侧操作界面仍需后续验收；本批不代表整个阶段C完成。

测试清单及两个平台的实际结果见 [验收记录](verification.md)。
