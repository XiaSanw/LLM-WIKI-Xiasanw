---
type: entity
confidence: emerging
created: 2026-05-05
updated: 2026-05-24
tags: [agent, tool, coding, cli, anthropic]
sources: []
---

# Claude Code 编程助手

> Anthropic 出品的 CLI AI 编程工具，终端里的自主 Agent

## 一句话

Anthropic 出品的命令行 AI 编程助手——不是 IDE 插件，是独立的 CLI 工具，能在终端里自主完成代码生成、调试、重构和项目管理。

## 核心特性

- **CLI-first 形态**：不依赖 IDE，直接在终端里运行。可以 `cd` 到任何项目目录，Claude Code 接管整个开发环境。这种独立性让它比 IDE 插件更灵活——你可以在服务器上跑它、在 tmux 里挂后台、用手机 SSH 操控。
- **自主 Agent 模型**：不是"你写一行我补一行"的代码补全，而是"你说要什么，我分析、规划、写代码、跑测试、修 bug"的完整开发循环。支持 tools（文件读写、shell 执行、git 操作），Agent 自主决定调用什么工具。
- **内置 Memory 系统**：跨会话持久化用户偏好和项目上下文。你告诉它一次"我喜欢 snake_case"或"这个项目用 pytest 不用 unittest"，以后每次会话它都记得。Memory 分为 user（你的偏好）、project（项目约定）、feedback（你纠正过它的事）三种类型。
- **Skill/Hook 机制**：用户可自定义工作流。Skill 是特定领域的指令集（比如 `/llmwiki-ingest` 就是通过 Skill 注册的知识库操作），Hook 是在特定时机自动执行的脚本（如每次 commit 前跑 lint）。这让 Claude Code 从一个工具变成了一个平台。
- **Plan Mode**：复杂任务先出计划再执行。Agent 不会直接动手写代码，而是先分析需求、探索代码库、设计方案、让你确认，然后再实施。这降低了"Agent 一顿操作全写错了"的风险。
- **多种模型可选**：支持 Opus（最强推理）、Sonnet（平衡速度和质量）、Haiku（最快最经济）。可以按任务选择——研究用 Opus，日常开发用 Sonnet，快速脚本用 Haiku。

## 为什么重要

从"Copilot"到"Agent"的范式转变——Claude Code 是第一个把这件事做到生产级别的工具。

过去的 AI 编程工具（Copilot、Codeium、TabNine）是"帮你在代码里补一段"——它们在 IDE 里等光标闪烁，你不停它们不动。Claude Code 完全不同——你给它一个目标，它自己在终端里读写文件、执行命令、查看输出、修正错误，直到目标达成。

这不是功能增强，是交互模式的根本改变：
- 旧模式：人写代码，AI 补充 → AI 是副驾驶（copilot）
- 新模式：人说目标，AI 执行 → AI 是代理（agent）

这种转变的实际影响很大。以前用 Copilot，你还是要自己写大部分代码、自己 debug、自己读文档。用了 Claude Code，你把一个 issue 告诉它，它自己去翻代码、定位问题、修复、跑测试、提交。你只需要 review 结果。

同时，它的 skill 和 hook 系统让个人知识管理成为可能——llmwiki-base 本身就是基于 Claude Code 的 skill 机制构建的。没有 Claude Code 的平台化能力，Agent 无关的知识库系统就不会以现在这种形态存在。

## 与其他工具对比

| 维度 | Claude Code | GitHub Copilot | Cursor | Codex CLI |
|---|---|---|---|---|
| 形态 | 独立 CLI | IDE 插件 | IDE（VS Code fork） | 独立 CLI |
| 工作模式 | 自主 Agent | 代码补全 + Chat | 代码补全 + Agent | 自主 Agent |
| 运行方式 | 终端会话 | 编辑器内 | 编辑器内 | 终端会话 |
| 模型 | Claude 系列 | GPT + Claude | 多种 | GPT 系列 |
| 可扩展性 | Skill + Hook | 有限 | 有限 | 基于 Codex SDK |
| 记忆系统 | 内置（user/project/feedback） | 无 | 基于项目的 rules | 无 |
| 适合场景 | 完整开发任务 | 写代码时辅助 | IDE 重度用户 | 完整开发任务 |
| 定价 | 需要 Claude 订阅 | GitHub 订阅 | 免费试用/订阅 | 需要 GPT Plus/Pro |

**选择建议**：
- 喜欢全流程自动化 → Claude Code 或 Codex CLI
- 喜欢在 IDE 里边写边让 AI 辅助 → Copilot 或 Cursor
- 两者都要 → Cursor（IDE）+ Claude Code（命令行重任务）

## 关键架构

Claude Code 的核心循环：

```
用户输入任务
    ↓
Claude Code 分析 → 需要更多上下文？
    ├─ 是 → 读取文件 / grep 搜索 / 运行命令
    └─ 否 → 制定方案 → Plan Mode 展示给你确认
              ↓
         执行方案 → 写代码 / 改配置 / 跑测试
              ↓
         检查结果 → 有错误？
              ├─ 有 → 分析错误 → 修复 → 重试
              └─ 无 → 完成，报告结果
              ↓
         Memory 系统 → 保存学到的东西

下次会话：
    ↓
读 Memory → 已知道你的偏好和项目约定 → 跳过解释环节
```

## 实用信息

- 获取方式：`npm install -g @anthropic-ai/claude-code`
- 基本用法：终端 `cd` 到项目目录 → 运行 `claude` → 自然语言交互
- 模型选择：`claude --model opus` / `claude --model sonnet` / `claude --model haiku`
- Skill 目录：`~/.claude/skills/`
- Memory 位置：`~/.claude/projects/{project-path}/memory/`
- 配置：`~/.claude/settings.json`
- 定价：需要 Anthropic 订阅（Pro 或 API key）

## 来源

- 官方文档：https://docs.claude.com/en/claude-code
- llmwiki-base 项目直接使用经验

## 相关

- [[mem0]] — Agent 记忆中间件，Claude Code 内置记忆系统的外部替代方案
- [[llm-wiki-skill]] — 基于 Claude Code Skill 机制的知识库工具
- [[agent-memory-approaches]] — Agent 记忆方案对比
- [[cpa-cli-proxy-api]] — 可通过 CPA 让 Claude Code 使用 GPT 模型
- cursor（待收录）
- github-copilot（待收录）
- mcp-protocol（待收录）
