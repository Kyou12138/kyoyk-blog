---
title: Codex CLI 速查（2026）
description: Codex CLI 的安装、登录、快捷键、斜杠命令、启动参数与配置实战速查。
tags: [ai, other]
---
# Codex CLI 速查表

cx 和 cc 定位差不多，但设计思路有不少区别——cx 有内置沙盒、用 TOML 配置、项目指令文件叫 AGENTS.md 而不是 CLAUDE.md。下面把我日常用到的命令和踩过的坑都整理了一下，希望对各位有帮助。

*有错误或遗漏欢迎指出，我会持续更新~*

`2026 版`

> 参考来源：[OpenAI 官方文档](https://developers.openai.com/codex/cli/)、[GitHub 仓库](https://github.com/openai/codex)、[CLI 命令参考](https://developers.openai.com/codex/cli/reference/)、[配置参考](https://developers.openai.com/codex/config-reference/) 等，加上自己使用中的一些总结

<!--truncate-->

---

## 首要任务——安装与登录

先说前提：**Node.js >= 22** 是硬性要求，版本低了装不上。账号方面需要 ChatGPT Plus/Pro/Team/Business/Edu 订阅

### macOS / Linux 装法（简单）

```bash
# npm 全局安装，一行搞定
npm i -g @openai/codex

# macOS 也可以 brew（装的是桌面应用版本）
brew install --cask codex

# 验证
codex --version
```

### Windows 装法（重点讲讲）

Windows 目前有两种方式跑 cx，各有利弊：

#### 方式一：WSL2（推荐，体验最好）

cx 官方说了 Windows 支持还是**实验性**的，WSL2 是目前最稳的方案。原理就是在 Windows 里跑一个 Linux 子系统，cx 跑在 Linux 环境里，兼容性拉满。

**第一步：装 WSL**

打开 PowerShell（管理员），跑一行：

```powershell
wsl --install
```

装完会提示重启，重启后会自动进入 Ubuntu 的初始化，设个用户名密码就行。

如果之前装过但版本是 WSL1，建议升级到 WSL2：

```powershell
wsl --set-default-version 2
```

**第二步：在 WSL 里装 Node.js**

Ubuntu 自带的 Node 版本太老，别用 apt 装，用 nvm：

```bash
# 装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# 重新开一个终端，或者 source 一下
source ~/.bashrc

# 装 Node 22
nvm install 22

# 验证
node -v   # 应该显示 v22.x.x
npm -v
```

**第三步：装 Codex CLI**

```bash
npm i -g @openai/codex
codex --version
```

**第四步：把项目放对地方**

这个很重要——**项目要放在 Linux 文件系统里**，别放在 `/mnt/c/` 下面。跨文件系统 IO 会很慢，Git、Docker、测试啥的都会卡。

```bash
# 好的做法：项目放在 Linux home 下
mkdir -p ~/code && cd ~/code
git clone your-repo

# 不好的做法：从 Windows 盘符访问
cd /mnt/c/Users/xxx/project  # 别这么干，会很慢
```

**VS Code 配合 WSL 用**

装个 VS Code 的 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)，然后在 WSL 终端里：

```bash
cd ~/code/my-project
code .    # 会自动用 WSL 模式打开 VS Code
```

这样 VS Code 的终端也是 WSL 环境，cx 跑起来没问题。

#### 方式二：原生 Windows（PowerShell，能用但有坑）

