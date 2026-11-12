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

## 服务器监控

- 博客页脚的 `/status` 只显示在线/离线数量；`/admin/status` 沿用博客登录，显示多台服务器的 CPU、内存、磁盘、网络、负载和历史曲线。
- 采集由 Nezha Dashboard 2.6.1 + 官方 agent 2.4.0 完成。当前仅接入华南 ECS；添加 agent 后会自动出现在列表。Dashboard 在 `/opt/nezha`，仅绑定 `127.0.0.1:8008` 并接入 `blog-web` 网络。
- `/opt/blog/.env` 设置 `NEZHA_API_URL=http://nezha-dashboard:8008` 和 `NEZHA_API_TOKEN`。PAT 仅授予 `nezha:inventory:read`、`nezha:server:read`，不放入浏览器或 `NEXT_PUBLIC_`。Dashboard 配置 `force_auth: true`。
- TSDB 配置 `data_path: /dashboard/data/tsdb`、`retention_days: 90`、`max_memory_mb: 64`。当前上游 API 提供 1/7/30 天查询；采样从安装时开始，不回填旧数据。页面 5 秒更新实时读数、60 秒更新选中的历史指标，隐藏标签页暂停请求。
- 公共子域 `status.kythron.com` 跳回博客 `/status`。Nezha 管理面板不通过该子域开放；维护可用 SSH 本地转发 `ssh -L 18008:127.0.0.1:8008 <server>` 后访问 `http://localhost:18008/dashboard`。无需 GitHub OAuth。
- 部署描述见 `deploy/nezha/compose.yaml`（复制到 `/opt/nezha/docker-compose.yml`，保留原 `data/`）。本机 agent 通过 loopback 上报；额外机器需先建立到 Dashboard 的私网或 SSH 转发通道，不能把公开状态页当作 agent 接入地址。
- 每日备份会短暂停止 Dashboard，对 SQLite 和 TSDB 一起打包再恢复，避免不一致热备。博客保持运行；采集中断期间的数据不会回填。部署后 cron 调用 `bash /opt/blog/deploy/backup-daily.sh`。
- 验证：`npm run selfcheck`；访问控制可运行 `node --experimental-strip-types scripts/probe-check.mts http://localhost:3101`。

## 文档

- `GLOSSARY.md` — 项目术语
- `docs/adr/` — 架构决策记录
- `docs/agents/` — issue tracker / triage 标签 / 领域文档约定
