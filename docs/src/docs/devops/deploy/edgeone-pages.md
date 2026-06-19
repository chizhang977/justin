---
title: EdgeOne Pages 部署 VitePress
---

# EdgeOne Pages 部署 VitePress

EdgeOne Pages 适合部署 VitePress、Vue、React 这类前端静态站点。和 Vercel 类似，它可以连接 GitHub 仓库，提交代码后自动构建和发布。

这篇文档按当前项目 `chizhang977/justin` 编写。

## 当前项目参数

在 EdgeOne Pages 创建项目时，按下面填写：

| 配置项 | 值 |
| --- | --- |
| 代码仓库 | `chizhang977/justin` |
| 分支 | `master` |
| 项目根目录 | 留空或 `/` |
| 框架预设 | 其他 / 自定义 |
| 安装命令 | `npm ci` |
| 构建命令 | `npm run docs:build` |
| 输出目录 | `docs/.vitepress/dist` |
| Node 版本 | 优先选择 `20`，没有就选 `18` |

环境变量：

| 变量名 | 值 | 说明 |
| --- | --- | --- |
| `VITEPRESS_BASE` | `/` | EdgeOne 自定义域名或项目域名通常部署在根路径 |
| `VITEPRESS_SITE_URL` | `https://你的域名` | 生成 sitemap 时使用，没有域名前可以先不填 |

如果以后仍然保留 GitHub Pages，GitHub Pages 继续使用 `/justin/` 子路径；EdgeOne Pages 使用 `/` 根路径。当前配置已经支持通过 `VITEPRESS_BASE` 区分。

## 推荐流程

```text
1. 提交代码到 GitHub
2. 登录腾讯云 EdgeOne 控制台
3. 进入 Pages / Makers
4. 选择导入 Git 仓库
5. 授权 GitHub 并选择 chizhang977/justin
6. 填写构建命令和输出目录
7. 设置环境变量 VITEPRESS_BASE=/
8. 选择加速区域
9. 开始部署
10. 部署成功后用预览链接验证
11. 绑定自定义域名
12. 配置 HTTPS
```

腾讯云官方文档说明，Makers 支持通过导入 Git 仓库、模板、直接上传等方式创建项目，并且连接 Git 仓库后需要填写构建命令；新的提交推送到主干分支后会自动部署。

## 加速区域怎么选

EdgeOne Pages 的加速区域会影响节点和备案要求。

| 加速区域 | 是否适合你 | 备案要求 |
| --- | --- | --- |
| 中国大陆可用区 | 国内访问最好 | 添加自定义域名需要工信部备案 |
| 全球可用区 | 国内外都考虑 | 添加自定义域名需要工信部备案 |
| 全球可用区（不含中国大陆） | 暂时不备案的过渡方案 | 添加自定义域名不要求工信部备案 |

如果目标是解决国内访问慢的问题，最终应选择 **中国大陆可用区** 或 **全球可用区**，并完成备案。

如果你现在还没有备案，可以先选 **全球可用区（不含中国大陆）** 跑通部署流程，但这不算真正解决国内访问。

## 自定义域名

部署成功后，建议绑定自定义域名。

流程：

```text
1. 进入项目详情
2. 打开域名管理
3. 添加自定义域名
4. 按提示添加域名归属权验证记录
5. 添加 CNAME 解析记录
6. 配置 HTTPS 证书
7. 等待 DNS 生效
```

如果使用中国大陆可用区或全球可用区，域名需要先完成 ICP 备案。EdgeOne Pages 文档也说明，自定义域名添加后不会自动生成证书，建议手动完善 HTTPS 配置。

## 备案怎么理解

买域名本身不等于必须备案，关键看网站是否使用中国大陆节点。

| 场景 | 是否需要备案 |
| --- | --- |
| 域名 + Vercel | 通常不需要 |
| 域名 + Cloudflare Pages 普通海外节点 | 通常不需要 |
| 域名 + EdgeOne 全球可用区（不含中国大陆） | 不要求工信部备案 |
| 域名 + EdgeOne 中国大陆可用区 | 需要备案 |
| 域名 + 腾讯云大陆服务器 / CDN | 需要备案 |

长期来看，如果你的博客主要给国内访问，建议做备案后使用 EdgeOne 中国大陆节点。

## 部署后检查

打开站点后重点检查：

- 首页是否正常加载。
- 刷新文档详情页是否 404。
- 样式、图片、代码高亮是否正常。
- 搜索是否能打开。
- 在线编辑入口是否能正常走 GitHub OAuth。
- 浏览器控制台是否有 `/justin/assets/...` 这类 404。

如果出现 `/justin/assets/...` 404，说明 EdgeOne 构建时没有使用根路径。检查环境变量：

```text
VITEPRESS_BASE=/
```

## 回滚方式

EdgeOne Pages 支持通过部署记录重新部署。每次提交 GitHub 后会生成新的部署版本，如果新版本有问题，可以在构建部署列表中回到上一个可用版本。

## 和 Vercel 的关系

Vercel 可以继续保留，当作海外访问或备用部署。

推荐结构：

```text
GitHub 仓库
  -> Vercel：海外/备用
  -> EdgeOne Pages：国内主访问
  -> GitHub Pages：可保留，也可以后续停用
```

最关键的是：EdgeOne 构建时设置 `VITEPRESS_BASE=/`，GitHub Pages 构建时继续走默认 `/justin/`。
