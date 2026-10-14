---
title: mattpocock 系列 Skill 学习笔记
description: grill-me 背后完整的工程化 Skill 体系：核心路径、上下文原理、实践要点与取舍。
tags: [ai]
---

# mattpocock 系列 Skill 学习笔记

最开始只拿 grill-me 当"需求拷问器"用，把整个体系学下来才发现，它只是一环。这套 Skill 真正值钱的地方不在某个命令，而是靠文档驱动，把"对齐想法 → 落实设计 → 拆分任务 → 实现 → 审查"串成一条不依赖上下文的工程化路径。

<!-- truncate -->

## 1. 解决什么问题（Why This Exists）

- 需求对齐：模型再强也读不了心。东西做出来和预想有偏差，返工烧掉的 token 远超前期对齐的成本。
- 跑偏控制：AGENTS.md 里的约束经常被模型忽略，大项目跑偏了人盯不住。固化成流程，跑偏至少能在流程上被提前发现。
- 上下文管理：这条是根本。同一个模型、同一个仓库，产出好坏取决于每次调用喂进去的上下文。把工程经验、边界、验收标准整理成模型能执行的过程，相当于给业务层做了一次 post-train。
- 对比 Superpowers：那套太重，什么需求都全流程走一遍，小项目纯浪费，大项目还容易走偏。这套按需手动调，项目大小都吃得下。

---

## 2. 核心路径（Core Workflow 0-5）

- **步骤 0** - `/setup-matt-pocock-skills`：先定标准（术语、issue tracker、文档布局），项目一建好第一步就跑它
- **步骤 1** - `/grill-with-docs`：拷问对齐，沉淀共识文档（零散的）
- **步骤 2** - `/to-spec`：把共识整理成正式设计文档（Spec）
- **步骤 3** - `/to-ticket`：拆成带依赖关系、能独立完成的 ticket
- **步骤 4** - `/implement 01`：新开的 session 里实现指定 ticket
- **步骤 5** - `/code-review`：两个 subagent 并行审查（规范/bug + 有没有偏离设计）

### 理解要点

- 问答和干活是分开的：步骤 1-3 在同一上下文里完成，从步骤 4 起，每个 ticket 各开新 session。所以"grill 太费上下文"是误用，不是设计缺陷；没有依赖的 ticket 还能并行去跑。
- 为什么非要拆 ticket：1M 是标称值，真正的 smart zone 不到 200K，上下文一大，注意力就散了。拆开之后，每次实现的输入都压在 smart zone 以内，模块化也顺带管住了。
- grill-with-docs 和 to-spec 不重复：一个是问答攒下来的共识，零散；一个是收敛后的设计文档。
- 步骤能裁就裁：小项目 grill 完直接 `/implement`，spec、ticket 都可以跳过。流程为人服务，别反过来。

---

## 3. 实践要点（Practical Tips）

- grill 问起来没完，一般是两种情况：
  - 描述太笼统 → 多说想法
  - 项目大到自己也没想清 → 先用 `/wayfinder`，别硬 grill
- 优缺点分明的选项，直接授权它自作主张，不必事事都问。
- grilling 的回答必须人来纠偏。问得过细或过粗，当场就说。被模型带着走完一轮，结果多半不是想要的。
- ticket 做完自查：Workload 均衡吗？都是 vertical slice 吗？从入口把主链走一遍，能通吗？
- `/implement` 自带 `/tdd` 和 `/code-review`，第 5 步一般免手动；`/implement-spec` 能按依赖顺序把一组 ticket 自动跑完。
- 用法上有疑问就问 `/ask-matt`，它是这套体系自带的说明书。

---

## 4. 常用辅助 Skill（Helper Skills）

- `/improve-codebase-architecture`：架构巡检，输出候选改进项；每个候选用一个 fork 出来的 session 再走 grill→spec→impl。做的是优化，算不上重构
- `/wayfinder`：大项目想不清的时候拿来规划。能定的内容出实现 ticket，定不了的出"决策 ticket"，迷雾随推进慢慢散开
- `/writing-for-agents`：写给 Agent 看的文档要按它习惯的方式组织，更详细不等于更好，还能省 token
- `/handoff`：session 交接用的文档；走过 0-5 流程的项目基本用不上
- `/wait-what`：把啰唆的回复压成说人话（直接让它大白话重讲一遍也行）
- `/research`：subagent 调研，不占主上下文，查到的东西刨根问底找信源
- `/teach`：生成能交互的网页教你理解项目，带问答题

---

## 5. 模型适配（Model Fit）

- Claude 和 GLM 用起来顺手。
- GPT 系的强指令遵循是过拟合出来的，套上这套就成枷锁，不会变通，codex 跑到一半就开始压缩上下文。
- 折中办法是混搭：死板的模型出 wayfinder 和 spec，活泛的模型做 ticket 实现。

---

## 6. 我的取舍（My Takeaways）

- 理念不会过时，形式会。skill 只是壳，背后是对齐、收敛、拆分、验证这套软件工程的老三样，放到古法编程时期也成立。模型变强淘汰的是繁琐流程，不是对齐本身。
- 项目复杂度决定价值。one-shot 的小活裸奔就好；要长期维护、多人协作、模块又多的项目，文档和 ticket 是让以前的决策有据可查的唯一去处，不然只能到注释和 git log 里考古。
- 警惕过度规划。项目本该由粗到细迭代，一次性规划太全，做到一半发现更好的解法，回头要改一堆 SPEC/ADR。文档比代码先烂，代码就跟着烂。裁剪步骤、保持文档轻量，比照单全收重要。
- 也可以按习惯定制。只留 grilling 对齐和关键审查，`/implement` 里的 review、测试、防御性编程，按项目取舍。

---

## 7. 参考（References）

- 原帖：[强烈推荐 mattpocock(grill-me) 系列 skill（linux.do / zerosoul）](https://linux.do/t/topic/2952622)
- 视频：[matt 讲如何减少 grill 的无效提问](https://www.bilibili.com/video/BV1zn396mEfz)
- 视频：[体系整体介绍](https://www.bilibili.com/video/BV1zUh56RE8k)
