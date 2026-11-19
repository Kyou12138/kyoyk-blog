# AGENTS.md

## 系统级补充规则

- 当网络直连失败（如超时、DNS 解析失败、连接被拒绝）时，自动启用系统代理 `127.0.0.1:7897` 并重试一次。
- 代理地址统一使用 `http://127.0.0.1:7897`，并同步到 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`。
- 本地地址不走代理：`NO_PROXY=localhost,127.0.0.1,::1`。

## 本地服务管理

- 禁止执行 `taskkill /F /IM node.exe` 或 `Stop-Process -Name node`，它们会结束所有 Node 进程，包括 pi、CodeGraph 和 MCP 服务本身。
- 重启 Next 服务时先按端口 3100 找到 PID，再使用 `taskkill //PID <PID> //F` 或 `Stop-Process -Id <PID> -Force`。
- PowerShell 查找占用端口的进程：`Get-NetTCPConnection -LocalPort 3100 -State Listen | Select-Object -ExpandProperty OwningProcess -Unique`。

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`Kyou12138/kyoyk-blog`), driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, label strings identical to the role names. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.
