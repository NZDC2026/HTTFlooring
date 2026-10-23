# E03 澳大利亚工资申报准备与连接器框架

更新：2026-10-23。用户尚未开通服务商，授权先完成可配置代码，保持本地架构和程序运行时处理，不实际申报或划款。

## 本轮状态

**本地申报工作台和可插拔连接器框架已实现；E03 外部集成仍未关闭。** 当前没有生产服务商适配器，也未取得服务商 API 合同、产品注册、认证或真实回执验收。不能把本轮称为可直接向 ATO 或 SuperStream 发送的完整接入。页面和主进程均阻止没有已安装适配器的启用/发送；配置保存只保存接入准备信息，不建立远程连接。

入口：`/payroll/transmissions`，工资导航的 Transmissions 和管理页面目录。保留 `/payroll/filing` 原来的本地复核表及独立外部参考记录。

## 可验证的本地行为

- 补充雇主 ABN/branch、声明联系人、完整历史确认，以及员工稳定 payroll ID、法定姓名、出生日期、澳洲地址、SAW 收入类型、F/P/C 任职类别、经复核的税务待遇和 APRA fund 信息。
- 工资项目明确映射 GROSS、PAID_LEAVE、OVERTIME、ALLOWANCE、DEDUCTION、PAYG、SG、RESC；保留逐项目金额和服务商子类型，不能仅靠总工资掩盖项目差异。格式检查与 ABN 校验和并非 ABR、TFN、税务待遇或基金登记验证。
- 以 **pay date** 落入 7 月 1 日至次年 6 月 30 日的已过账工资计算整数分 YTD；冲销工资不再计入金额，但受影响员工保留零 YTD 更正行。未过账工资、缺少身份/分类和财年日期错误会拦截准备。
- 内部 PAY、UPDATE、FINALISE、UNFINALISE 和 SUPER_CONTRIBUTION 报表冻结源摘要、工资分录/源 token/工资单摘要、身份、项目、期间及 YTD；原始报表不因冲销或身份修改而重写。源变化使旧报表不可再次声明。
- STP 更正必须链接同雇主/branch、同财年最新已接受报告；不能倒退已接受 YTD 截止日；已接受最终确认后先撤销最终确认。最终确认限已结束财年。这里是本地连接器状态约束，尚不是厂商或 ATO 协议实现。
- 声明冻结受信用户、姓名、理由和时间；准备与声明分离，主进程检查 payroll.manage / payroll.approve。配置还需 users.manage；所有身份、预览和后台检查需 payroll.read。AUDITOR 等无工资权限角色不能读取 TFN/身份。
- 一个不可变报表只产生一个发送任务。运行时只处理当前登录且仍有权限的原任务拥有者；退出/闲置会停止后续网络工作。30 秒超时会中止请求并保留未知结果。
- POST 未知结果或发送途中重启后，只按原 request ID 做只读 lookup；绝不自动重发。得到 provider ID 后才 poll。响应必须匹配 request ID、report ID、源摘要、雇主 ABN 和稳定 provider ID。HTTP 成功或人工参考号不等于 ATO 受理。
- STP ACCEPTED 必须含匹配的 authority reference。退休金的 PROVIDER_RECEIVED / PROCESSING / PARTIAL 与 FUND_RECEIVED 分开；全部匹配 payroll ID、fund ABN、USI、member ID、整数分金额、日期和参考，才允许 FUND_RECEIVED。保留每次不同的已验证回执，不允许状态或已确认分笔金额倒退。已尝试的同一工资批次退休金请求禁止再次创建，即使被拒绝也需先在外部处理，不提供绕过重复保护的本地重置。
- 原有工资计算、总账、银行付款和本地复核登记不受申报回执修改。基金回执不生成付款分录，也不表示本程序实际划款。独立 portal note 始终是人工复核记录。

## 明确的支持范围

所有报表标记 `INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT`。它们是连接器内部审核模型，**不是 STP、SBR、SuperStream 或 SAFF 上传格式**，无“导出后直接申报”的按钮。

本地准备限受复核的澳大利亚 AUD 国内工资/薪金、完整本地财年工资历史。外部 opening YTD/迁移导入、SMSF、其他收入类型、TFN 豁免、终止雇佣/ETP、FBT、薪资牺牲及其他完整 Phase 2 条件不在当前模型内。带请假记录的 STP 报表被拦截，因为现有工资快照不能完整可靠地拆分带薪假子类型；不能把包含请假的工资全部归为 Gross。补充税务待遇和子类型仍需服务商校验。人工勾选历史完整不能代替外部历史对账。

