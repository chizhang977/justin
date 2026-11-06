---
title: 存量项目架构梳理
category: DevOps
date: 2026-11-06
status: verified
tags: 架构,VitePress,Vercel,GitHub API
---

# 存量项目架构梳理

本文记录本仓库（Justin Docs）当前的存量架构：分层结构、关键组件、在线编辑写入链路、安全边界、双部署轨道差异，以及已识别的技术债。

梳理基于 2026-11-06 的全量代码阅读，结论均以实际源码为准。

## 核心定位

这个项目不是普通的静态文档站，而是**用 GitHub 仓库当数据库**的在线技术文档库。

- **读**走 VitePress 静态站，构建产物由 CDN 分发。
- **写**走 Vercel Serverless Functions，由服务端代理 GitHub Contents API 提交 commit。
- **两端通过 GitHub 仓库这个中间层解耦**，没有引入任何数据库。

带来的直接收益是：零数据库运维成本、内容天然带版本历史、每次写入都是标准 Git 提交、回滚即 `git revert`。

## 五层结构

```text
访问层    浏览器（静态文档阅读 / /write 在线编辑器 / 登录态 Cookie）
   ↓
渲染层    VitePress 静态站（config.mts / nav.ts / sidebar.ts / theme/）
   ↓                    ↓
服务层    Vercel Serverless（api/github/ 6 个 handler + _shared.js）
   ↓
代理层    GitHub Contents API（GET/PUT contents/{path}，sha 乐观锁）
   ↓
数据源    GitHub 仓库 chizhang977/justin（118 篇文档 + 597 个静态资源）
```

### 各层规模

| 层 | 位置 | 规模 |
| --- | --- | --- |
| 渲染层 | `docs/.vitepress/` | 配置文件 3 个 + 主题组件 9 个 + `style.css` 5328 行 |
| 服务层 | `api/github/` | 7 个 JS 文件共 767 行，其中 `_shared.js` 296 行 |
| 数据源 | `docs/src/docs/**/*.md` | 118 篇文档 |
| 静态资源 | `docs/src/public/` | 597 个文件（图标、图片、上传目录） |

## 目录职责

```text
justin/
├── api/github/              # Vercel Serverless Functions
│   ├── _shared.js           # 公共逻辑：鉴权、路径校验、Cookie、GitHub 请求封装
│   ├── me.js                # GET  当前登录用户 + 是否有提交权限
│   ├── file.js              # GET/PUT  文档读取与提交
│   ├── asset.js             # PUT  图片上传
│   ├── logout.js            # POST 清除会话
│   └── oauth/
│       ├── start.js         # GET  生成 state、跳转 GitHub 授权
│       └── callback.js      # GET  换取 access_token、落地会话
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts       # 站点配置、base 路径、Markdown 插件、主题配置
│   │   ├── nav.ts           # 顶部导航（8 个一级分类）
│   │   ├── sidebar.ts       # 侧边栏（按路径前缀匹配分组）
│   │   └── theme/
│   │       ├── index.ts     # 主题入口，注册组件与 Layout 插槽
│   │       ├── style.css    # 全局样式 5328 行
│   │       ├── components/  # 9 个自研组件
│   │       └── data/
│   │           └── recent-posts.data.ts  # 扫描 frontmatter 生成文档元数据
│   └── src/
│       ├── index.md         # 首页，挂载 HomeWorkbench
│       ├── write.md         # 在线写作页，挂载 DocEditor
│       ├── docs/            # 118 篇正文文档
│       └── public/          # 静态资源
├── .github/workflows/deploy.yml  # GitHub Actions 构建并发布到 gh-pages
├── vercel.json                    # Vercel 构建配置
└── deploy.sh                      # 手工推送到 gh-pages
```

## 渲染层：主题组件清单

`theme/index.ts` 通过 `extends: DefaultTheme` 继承官方主题，再用 Layout 插槽挂载自研组件。

