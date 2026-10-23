> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G02 日内促销与单据取价时间

## 实现范围

报价新增、报价草稿编辑、直接销售订单和直接发票均使用明确取价时刻。每次保存由可信主进程确定一个上下文，所有行共用，按行保存 `pricingAt`（规范 UTC ISO 时间戳）和 `pricingTimezone`（公司 IANA 时区快照）。直接单据载荷也保存这组字段，审批与签发使用已保存的行。

客户专属价格仍按单据业务日期判断有效期；促销使用取价时刻，包含开始、不包含结束。报价编辑的自动价格由主进程核算，不能通过渲染进程提交的金额或促销来源绕过；手工价优先并清除促销归属。页面正确显示 Promotion。

## 时间规则

- 新表单打开时固定取价时刻，并显示公司时区及当地日期时间；可输入带明确 UTC 偏移的时间戳或使用 Reset pricing time。
- 未显式提供时间时，当天取当前时刻，其他日期取公司时区当地零点。此默认行为在表单说明中可见。
- 时间必须包含秒及 Z/UTC 偏移，且在取价时区对应单据日期。无偏移、不合法日历时间、错误日期、无当地零点的日期会被拒绝；不会以 UTC 零点代替。
- 夏令时重复小时通过输入偏移明确区分；日期零点按 IANA 时区计算，与主机时区无关。
- 更新直接草稿或报价且取价时刻未改时，沿用已保存的时区；公司设置改变不会追溯更改该证据。明确改取价时间时按当前公司时区验证。

## 快照、持久化和恢复

- 报价 → 订单 → 发票复制原行快照；已发送报价不能编辑。直接单据审批、签发和重复签发保留快照，不重新取价。
- 直接草稿的创建请求指纹在补默认时间之前计算。成功后的同请求重试，即使时钟变化或重启，也返回原草稿，不重算、不重复建立。
- 无效取价时间在持久化前拒绝，失败后可使用同一 operationId 修正重试；沿用现有原子提交和可信审计机制。
- 旧单据缺少这组可选字段时保持原样，详情明确显示 Legacy pricing time not recorded。读取、重启、审批和转换不会填造旧取价证据。备份校验拒绝不完整/无效时间及时区，以及直接草稿载荷和行快照不一致。
- 周期发票保留原模板净价，但在新发生日建立自己的取价上下文，不携带源单日期的取价时刻。
- 未接入独立后台，未变更业务档案；仅在一次性合成档案内做原生验收。持久化版本仍为 23，可选字段兼容旧记录。

## 自动验证

新增测试：
- `src/features/sales/data/pricingInstant.test.ts`：默认时间、跨 UTC 日期、悉尼/奥克兰夏令时零点、重复小时、无偏移和无效日期、旧快照。
- `src/features/sales/data/pricingInstantIntegration.test.ts`：真实主进程报价边界、直接订单/发票审批后规则变化、转换快照、主进程重算、客户价格的业务日期、失败修正、幂等重启、时区设置变化、损坏备份、周期发生日。
- `src/features/sales/components/PricingTimeFields.test.tsx`：明确时间及时区、歧义输入提示、未知旧证据显示。

已有 `businessIntegration.test.ts` 的促销测试改为显式传入其原先测试的 UTC 时刻，避免以日期代替具体活动边界。直接单据、报价收发、会计/库存、周期任务及其他既有用例仍纳入完整回归。

## 原生 Electron 验证

实际项目生产构建，隔离合成档案 `/private/tmp/htt-g02-native`：
1. 直接发票选择 ABC Flooring Pty Ltd、European Oak，日期 2026-10-21。活动 09:00–18:00 +13:00，活动净价 12.00。
2. 09:00 显示净额 12.00/税 1.20/总额 13.20；18:00 恢复客户价 62.50/税 6.25/总额 68.75。无偏移或缺冒号输入显示错误，无法作为有效取价保存。
3. 保存 09:00 草稿、审批、签发。INV-2026-0002 显示 Promotion、12.00 和 `2026-10-20T20:00:00.000Z · Pacific/Auckland`。
4. 从客户销售入口新建 QU-2026-0002，同样显示 Promotion 12.00；保存后详情保留时间快照。编辑取价为 18:00，预览及保存均变成 Customer 62.50，快照更新为 `2026-10-21T05:00:00.000Z`。

最终实际项目 build/test 结果见本文件的验证结果段。

5. 完全退出并重新启动应用、重新登录后，销售列表保留报价 68.75 和发票 13.20，发票详情仍为 Promotion 12.00，原取价时间及时区不变。

## 验证结果

实际项目 `/Users/chandler/Documents/GitHub/HTTFlooring/htt-management`：

- 完整回归：**127 个测试文件，1594 项全部通过，0 失败，0 跳过，253.07 秒**（原基线 124 文件/1565 项，新增 3 文件/29 项）。
- `tsc -b` 和 Vite renderer / Electron main / preload 生产构建通过。既有大分块警告仍存在，不影响构建结果。
- 完整命令：`node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev`。沿用 Node 24 环境关闭 Maglev 的测试运行方式。
- 完整回归后仅修正两个表单的取价提示文案；再次构建并运行取价界面测试通过。
- 日志：`/private/tmp/htt-g02-actual-test.log`、`/private/tmp/htt-g02-actual-build.log`、`/private/tmp/htt-g02-final-ui-test.log`。

G02 验收条件已满足。其余工作包继续按缺口清单记录，不把本轮关闭扩展为全系统完成。
