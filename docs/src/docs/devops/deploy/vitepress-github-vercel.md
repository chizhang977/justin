---
title: VitePress 同时部署 GitHub Pages 和 Vercel
---

# VitePress 同时部署 GitHub Pages 和 Vercel

这个项目同时考虑 GitHub Pages 和 Vercel。两者最大的差异是访问路径：

- GitHub Pages 当前地址是 `https://chizhang977.github.io/justin/`，站点部署在 `/justin/` 子路径下。
- Vercel 通常部署在根路径 `/`。

如果 VitePress 的 `base` 固定写成 `/justin/`，在 GitHub Pages 上正常，但在 Vercel 上会去加载 `/justin/assets/...`，导致页面样式和脚本找不到，表现就是页面空白或资源 404。

## 当前解决方案

配置文件会根据环境自动决定 `base`：

```ts
const isVercel = process.env.VERCEL === '1'
const base = process.env.VITEPRESS_BASE ?? (isVercel ? '/' : '/justin/')
```

含义：

- Vercel 构建时，平台会提供 `VERCEL=1`，因此 `base` 使用 `/`。
- GitHub Actions 构建时没有 `VERCEL=1`，因此默认使用 `/justin/`。
- 如果以后有特殊部署路径，可以手动设置 `VITEPRESS_BASE` 覆盖。

## Vercel 配置

项目根目录增加 `vercel.json`：

```json
{
  "framework": null,
  "installCommand": "npm ci",
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist",
  "cleanUrls": true
}
```

解释：

| 配置 | 作用 |
| --- | --- |
| `installCommand` | Vercel 安装依赖时执行 `npm ci` |
| `buildCommand` | 执行 VitePress 构建 |
| `outputDirectory` | 告诉 Vercel 静态文件输出目录 |
| `cleanUrls` | 让不带 `.html` 的路径也更容易访问 |

## GitHub Pages 配置

GitHub Actions 继续构建：

```bash
npm run docs:build
```

输出目录：

```text
docs/.vitepress/dist
```

因为 GitHub Pages 是仓库子路径访问，所以需要 `base: '/justin/'`。当前配置已经自动处理。

## 本地验证

本地不安装依赖时不能构建。安装依赖后可以运行：

```bash
npm run docs:dev
```

预览构建产物：

```bash
npm run docs:build
npm run docs:preview
```

如果想模拟 Vercel 根路径构建：

```bash
$env:VERCEL="1"
npm run docs:build
```

如果想模拟 GitHub Pages 子路径构建：

```bash
$env:VITEPRESS_BASE="/justin/"
npm run docs:build
```

## 常见问题

### 1. Vercel 页面空白

优先打开浏览器开发者工具，看 Network 是否有资源 404。

如果看到类似：

```text
/justin/assets/app.xxxx.js 404
```

基本就是 `base` 配错了。Vercel 应该使用 `/`，GitHub Pages 才使用 `/justin/`。

### 2. 图片不显示

VitePress 中 public 目录里的资源要从根路径写：

```md
![logo](/logo.svg)
```

组件里建议使用 `withBase()`：

```ts
import { withBase } from 'vitepress'
```

这样无论部署在 `/` 还是 `/justin/`，路径都会正确。

### 3. 直接在线写文档是否可行

可行，但不能让前端页面直接保存文件到仓库。浏览器没有权限写 GitHub 仓库，除非接入认证和 GitHub API。

比较稳的方案：

1. 先继续用 Markdown 写文档，保证目录和质量。
2. 后续接 Decap CMS 或 TinaCMS，通过 GitHub OAuth 登录后提交 Markdown。
3. 如果要完全自定义体验，可以用 Vercel Serverless Function 调 GitHub API 创建 commit 或 Pull Request。

安全原则：

- GitHub token 不能写在前端代码里。
- 写仓库必须经过登录授权。
- 最好走 Pull Request 或草稿流程，避免误操作直接改主分支。