| 组件 | 行数 | 作用 |
| --- | --- | --- |
| `HomeWorkbench.vue` | 231 | 首页工作台：四条学习主线、快捷入口、阅读流程 |
| `DocEditor.vue` | 1200 | 在线编辑器，核心组件 |
| `SidebarActiveHeadings.vue` | 275 | 侧边栏当前章节高亮 |
| `DocReadingMeta.vue` | 165 | 文档顶部信息条：分类、阅读时间、章节数、更新时间 |
| `CodeCopyEnhancer.vue` | 151 | 代码复制增强，剥离复制时残留的行号 |
| `ThemePalette.vue` | 96 | 明暗模式与 4 种主题色切换 |
| `DocFeedback.vue` | 72 | 底部反馈入口，预填 GitHub Issue |
| `DocBottomOutline.vue` | 53 | 底部"本文脉络"章节导航 |
| `ReadingProgress.vue` | 29 | 顶部阅读进度条 |

`config.mts` 里的自定义 Markdown 规则 `strip_copied_line_numbers` 与 `CodeCopyEnhancer` 的同名函数是**同一逻辑的两份实现**（前者处理构建期渲染，后者处理浏览器端复制），修改时需要同步。

## 服务层：在线编辑写入链路

这是整个项目最复杂的部分。

```text
1 · 登录换票
   /api/github/oauth/start 生成 state 存 Cookie → 跳转 GitHub 授权
   → /api/github/oauth/callback 校验 state → 换 access_token

2 · 落地会话
   token 写入 justin_docs_token Cookie（HttpOnly + SameSite=Lax + Secure，默认 8 小时）

3 · 载入文档
   GET /api/github/file?path=... → 服务端解 base64 → 回传 content 与 sha
   → 前端同时把内容记入 localStorage 草稿

4 · 服务端五道卡点（全部在 _shared.js）

5 · 提交入库
   PUT /api/github/file 带 path + content + sha
   → Contents API 写入 commit，sha 不匹配则冲突

6 · 重建上线
   GitHub 推送触发 Vercel 重新构建 → 新文档可见
   → 前端 1.6 秒后自动跳回文档页
```

### 编辑器的两种模式

| 模式 | 入口 | 行为 |
| --- | --- | --- |
| 新建 | 首页"新建文档" → `/write` | 选分类 + 填 slug 生成路径，预填 `buildTemplate()` 模板，提交带 `createOnly: true` |
| 编辑 | 文档页"在线编辑" → `/write?path=...` | 载入已有内容，携带 sha 提交，服务端用 sha 做乐观锁 |

新建模式下如果目标文件已存在，服务端返回 `409 该文档已经存在，请切换为编辑模式`。

### 编辑器附带能力

- 导入本地 Markdown（点击选择或拖拽投放，限制 3MB）
- 图片上传（限制 4MB，转 base64 走 `asset.js`，落到 `docs/src/public/assets/uploads/年/月/`）
- 本地草稿自动保存（key `justin-docs-online-writer-draft-v4`），登录前切换编辑状态不丢内容
- 标题双向同步：正文首行 `# 标题` 与 frontmatter title 互为回填

## 安全边界

所有校验逻辑集中在 `api/github/_shared.js`，共五道卡点：

| 卡点 | 实现 | 说明 |
| --- | --- | --- |
| 同源校验 | `requireSameOrigin` | 比对 Origin / Referer 的 host 与请求 host 是否一致 |
| 会话校验 | `requireToken` | `justin_docs_token` Cookie 不存在直接 401 |
| 用户白名单 | `requireAllowedUser` | 调 GitHub `/user` 取真实 login，比对 `GITHUB_ALLOWED_USERS` |
| 路径白名单 | `normalizeDocPath` | 只允许 `GITHUB_ALLOWED_PREFIXES` 前缀内的路径 |
| 文件类型 | `normalizeDocPath` | 只允许 `.md` 结尾 |

额外的路径净化：`normalizeDocPath` 会过滤 `..`、空字节（`\0`）、反斜杠，并统一去掉前导斜杠，防目录穿越。`safeReturnTo` 保证 OAuth 回调的 `returnTo` 必须以单个 `/` 开头，防开放重定向。

OAuth state 校验：`start.js` 生成 16 字节随机 hex 存 Cookie，`callback.js` 严格比对，防 CSRF。

