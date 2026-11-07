# 部署到华为云 ECS，通过 Cloudflare Tunnel 暴露

## Status

accepted

## Context

应用需要一个常驻 Node 进程和 PostgreSQL，静态托管（Vercel）不再适用。华为云账号已有授权（`hcloud` KooCLI，region `cn-south-1`），Cloudflare 账号已有 `cloudflared` 与 `cert.pem`。

华为云大陆节点绑定域名要求 ICP 备案，备案周期 2–3 周，会直接杀死项目节奏。Cloudflare Tunnel 是出站连接，不需要在 ECS 上开放 80/443，也不需要备案即可提供服务。

## Decision

单台 ECS 上用 `docker compose` 跑三个容器：`app`（Next.js，监听 `127.0.0.1:3000`）、`db`（PostgreSQL，仅内网）、`cloudflared`（出站隧道）。

构建不在 ECS 上做——目标机是 2 vCPU / 2 GB 的沙箱机型（`lockSource: hcss`，配置不可改、会到期），`next build` 在 2 GB 上会 OOM。镜像由 GitHub Actions 构建并推送到华为云 SWR，ECS 只做 `docker compose pull && up -d`。

上传的图片存本地 `./data/uploads`，通过 volume 挂载；备份用 `pg_dump` + `tar` 打包上传到华为云 OBS。

## Consequences

- 证书、TLS、边缘缓存全部由 Cloudflare 提供，ECS 上不需要 Caddy / certbot。
- 这台 ECS 是沙箱机型，到期会消失。迁移到正式 ECS 时只需换机器变量：镜像、compose 文件、tunnel、备份脚本都不变。
- 2 GB 内存同时跑 PG + Next 偏紧，需要在 ECS 上配 4 GB swap 兜底运行时（构建不在此机发生）。
- 站点的可用性依赖 Cloudflare 的连通性。
