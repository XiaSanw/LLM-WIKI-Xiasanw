---
type: entity
confidence: emerging
created: 2026-05-06
updated: 2026-05-24
tags: [memory, agent, opensource, self-improving, stateful]
sources: []
---

# Letta 自适应记忆框架

> 原 MemGPT，有状态、自改进的开源 AI Agent 记忆系统

## 一句话

开源的有状态 Agent 平台——用结构化 memory block 替代扁平上下文窗口，让 Agent 能主动管理记忆、持续学习、自我改进。

## 核心特性

- **Memory Block 架构**：把 Agent 的记忆分成多个命名块（human block、persona block、episodic block 等），每块独立读写和管理。不像传统做法把整个 history 塞进 system prompt 末尾，而是让 Agent 像操作文件系统一样操作自己的记忆。
- **有状态 Agent**：Agent 的状态持久存在，不是每次会话重建。上次学到的偏好、积累的知识、建立的联系——全部保留在 memory block 中。下次启动时 Agent 自动加载自己的状态。
- **自改进机制**：Agent 可以在运行时修改自己的 persona block——比如发现自己回答问题不够简洁，就编辑自己的 persona 加入"回答要简洁"。这是真正的"学习"，不是被动存储。
- **模型无关**：不绑定任何 LLM 提供商。支持 Claude、GPT、Gemini 等主流模型，也支持本地开源模型。
- **两种形态**：Letta Code（CLI 工具，npm 分发，适合个人开发者）和 Hosted API（Python/TypeScript SDK，适合集成到应用）。

## 为什么重要

Letta 把"记忆管理"从"注入上下文"升级成了"Agent 主动操作"——Agent 不只是读记忆，还能编辑、重组、删除记忆。这是从"给 AI 一个记事本"到"给 AI 一个大脑"的跨越。

### 与 Mem0 的关键区别

| 维度 | Mem0 | Letta |
|---|---|---|
| 记忆模型 | 写入式——Agent 调 API 存记忆 | 管理式——Agent 主动编辑、重组记忆 |
| Agent 角色 | 被动——调用存储服务 | 主动——记忆是 Agent 的工具之一 |
| 状态模型 | 无状态——每次从 API 加载 | 有状态——Agent 自己持有和更新状态 |
| 存储方式 | 向量数据库 + embedding | 结构化 memory block（human/persona/episodic） |
| 自改进 | 不支持 | 核心能力——可修改自己的 persona |
| 适合场景 | 需要外挂记忆层的现有 Agent | 从零构建有状态的自主 Agent |

Mem0 好比**外部硬盘**——Agent 往里存东西，用时查。Letta 好比**工作记忆 + 长期记忆**——Agent 自己在管理。

### 与 llmwiki 的关键区别

| 维度 | llmwiki（文件系统派） | Letta（有状态 Agent 派） |
|---|---|---|
| 产出 | 给人看的 Markdown wiki 页面 | 给 Agent 自己用的 memory block |
| 读者 | 人 + Agent 都能读 | 主要是 Agent 自己读 |
| 持久化 | 文件系统 | Letta 服务端存储 |
| Agent 无关 | 天然（文件通用格式） | 绑定 Letta 平台 |
| 人的参与 | 人可以浏览、编辑、review | 人是"用户"角色，不直接操作记忆 |

llmwiki 选择了"Agent 无关、人可读"的路线——这是有代价的（Agent 不能像 Letta 那样动态管理记忆），但也有优势（不绑定平台、人能直接打开、能发布成网站）。

## 技术架构

```
┌─────────────────────────────────────┐
│           Letta Agent               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Memory Blocks             │  │
│  │                               │  │
│  │  human block    ← 你是谁      │  │
│  │  persona block  ← Agent 是谁  │  │
│  │  episodic block ← 发生过什么  │  │
│  │  archival block ← 长期知识    │  │
│  └───────────────────────────────┘  │
│              ↕                      │
│     Agent 可以主动读写编辑          │
│                                     │
│  工具集（记忆管理是其中之一）       │
│  - core_memory_replace              │
│  - core_memory_append               │
│  - archival_memory_insert           │
│  - archival_memory_search           │
│  - conversation_search              │
│                                     │
│  LLM（任何模型）                    │
│  ← 运行时 → 读取/编辑 memory block │
│  ← 启动时 → 从存储加载状态         │
└─────────────────────────────────────┘
```

核心循环：
1. 用户发消息 → Agent 从存储加载 memory block
2. Agent 把 memory block 注入到 LLM 上下文
3. LLM 生成回复，同时可能决定修改 memory block
4. 修改后的 memory block 写回存储
5. 下一条消息从步骤 1 重新开始

## 实用信息

- 获取方式（Letta Code）：`npm install -g @letta-ai/letta`
- Python SDK：`pip install letta`
- 推荐模型：Claude Opus 4.5、GPT-5.2（高质量记忆管理），Claude Haiku、GPT-5-nano（经济模式）
- 适用场景：
  - 需要长期记忆的客服 Agent
  - 能自我改进的研究助手
  - 个性化教育辅导 Agent
  - 有"人格"的虚拟角色
- 不适用场景：
  - 简单问答（不需要记忆管理）
  - 需要给人看的文档（用 llmwiki）
  - 不想绑定平台的场景（Letta 的 memory block 不通用）

## 来源

- GitHub: https://github.com/letta-ai/letta
- 论文：MemGPT: Towards LLMs as Operating Systems
- 采集时间: 2026-05-06

## 相关

- [[mem0]] — API 记忆中间件，Letta 的主要对比对象
- [[llmwiki-lucasastorian]] — 文件系统派记忆方案
- [[agent-memory-approaches]] — Agent 记忆方案全景对比
- agent-agnostic-memory（待收录）
- stateful-agent（待收录）
