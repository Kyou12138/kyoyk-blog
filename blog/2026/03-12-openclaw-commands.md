---
title: OpenClaw 速查表
description: OpenClaw常见命令速查
tags: [ai]
---

## OpenClaw 速查表

### 1) 快速安装（Quick Installation）
```bash
npm install -g openclaw@latest
openclaw onboarding --install-daemon
```

**全局参数（Global Flags）**

- `--dev`：使用隔离状态目录 `~/.openclaw-dev/`
- `--profile <name>`：使用隔离状态目录 `~/.openclaw-<name>/`
- `--json`：输出机器可读 JSON
- `--no-color`：关闭 ANSI 彩色输出

---

### 2) 核心 CLI 命令（Core CLI Commands）
**网关 / 服务**
- `openclaw gateway [--port]`：运行 WebSocket 网关服务器
- `openclaw gateway start|stop|restart`：管理网关服务（启动/停止/重启）

**渠道（Channels）**
- `openclaw channels login`：WhatsApp 扫码配对（QR pairing）
- `openclaw channels add [--token]`：添加 Telegram/Discord/Slack 机器人（通常需要 token）
- `openclaw channels status --probe`：检查渠道健康状态

**初始化与诊断**
- `openclaw onboard`：交互式引导设置（Setup Wizard，图中提示可带 `--install-daemon`）
- `openclaw doctor [--deep]`：健康检查 + 快速修复（深度诊断用 `--deep`）

**配置与模型**
- `openclaw config get|set|unset`：读取/写入/删除配置项
- `openclaw models list|set|status`：模型管理 + 授权状态
- `openclaw models auth setup-token`：授权流程（图中标注为偏好的 Anthropic token 授权方式）

---

### 3) 渠道管理（Channel Management）
- **WhatsApp**
  - `openclaw channels login`（QR Scan）
- **Telegram**
  - `openclaw channels add --channel telegram`（Bot Token）
- **Discord**
  - `openclaw channels add --channel discord`（Bot Token）
- **iMessage**
  - `macos bridge`（macOS 原生桥接）
- **Slack**
  - `openclaw channels add --channel slack`（Bot Token）

---

### 4) 工作区结构（Workspace Anatomy）
工作区根目录（Root）：
- `~/.openclaw/workspace`

常见文件（用于“人格/偏好/记忆/启动”等）：
- `AGENTS.md`：指令（Instructions）
- `SOUL.md`：人设/语气（Persona / Tone）
- `USER.md`：用户偏好（Preferences）
- `IDENTITY.md`：名称/主题（Name / Theme）
- `MEMORY.md`：长期记忆（Long-term）
- `memory/YYYY-MM-DD.md`：日志（Logs）
- `HEARTBEAT.md`：检查清单（Checklist）
- `BOOT.md`：启动项（Startup）

---

### 5) 聊天内斜杠命令（In-chat Slash Commands）
- `/status`：健康状态 + 上下文（Health + Context）
- `/context list`：查看上下文贡献者（Context contributors）
- `/model <m>`：切换模型（Switch model）
- `/compact`：释放窗口空间（Free up window space）
- `/new`：新会话（Fresh session）
- `/stop`：中止当前运行（Abort current run）
- `/tts on|off`：开关语音（Toggle speech）
- `/think`：开关“推理/思考”模式（Toggle reasoning）

---

### 6) 关键路径（Essential Path Map）
- 主配置（Main config）：`~/.openclaw/openclaw.json`
- 默认工作区（Default workspace）：`~/.openclaw/workspace/`
- Agent 状态目录（Agent state）：`~/.openclaw/agents/<id>/`
- OAuth & API Keys：`~/.openclaw/credentials/`
- 向量索引库（Vector index store）：`~/.openclaw/memory/<id>.sqlite`
- 全局共享技能（Global shared skills）：`~/.openclaw/skills/`
- 网关日志（Gateway file logs）：`/tmp/openclaw/*.log`

---

### 7) 记忆 & 模型（Memory & Models）
- 向量检索（Vector Search）
  - `openclaw memory search "X"`
- 切换模型（Model Switch）
  - `openclaw models set <model>`
- 授权设置（Auth Setup）
  - `openclaw models auth setup`

---

### 8) Hooks & Skills
- 安装技能（ClawHub）
  - `clawhub install <slug>`
- 查看 hooks 列表
  - `openclaw hooks list`

---

### 9) 自动化 & 研究（Automation & Research）
- 浏览器（Browser）
  - `browser start` / `browser screenshot`
- 子代理（Subagents）
  - `/subagents list` / `/subagents info`
- 定时任务（Cron jobs）
  - `cron list` / `cron run <id>`
- 心跳（Heartbeat）配置示例
  - `heartbeat.every: "30m"`

---

### 10) 语音 & TTS（Voice & TTS）
- OpenAI / ElevenLabs：Premium
- Edge TTS：免费（No API key）
- 配置项示例：
  - `messages.tts.auto: "always"`

---

### 11) 故障排查（Troubleshooting）
- **私聊不回复（NO DM REPLY）**
  - `pairing list` → `approve`
- **群里不说话（SILENT IN GROUP）**
  - 检查 `mentionpatterns` 配置
- **授权过期（AUTH EXPIRED）**
  - `openclaw models auth setup-token`
- **网关挂了（GATEWAY DOWN）**
  - `openclaw doctor --deep`
- **记忆异常（MEMORY BUG）**
  - `openclaw memory index`