**关键设计取舍**：OAuth 只能证明"你是谁"，不能判断"你该不该改这个仓库"，所以权限控制依赖独立的 `GITHUB_ALLOWED_USERS` 白名单，而不是 OAuth scope。

## 配置项

所有配置走环境变量，不硬编码在代码里。

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | 无 | OAuth App 客户端 ID，必填 |
| `GITHUB_CLIENT_SECRET` | 无 | OAuth App 客户端密钥，必填 |
| `GITHUB_OWNER` | `chizhang977` | 仓库 owner |
| `GITHUB_REPO` | `justin` | 仓库名 |
| `GITHUB_BRANCH` | `master` | 写入分支 |
| `GITHUB_ALLOWED_USERS` | 同 `GITHUB_OWNER` | 允许提交的 GitHub 用户，逗号分隔 |
| `GITHUB_ALLOWED_PREFIXES` | `docs/src/docs/,docs/src/index.md` | 允许编辑的路径前缀 |
| `GITHUB_SESSION_MAX_AGE` | `28800`（8 小时） | 会话 Cookie 有效期 |
| `GITHUB_OAUTH_SCOPE` | `public_repo` | OAuth 授权范围 |
| `VITEPRESS_BASE` | 按环境推导 | 站点 base 路径 |
| `VITEPRESS_SITE_URL` | 按环境推导 | sitemap 站点地址 |

`config.mts` 里 `VERCEL === '1'` 时 base 自动切为 `/`，否则为 `/justin/`；`VITEPRESS_BASE` 可手动覆盖。

## 双部署轨道

两条轨道共用同一份仓库数据，但能力边界不同。

| | GitHub Pages | Vercel |
| --- | --- | --- |
| 地址 | `chizhang977.github.io/justin/` | `justin-red.vercel.app` |
| 构建 | Actions `deploy.yml` → `gh-pages` 分支 | Vercel 自动构建 |
| 静态阅读 | 支持 | 支持 |
| 在线编辑 | **不支持，`/api` 路由 404** | 支持 |
| 图片上传 | 不支持 | 支持 |
| base 路径 | `/justin/` | `/` |
| 额外依赖 | Node 20 + yarn | 需配置 `GITHUB_*` 环境变量 |

### 本地开发的断层

`yarn docs:dev` 启动的是纯静态开发服务器，**没有 Serverless 运行时**，`/api/github/*` 全部返回 404，编辑器无法保存。

这不是配置问题，而是架构的固有特性：写能力依赖服务端运行时。本地要验证完整链路，只能部署到 Vercel 后测试。

## 已识别的技术债

| 项 | 位置 | 影响 |
| --- | --- | --- |
| 根目录残留一次性脚本 | `scan-docs.js`、`fix-docs.js`、`safe-fix-docs.js`、`safe-fix-docs-v2.js`、`docs-scan-report.json`、`redesign-homepage.html`、`build-output.txt` | 污染仓库根目录，干扰新人理解项目结构 |
| 双发布路径并存 | `deploy.sh` 与 `.github/workflows/deploy.yml` | 手工推送与自动构建可能互相覆盖 |
| `DocEditor.vue` 单文件过大 | 1200 行 | 编辑、导入、图片、草稿、OAuth 逻辑耦合在一个文件 |
| 行号剥离逻辑重复 | `config.mts` 与 `CodeCopyEnhancer.vue` | 同一逻辑两份实现，易漏改 |
| 本地无 API 运行时 | `yarn docs:dev` | 无法本地验证写入链路 |
| 多套锁文件 | `package-lock.json` 与 `yarn.lock` 并存 | README 已提示以 `package-lock.json` 为准 |

## 维护建议

- 文档按分类放入 `docs/src/docs`，新增后同步 `nav.ts` 与 `sidebar.ts`。
- 新文档写清背景、概念、流程、命令、排障，编辑器模板也是这个结构。
- 修改安全校验时，只改 `_shared.js`，不要在各 handler 里重复实现。
- 不提交 `node_modules`、`.env`、`.vitepress/cache`、`.vitepress/dist`。
- Vercel 使用 `npm ci`，以 `package-lock.json` 为准。
