# Justin Docs

一个基于 VitePress 构建的个人技术文档库，用来沉淀 Linux、Java、MySQL、Redis、Docker、Kubernetes、Nginx、Jenkins、前端工程和部署实践。

这个站点不是单纯的博客首页，而是面向长期学习、复习、求职准备和生产实践的工程笔记库。内容会尽量按照“概念 -> 原理 -> 操作流程 -> 常用命令 -> 排障记录”的方式整理，方便以后持续补充。

## 在线访问

- GitHub Pages：[https://chizhang977.github.io/justin/](https://chizhang977.github.io/justin/)
- Vercel：[justin vercel](https://justin-red.vercel.app)部署后填写你的 Production 域名，例如 `https://your-project.vercel.app`

GitHub Pages 适合作为静态访问地址；Vercel 用来承载完整功能，尤其是在线编辑文档需要依赖 Vercel Serverless API。

## 项目定位

这个仓库主要做三件事：

- 记录个人技术学习路线和知识点。
- 整理后端、数据库、Linux、容器、DevOps 等工程实践。
- 提供一个可长期维护的个人技术文档站，后续可以扩展成完整知识库。

## 内容方向

| 分类 | 内容 |
| --- | --- |
| Linux | 文件目录、用户权限、进程服务、日志、网络排障、磁盘挂载、软件包管理 |
| Java | Java 基础、新特性、反射、Spring Boot、工程设计 |
| MySQL | SQL 基础、条件过滤、分组分页、索引、慢查询、主从复制、备份恢复 |
| Redis | 缓存、分布式缓存、集群、OpenResty、Canal |
| Docker | 镜像、容器、网络、数据卷、Dockerfile、Compose、生产部署 |
| Kubernetes | K8s 基础、安装、KubeSphere、Ingress |
| DevOps | Nginx、Jenkins、VitePress 部署、GitHub Pages、Vercel |
| 前端资源 | Vue、Vue3、常用工具、资源导航 |

## 功能特性

- 基于 VitePress 的静态文档站。
- 自定义首页和主题样式。
- 明暗模式与主题色切换。
- 本地搜索。
- 阅读进度条。
- 文档顶部信息条：分类、阅读时间、章节数、更新时间。
- 文档底部“本文脉络”，方便回到具体标题。
- 代码块复制优化，避免复制出多余行号。
- 支持 GitHub Pages 和 Vercel 双平台部署。
- 支持 Vercel 环境下在线新建、编辑、导入 Markdown 并提交到 GitHub。
- 支持在线写作页上传图片到仓库静态资源目录。

## 技术栈

- VitePress
- Vue 3
- TypeScript
- Markdown
- GitHub Pages
- Vercel
- GitHub OAuth
- GitHub Contents API
- 自定义 Markdown 写作器

## 目录结构

```text
justin
├─ api
│  └─ github                  # Vercel Serverless API，负责在线编辑和 GitHub 写入
├─ docs
│  ├─ .vitepress
│  │  ├─ config.mts           # VitePress 配置
│  │  ├─ nav.ts               # 顶部导航
│  │  ├─ sidebar.ts           # 侧边栏
│  │  └─ theme                # 自定义主题和 Vue 组件
│  └─ src
│     ├─ docs                 # Markdown 文档内容
│     ├─ public               # 静态资源
│     ├─ index.md             # 首页
│     └─ write.md             # 在线写作页面
├─ package.json
├─ vercel.json
└─ README.md
```

## 本地开发

安装依赖：

```bash
npm ci
```

启动开发服务：

```bash
npm run docs:dev
```

构建生产产物：

```bash
npm run docs:build
```

本地预览构建结果：

```bash
npm run docs:preview
```

Windows PowerShell 如果遇到脚本策略问题，可以使用：

```bash
npm.cmd run docs:dev
npm.cmd run docs:build
```

## 部署说明

### GitHub Pages

GitHub Pages 适合部署静态站点。当前 VitePress 配置会在非 Vercel 环境使用：

```text
base=/justin/
```

所以 GitHub Pages 地址是：

```text
https://chizhang977.github.io/justin/
```

### Vercel

Vercel 用于部署完整功能，包括 `/write` 在线编辑页面和 `/api/github/*` Serverless API。

Vercel 配置在 `vercel.json`：

```json
{
  "installCommand": "npm ci",
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist",
  "cleanUrls": true
}
```

导入仓库时保持项目根目录为仓库根目录，不要把 Root Directory 改成 `docs`。

## 在线编辑文档

项目提供了 `/write` 页面，可以在线写 Markdown，然后提交到 GitHub 仓库。完整能力只在 Vercel 上可用，因为它需要 Serverless API 保存 GitHub OAuth Secret。

当前入口分成两条：

- 首页点击 `新建文档`：进入 `/write`，创建新 Markdown。
- 文档页点击 `在线编辑`：进入 `/write?path=...`，读取并编辑当前文档。

本地 Markdown 导入放在写作页内部，属于新建文档流程，不再作为首页主入口。

### 写入链路

```text
浏览器写作
  -> GitHub OAuth 登录
  -> Vercel API 校验用户和路径
  -> GitHub Contents API 写入 Markdown 或图片
  -> 产生 commit
  -> Vercel 自动重新构建
```

### GitHub OAuth App 配置

进入 GitHub：

```text
Settings -> Developer settings -> OAuth Apps -> New OAuth App
```

填写：

| 配置项 | 示例 |
| --- | --- |
| Application name | Justin Docs Writer |
| Homepage URL | `https://你的-vercel-production域名` |
| Authorization callback URL | `https://你的-vercel-production域名/api/github/oauth/callback` |

创建后保存：

- `Client ID`
- `Client Secret`

`Client Secret` 只能放在 Vercel 环境变量中，不能提交到 GitHub。

### Vercel 环境变量

进入 Vercel 项目：

```text
Project -> Settings -> Environment Variables
```

添加：

| 变量名 | 示例值 | 说明 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | OAuth App 的 Client ID | GitHub OAuth 客户端 ID |
| `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret | GitHub OAuth 密钥 |
| `GITHUB_OWNER` | `chizhang977` | 仓库拥有者 |
| `GITHUB_REPO` | `justin` | 仓库名 |
| `GITHUB_BRANCH` | `master` | 写入分支 |
| `GITHUB_ALLOWED_USERS` | `chizhang977` | 允许在线提交的 GitHub 用户 |
| `GITHUB_OAUTH_SCOPE` | `public_repo` | 公开仓库写入权限 |
| `GITHUB_ALLOWED_PREFIXES` | `docs/src/docs/,docs/src/index.md` | 允许编辑的 Markdown 路径白名单 |

如果仓库是私有仓库，`GITHUB_OAUTH_SCOPE` 需要改成：

```text
repo
```

### 使用流程

新建文档：

1. 打开首页，点击 `新建文档`。
2. 选择分类目录和文件名。
3. 在大面积写作区直接编辑 Markdown，需要查看效果时打开右侧预览。
4. 登录 GitHub。
5. 点击 `提交`。
6. 等待 Vercel 重新构建后访问新文档。

编辑当前文档：

1. 打开任意文档阅读页。
2. 点击 `在线编辑`。
3. 未登录时先登录，登录后会自动读取当前文档内容。
4. 修改后点击 `提交`。
5. 提交成功后页面会自动回到该文档。

导入 Markdown：

1. 打开 `/write`。
2. 点击 `导入`，选择本地 `.md`、`.markdown`、`.mdown` 文件。
3. 确认分类目录、文件名和标题。
4. 点击 `提交`。

### 图片上传

编辑器支持上传本地图片。图片会通过 `/api/github/asset` 写入：

```text
docs/src/public/assets/uploads/YYYY/MM/
```

Markdown 中保存的路径类似：

```markdown
![图片说明](/assets/uploads/2026/06/example.png)
```

支持 `png`、`jpg`、`jpeg`、`webp`、`gif`、`svg`，单张图片建议不超过 4MB。

### 配置后的测试流程

1. 重新部署 Vercel，让环境变量生效。
2. 打开 Vercel Production 域名，点击首页 `新建文档`。
3. 登录 GitHub，创建并提交一篇测试文档。
4. 到 GitHub 仓库确认产生 commit。
5. 等待 Vercel 自动重新构建，在线访问新文档。
6. 打开这篇文档，点击 `在线编辑`，确认能读取当前内容。
7. 修改后再次提交，确认编辑已有文档可用。
8. 在写作页上传一张小图片，确认图片写入 `docs/src/public/assets/uploads/` 且页面能显示。

### 安全边界

Markdown 编辑接口默认只允许编辑：

```text
docs/src/docs/
docs/src/index.md
```

图片上传接口只写入：

```text
docs/src/public/assets/uploads/
```

并且会检查：

- 是否完成 GitHub OAuth 登录。
- 当前 GitHub 用户是否在 `GITHUB_ALLOWED_USERS` 白名单中。
- 提交路径是否是 Markdown 文件。
- 提交路径是否在允许目录内。
- 写入请求是否来自同源页面。

这样可以避免误改 `.vitepress` 配置、构建脚本、接口代码或仓库其他文件。

## 常见问题

### 为什么 GitHub Pages 上不能在线提交

GitHub Pages 只能托管静态文件，没有服务端函数，不能安全保存 GitHub OAuth Secret。因此 `/write` 的完整提交功能必须部署在 Vercel 上。

### 提交成功后为什么页面没有立刻变化

提交成功代表 Markdown 已经写入 GitHub。线上页面还需要等待 Vercel 或 GitHub Pages 重新构建，构建完成后页面才会更新。

### 为什么需要 `GITHUB_ALLOWED_USERS`

OAuth 只能证明用户是谁，不能自动判断这个用户是否应该有权限写你的仓库。`GITHUB_ALLOWED_USERS` 用来限制只有指定 GitHub 用户能通过站内编辑器提交。

### 为什么不把 GitHub token 写在前端

前端代码会被所有访问者下载。如果把 token 写进前端，任何人都可能拿到它并修改仓库。正确做法是把密钥放在 Vercel Serverless API 中。

## 维护建议

- 文档尽量按分类放入 `docs/src/docs`。
- 新文档优先写清楚背景、概念、流程、命令和排障。
- 不提交 `node_modules`、`.env`、`.vitepress/cache`、`.vitepress/dist`。
- Vercel 使用 `npm ci`，建议以 `package-lock.json` 为准，避免同时维护多套包管理锁文件。

## License

本项目用于个人学习和技术沉淀，内容会持续调整和补充。
