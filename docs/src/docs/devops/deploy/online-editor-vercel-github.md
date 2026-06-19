# 在线写作与 GitHub 提交

这个站点的在线写作功能分成两条清楚的入口：

- 首页的 `新建文档`：进入 `/write`，用于创建一篇新的 Markdown 文档。
- 文档阅读页的 `在线编辑`：进入 `/write?path=...`，只编辑当前正在阅读的这篇文档。

本地 Markdown 导入不再作为首页主入口，而是放在 `/write` 写作页内部。这样首页负责创建，文档页负责编辑，导入只是新建文档流程里的一个补充能力。

## 写入链路

```text
浏览器写 Markdown
  -> Vercel Serverless API
  -> GitHub OAuth 校验身份
  -> GitHub Contents API 写入仓库
  -> Vercel 自动重新构建站点
```

文档内容仍然以 Markdown 文件为源头，默认写入 `docs/src/docs/`。图片会上传到 `docs/src/public/assets/uploads/`，Markdown 中保存 `/assets/uploads/...` 路径。

## 为什么需要 Vercel API

浏览器页面不能直接保存 GitHub token。只要把 token 写进前端代码、构建环境变量或静态资源里，任何访问网站的人都有机会拿到它。

所以成熟可用的做法是：

1. 前端只负责写作、导入、上传和提交动作。
2. GitHub OAuth 的 `client_secret` 放在 Vercel Serverless Function。
3. `/api/github/*` 完成登录校验、用户白名单校验、路径校验和 GitHub 写入。

GitHub Pages 是纯静态托管，不能运行这些 API，所以只能阅读文档，不能站内提交。

## GitHub OAuth App 配置

进入 GitHub：

```text
Settings -> Developer settings -> OAuth Apps -> New OAuth App
```

填写：

| 配置项 | 示例 |
| --- | --- |
| Application name | Justin Docs Writer |
| Homepage URL | `https://你的域名.vercel.app` |
| Authorization callback URL | `https://你的域名.vercel.app/api/github/oauth/callback` |

创建后得到：

- `Client ID`
- `Client Secret`

`Client Secret` 只能放在 Vercel 环境变量里，不能提交到 GitHub。

## Vercel 环境变量

在 Vercel 项目中进入：

```text
Settings -> Environment Variables
```

添加：

