# D04：报表设置、收藏及PDF报表包（053）

本批只改htt-backend。新增053和五张公司RLS表，001—052不改；三个客户端、生产数据库和真实发件/支付/税务服务不操作。

交付十类现有源报表的受控过滤/列、个人或公司共享配置、个人收藏、个人显示设置、冻结多报表快照、封面/目录/书签/分页PDF和私有作业/下载。不是SQL/公式设计器、币种换算器或另一个会计引擎；保存配置不能扩大源权限、改动账本或把权责发生制金额换标签冒充现金制。

## 支持的报表与过滤

所有日期明确ISO yyyy-MM-dd；from/to为半开区间[from,to)，1—366天；asOf为含当日截止。日期从公元3年起，禁止infinity、日期时间字符串。可选ID必须存在于当前公司。任何未知过滤键/列、重复列、控制字符或不适用的过滤组合拒绝，不忽略执行。

| kind | 原生来源 | filters |
|---|---|---|
| PROFIT_LOSS | 既有GL利润表/排除年结对损益展示的重复影响 | from,to |
| BALANCE_SHEET | 既有GL资产负债表，原生会计年度和未结损益 | asOf |
| AR_AGING / AP_AGING | 原生AR/AP账龄和控制科目核对 | asOf,partyId? |
| CASH_FLOW | 原现金流SQL的完整、受限快照适配；直接法/原活动分类 | from,to |
| PURCHASING | 原采购经营报表 | from,to,partyId? |
| ARAP | 原往来及预收/预付核对报表 | from,to,partyId? |
| INVENTORY | 原库存/在途估值及公司库存差异 | from,to,warehouseId? |
| BANKING | 原资金账面/流水匹配及对账信息 | from,to,bankAccountId? |
| SALES | 原同源净销售/同环比经营报表 | from,to |

来源权限与原接口一致：核心财务需accounting.reports.read+accounting.ledger.read，现金流还需banks.read；经营报表复用accounting.require_operating_report，采购成本、库存成本、全客户及销售核对等原权限仍必需。部分源是公司级财务报表，不把用户仓库作业权限推导成公司级成本权限。SALE此入口不收客户/商品维度ID；这些维度继续走原sales-analytics接口。

每份定义为`{kind,filters,columns?}`。columns为原生字段key数组，1—8项、不重复；省略用该源的默认白名单。默认示例：

- 利润/资产负债：code,name,kind,amount。
- 账龄：number,partyName,dueOn,outstanding,availableCredit,netBalance。
- 现金流：postingDate,sourceNumber,description,category,signedAmount,inflowContribution。
- 采购：date,eventType,number,partyName,net,gst,gross。
- 库存：positionType,sku,name,quantity,value。
- 银行：bankName,opening,debits,credits,closing,lastReconciledTo。
- 销售：productName,baseUnitCode,baseQuantity,net,previousNet,yearAgoNet。

只投影选定的行字段，但保留源报表totals、原生口径、状态和核对元数据。隐藏列不会重新计算或改变总数/金额。缺少源报表筛选/计算功能不能通过配置注入SQL补出。

## API

前缀`/api/v1`，沿用OIDC、X-Company-Id、限流、no-store和事务。所有写操作要Idempotency-Key；更改保存配置和设置需If-Match。各GET分页最大100；单个SavedReport与Pack ID不跨公司可见。

| 方法 | 路径 | 功能 |
|---|---|---|
| GET / POST | /reports/saved | 列出/创建保存配置；GET支持favourites=true,page,pageSize |
| GET / PUT | /reports/saved/{id} | 读取或按版本更新自己的配置；active=false归档、true恢复 |
| PUT | /reports/saved/{id}/favourite | `{active:true/false}`，仅影响本人收藏，重复请求不产生重复记录 |
| GET / PUT | /reports/settings | 本人、当前公司的显示设置，未设置version=0；首次PUT If-Match:0 |
| POST | /reports/packs | 冻结1—8份授权源；201返回id/version=1/sha256/snapshot |
| GET | /reports/packs | 本人当前可授权的生成历史；权限过滤后totalCount/page |
| GET | /reports/packs/{id} | 本人冻结包；每次重新检查每份来源当前权限 |
| POST | /documents/{packId}/pdf | 原私有PDF请求接口，If-Match:1，202返回原作业ID |
| GET | /documents/{packId}/jobs、/document-jobs/{jobId} | 原私有作业状态和重试记录 |
| POST | /document-jobs/{jobId}/retry | 原FAILED受控重试，当前作业If-Match及reason |
| GET | /documents/{packId}/files、/files/{fileId}/content | 原私有文件目录/授权下载，重新检查当前源权限 |

创建/更新保存配置：

```json
{"name":"Monthly profit","visibility":"PRIVATE","active":true,
 "definition":{"kind":"PROFIT_LOSS","filters":{"from":"2026-10-01","to":"2026-11-01"},"columns":["code","name","amount"]}}
```

默认PRIVATE，仅所有者可读；COMPANY需要reports.saved.share且只分享配置，不授予报表数据权限，也不把PDF包变成共享文件。公司可见配置仍只由原所有者更改。每次更改追加不可变版本；归档不删除历史，归档的共享配置从其他人的列表和收藏消失。收藏按公司/本人/配置唯一，不能替他人收藏或通过收藏保留被撤销的共享可见性。

