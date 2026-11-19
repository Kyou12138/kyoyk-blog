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
| `posts` | 笔记本体。`status` 为 `draft` / `published` / `private`；私有时正文只存在 `secret`（AES-256-GCM，密钥由 `AUTH_SECRET` 派生），`body` 为空 |
| `tags` / `post_tags` | 自由多值标签 |
| `post_revisions` | 每次保存留一份快照 |
| `assets` | 上传图片的 sha256 索引，文件本身在 `DATA_DIR/uploads` |

文章地址由发布时间推导：`/blog/YYYY/MM/DD/<slug>`，与迁移前的 Docusaurus 站完全一致。

## 皮肤

页头右侧的圆盘按钮在几套皮肤间轮换，选择记在 `localStorage` 的 `kyou-skin`，首屏由 `layout.tsx` 里的内联脚本在绘制前落定，不会先闪一下默认色。皮肤只换 token（配色、圆角、字面），不动布局与数据：

| 皮肤 | 说明 |
|---|---|
| `gold` 原版 | 雾蓝白纸 + 金，迁移前 Docusaurus 站的配色（默认） |
| `ink` 曜石 | 墨黑底 + 琥珀，迁移后那版 Linear 风格暗色站 |
| `paper` 纸墨 | 暖棉纸 + 朱砂，Editorial 版式自带配色 |

新增一套 = `src/lib/skins.ts` 加一项 + `globals.css` 末尾加一段 `html[data-skin="…"]` 覆盖。画布类组件（如 `KnowledgeGraph`）读不到 CSS 变量，需监听 `data-skin` 变化后重读 `getComputedStyle` 再重绘。

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

### Instabox 主机

当前额外接入 3 台 Instabox 沙箱（`claude-code-7x24`、`claude-code-7x24-1`、`k-1`）。它们不在 ECS 内网，因此每台用一条反向受限的 SSH 本地转发把 Dashboard 映射到自己的 `127.0.0.1:18008`：

- ECS 上存在系统用户 `nezha-tunnel`，`/etc/ssh/sshd_config.d/60-nezha-tunnel.conf` 限定它只能公钥登录、只能转发到 `127.0.0.1:8008`、无 TTY 无 shell。每台机器的公钥单独授权，注释即机器名，删除对应行即可吊销。
- 每台机器上两个 systemd 单元（本目录的 `instabox-tunnel.service` / `instabox-agent.service`）开机自启并在断开后 10 秒重连；`/opt/nezha-agent` 存放 agent、独立密钥和 0600 配置（含 agent 密钥）。
- 沙箱休眠时 agent 上报中断，页面显示离线并附最后读数；恢复后转发重建，无需手工干预。
- 新增机器：复用同样两个单元，按机器名新建一对密钥并在 ECS 的 `authorized_keys` 追加一行，再为该机器准备一份 `config.yml`（uuid 随机、`server: 127.0.0.1:18008`）。
- 每日备份会短暂停止 Dashboard，对 SQLite 和 TSDB 一起打包再恢复，避免不一致热备。博客保持运行；采集中断期间的数据不会回填。部署后 cron 调用 `bash /opt/blog/deploy/backup-daily.sh`。
- 验证：`npm run selfcheck`；访问控制可运行 `node --experimental-strip-types scripts/probe-check.mts http://localhost:3101`。

## 文档

- `GLOSSARY.md` — 项目术语
- `docs/adr/` — 架构决策记录
- `docs/agents/` — issue tracker / triage 标签 / 领域文档约定
