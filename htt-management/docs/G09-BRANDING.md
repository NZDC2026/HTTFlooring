> G14 reference status (2026-10-23): Dated implementation/acceptance record. Scope exclusions, schema and test counts below describe that delivery, not today’s remaining work. Current scope and follow-ups: [CURRENT-SYSTEM-STATUS.md](CURRENT-SYSTEM-STATUS.md).

# G09 公司品牌图片

本地财务设置 `/settings/financial` 增加 Company branding image。沿用可信主进程、本地业务仓库、原子持久化、审计和完整备份，不上传图片、不连接独立后台，不读取或加载图片中的外部 URL。

## 支持范围与存储

支持静态、非交错、8-bit RGB／RGBA／灰度 PNG，最大 1024 × 1024 像素，输入不超过 1 MB，规范化后不超过 256 KB。保留透明像素和合法颜色键透明度。Indexed／16-bit／interlaced PNG、APNG、JPEG、SVG 和外部网址明确拒绝，界面显示限制，不静默当作另一种格式。

主进程检查文件名、规范 base64、PNG 签名、块边界／CRC／顺序、颜色类型、尺寸、解压长度及行滤波。按受限像素缓冲解码后重新编码为只有 IHDR／IDAT／IEND 的 RGBA PNG，剥离原始元数据、额外载荷和非像素内容。合法图片不能仅靠伪造扩展名或签名通过；尺寸与解压上限在分配像素内存前检查。

规范化图片作为不可变内容记录保存于主进程业务快照，记录 SHA-256、尺寸、MIME、大小和安全文件名。相同像素内容去重；选择历史 Logo 或 Use no logo 只追加选择历史，不删除旧资产。最多保留 20 张、合计 4 MB，超限拒绝且保持原选择。旧输出嵌入自己的图片快照，因此停用、换图或选择历史图片不会改变已准备的文档。

## 应用与输出

销售报价、订单、发票、客户贷项及采购订单、付款通知在准备时由主进程捕获当前图片。销售／采购模板的 Left／Centre／Right 位置一并冻结。旧版无图片输出保持无图片，不追溯套用新品牌。

打印 iframe、独立 HTML 与 Print／Save as PDF 使用嵌入的 `data:image/png;base64` 图片，限定尺寸并保持比例。CSP 只增加 data 图片白名单，继续禁止脚本、远程资源、表单和任意 HTML。更换文档版本后，打印控件等待新的 iframe 及图片加载完成。

报表包在生成时复制公司及 Logo，封面输出图片；保存报表结果也复制自己的 Logo，页面预览、独立 HTML 和新增 Print／Save report PDF 使用该结果快照。CSV 是纯数据格式，不嵌入图片。报表预览按原架构驻留内存，导出 HTML／PDF 保留图片；离开页面后须重新生成新的预览，不能称作持久化历史报表。

## 权限、恢复与兼容

查看品牌设置要求 accounting.read；上传、选择或停用沿用财务设置的 accounting.post。ACCOUNTANT／FINANCE_ADMIN／ADMIN 按原权限可维护；AUDITOR 只读；Sales 等不能修改或读取品牌设置仓库，但具有单据准备权限的用户可以在获授权的输出中使用主进程捕获的图片。文件输入只提交用户选择的字节，不接受主机文件路径、URL 或 renderer 指定的图片元数据。

每次修改要求原因与期望版本；审计记录可信操作者、时间、操作 ID、规范化请求摘要和所选图片。相同操作者／请求跨重启返回原图片，不追加历史；不同请求或操作者不可复用 ID。图片与选择处于同一主机原子命令，失败回滚；持久化提交确认不确定时停止新写入，重启后凭操作 ID 核对结果。

schema 升级至 30；合法旧数据迁移为空品牌仓库并保留迁移前备份。恢复重验图片字节、SHA／尺寸、资产引用、历史顺序、请求摘要和单据图片绑定。含新图片证据的数据不得冒充旧 schema。完整备份包含图片，不依赖原始磁盘文件或互联网。

新增 24 项 PNG 编解码／安全用例、19 项真实主进程集成用例及 1 项页面权限用例。独立 Python／zlib 样本核对像素与元数据剥离，验证五种滤波跨像素／行边界、透明度、CRC、非法尺寸／类型、动画、解压上限及尾随载荷。集成覆盖去重、不可变图片和位置、单据／报表、权限、迁移、损坏证据、限额、回滚和跨重启幂等恢复。

实际项目完整回归：139 个测试文件、1857 项测试通过，0 失败，228.14 秒。桌面验收后调整文件输入间距，并确保收起的保存报表预览在打印前展开；在实际项目复查品牌、保存报表及页面 196 项全部通过（7.56 秒）。最终 TypeScript、Vite renderer 与 Electron main/preload 生产构建通过；既有大分块提示仍为警告。

执行命令：`tsc -b && vite build`；`node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev`，沿用 Node 24 已验证配置。

原生 Electron 使用 `/private/tmp/htt-g09-native` 独立合成档案。品牌设置显示当前橙色图片及保留绿色旧图；旧发票仍显示绿色快照。经实际打印对话框保存 1 页发票和 3 页管理报表 PDF：发票嵌入绿色图片，报告封面嵌入橙色图片。全部 4 页渲染后逐页检查，图片可见、比例和版面正常、表格／金额未遮挡，无应用导航或工作区。查看、生成预览和打印前后，repositories 与 storage 同种子证据逐项完全一致。验收后关闭独立应用，未发送邮件或使用真实业务档案。

G09 在上述本地静态 PNG 品牌范围关闭；G10–G17 共 8 个本地功能／质量／交付包及 3 个外部连接边界保留。
