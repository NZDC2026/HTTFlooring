# HTT 三端统一设计实施说明

## 产品边界

本次统一视觉规范，三个产品继续独立运行、独立导航。

| 产品 | 现有技术 | 保留的交互结构 | 本次实现 |
|---|---|---|---|
| customer-portal | React 19、TypeScript、Vite、React Router | 普通官网横向导航、产品展示、登录后的客户自助页面 | 品牌标记、绿色主操作、卡片与状态配色、客户工作台快捷入口、响应式细节 |
| htt_flooring_app | Flutter、Material 3、Provider | 销售／仓库角色路由、手机底部导航、原有业务页面 | 共享色板、卡片和输入框、48px 主按钮、销售首页顶部栏、仓库首页色板与窄屏网格；销售端大屏可使用 NavigationRail |
| htt-management | React 19、TypeScript、Vite、Tailwind 4、Electron | Web／PC 侧栏、权限筛选、Reception／Owner／Accounts 看板 | 品牌侧栏、看板卡片、六项 Reception 指标、小屏菜单与工具栏、键盘焦点样式 |

## 审计结论

- 客户站已有公开首页、登录／注册、Dashboard、Inventory、Series／Collections／Products、Quotes、Orders、Invoices、Credits／Returns、Rebates 和 Account 路由。原有 RequireAccount 和数据计算保留。
- App 使用 RoleRouter 分派 SalesNavigation 和 WarehouseNavigation；业务状态通过既有 Provider／Service 管理。AppShell 保留 currentIndex 和 onDestinationSelected 接口，未增加跨产品入口。
- 管理端使用 Hash Router、AppLayout、Sidebar 和 Topbar。现有 ReceptionDashboard 与 OwnerDashboard 已包含实时／示例模式和角色展示；继续复用，未重建财务或库存流程。
- 仓库首页原先有局部硬编码的米色背景，已改为共享背景与卡片色。其独立 WarehouseNavigation 继续保留。
- 本次不新增跨产品登录、产品切换器或共享业务状态。

## 参考图与设计规则

以用户最后上传的 Reception Dashboard 图为准：深绿品牌导航、明亮页面背景、白色圆角卡片、细边框和柔和阴影。绿色表示完成／可用，蓝色表示信息／配送，琥珀色表示待处理，红色表示逾期／异常，紫色用于订单处理。文字和状态标签共同表达含义。

官网保留产品与空间摄影，App 使用紧凑标题和触控控件，管理 Web／PC 使用高信息密度侧栏和工作区。未把参考图的所有装饰图片或全部区块逐像素复制到三个产品。

## 代码入口

仓库位置：`/Users/chandler/Documents/GitHub/HTTFlooring`。

- `design-system/tokens.json`：三端共享的颜色源。
- `design-system/generate.mjs`：执行 `node design-system/generate.mjs`，生成两个 Web CSS 色板和 Flutter `htt_tokens.dart`。
- `customer-portal/src/portal-system.css`：官网与客户工作台视觉适配；通过 main.tsx 加载。
- `customer-portal/src/pages/DashboardPage.tsx`：指向既有库存、报价、订单和发票路由的快捷入口。
- `htt_flooring_app/lib/theme/app_theme.dart`：兼容原 AppColors 名称的主题适配。
- `htt_flooring_app/lib/widgets/app_shell.dart`：手机／大屏销售导航，保留原回调。
- `htt-management/src/styles/tokens.css`：现有 CSS 变量映射到共享色板。
- `htt-management/src/layouts/`：保留权限导航，增加小屏展开／关闭、Escape 关闭和选路后关闭。
- `htt-management/src/features/dashboard/pages/`：Owner／Reception 的参考图样式。新增 Action Required 卡片取自现有未完成且已到期任务；示例模式显示独立示例值。

## 验证与实际范围

- 客户站：生产构建通过，19 项测试通过。
- App：变更文件分析无问题，22 项测试通过（含 390px／1024px 导航回调验证），Flutter Web 编译通过。
- 管理端：Web 生产构建及 Electron 主进程／渲染器构建通过；导航和看板相关 12 个测试文件、107 项测试通过。
- 管理端全量测试在两种进程池下均未正常产出结果，已停止挂起的测试进程；不能据此声称全量测试通过。
- 全项目 Flutter 分析仍有 10 条既有格式提示；Web lint 仍有既有警告。管理端运行 Node 26，与项目声明的 Node 24 有版本差异，构建仍成功；产物体积提示仍存在。
- 浏览器已检查客户官网、Flutter App 手机布局，以及管理端桌面／小屏界面。App 的浏览器预览用于视觉检查，不代表完成 iOS／Android 真机或 Electron 安装包验收。
- 管理端按项目要求重启既有在线 Web 服务，保留原配置及数据目录；公开站点随后返回 HTTP 200。
- 未提交 Git commit，也未替换已安装的 PC 或手机 App。

## 预览说明

PNG 文件是本次实际运行页面截图。单独的 HTML 文件是设计样例，用合成数据展示角色内容，静态操作卡片不执行业务动作。设计样例未放入三个产品的导航中。

本次完成共享设计基础、核心工作台和响应式导航适配；没有逐页重新设计所有业务表单、打印模板或报表。
