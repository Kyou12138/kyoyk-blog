# 以 kythron.com 为唯一 canonical 域，保留现有 URL 结构

## Status

accepted

## Context

现状：`kythron.com`、`www.kythron.com`、`blog.kyoyk.top` 三个域名并列指向同一个 Vercel 上的 Docusaurus 部署，`og:url` 固定写 `https://blog.kyoyk.top/`。同一份内容多个域名服务会产生重复内容，登录 cookie 也会按域分裂。

已发布文章地址形如 `/blog/2026/03/10/ticket`，已进入外链、RSS 历史与 Algolia 索引。

## Decision

`kythron.com` 为唯一 canonical。`www.kythron.com`、`blog.kythron.com`、`blog.kyoyk.top` 全站 301 到 `kythron.com` 的同路径地址。

Docusaurus 的路由（`/`、`/blog/...`、`/proj`、`/about`）原样搬到 apex，因此重定向只需替换 host，不需要路径映射表。

`/admin` 只在 canonical 域可用，非 canonical 域一律先 301，避免会话在多个域间分裂。

## Considered options

- **以 `blog.kythron.com` 为 canonical**：可以省掉 apex 上 `/blog` 前缀的重复，但品牌域落在子域上，且所有路径仍要带 `/blog`。
- **以 `blog.kyoyk.top` 为 canonical**：不需要任何重定向，但对简历展示而言域名叙事偏弱，且与 Kythron 品牌脱节。

## Consequences

- Sitemap、RSS、`og:url`、`canonical` 全部基于 `kythron.com` 生成，域名只从环境变量读。
- 旧 Algolia 索引随 ADR-0001 一并废弃，重新建索引的话目标是 `kythron.com`。
