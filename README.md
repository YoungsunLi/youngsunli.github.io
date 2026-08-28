# Youngsun's Blog

> [https://lsun.net](https://lsun.net)

基于 [VitePress](https://vitepress.dev/) 与 [concise](https://github.com/YoungsunLi/vitepress-theme-concise) 主题的个人博客。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
```

## 构建与预览

```bash
npm run build    # 输出到 dist/
npm run preview  # 本地预览构建产物
```

## 写文章

在 `docs/posts/` 下新建 Markdown 文件，直接写正文即可：

```md
# 文章标题

正文……
```

标题取正文第一个 `#`，发布日期取该文件首次提交进 git 的时间，首页卡片按日期倒序自动收录。
需要固定日期时（例如发布后又做过修改），才在 frontmatter 里显式写：

```md
---
date: '2019-04-14'
---
```

文中图片放 `docs/img/`，用相对路径引用（如 `../img/foo.png`），构建时由 Vite 处理并加内容 hash。

侧边栏目录在 `docs/.vitepress/config.mts` 的 `themeConfig.sidebar` 中维护。

## 部署

- 自动：推送 `docs` 分支触发 `.github/workflows/deploy.yml`
  （需先在仓库 Settings → Pages 把 Source 切成 "GitHub Actions"）
- 手动：`./deploy.sh` —— 构建后把 `dist/` 强推到 `master` 分支

`CNAME` 和站点验证文件放在 `docs/public/`，构建时自动进入产物，不会因重新部署丢失。

> 发布日期依赖完整的 git 历史，CI 中需 `fetch-depth: 0`（workflow 里已设置）。

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.mts          # 站点配置
│   └── theme/
│       ├── index.ts        # 启用 concise 主题
│       └── posts.data.mts  # 构建时收集文章列表
├── posts/                  # 文章
├── img/                    # 文章配图
├── public/                 # 原样拷贝到产物根目录（CNAME、favicon、站点验证文件）
├── about/
└── index.md                # 首页
```

主题（版式、卡片、分页、配色）在独立仓库 [vitepress-theme-concise](https://github.com/YoungsunLi/vitepress-theme-concise) 中维护。

## License

[MIT](LICENSE)