| 变量名 | 示例值 | 说明 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | OAuth App 的 Client ID | 公开 ID |
| `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret | 服务端密钥 |
| `GITHUB_OWNER` | `chizhang977` | 仓库拥有者 |
| `GITHUB_REPO` | `justin` | 仓库名 |
| `GITHUB_BRANCH` | `master` | 写入分支 |
| `GITHUB_ALLOWED_USERS` | `chizhang977` | 允许在线提交的 GitHub 用户，多个用户用英文逗号分隔 |
| `GITHUB_OAUTH_SCOPE` | `public_repo` | 公开仓库写入权限，私有仓库改成 `repo` |
| `GITHUB_ALLOWED_PREFIXES` | `docs/src/docs/,docs/src/index.md` | 允许编辑的 Markdown 路径 |

配置完成后，重新部署 Vercel。

## 新建文档流程

1. 打开首页。
2. 点击 `新建文档`。
3. 在写作页选择分类目录、文件名。
4. 在大面积写作区直接编辑 Markdown。
5. 需要查看排版效果时打开右侧预览。
6. 点击 `GitHub 登录` 完成授权。
7. 点击 `提交`。
8. 等待 Vercel 自动构建完成后访问新文档。

新建文档时会保存本地草稿。没有提交前，即使登录 GitHub 导致页面跳转，回到 `/write` 后也会恢复上次未提交的新建草稿。

## 编辑当前文档流程

1. 打开任意文档阅读页。
2. 点击文档信息栏中的 `在线编辑`。
3. 页面进入 `/write?path=当前文档路径`。
4. 如果未登录，会先显示登录面板，不会创建空白新文档。
5. 登录后自动读取当前文档内容。
6. 修改后点击 `提交`。
7. 提交成功后页面自动返回该文档阅读页。

这条流程不会让你手动选择目录，也不会误把“编辑当前文档”变成“新建文档”。

## 导入本地 Markdown

导入属于新建文档流程。

1. 打开 `/write`。
2. 点击左侧或顶部的 `导入`。
3. 选择本地 `.md`、`.markdown`、`.mdown` 文件，也可以拖入写作页设置区。
4. 系统自动读取标题：优先 frontmatter 的 `title`，其次第一个一级标题，最后使用文件名。
5. 确认分类目录、文件名和标题。
6. 点击 `提交` 写入 GitHub。

导入文件建议控制在 3MB 以内。导入后按新建文档提交，如果目标路径已经存在，接口会拒绝覆盖，避免误删已有内容。

## 图片上传

写作编辑器支持插入图片链接，也支持上传本地图片。

上传本地图片时，浏览器会把图片交给：

```text
/api/github/asset
```

接口会校验 GitHub 登录状态和用户白名单，然后把图片写入：

```text
docs/src/public/assets/uploads/YYYY/MM/
```

Markdown 中保存的图片路径类似：

```markdown
![图片说明](/assets/uploads/2026/06/20260619093000-linux-demo-a1b2c3.png)
```

支持的图片类型：

- `png`
- `jpg`
- `jpeg`
- `webp`
- `gif`
- `svg`

单张图片建议不超过 4MB。更大的截图或动图应先压缩，否则会影响仓库体积和页面加载速度。

## 编辑器交互

写作页使用自定义 Markdown 写作器，不再依赖第三方所见即所得编辑器。核心交互保持简单：

- 左侧窄工具栏负责新建、导入、上传图片和文档设置。
- 中间是大面积 Markdown 写作区，适合长文档连续输入。
- 顶部工具栏提供标题、加粗、代码块、表格、引用、列表和图片插入。
- 右侧预览默认收起，需要检查排版时再打开，避免长期占用写作空间。

文档站最终显示效果以 VitePress 构建结果为准。编辑器优先保证在线写入、上传、提交和阅读体验稳定，而不是强行模拟完整桌面 Markdown 软件。

## 安全边界

Markdown 编辑接口默认只允许写入：

```text
docs/src/docs/
docs/src/index.md
```

图片上传接口只写入：

```text
docs/src/public/assets/uploads/
```

同时建议保留：

```text
GITHUB_ALLOWED_USERS=chizhang977
```

这样即使其他 GitHub 用户进入 `/write` 并完成 OAuth 授权，也不能通过接口提交内容。

## 上线验收清单

1. 打开 Vercel 线上首页，点击 `新建文档`。
2. 确认 `/write` 能正常打开，编辑器能输入标题、段落、代码块、表格。
3. 点击 `GitHub 登录`，确认能跳转 GitHub OAuth。
4. 授权后确认能回到 `/write`，并显示当前 GitHub 用户。
5. 新建一篇测试文档并提交。
6. 到 GitHub 仓库确认 Markdown 文件已经生成。
7. 等待 Vercel 自动构建，确认线上能访问新文档。
8. 打开这篇文档，点击 `在线编辑`，确认能读取当前文档内容。
9. 修改后再次提交，确认 GitHub 产生新的 commit。
10. 在写作页插入一张小图片，确认图片文件写入 `docs/src/public/assets/uploads/`，线上文档能正常显示。

## 常见问题

### 提交后为什么页面没有马上变化

提交成功只代表 Markdown 或图片已经写进 GitHub。线上页面需要等待 Vercel 构建完成后才会更新。

### GitHub Pages 能不能站内提交

不能。GitHub Pages 没有服务端函数，无法安全保存 GitHub OAuth Secret。

### 为什么 OAuth scope 默认用 public_repo

这个博客仓库是公开仓库，`public_repo` 已经能满足公开仓库内容写入。只有当仓库改成私有仓库时，才需要把 `GITHUB_OAUTH_SCOPE` 改成 `repo`。
