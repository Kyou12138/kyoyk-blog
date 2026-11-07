# Kyou Blog

个人技术笔记站，兼作全栈能力的展示面。Next.js 15 App Router + PostgreSQL，自己写的鉴权、搜索、加密笔记，部署在华为云 ECS 上，经 Cloudflare Tunnel 暴露。

线上：<https://kythron.com>

## 本地开发

```bash
npm install
cp .env.example .env.local   # 填 DATABASE_URL / AUTH_SECRET / AUTH_PASSWORD_HASH
npm run db:migrate           # 建表（幂等）
npm run db:seed              # 把 blog/ 下的 Markdown 导入数据库（可选）
npm run dev
```

生成后台密码：

```bash
npm run auth:hash -- '你的密码'
# 输出 AUTH_PASSWORD_HASH 和 AUTH_SECRET，写进 .env.local
```

## 数据模型

| 表 | 用途 |
|---|---|
| `posts` | 笔记本体。`status` 为 `draft` / `published` / `private`；私有时正文在 `secret`（AES-256-GCM），`body` 为空 |
| `tags` / `post_tags` | 自由多值标签 |
| `post_revisions` | 每次保存留一份快照 |
| `assets` | 上传图片的 sha256 索引，文件本身在 `DATA_DIR/uploads` |

文章地址由发布时间推导：`/blog/YYYY/MM/DD/<slug>`，与迁移前的 Docusaurus 站完全一致。

## 部署

服务器上 `/opt/blog`：

```bash
docker compose -f deploy/compose.ecs.yaml --env-file .env up -d --build
```

- 应用与 Cloudflare 隧道都在 `docker compose` 里；容器不对外开任何端口。
- 数据库复用同机的 `promptvault` PostgreSQL 实例（独立 database 与 role）。
- 备份：`deploy/backup-daily.sh`，cron 每天 03:20，保留 14 天。
- 发布：`deploy/deploy.sh`。

基础镜像走华为云 SWR 镜像代理（`NODE_IMAGE` / `TUNNEL_IMAGE` 环境变量覆盖），npm 走 `npmmirror`。

## 文档

- `GLOSSARY.md` — 项目术语
- `docs/adr/` — 架构决策记录
- `docs/agents/` — issue tracker / triage 标签 / 领域文档约定