## 存储、恢复与审计

`local-security/payroll-filing-v1.json` 整体使用 Electron safeStorage 加密，包含补充身份、凭据、冻结报表、声明、原请求、回执证据和复核历史。默认未操作时不创建文件；OS 保护存储不可用时不回退到明文。概览不返回 API key、凭据摘要或逐员工 TFN；受权限保护的报表预览只在界面显示 TFN 后三位。

此日志与通信、银行 feed 一样位于业务备份之外，防止旧业务备份恢复清除已发送证据。恢复后若分录、source token、pay date、工资单等不可变证据缺失/变化，将停止运行时处理。正常工资冲销保留不可变证据，允许继续查询原请求并准备更正。损坏或无法解密时仅禁用申报子系统，不清空业务数据或自动重建日志。

备份整个档案还必须保留可解密的 OS 凭据；不得只复制加密文件后删除旧档案。完整档案回退也可能丢失更新的外部记录，恢复后须先与服务商核对。服务商为最终外部证据来源；本地日志无法证明另一个设备从未申报。

补充身份采用 revision 比较，防止旧页面覆盖更新。业务安全审计记录配置、身份复核、准备、声明、发送意图、回执和人工复核，不写 API key、TFN 或原始响应。配额为 1000 报表、1000 任务、每任务 500 份不同回执、2000 身份复核和 2000 portal notes；达到配额会停止写入，保留完整证据而不自动删除历史。

## 接入真实服务商的剩余步骤

1. 选定兼有所需 STP 和 SuperStream 能力的服务商，取得正式开发合同、身份/授权方式、租户标识、测试环境和生产资格。现有代码不猜测私有 API URL、请求字段或受理语义。
2. 实现 `electron/payroll-filing/adapter.ts` 的 submit / lookup / poll，遵守 AbortSignal、原 request ID 幂等与只读查回。实现完整 Phase 2、财年历史/迁移、更正、最终确认和各基金明细映射及厂商校验；如一个服务商并非同时支持两类业务，应分离能力并保持不支持入口禁用。
3. 在可信主进程显式注册适配器；默认注册表为空。只有已验证适配器、配置和独立声明都具备，才可能产生外部请求。API key 不通过渲染进程发起网络请求。
4. 完成服务商 sandbox、ATO/DSP/SSP 产品注册与所需认证，验证拒绝、未知结果、补报、更正、最终确认/撤回、基金分笔退回/收款和恢复，随后由用户启用生产。不能以本地模拟测试替代此步骤。

## 官方参考

- [ATO DSP 使用 SSP 的要求](https://softwaredevelopers.ato.gov.au/guide-dsps-using-ssp)、[STP 产品注册](https://softwaredevelopers.ato.gov.au/STP_ProductRegistration)、[SSP 名录](https://softwaredevelopers.ato.gov.au/sending-service-providers)。
- [ATO STP Phase 2 guidance](https://softwaredevelopers.ato.gov.au/STPPhase2GuidanceNote)、[SuperStream guidance](https://softwaredevelopers.ato.gov.au/SSTC/Guidance)。
- [ABR ABN 格式及校验和](https://abr.business.gov.au/Help/AbnFormat)。
- [Single Touch API 概览](https://www.singletouch.com.au/single_touch_api_overview)、[开发指南取得方式 FAQ](https://www.singletouch.com.au/single_touch_payroll_faq)。仅用于解释接入准备；本项目未把该服务商列为已接通。

## 验证

实际项目 `pnpm build` 通过；最终 `pnpm test:ci` **168 个文件、3703 项通过**（253.02 秒），其中 62 项直接覆盖 E03。文档索引 66 项、表格清单 149 个表面检查通过。原生合成档案验证了缺项拦截、报表冻结、金额/TFN 遮罩、独立复核备注、重载持久化、声明备注隔离和 AUDITOR 隐藏入口；业务仓库内容保持不变。

验证结果见 [本轮机器记录](acceptance-e03-20261023/evidence.json)。测试使用合成雇主、员工、密钥和注入的测试连接器，禁止真实网络。原生用例另使用临时档案，不改真实公司数据。服务商适配与外部验收继续待完成。
