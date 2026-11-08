# 迁移到 Next.js 全栈 + PostgreSQL

## Status

accepted

## Context

原站是 Docusaurus 3.7 静态站：31 篇 Markdown 在仓库里，`npm run build` 出静态文件，部署在 Vercel。搜索用 Algolia DocSearch，加密笔记靠前端 PBKDF2 遮蔽 UI（正文仍在静态 HTML 里）。

作者要的是**在线写作**，并且这个站同时是给简历看的作品。在线写作本身不需要数据库（编辑器提交 Markdown 到仓库即可），但后续要长出来的东西——草稿态、私有笔记、服务端搜索、图片上传、真实鉴权——都需要服务端身份与写库。

## Decision

全站替换为 Next.js App Router + PostgreSQL，DB 成为 Post 的唯一真相源，Markdown 文件一次性导入后归档。

内容模型：`posts`（含 `status: draft|published|private`）、`tags`、`post_tags`、`post_revisions`（每次保存留一版）、`assets`（上传的图片）。

## Considered options

- **静态站 + commit 式后台**：编辑器用 `octokit` 提交 Markdown，Docusaurus 不动。最省，但拿不到草稿态、私有笔记、服务端搜索，简历上也讲不出"全栈"。
- **保留 Docusaurus + 独立管理应用**：两个部署、两套鉴权、内容同步靠 webhook。复杂度比全栈更高。
- **Docusaurus + 插件式后端**：Docusaurus 的 blog 插件不支持从 DB 取内容，改造成本超过重写。

## Consequences

- 文章历史不再体现在 git log，改由 `post_revisions` 表记录。
- Algolia DocSearch 移除，采用双层搜索架构对齐体验与性能：
  - **全局即时搜索（快捷键 Ctrl+K 浮层）**：按需拉取轻量 JSON 索引（`/api/search-index`，仅含已发布笔记的标题、地址、标签与摘要，首屏免载，约几 KB），实现零网络往返延迟的即时过滤与键盘快捷导航；
  - **列表深度检索（`/blog?q=...` 与无 JS 降级）**：直通后端 PostgreSQL 原生 `ILIKE` 查询（覆盖正文 `body` 全文），数据量扩大后平滑升级为 `pg_trgm` GIN 索引。
- `dev/nextjs-migration` 分支不 merge，只取 `src/lib/db.ts` 的连接/SSL 降级逻辑与 seed 脚本的 frontmatter 解析。
- 全站从"零运维静态托管"变成"需要一台机器 + 一个数据库"，见 ADR-0002。