创建冻结包的两种item不可混用：

```json
{"title":"Monthly review","items":[
 {"savedReportId":"<uuid>","version":3},
 {"definition":{"kind":"BALANCE_SHEET","filters":{"asOf":"2026-10-31"},"columns":["code","name","amount"]}}
]}
```

SavedReport版本必须精确匹配且未归档；不能再传覆盖过滤字段。包解析后固定定义、选列、显示设置、公司抬头、native totals/status和数据；之后保存配置更名、归档、调格式或新记账不改旧包。包始终是创建者私有，即便其中的定义来自COMPANY共享收藏。共享配置撤回阻止新的使用，已存在的本人冻结快照仍按原生数据权限授权，不依赖旧配置是否继续公开。

新增reports.saved.read/write/share、reports.packs.create默认仅ADMIN/FINANCE。所有源权限须同时满足；pack创建权限也用于该功能的历史/快照读取，PDF/file/job还需原文档动作权限。无权源不会在列表计数/标题中泄漏；一个包任何来源不再可授权则整个包/文件不可读取，不返回残余部分。

## 显示设置与口径

PUT `/reports/settings`：

```json
{"format":{"currency":"AUD","basis":"SOURCE_DEFINED","decimalPlaces":2,
 "negativeStyle":"PARENTHESES","header":"HTT Flooring","footer":"Internal review"}}
```

currency只接受AUD，basis只接受SOURCE_DEFINED；源报表仍显示ACCRUAL_GL、POSTING_DATE或原DIRECT现金流方法。decimalPlaces仅0或2，用于金额展示，原始快照金额不变；数量固定6位、百分比4位，计数按整数。负数样式MINUS/PARENTHESES；页眉<=120、页脚<=240字符。AU千位逗号、小数点，明确AUD；不接受可执行HTML、远程资源、路径或字体文件选项；文本按字面转义。未知/空格式枚举及控制字符422。个人设置按公司隔离、版本冲突409，未保存默认version=0。

本次不增加外币换算、任意现金制损益表、任意公式/派生科目或会计重分类。R050的当前受控显示部分交付，真正新增计算口径需独立明确/实现/核验，不能用页眉或format.basis来替代。

## 快照一致性、PDF与失败处理

所有源在同一SQL STABLE快照中读取，记录snapshotAt/mvccSnapshot；并发过账不会让包中利润表与往来报表取到一旧一新。原生财务/往来/GST/现金流/库存核对字段保留，不写补平分录。snapshot保存SHA256、复合公司外键并append-only，正式报表包注册记录不可修改/删除。

单源完整结果最多1000行、全包2000行、8个section、冻结JSON<=400000字节；超限422要求拆分/缩小筛选，不以第一页假装完整。PDF沿用原512KiB输入、40秒渲染、10MiB文件上限及固定错误码，无输入控制的路径/网络/图片。A4横向、封面、真实页码目录、PDF书签、连续页码、跨页表头和长文本换行；显示源快照hash，金额格式不改变底层数值。

复用现有PDF唯一作业/版本、租约围栏、指数退避、FAILED人工重试和私有文件存储。重试始终加载冻结payload，不能重新查询活动报表。请求/Worker加载/完成发布/最终下载各阶段重新检查当前源权限；渲染期间撤权时结果记FAILED、不发布文件。伪造作业payload或snapshotHash拒绝；旧完成令牌不生成重复文件。只有PDF，不能借新doc type隐式发送邮件或上传附件。

053对既有文档授权和完成函数增加私有包装；重命名后的旧入口撤销app/worker/public执行权，防绕过。原报价、发票、PO、对账单、CSV和CRM附件继续走原实现。部署按原流程先迁移再重启API/Worker，避免旧进程缓存旧例程计划；本文不表示生产已迁移。

字体沿用Documents:FontPath/HTT_PDF_FONT的固定部署配置；默认字体不支持的字符使作业明确失败而不是输出方框。含中文或其他文字需安装覆盖字符的字体并实际验证；用户不能指定字体文件路径。

## 验证与剩余边界

42项D04专项覆盖十类源、私有/公司共享及所有者维护、个人收藏/归档恢复、设置版本与白名单、NUL拒绝、冻结配置/金额、并发幂等、永久/暂时失败重试、加载/完成/下载撤权，以及现金/非现金制真实费用/付款→AP/GL/GST核对和并发同快照。

另回归原财务、现金流、经营、销售分析、PDF/邮件/CSV/回收站、003—052旧库逐版升级和阶段C财务串联。精确名称/源摘要见stage-d-04-results.json，数量及发布启动冒烟见verification.md。已用合成数据生成18页样例，逐页渲染PNG并检查目录页码、连续表头、长名称、负数括号、数量精度和文本转义。

[排版样例（全为合成数据，不能用于记账）](examples/report-pack-sample.pdf)。它证明排版，不替代真实业务数据迁移或生产容量验收。

R042/R043本次十类白名单后台切片已实现，客户端呈现/联调及其他报表源适配另验；R050仍部分。尚不包含GST/BAS底稿、独立GL/TB、工资/其他专用报表适配到设计器、任意时间相对筛选、复杂公式、跨币种/新的计算口径、报表包邮件、客户门户自助报表或生产SLO。现有这些专用源接口和原CSV契约保留；不伪造来源数据，不恢复被排除的Send to Accountant或自动发件功能。
