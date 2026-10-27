# 银行账户与基础账务查询（033）

仅修改 htt-backend。澳洲、AUD、原 GST/往来/信用/库存规则继续适用；不修改客户端，不迁移正式账套。

## 银行账户

| API | 权限与行为 |
|---|---|
| GET /api/v1/bank-accounts | accounting.banks.read；完整档案、当前有符号账面余额、默认映射版本 |
| GET /api/v1/bank-accounts/{id} | 同上；账户 ID 同时是原 BANK 总账科目 ID |
| GET /api/v1/bank-accounts/options | accounting.banks.use；仅活动账户、名称/科目代码/类型/币种及账号尾四位，不含余额或完整账号 |
| POST /api/v1/bank-accounts | banks.write + banks.read；创建 BANK 总账科目及档案，强制幂等键 |
| PUT /api/v1/bank-accounts/{id} | 同上，If-Match 使用档案 version；维护名称/持有人名称/活动状态，首次补录 LEGACY 身份 |
| PUT /api/v1/bank-accounts/default | 同上，body={bankAccountId}；If-Match 使用 defaultMappingVersion，而非档案 version |

档案输入：`code,name,kind,bsb,accountNumber,accountHolder,active`。

- BANK：六位 BSB（空格/连字符归一化）、1—20位数字账号及持有人。格式校验不代表银行已验证或收款人已验证。
- CASH / CARD_CLEARING：不填写银行账号字段，分别用于现金和卡款清算科目。所有类型均为 AUD、ASSET/BANK 控制科目。
- LEGACY：升级将已有 BANK 科目及历史收付 FK 原样保留，资料未知时不推断 BSB/账号。新建禁止 LEGACY；旧档案可仅改名/停用，或一次补录实际身份。
- 同公司 BANK 的 BSB+账号唯一；停用后仍保留唯一性。完成配置后类型、BSB和账号不可改；持有人名称允许经版本检查和审计更名，金融身份变化应新建账户。此 API 不改 GL code；名称是银行目录显示名，原总账科目名称保持。
- 档案与 GL 科目的活动状态共同控制新选择；原 BANK GL 分类不得改变。有历史的档案没有删除入口。停用档案不阻断按原 GL 账户合法撤销/重新核销，GL 科目仍须满足原有效性规则。

默认 ADMIN/FINANCE 有完整银行/账务读写权限，OFFICE 只有 banks.use，可读取脱敏选项；其他角色默认没有新增财务权限。权限校验在成功幂等缓存返回前执行；维护接口叠加目录读取权限，避免写权限成为读取余额的旁路。审计不记录 BSB/完整账号。

## 收付账户选择

下列原有输入追加可选 `bankAccountId`：

1. POST /customers/{id}/receipts（客户收款/预收）
2. POST /suppliers/{id}/payments（供应商付款/预付）
3. POST /customers/{id}/refunds（客户退款）
4. POST /supplier-refunds（供应商退款）

明确指定时还需 banks.use；SQL 再次检查公司、档案/GL 活动状态并持有共享锁到过账提交。停用与过账竞争按锁顺序串行化，等待期间停用生效时拒绝过账。付款方式是原业务信息，不等同余额账户类型；本次没有新增现金余额不足或透支规则。

省略该字段继续使用原 BANK 映射，原请求的成功幂等指纹保持不变；默认账户改变后重放原键不会重新过账或挪动历史资金。明确选择其他账户会改变请求指纹。原撤销、更正及重新核销继续使用原收付对应 GL 账户，不跟随当前默认账户。客户退款的 bankAccountId 从其原始凭证读取，避免增设重复余额字段。

## 基础账务查询

均需 `accounting.ledger.read`，默认仅 ADMIN/FINANCE；是公司级财务权限，不受销售客户分配替代。全部仅查询已存在的不可变凭证，不产生调账。

- `GET /accounting/general-ledger?from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=...&partyId=...&documentId=...&page=1&pageSize=...`：半开区间 `[from,to)`，1—366天；可选科目/往来方/来源单据过滤，范围外 ID 返回404。返回期初、有符号期末、本期借贷、总条数与明细；每行包含原凭证、来源单据号/类型、来源版本、过账类型、冲销批次及跨页连续余额。排序固定为过账日、凭证 ID、分录 ID。同日 UUID 排序不代表业务先后，但保证分页确定性。
- `GET /accounting/journals/{id}`：凭证头、来源文档与全部借贷分录，可由总账明细追溯。
- `GET /accounting/trial-balance?from=...&to=...&includeZero=true`：相同日期边界；包含活动与停用科目，期初/本期/期末和借贷合计、BALANCED/UNBALANCED。默认隐藏全零行，合计仍基于所有科目。

partyId 按分录本身的往来方字段过滤，不推断没有 partyId 的银行分录；查看完整业务凭证可用 documentId 或凭证追溯。

总账与试算的明细/汇总各自通过一个 SQL 语句在单一 MVCC 快照计算；分页先算完整期间的运行余额再截取。`signed` 一律为借方减贷方，不是按科目正常方向取绝对值；金额以字符串输出。期初是过滤范围内全部早于 from 的历史分录，未假设期初为零。账务记录不因单据进入回收站而消失。

这些是基础 GL/TB 查询，不包含 P&L、资产负债表、现金流、自动结转或财务报表包。银行目录的余额是 GL 账面数，不是银行实时余额、可用资金或银行对账结论；未实现银行流水/Feeds、匹配、statement reconciliation 或完整 bank register。真实期初迁移与上线验证单列。
