# 正式界面导航

更新：2026-11-01。按用户确认，从正式界面移除 Page directory 和 Customer Demo Journey，保留两者源码及历史演示进度，不删除业务数据。

`src/features/security/optionalWorkflows.ts` 中独立的 `presentationWorkflows` 配置将两项置为 false。侧栏、Dashboard 演示按钮、公共页头的 Page directory、通用框架 More pages、全局搜索结果、演示返回提示和登录首页选项同步隐藏。正式路由入口拒绝旧目录和演示地址，包括大小写及编码变体；原组件及原路由声明保留供后续经开发和验收恢复，不提供用户运行时启用开关。

## 保留必要业务入口

- 各模块顶部增加折叠的 More in… 导航，只显示当前模块且当前角色有权访问的业务入口。复用已有路由元数据，不新建另一个全局页面目录。
- 产品、价格、银行规则、银行 feed、年结、通讯/催款、单据准备、配置及报表继续从对应模块进入。
- 侧栏补充 Recurring transactions、Tasks、Import & export。
- Customer review 同时可从 Sales 的模块导航进入；Business record search 继续从全局搜索进入。
- 上一阶段停用的六类金融功能仍保持停用，不因补导航而恢复。

旧个人偏好中的 `/workspace` 保留可读取性，但登录时会按现有角色选择 Dashboard、Sales、Purchases 或 Inventory，不再回到页面目录；没有业务权限时使用个人偏好页作为安全回退。偏好版本和业务结构均未改变。

原始 Page directory、Customer Demo Journey 实现未删除；修改前文件另保存在开发工作区 `baselines/formal-navigation-start/originals`。恢复需要修改编译配置并重新构建验收。

实际项目构建成功；完整回归 177 个测试文件、3782 项全部通过（266.94 秒）。70 份文档及 149 处保留源码表格索引检查通过。原生隔离档案验证了侧栏、首页、模块入口、产品页、搜索和首页选项；业务 repositories 与 storage 未改变。两页原组件与基线逐字节一致。见 [验收证据](acceptance-formal-navigation-20261101/evidence.json)。
