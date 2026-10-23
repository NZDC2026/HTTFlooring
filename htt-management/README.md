# HTT Management

HTT Flooring 管理财务端桌面应用。Electron 主进程拥有本地业务数据、授权、审计与原子持久化；React/TypeScript 界面使用 Repository/Service。没有独立后台。

开发与需求入口：[当前系统能力](docs/CURRENT-SYSTEM-STATUS.md)、[工作包进度](docs/WORKFLOW-ACCEPTANCE-20261021.md)、[文档索引](docs/DOCUMENTATION-INDEX.md)。以这些当前说明核对后续工作，旧交付文档保留原时点范围和验证数字。

## 本地开发

使用现有 pnpm lockfile 安装依赖：`pnpm install --frozen-lockfile`。`pnpm dev` 启动开发环境，`pnpm build` 执行 TypeScript、Vite renderer/main/preload 构建，`pnpm test` 运行测试。Node 24 环境若需避开 Maglev，已验证的等价测试命令是：

```sh
node --no-maglev ./node_modules/vitest/vitest.mjs run --pool=forks --maxWorkers=2 --execArgv=--no-maglev
```

macOS 构建本地 OCR 助手需要 Xcode Command Line Tools；构建脚本编译并合并 arm64/x86_64。打包配置把助手放入 Resources/ocr，运行不依赖 Swift 编译器。OCR 目前仅支持 macOS 英文 PDF/PNG/JPEG，Windows 保留手工/CSV。

`pnpm dist:dir` 生成目录应用；正式签名、公证、Windows 安装/升级和发布验收仍待 G16。构建成功不代表已完成正式上线验收。业务档案和凭据不应提交到源码或补丁；测试使用独立临时档案。

## 范围检查

```sh
node scripts/current-guidance.mjs --check
node scripts/table-inventory.mjs --check
```

目录 `/workspace` 展示本地业务入口，`/help` 和 `/settings/integrations` 说明能力边界。销售/采购输出、银行 ABA 和工资复核不执行邮件发送、银行付款或电子税务提交。
