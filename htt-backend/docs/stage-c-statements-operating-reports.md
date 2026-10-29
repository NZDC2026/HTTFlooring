# 阶段C C03：客户对账单、经营报表及受控导出

本批只修改htt-backend，新增042_statements_operating_reports.sql，001—041及依赖锁文件保持。三个客户端、正式数据库及真实邮件服务未改动。对账单和经营报表是只读财务事实的不可变快照，不产生Journal、不重新归属GST、不释放信用额度，也不改变库存或往来余额。

## 客户对账单

按客户主体合并所有门店，使用[from,to)过账日期口径；PDF显示的结束日为to前一天。不是按发票开具日期猜余额，也不是当前欠款列表截图。按AR控制科目逐来源单汇总实际借贷，输出期初、期间借方/贷方、逐笔滚动余额及期末，并独立从原发票行、贷项、核销、解除、收退款和冲销重建截止日业务余额。差异不为0时可以预览UNRECONCILED，拒绝正式保存/出单，不能自动补差。

已有贷项和退款已计入AR，不在期末再次减一遍。预收款单列advanceBalance，不抵减AR。预收/预付原分录未逐条填写往来方，因此另从不可变预收/付款、应用/解除、退款/反向及原收付款撤销事件，结合各自凭证过账日期重建；不读取今天的available投影冒充历史余额。对账单展示未结发票余额（含负值），用于核实而不是再次汇总扣款。

保存时同时冻结公司/客户名称、期间、来源活动、余额和SHA-256，分配ST-UUID标识，版本恒为1。后续收付款、主数据名称修改、BAS定版、月结或年结不重写旧快照；需要更新对账单时生成新快照。旧快照仍可追踪生成时间和当时来源，重试PDF不重新查询账务。

PDF模板版本2：客户身份、期间、期初、明细借贷及滚动余额、期末、单列预收款和未结发票；分页重复表头及页码，转义文本。它不是税务发票或新的GST凭据。最多1000条活动/1000个未结项目、快照约500KB，超过限制需缩小期间。默认字体覆盖西文及常见特殊字符；中文等其他文字须配置支持相应字形的Document FontPath，缺字会明确失败，不静默输出方框或丢字。

PDF、文件完整性校验、私有下载、邮件、租约和重试沿用[原文档作业](stage-b-documents.md)。邮件须显式授权、配置验证发件人及指定收件人，不能从财务备注自动群发。同幂等键返回同作业；同一对账单存在QUEUED/PROCESSING/RETRY/UNKNOWN邮件时，换新键也不能另排一封。明确可重试错误采用原作业退避，FAILED可授权手工重试；UNKNOWN须先核查提供商结果，禁止盲目重发或重试。确认发送成功后主动再次发件属于新的授权请求，不承诺不同请求键之间的永久去重。

## 经营报表口径

四类报表限定当前公司、AUD及最多366天的[from,to)。日期、维度和报表类型白名单校验，不支持动态SQL/任意列或任意排序表达式。查询按单条数据库快照生成全部范围内总计，再分页；每页总计不会缩成页内合计。读取上限5000行/约4MB，超过需按期间或支持的维度拆分。

| kind | 支持维度 | 内容及核对 |
| --- | --- | --- |
| PURCHASING | partyId（供应商往来方ID） | 期间确认订单原始总额、收货成本、采购退货负成本、正式账单及供应商贷项负金额。ORDER/RECEIPT/RETURN/BILL/CREDIT分事件列示；orderCommitments为期间确认订单原始金额，不是当前未收货承诺余额。净收货成本与净开票分开，不把订单/收货/账单重复相加 |
| ARAP | partyId | 按往来方及AR/AP分别列期初、借方、贷方、期末、独立业务余额及差异；历史预收/预付另列，并与公司级预收/预付总账余额独立核对。AP期末按贷方减借方，AR按借方减贷方，不将AR与AP净成单一“欠款” |
| INVENTORY | warehouseId | 重用关账的历史库存/成本事实，列在库期初、收发数量/金额及期末；在途独立列截止日数量/成本，不混入可售数。在途仓库维度为目的仓库，含sourceWarehouseId供追溯；在途行只列截止日余额，其期初/收发列留空。与库存/在途总账的独立差异标明COMPANY_WIDE，仓库过滤不伪装成逐仓GL核对 |
| BANKING | bankAccountId | 银行GL期初＋借方－贷方＝期末；另列未分配资金、未匹配流水和最近有效对账日。历史资金余额按过账日期；匹配/未匹配和有效对账状态明确为CURRENT_AT_CAPTURE，不把后来解除匹配的现状伪装成当年对账状态 |

报表发现差异时展示UNRECONCILED并保留检查数据，导出同样带差异，不能隐藏或补平。客户对账单因会对外发送，保存时另要求AR业务与控制账完全相符。采购金额是来源事件汇总而非另一本应付账；应付/GST、库存差异及年结规则继续归原模块。

## API

