# 部署到华为云 ECS，通过 Cloudflare Tunnel 暴露

## Status

accepted（2026-11-07 实施后有修订，见 Consequences）

## Context

应用需要一个常驻 Node 进程和 PostgreSQL，静态托管（Vercel）不再适用。华为云账号已有授权（`hcloud` KooCLI，region `cn-south-1`），Cloudflare 账号已有 `cloudflared` 与 `cert.pem`。

华为云大陆节点绑定域名要求 ICP 备案，备案周期 2–3 周，会直接杀死项目节奏。Cloudflare Tunnel 是出站连接，不需要在 ECS 上开放 80/443，也不需要备案即可提供服务。

目标机是一台 2 vCPU / 2 GB 的沙箱 ECS（`lockSource: hcss`，配置不可改、会到期），上面已经跑着 promptvault 的三容器与两条隧道。

## Decision

单台 ECS 上用 `docker compose` 跑两个容器：`app`（Next.js standalone，监听容器内 3000，不发布端口）、`cloudflared`（出站隧道）。镜像在**这台 ECS 本机上**通过 `docker compose up --build` 构建。

数据库不新起容器：复用已有的 `promptvault-ecs-db-1`（PostgreSQL 17），博客用独立的 database `blog` 与登录角色，通过外部 docker 网络 `promptvault-ecs_default` 访问。

上传的图片存本地 `/opt/blog/data/uploads`，通过 volume 挂载；备份脚本每天 `pg_dump` + `tar` 打包，保留 14 天。

## Consequences

- 证书、TLS、边缘缓存全部由 Cloudflare 提供，ECS 上不需要 Caddy / certbot，也没有开放任何入站端口。
- 原计划「CI 构建镜像 → 推 SWR → ECS 拉取」**没有采用**：Docker Hub 从这台机器不可达，改用华为云 SWR 的 docker.io 镜像代理拉基础镜像；4 GB swap 加到位后，本机构建实测可用（约 3 分钟）。CI 仍值得补，但它现在是可选优化而不是前置条件。
- 这台 ECS 是沙箱机型，到期会消失。迁移到正式 ECS 时只需换机器变量：镜像、compose 文件、隧道、备份脚本都不变。
- 与 promptvault 共用 PG 实例意味着它是一个共享故障域：PG 重启时博客一起抖；博客的高负载也可能影响 promptvault。31 篇文章的量级下接受这个代价。
- 博客的 DB 备份与 promptvault 的备份脚本是两份，各自独立运行。
