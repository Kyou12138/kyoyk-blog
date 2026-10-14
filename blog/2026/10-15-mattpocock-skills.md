---
title: mattpocock 系列 Skill 学习笔记
description: grill-me 背后完整的工程化 Skill 体系：核心路径、上下文原理、实践要点与我的取舍。
tags: [ai]
---

# mattpocock 系列 Skill 学习笔记

之前只把 grill-me 当"需求拷问器"在用，学完整个体系才发现它只是一环。这套 Skill 的价值不在单个命令，而在**用文档驱动把"对齐想法 → 落实设计 → 拆分任务 → 实现 → 审查"串成一条不依赖上下文的工程化路径**。

## 解决什么问题

- **需求对齐**：模型再强也不会读心。做出来的东西和预想有偏差，返工浪费的 token 远大于前期对齐的成本。
- **跑偏控制**：AGENTS.md 里的约束经常被模型忽略，大项目跑偏了人盯不住；固化成流程后，跑偏能在流程上被发现。
- **上下文管理**：这是本质——同样的模型、同样的仓库，产出质量差异取决于每次调用喂给它的上下文。把人的工程经验、边界、验收标准整理成模型可执行的过程，相当于一次业务层的 post-train。

对比 Superpowers：那套太重，任何需求都全流程走一遍，小项目纯浪费；大项目又容易走偏。这套是**按需手动调用**，大小项目都能伸缩。

## 核心路径（0-5 步）

| 步骤 | Skill | 干什么 |
| --- | --- | --- |
| 0 | `/setup-matt-pocock-skills` | 定标准：术语、issue tracker、文档布局，**建项目第一步就跑** |
| 1 | `/grill-with-docs` | 拷问对齐，沉淀共识文档（零散的） |
| 2 | `/to-spec` | 共识整理成正式设计文档（Spec） |
| 3 | `/to-ticket` | 拆成带依赖关系、可独立完成的 ticket |
| 4 | `/implement 01` | **新 session** 里实现指定 ticket |
| 5 | `/code-review` | 双 subagent 并行审查：规范/bug + 是否偏离设计 |

理解要点：

- **1-3 在同一上下文完成，4 起每个 ticket 各开新 session**。问答和干活分离，所以"grill 太费上下文"是误用，不是设计缺陷。无依赖的 ticket 可多 session 并行。
- **为什么要拆 ticket**：1M 上下文标称值是幌子，smart zone 不到 200K，上下文越大注意力越涣散。拆分让每次实现的输入都压在 smart zone 内，顺带控制模块化。
- **grill-with-docs 和 to-spec 不是重复**：前者是问答共识（零散），后者是收敛后的设计文档。
- **步骤可裁剪**：小项目 grill 完直接 `/implement`，跳过 spec 和 ticket。流程为人服务，不是反过来。

## 实践要点

- grill 问个没完时：① 描述太笼统 → 多说想法；② 项目大到自己也没想清 → 先用 `/wayfinder` 而不是硬 grill。优缺点分明的选项直接授权它自作主张，别事事都问。
- grilling 的回答**必须人来纠偏**——发现问得过细或过粗要直接说，被模型带着走完一轮，结果大概率不是想要的。
- 想不清的大项目用 `/wayfinder`：能定的出实现 ticket，定不了的出"决策 ticket"，规划路径先立住，迷雾随推进散开。
- ticket 做完自查：Workload 均衡吗？都是 vertical slice 吗？从入口走一遍主链能走通吗？
- `/implement` = `/tdd` + 自动 `/code-review`，第 5 步一般免手动；`/implement-spec` 可按依赖顺序自动跑完一组 ticket。
- `/ask-matt` 是这套体系的自带说明书，用法问题直接问它。

## 常用辅助 Skill

- `/improve-codebase-architecture`：架构巡检，输出候选改进项；每个候选 fork 一个 session 再走 grill→spec→impl。是优化不是重构。
- `/writing-for-agents`：写给 Agent 看的文档要用它的方式组织，越详细≠越好，还省 token。
- `/handoff`：session 交接文档。走了 0-5 流程的项目基本用不上。
- `/wait-what`：啰唆回复压缩成人话（直接让它大白话重讲也行）。
- `/research`：subagent 调研不占主上下文，刨根问底找信源。
- `/teach`：生成可交互网页教你理解项目，带问答题。

## 模型适配

Claude / GLM 效果好；GPT 系过拟合的强指令遵循会把这套变成枷锁，不会变通，codex 跑一半就在压缩上下文。僵的模型出 wayfinder/spec，活泛的模型做 ticket 实现，混搭比全程 GPT 强。

## 我的取舍

社区两极争论很凶，我站中间：

1. **理念不会过时，形式会**。skill 是壳，背后是"对齐-收敛-拆分-验证"的软件工程老三样，古法编程时期也成立。模型变强淘汰的是繁琐流程，不是对齐本身。
2. **项目复杂度决定价值**。one-shot 小活裸奔就好；要长期维护、多人协作、模块多的项目，文档和 ticket 是唯一能让"以前的决策"可追溯的东西——不然只能从注释和 git log 里考古。
3. **警惕过度规划**。项目本该由粗到细迭代，一次性规划过全，做到一半发现更好解法，回头改一堆 SPEC/ADR——文档比代码先烂，代码跟着烂。裁剪步骤、保持文档轻量比照单全收重要。
4. 可以按自己习惯定制：只保留 grilling 对齐 + 关键审查，`/implement` 里的 review、测试、防御性编程按项目取舍。

## 参考

- [linux.do 原帖：强烈推荐 mattpocock(grill-me) 系列 skill（zerosoul）](https://linux.do/t/topic/2952622)
- [matt 讲如何减少 grill 的无效提问](https://www.bilibili.com/video/BV1zn396mEfz)
- [体系整体介绍视频](https://www.bilibili.com/video/BV1zUh56RE8k)