路径均加`/api/v1`，按当前授权公司访问。写请求需Idempotency-Key，PDF、邮件、重试及导出沿用If-Match；快照版本1。金额/数量返回十进制字符串。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | /customers/{id}/statement-preview?from=&to= | 即时预览，无保存/记账副作用 |
| POST | /customers/{id}/statements | 请求{from,to}，生成不可变对账单，201 |
| GET | /customers/{id}/statements?page=&pageSize= | 历史对账单列表 |
| GET | /customer-statements/{id} | 快照、版本及SHA |
| POST | /documents/{id}/pdf | 使用冻结快照排PDF，202；每版本一个PDF作业 |
| POST | /documents/{id}/emails | 使用已完成的本对账单PDF，202；现有DocumentEmailInput |
| GET | /accounting/reports/operating?kind=&from=&to=&partyId=&warehouseId=&bankAccountId=&page=&pageSize= | 即时报表；不适用的维度拒绝而不是忽略 |
| POST | /operating-report-runs | 请求{kind,from,to,partyId?,warehouseId?,bankAccountId?}，保存完整筛选范围快照，201 |
| GET | /operating-report-runs?kind=&page=&pageSize= | 指定报表类型的历史生成记录 |
| GET | /operating-report-runs/{id} | 冻结内容、筛选、版本及SHA |
| POST | /operating-report-runs/{id}/export | 排CSV作业，202；同快照/版本复用同一作业 |
| GET | /documents/{id}/jobs、/document-jobs/{id} | 状态、失败代码、尝试次数与输出文件ID |
| POST | /document-jobs/{id}/retry | FAILED授权重试，原版本If-Match及原因 |
| GET | /files/{id}/content | 重新鉴权后下载，attachment/no-store/sandbox，校验SHA |

列表默认25、最大100；即时报表按该页rows和全范围totals返回。保存/导出总是完整的白名单筛选范围，不是偷偷只导出当前页。若需要CSV与屏幕严格对应同一时点，先POST生成快照，再通过GET该run展示及导出；两次独立即时GET并不承诺跨请求共用MVCC快照。

## 导出安全与失败恢复

CSV为UTF-8 BOM/RFC4180双引号转义，包含报表类型、原快照SHA、期间/筛选/生成时间/总计/核对元数据以及明细。只使用服务器固定列定义。文本中可能被电子表格执行的公式前缀会加单引号；数值列严格解析，负金额保留为数值，不改财务金额。导出不提供任意路径或外链，也不开放将CSV当普通附件绕过生成流程。

新增EXPORT作业复用现有claim/租约/fencing/退避/最多5次尝试及FAILED手工重试。数据库要求EXPORT载荷与相应不可变run和列定义一致，PDF载荷须等于对账单快照；不能替换已排队报表内容。完成时落私有文件、内容和链接同事务，只有验证文件可下载。生成前和成功入库时检查当前权限；下载、作业查看和重试也重查，权限撤销后不能靠旧幂等结果或文件ID访问成本数据。过期工作者无法以旧租约覆盖新结果。

## 权限、隔离与一致性

新增accounting.statements.read/send及reports.operating.read/export四权限，默认仅ADMIN/FINANCE。对账单读取同时要求ledger.read、accounting.reports.read及现有客户范围；发送另需statements.send和documents.email.send；PDF/文件/重试保留原权限。赋给受限销售人员时仍逐客户检查，客户分配撤销后待执行作业会拒绝。普通销售/办公室/仓库/采购及门户不会因有原单读取权而得到财务经营报表。

经营报表read是公司级财务权限，不是门户/仓库的成本查询入口；同时要求ledger.read及accounting.reports.read。PURCHASING另需purchase.orders.read/purchase.cost.read，INVENTORY需inventory.cost.read，ARAP需customers.all，BANKING需银行档案/流水读取。导出、文件及作业访问在这些权限之外再要求reports.operating.export，不能通过已生成的CSV绕过成本权限。

042新增customer_statements和operating_report_runs两张FORCE RLS、append-only表，累计185业务/基础表、42迁移；新增预收/预付历史事件视图及独立总账核对，不改账务来源表。快照注册单据不可编辑/删除，SHA校验、来源输出证明和公司复合外键共同绑定文档、内容及工作队列。审计、Outbox、快照、作业和幂等结果同事务；晚期审计失败全部回滚。客户外键与原收款行锁会短暂串行，锁超时按原可重试响应处理，不绕开锁静默重读半份余额。

## 验证与保留范围

本批专项覆盖两种GST口径、收款/贷项/退款/反向、预收预付应用/解除/退款/原收付款撤销、历史余额、采购收货/退货与独立费用账单、库存在途分批收货、权限撤销/跨公司/客户范围、幂等/并发工作者、失败回滚及已知/未知邮件结果。实际运行数量和五页PDF逐页视觉检查记录见[验收记录](verification.md)。

不包含C07销售事实报表、D工资报表、通用主数据CSV映射导入/任意列/批量操作、供应商remittance和专用收据模板、真实邮件提供商投递与生产容量/恢复验收。三个客户端及真实Bank Feeds仍另行实施。C03完成不等于阶段C整体完成；上线按独立042迁移任务→新版Worker→新版API顺序执行，不能让旧Worker领取EXPORT。
