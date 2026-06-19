# 在线写作与 GitHub 提交

这个站点可以提供一个 `/write` 在线写作页，用来新建或编辑 Markdown 文档。它的写入链路是：

```text
浏览器写 Markdown
  -> Vercel Serverless API
  -> GitHub OAuth 校验身份
  -> GitHub Contents API 写入 docs/src/docs
  -> Vercel 或 GitHub Pages 自动重新构建
```

## 为什么不能纯前端直接提交

浏览器页面本身不能安全保存 GitHub token。只要把 token 写进前端代码、环境变量或构建产物里，任何访问网站的人都有机会拿到它，然后直接修改仓库。

所以成熟可用的做法是把 GitHub OAuth 的 `client_secret` 放在服务端，也就是 Vercel Serverless Function 里。前端只负责编辑内容，真正的 token 交换和 GitHub 写入都在 `/api/github/*` 中完成。

## 适用部署方式

| 部署方式 | 是否支持站内提交 | 说明 |
| --- | --- | --- |
| Vercel | 支持 | 可以运行 `/api/github/*` Serverless Function |
| GitHub Pages | 不支持 | 纯静态站点，没有服务端能力 |
| GitHub Pages 降级方案 | 支持跳转编辑 | `/write` 会提示使用 GitHub 网页编辑 |

## GitHub OAuth App 配置

进入 GitHub：`Settings -> Developer settings -> OAuth Apps -> New OAuth App`。

需要填写：

| 配置项 | 示例 |
| --- | --- |
| Application name | Justin Docs Writer |
| Homepage URL | `https://你的域名.vercel.app` |
| Authorization callback URL | `https://你的域名.vercel.app/api/github/oauth/callback` |

创建后会得到：

- `Client ID`
- `Client Secret`

`Client Secret` 只能放在 Vercel 环境变量里，不能提交到 GitHub。

注意：OAuth 回调地址必须和实际访问 `/write` 的域名一致。建议使用 Vercel 的 Production 域名或你绑定的自定义域名测试，不要使用每次都会变化的 Preview 域名。

## Vercel 环境变量

在 Vercel 项目中进入 `Settings -> Environment Variables`，添加：

| 变量名 | 示例值 | 说明 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | OAuth App 的 Client ID | 公开 ID |
| `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret | 服务端密钥 |
| `GITHUB_OWNER` | `chizhang977` | 仓库拥有者 |
| `GITHUB_REPO` | `justin` | 仓库名 |
| `GITHUB_BRANCH` | `master` | 写入分支 |
| `GITHUB_ALLOWED_USERS` | `chizhang977` | 允许在线提交的 GitHub 用户，多个用户用英文逗号分隔 |
| `GITHUB_OAUTH_SCOPE` | `public_repo` | 公开仓库写入权限，私有仓库才改成 `repo` |
| `GITHUB_ALLOWED_PREFIXES` | `docs/src/docs/,docs/src/index.md` | 允许编辑的路径白名单 |

配置完成后重新部署 Vercel。

## 使用流程

1. 打开 `/write`。
2. 点击 `GitHub 登录`。
3. 授权后回到写作页。
4. 选择 `编辑` 或 `新建`。
5. 使用 `实时` 模式写 Markdown 内容；需要看源码或左右对照时，可以切换到 `编辑`、`分屏` 或 `预览`。
6. 填写提交说明。
7. 点击 `提交`。
8. 等待 Vercel 或 GitHub Pages 自动构建完成。

## 实时写作模式

`/write` 默认进入 `实时` 模式。这个模式不是富文本改写 Markdown，而是按 Markdown 块进行编辑：当前正在编辑的标题、段落、列表、表格或代码块显示源码，其他内容实时渲染成最终阅读效果。

这种方式适合技术文档，因为命令、代码块、表格和 frontmatter 不会被富文本编辑器偷偷改格式。需要一次性大范围调整源码时，切换到 `编辑` 模式即可；需要对照阅读效果时，切换到 `分屏` 模式。

## 导入本地 Markdown

在线写作页支持把本地 `.md`、`.markdown`、`.mdown` 文档导入到编辑器，然后沿用同一套 GitHub 提交流程写入仓库。

导入流程：

1. 打开 `/write`。
2. 点击 `导入` 或在左侧设置区选择本地 Markdown 文件。
3. 系统会自动读取文档标题：优先读取 frontmatter 的 `title`，其次读取第一个一级标题，最后使用文件名。
4. 确认 `分类目录`、`文件名`、`标题`。
5. 检查预览内容。
6. 点击 `提交`，等待 Vercel 自动构建。

导入后的文档会按 `新建` 模式提交。如果目标路径已经存在，接口会拒绝覆盖并提示切换为编辑模式，这样可以避免误覆盖已有文档。单个导入文件建议控制在 3MB 以内，图片、压缩包等资源不要直接内嵌到 Markdown 里。

## 安全边界

当前接口只允许编辑 Markdown，并且默认限制在：

```text
docs/src/docs/
docs/src/index.md
```

这样可以避免在线编辑器误改 `.vitepress` 配置、构建脚本、接口代码或仓库其他文件。

同时建议保留：

```text
GITHUB_ALLOWED_USERS=chizhang977
```

这样即使其他 GitHub 用户进入 `/write` 并完成 OAuth 授权，也不能通过接口提交文档。

## 上线验收清单

部署完成后按这个顺序检查：

1. 打开 `/write`，确认页面能正常显示。
2. 点击 `GitHub 登录`，确认能跳转到 GitHub OAuth 授权页。
3. 授权后确认能回到 `/write`，并显示当前 GitHub 用户。
4. 新建一篇测试文档，例如 `docs/src/docs/linux/linux/vercel-editor-test.md`。
5. 点击 `提交`，确认页面返回 commit 链接。
6. 到 GitHub 仓库确认新 Markdown 文件已经生成。
7. 等待 Vercel 重新构建，确认线上能访问新文档。
8. 删除测试文档或继续修改它，再提交一次，确认编辑已有文档也可用。

## 常见问题

### 提交后页面为什么没有马上变化

提交成功只代表 Markdown 已经写进 GitHub。线上页面需要等待 Vercel 或 GitHub Pages 构建完成后才会更新。

### GitHub Pages 能不能也站内提交

不能。GitHub Pages 只能托管静态文件，没有服务端函数，无法安全保存 GitHub OAuth Secret。

### 为什么 OAuth scope 默认用 `public_repo`

这个博客仓库是公开仓库，`public_repo` 已经能满足公开仓库内容写入。只有当仓库改成私有仓库时，才需要把 `GITHUB_OAUTH_SCOPE` 改成 `repo`。