如果不想折腾 WSL，也可以直接在 PowerShell 里跑。先确保 Node >= 22 装好了（可以去 [nodejs.org](https://nodejs.org) 下安装包，或者用 `winget install OpenJS.NodeJS`）。

```powershell
npm i -g @openai/codex
codex --version
```

原生 Windows 下 cx 用的是**实验性的 Windows 沙盒**：
- 通过 Restricted Token + 文件系统 ACL 限制写入范围
- 创建专用的 Windows Sandbox User 执行命令
- 用 Windows 防火墙规则限制网络访问

听着挺靠谱的，但实际用下来偶尔会有权限问题，Win10 上比 Win11 更容易出问题。如果你主要在 Windows 上开发而且不想装 WSL，可以试试，遇到问题再切 WSL。

#### Windows 踩坑汇总

| 问题                            | 解决办法                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| WSL 里 `codex` 登录弹不出浏览器 | 复制终端里显示的 URL，手动在 Windows 浏览器里打开            |
| `/mnt/c/` 下项目跑得慢          | 把项目移到 `~/code/` 下                                      |
| 原生 Windows 沙盒报权限错       | 试试用管理员权限跑 PowerShell，或者切 WSL                    |
| Node 版本不对                   | `node -v` 检查，低于 22 就用 nvm 重装                        |
| npm 全局安装报 EACCES           | WSL 里用 nvm 装的 Node 一般没这问题；原生 Windows 试试管理员 PowerShell |

### 认证登录

| 命令                                                    | 说明                                     |
| ------------------------------------------------------- | ---------------------------------------- |
| `codex`                                                 | 首次启动自动弹浏览器，ChatGPT 账号登录   |
| `codex login`                                           | 手动触发浏览器 OAuth                     |
| `codex login --device-code`                             | 设备码登录，SSH 远程机器没浏览器就用这个 |
| `printenv OPENAI_API_KEY \| codex login --with-api-key` | API Key 登录                             |

登录后 token 保存在 `~/.codex/token`。WSL 环境下就是 Linux 的 home 目录，原生 Windows 下是 `%USERPROFILE%\.codex\token`。

## 快捷键

cx 的快捷键比 cc 少一些，而且目前**不支持自定义**（社区有人提了 [feature request](https://github.com/openai/codex/issues/3049) 但还没实现）。

### 基础操作

| 按键            | 作用                                           |
| --------------- | ---------------------------------------------- |
| `Enter`         | 发送消息                                       |
| `Esc`           | 取消当前请求                                   |
| `Esc Esc`       | 编辑上一条消息（这个挺实用，说错了可以直接改） |
| `Ctrl+C`        | 中断当前操作                                   |
| `Ctrl+C Ctrl+C` | 强制退出（按两次，一次可能不够）               |
| `Ctrl+D`        | 退出 Codex                                     |
| `Ctrl+K`        | 清屏                                           |
| `Ctrl+O`        | 选择 Codex Cloud 环境                          |

### 编辑与导航

| 按键          | 作用                                                      |
| ------------- | --------------------------------------------------------- |
| `Up` / `Down` | 翻之前的输入历史，不用重新打字                            |
| `Tab`         | 自动补全                                                  |
| `@`           | 引用文件（模糊搜索，跟 cc 的 @ 一样好用）                 |
| `!command`    | 内联跑 Shell 命令，比如 `!ls`、`!git status`，不用退出 cx |

`@` 引用文件是我用得最多的，比复制粘贴代码省 token 多了。

<!--truncate-->

---

## 会话里的斜杠命令

在输入框里打 `/` 会弹出命令面板，下面按用途分类。

### 会话控制

| 命令              | 说明                                                       |
| ----------------- | ---------------------------------------------------------- |
| `/compact`        | 压缩上下文，聊太久 token 爆了就靠这个续命                  |
| `/diff`           | 看当前 Git 差异，改了哪些文件一目了然                      |
| `/review`         | 让另一个 Codex 代理审查你的代码（相当于找了个同事 review） |
| `/resume`         | 恢复之前的对话                                             |
| `/fork`           | 把当前对话克隆一份到新线程，想试不同方案的时候很好用       |
| `/plan`           | 进入计划模式——只规划不执行，先看方案再动手                 |
| `/quit` / `/exit` | 退出                                                       |

`/compact` 真的建议多用，现在上下文还不是很长，聊久了上下文膨胀得很快，每次一个任务对话完成之后压缩一下能省不少钱。

### 配置与模型

| 命令            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| `/model`        | 切换模型或调推理级别                                         |
| `/personality`  | 切性格：friendly（话多热情）、pragmatic（干练务实）、none（纯工具人） |
| `/permissions`  | 调权限                                                       |
| `/status`       | 看当前工作目录、模型、token 用了多少                         |
| `/agent`        | 管理代理                                                     |
| `/experimental` | 开实验性功能（比如 Multi-agents），改完要重启                |

`/personality pragmatic` 我个人比较喜欢，不废话直接干活。

### 开发与工具

| 命令            | 说明                                                   |
| --------------- | ------------------------------------------------------ |
| `/init`         | 在项目里创建 AGENTS.md，**新项目第一件事建议就做这个** |
| `/skills`       | 浏览和插入技能                                         |
| `/mcp`          | 列出已连接的 MCP 工具                                  |
| `/theme`        | 换主题配色                                             |
| `/statusline`   | 自定义底部状态栏显示啥                                 |
| `/debug-config` | 看配置加载顺序，排查配置问题的时候很有用               |

### 会话持久化

| 命令                   | 说明                                     |
| ---------------------- | ---------------------------------------- |
| `/export session.json` | 导出当前会话                             |
| `/load session.json`   | 加载之前的会话继续干（适合跨天的大重构） |

<!--truncate-->

---

## 启动参数怎么用

### 基础启动

| 命令                  | 说明                                             |
| --------------------- | ------------------------------------------------ |
| `codex`               | 启动交互式 TUI                                   |
| `codex "你的任务"`    | 带着问题直接启动                                 |
| `codex exec "任务"`   | 非交互式执行（别名 `codex e`），跑脚本/CI 用这个 |
| `codex resume`        | 恢复之前的会话                                   |
| `codex resume --last` | 直接恢复最近一次，不用选                         |
| `codex resume --all`  | 包括其他目录的会话也能恢复                       |
| `codex fork`          | 分叉之前的会话                                   |
| `codex fork --last`   | 分叉最近一次会话                                 |

`codex resume --last` 相当于 cc 的 `claude -c`，恢复上次对话。

### 模型与行为

| 参数               | 说明                                                |
| ------------------ | --------------------------------------------------- |
| `--model <model>`  | 指定模型，如 `gpt-5-codex`、`gpt-5.3-codex`         |
| `--full-auto`      | 全自动模式，等于 `-a on-request -s workspace-write` |
| `-a never`         | 从不暂停请求人工审批                                |
| `-a on-request`    | 需要时才问你（交互式推荐）                          |
| `--path <dir>`     | 指定工作目录                                        |
| `--add-dir <path>` | 添加额外的可写目录，可重复用                        |
| `--search`         | 开启实时网页搜索（默认是缓存模式）                  |
| `-c key=value`     | 临时覆盖配置值，优先级最高                          |

### 沙盒模式

这是 cx 和 cc 最大的区别之一——**cx 有内置沙盒**，默认就会限制文件读写和网络访问。

| 参数                    | 说明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `-s read-only`          | 只读，只能看不能改，连 /tmp 都写不了                         |
| `-s workspace-write`    | 只能在项目目录和临时目录里写，默认禁网络（日常开发推荐这个） |
| `-s danger-full-access` | 全放开，啥都能干，慎用                                       |

### 全自动模式（cx 版的"不用按确认"）

这是大家最关心的——**怎么让 cx 全自动跑起来不用一直按确认**：

| 参数                                         | 说明                                         |
| -------------------------------------------- | -------------------------------------------- |
| `--full-auto`                                | **最推荐的自动模式**，自动审批但还有沙盒保护 |
| `--yolo`                                     | 禁用所有审批 + 禁用沙盒，等于裸奔            |
| `--dangerously-bypass-approvals-and-sandbox` | 跟 `--yolo` 一样，全称版本                   |

对比一下 cc 的话：
- cx 的 `--full-auto` ≈ cc 的 `--permission-mode auto-accept`（但 cx 还带沙盒保护）
- cx 的 `--yolo` ≈ cc 的 `--dangerously-skip-permissions`

**我的建议**：日常用 `--full-auto` 就够了，它在自动执行的同时还有沙盒兜底。`--yolo` 只在 Docker 容器或者虚拟机里才考虑用。

### 输出格式（exec 模式专用）

| 格式  | 说明                             |
| ----- | -------------------------------- |
| 默认  | 进度 → stderr，最终结果 → stdout |
| JSONL | 结构化流式输出，方便程序解析     |

<!--truncate-->

---

## 所有子命令一览

| 子命令                   | 别名      | 一句话说明                    |
| ------------------------ | --------- | ----------------------------- |
| `codex`                  | —         | 开 TUI                        |
| `codex exec`             | `codex e` | 非交互执行，CI 用             |
| `codex resume`           | —         | 恢复会话                      |
| `codex fork`             | —         | 分叉会话                      |
| `codex apply`            | `codex a` | 把 Cloud 任务的 diff 拉到本地 |
| `codex cloud-tasks`      | —         | 看 Cloud 任务列表             |
| `codex login`            | —         | 登录                          |
| `codex completion`       | —         | 生成 Shell 补全脚本           |
| `codex app`              | —         | 开 macOS 桌面应用             |
| `codex mcp-server`       | —         | 当 MCP 服务器用               |
| `codex features`         | —         | 管理功能标志                  |
| `codex execpolicy check` | —         | 检查执行策略（预览功能）      |

<!--truncate-->

---

## 聊聊 AGENTS.md

### 这东西是干嘛的？

就是 cx 版的 CLAUDE.md。你在里面写项目约定、架构说明、编码风格之类的，cx 每次启动都会先读这个文件，这样它就知道你的项目是怎么回事了。

**新项目第一件事**：启动 cx 后输入 `/init`，它会帮你生成一个 AGENTS.md 的框架。

### 查找优先级

cx 会从全局到当前目录逐层查找 AGENTS.md，越靠近当前目录的优先级越高：

| 级别     | 位置                                                  |
| -------- | ----------------------------------------------------- |
| 全局     | `~/.codex/AGENTS.md`                                  |
| 全局覆盖 | `~/.codex/AGENTS.override.md`（有这个就不读上面那个） |
| 项目根   | `项目根目录/AGENTS.md`                                |
| 项目覆盖 | `项目根目录/AGENTS.override.md`                       |
| 子目录   | 各级子目录中的 `AGENTS.md`（逐层叠加）                |

合并规则：每个目录最多取一个文件，从根往下拼接，总大小上限 32 KiB（可以在 config.toml 里改 `project_doc_max_bytes`）。

### 小技巧

如果团队里有人不想用 AGENTS.md 这个名字，可以在 config.toml 里配回退文件名：

```toml
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]
project_doc_max_bytes = 65536
```

这样 cx 会按 `AGENTS.override.md` → `AGENTS.md` → `TEAM_GUIDE.md` → `.agents.md` 的顺序查找。

<!--truncate-->

---

## 配置怎么搞

cx 用 TOML 格式配置（不是 JSON），配置文件在 `~/.codex/config.toml`。

### 配置优先级（从高到低）

1. **CLI 参数**（`-c key=value`）—— 临时覆盖，优先级最高
2. **Profile 值** —— 命名配置集
3. **项目配置**（`.codex/config.toml`）—— 仅受信项目生效
4. **用户配置**（`~/.codex/config.toml`）—— 全局默认
5. **内置默认值**

### 常用配置项

| 配置项                           | 说明                                           |
| -------------------------------- | ---------------------------------------------- |
| `model`                          | 用哪个模型，比如 `gpt-5-codex`                 |
| `model_provider`                 | 模型提供商 ID，默认 `openai`                   |
| `model_context_window`           | 上下文窗口大小                                 |
| `model_auto_compact_token_limit` | 自动压缩的 token 阈值                          |
| `instructions`                   | 直接写指令替代 AGENTS.md                       |
| `sandbox_mode`                   | 沙盒策略                                       |
| `review_model`                   | `/review` 用的模型（可以单独指定一个便宜的）   |
| `web_search`                     | 网页搜索模式：`cached`（默认）/ `live`（实时） |

### 安全相关

| 配置项                              | 说明                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| `sandbox_writeable_roots`           | workspace-write 下额外可写的路径                      |
| `sandbox_net_allow_workspace_write` | 允许沙盒内访问网络                                    |
| `project_trust`                     | 标记项目是否受信（不受信的会跳过 .codex/ 目录的配置） |

### 接第三方模型

如果想用 Azure OpenAI 或者其他兼容 API，可以自定义 provider：

```toml
[model_providers.my_provider]
base_url = "https://api.example.com/v1"
env_key = "MY_API_KEY"

[model_providers.my_provider.http_headers]
X-Custom-Header = "value"
```

然后 `model_provider = "my_provider"` 就行了。

### 功能标志

```bash
codex features list              # 看有哪些功能标志
codex features enable shell_snapshot   # 开某个功能
codex features disable shell_snapshot  # 关掉
```

### Shell 补全（建议装上）

```bash
# Zsh
codex completion zsh > "${fpath[1]}/_codex"

# Bash
codex completion bash > /etc/bash_completion.d/codex

# Fish
codex completion fish > ~/.config/fish/completions/codex.fish
```

装了之后 Tab 补全命令和参数，效率提升明显。

<!--truncate-->

---

## 目录里都有些啥文件

### 全局（~/.codex/）

| 文件                 | 干嘛的       |
| -------------------- | ------------ |
| `config.toml`        | 全局配置     |
| `token`              | 登录凭证     |
| `AGENTS.md`          | 全局项目指令 |
| `AGENTS.override.md` | 全局指令覆盖 |

### 项目级（.codex/）

| 文件                 | 干嘛的                 |
| -------------------- | ---------------------- |
| `config.toml`        | 项目配置（仅受信项目） |
| `AGENTS.md`          | 项目指令               |
| `AGENTS.override.md` | 项目指令覆盖           |

<!--truncate-->

---

## 沙盒和权限这块比较重要

这部分是 cx 的一大亮点——**自带沙盒安全机制**，cc 目前还没有。

### 两层安全

1. **沙盒（Sandbox）**：物理层面限制能干什么——能不能写文件、能不能联网
2. **审批策略（Approval）**：流程上限制——什么时候需要你点确认

### 沙盒模式一览

| 模式                 | 读文件 | 写文件            | 联网   | 我的理解                         |
| -------------------- | ------ | ----------------- | ------ | -------------------------------- |
| `read-only`          | 能     | 全禁（包括 /tmp） | 禁     | 纯看代码用，完全安全             |
| `workspace-write`    | 能     | 项目目录+临时目录 | 默认禁 | **日常开发首选**，出不了项目目录 |
| `danger-full-access` | 能     | 随便写            | 能     | 系统级操作才用，要小心           |

macOS 用 Seatbelt 实现沙盒，Linux 用 Landlock（也可以选 Bubblewrap）。这意味着限制是操作系统层面的，cx 自己想绕也绕不过去。

### 审批策略

| 策略                   | 什么时候问你             |
| ---------------------- | ------------------------ |
| `on-request`           | 需要越权的时候问（推荐） |
| `never`                | 从不问，CI/脚本用        |
| `on-failure`（已弃用） | 出错了才问，别用了       |

<!--truncate-->

---

## 我平时怎么用的

### 新项目起手式

```bash
cd my-project
codex
# 进去第一件事输入 /init 生成 AGENTS.md
# 然后手动补充项目的技术栈、目录结构、编码规范
# 这步做好了后面省很多口舌
```

### 计划先行

我一般习惯先 `/plan` 让它出方案，觉得靠谱了再 `/permissions` 切到可写模式执行。不然上来就让它改文件，万一改歪了还得回退。

### 省钱技巧

| 做法                | 为啥                                    |
| ------------------- | --------------------------------------- |
| 多用 `/compact`     | 聊久了 token 暴涨，压缩一下能省不少     |
| 用 `@` 引文件       | 别手动复制粘贴代码了，费 token 还不精确 |
| 先只读探路          | 默认就是只读，看方案满意了再切可写      |
| `/model` 调推理级别 | 简单问题没必要用最高推理级别            |

### CI 里怎么跑

```bash
# 最常用的，自动执行但有沙盒保护
codex exec --full-auto "fix the failing tests"

# Docker 里可以放心 yolo
codex exec --yolo "refactor the auth module"

# 加预算限制防止烧钱
codex exec --full-auto -c max_budget_usd=5 "update dependencies"
```

### 调试小技巧

- 报错直接整段粘进去，cx 解析堆栈跟踪很厉害
- 截图也能贴，cx 是多模态的
- `cat error.log | codex exec "explain"` 管道传日志分析
- `/diff` 随时看改了啥

<!--truncate-->

---

## 懒人速查

### 每天都用

| 干啥          | 命令                       |
| ------------- | -------------------------- |
| 开始干活      | `cd project && codex`      |
| 继续昨天的    | `codex resume --last`      |
| 快速问个事    | `codex exec "how do I..."` |
| 审查代码      | `/review`                  |
| 看改了啥      | `/diff`                    |
| 看 token 用量 | `/status`                  |
| 说错了想改    | `Esc Esc`                  |
| 跑路          | `Ctrl+C Ctrl+C` 或 `/quit` |

### 全自动执行模式对比

| 方式                          | 自动化   | 安全性 | 适用场景         |
| ----------------------------- | -------- | ------ | ---------------- |
| 默认 TUI                      | 低       | 高     | 不熟悉时先用这个 |
| `--full-auto`                 | 高       | 中     | **日常开发推荐** |
| `-a never -s workspace-write` | 高       | 中     | 精细控制         |
| `-s danger-full-access`       | 高       | 低     | 需要系统级操作   |
| `--yolo`                      | 完全自动 | 极低   | **仅限容器/VM**  |

### 进阶玩法

| 功能           | 怎么搞                          |
| -------------- | ------------------------------- |
| 分叉对话试方案 | `codex fork --last`             |
| 接第三方模型   | config.toml 配 `model_provider` |
| MCP 工具       | config.toml 配 MCP 服务器       |
| 多代理协作     | `/experimental` 开 Multi-agents |
| VS Code 联动   | 装 Codex Companion 插件         |
| 导出对话       | `/export session.json`          |
| 换性格         | `/personality friendly`         |

<!--truncate-->

---

## cx 和 cc 到底有啥区别

| 对比项       | Codex CLI (cx)           | Claude Code (cc)                 |
| ------------ | ------------------------ | -------------------------------- |
| 开发商       | OpenAI                   | Anthropic                        |
| 默认模型     | gpt-5.3-codex            | Claude Sonnet/Opus               |
| 项目指令文件 | `AGENTS.md`              | `CLAUDE.md`                      |
| 配置格式     | TOML                     | JSON                             |
| 全自动       | `--full-auto` / `--yolo` | `--dangerously-skip-permissions` |
| 内置沙盒     | 有（Seatbelt/Landlock）  | 没有                             |
| 恢复上次对话 | `codex resume --last`    | `claude -c`                      |
| 代码审查     | `/review`                | `/review`                        |
| 上下文压缩   | `/compact`               | `/compact`                       |
| MCP          | 支持                     | 支持                             |
| 开源         | 是（Rust）               | 是（TypeScript）                 |

<!--truncate-->

---

> 参考资料：
> - [OpenAI Codex CLI 官方文档](https://developers.openai.com/codex/cli/) | [CLI 命令参考](https://developers.openai.com/codex/cli/reference/) | [斜杠命令](https://developers.openai.com/codex/cli/slash-commands/)
> - [配置参考](https://developers.openai.com/codex/config-reference/) | [AGENTS.md 指南](https://developers.openai.com/codex/guides/agents-md/)
> - [GitHub: openai/codex](https://github.com/openai/codex)
