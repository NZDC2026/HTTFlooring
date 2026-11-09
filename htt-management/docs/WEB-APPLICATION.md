# 浏览器版运行说明

## 开发运行

在 `htt-management` 目录执行：

```sh
pnpm install
pnpm dev:web
```

该命令先构建 Node 服务，再同时启动 API（默认 `127.0.0.1:8787`）和 Vite。浏览器打开 Vite 打印的 Local 地址。前端 `/api` 由 Vite 代理给 API，不需要跨域配置。服务端代码修改后重新运行命令，前端仍支持热更新。原来的 `pnpm dev`、Electron 打包命令保留。

首次打开创建管理员，密码至少 12 位。之后可以在安全设置中管理账号和角色。请自行设置正式管理员；自动化和浏览器验收只使用 `/tmp` 下的隔离数据库，不会创建正式用户。

## 构建并运行

```sh
pnpm build:web
pnpm start:web
```

打开 `http://127.0.0.1:8787`。Node 同时提供前端静态文件和 API。前端路径使用原有 hash 路由。

项目原本指定 Node `24.19.0`、pnpm `11.25.0`，建议使用这些版本。本次本机验证环境为 Node `26.13.0`、pnpm `11.25.0`。

## 存储与备份

- 默认使用 `web-data/htt.sqlite`，SQLite WAL + FULL synchronous。账号/密码哈希/签名审计和业务快照分别保存；保留现有业务快照格式、校验、迁移及角色过滤，不把浏览器 localStorage 当作数据库。
- `HTT_DATA_DIR` 可指定独立的服务器数据目录。业务数据、账号都在服务端，浏览器刷新或服务重启不会删除它们。服务重启会清除登录会话，需要重新登录。
- 一个数据目录只运行一个 Node 服务进程。当前实现不适用于多实例或集群部署。
- 管理员可以在现有备份页面下载业务 JSON，并上传 JSON 预览后确认恢复。恢复后必须重启 Node 服务再刷新页面。业务备份不包含账号和审计。
- 完整备份：停止服务，再备份整个数据目录（包含 SQLite 文件及可能存在的 WAL/SHM 和恢复备份）。不要只复制正在使用的 SQLite 主文件。
- 原 Electron 数据不会自动混入新数据库。迁移现有业务记录：在 Electron 端导出业务备份，在网页创建管理员后上传并恢复，重启服务。原账号需要重新创建；不覆盖原桌面数据。
- 新建数据库继续沿用原项目默认数据，包括原有示例客户/商品等；上线录入前请审核和整理这些默认记录。

## 浏览器适配和当前边界

已接通管理员创建、登录/退出、用户及角色管理、密码修改、审计、原有已注册业务 repository 的读写、持久化、备份/恢复、附件上传/下载，以及浏览器打印客户对账单（可选择另存为 PDF）。跨浏览器共享服务端数据，活动页面每 15 秒刷新业务视图，并按当前登录用户的权限每分钟检查一次到期自动草稿；关闭页面或会话过期后不会继续扫描。

为了复用大量同步 repository 调用，当前浏览器 HTTP 桥采用同源同步 XMLHttpRequest；慢网络或大快照会暂时阻塞页面。未来可逐模块迁移为异步 API 与增量查询。请求在服务端排队执行，避免共享业务内存和账号上下文交叉。

桌面可选服务尚未全部迁移：邮件/提醒与在线收款、银行数据源、工资外部申报的 `integrations.*` / `bankFeeds.*` / `payrollFilings.*` 接口会明确返回尚未配置，不会伪造成功。普通业务录入、银行 CSV 导入、工资业务计算与数据库保存走已接通的业务 repository。OCR 需要 macOS 上真实可执行的识别 helper，可用 `HTT_OCR_HELPER` 指定路径；缺少 helper 时使用原有手工/CSV 流程。附件上传限 10 MB，当前网页恢复文件也限 10 MB。

## 部署到服务器

所有 Node 端环境配置统一列在项目根目录 `.env.example`。首次部署复制为 `.env`，然后在 `.env` 中修改服务器地址、数据目录和发件服务设置；`.env` 已被 Git 忽略，不要提交真实凭据。当前工作区 `.env` 已保留现有线上域名、端口、Secure Cookie 和数据目录。

```sh
cp .env.example .env
# 编辑 .env，再构建、启动
pnpm build:web
pnpm start:web
```

统一入口为 `config/environment.cjs`，使用 Node 自带的 `.env` 解析和加载，不需要另装 dotenv。优先级为：终端/CI 环境变量 → `.env` → `.env.example` 中的非敏感默认值。打包后的 Electron 不从用户的当前目录加载 `.env`。Vite 客户端只接收显式生成的网页版标志，不注入服务器密钥。

部署时 `.env` 中设置：`PUBLIC_ORIGIN` 为实际 HTTPS 来源（不带结尾斜杠），`COOKIE_SECURE=1`，`HOST=127.0.0.1`，`API_PORT=8787`；`HTT_DATA_DIR` 必须保持指向原有数据目录。反向代理继续转发到该端口。修改 `.env` 后重启；修改构建模式后重新构建。

发件密钥 `RESEND_API_KEY`、桌面签名 `CSC_*` 和 Apple 公证凭据只供 Node 端读取，不要使用 `VITE_` 前缀。未配置的密钥留空。验收用 `HTT_ACCEPTANCE_PROFILE`、`HTT_G17_CASE`、`HTT_ROUTE_EVIDENCE` 默认留空，每轮测试临时指定全新的临时目录。`npm_execpath`、`VITE_DEV_SERVER_URL`、`HTT_VERIFY_ARTIFACT` 是工具动态提供的运行信息，不要填入固定机器路径。

## 验证

```sh
pnpm test:web
pnpm build:web
```

接口测试使用临时 SQLite，覆盖初始化、禁止重复设置管理员、跨来源请求拒绝、未登录访问拒绝、不同浏览器权限隔离、错误命令、客户创建及重启后保留、账号保留、退出和错误密码。
