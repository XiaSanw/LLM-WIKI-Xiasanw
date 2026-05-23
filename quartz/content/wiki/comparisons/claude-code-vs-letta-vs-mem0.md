---
type: comparison
confidence: opinion
created: 2026-05-24
updated: 2026-05-24
tags: [memory, agent, comparison, architecture]
---

# Claude Code vs Letta vs Mem0：Agent 记忆方案对比

> Agent Memory Showdown — 内置记忆 vs 有状态 Agent vs API 中间件，各适合什么场景？

## 一句话结论

**做应用选 Mem0，做自主 Agent 选 Letta，做个人知识管理选 Claude Code 内置记忆（或 llmwiki）。三者解决的不是同一个问题。**

## 对比表

| 维度 | Claude Code 内置记忆 | Letta | Mem0 |
|---|---|---|---|
| **记忆模型** | user/project/feedback 三层 | 结构化 memory block（human/persona/episodic） | API 写入 + 向量检索 |
| **Agent 角色** | 被动使用——Agent 读写记忆，不管理结构 | **主动管理**——Agent 编辑、重组自己的记忆 | 被动存储——Agent 调 API 存取 |
| **状态持久化** | 文件系统（~/.claude/projects/） | Letta 服务端存储 | 向量数据库 |
| **自改进** | 支持（feedback 类型） | 核心能力——可修改 persona block | 不支持 |
| **平台绑定** | 绑定 Claude Code | 绑定 Letta 平台 | Agent-agnostic（任何 Agent 调 API） |
| **人可读性** | JSON 文件，人可打开 | memory block 是内部状态，人不直接读 | API 返回 JSON，可读但非文档级 |
| **存储内容** | 偏好、约定、纠正历史 | Agent 的"人格"和"记忆" | 事实、对话、上下文片段 |
| **适合场景** | 个人开发辅助 | 客服 Agent、虚拟角色、长期陪伴 | 即插即用记忆层 |
| **学习曲线** | 零——Claude Code 自动管理 | 中——需要理解 memory block 概念 | 低——调 API 即可 |
| **输出产物** | Agent 下次会话更懂你 | Agent 越来越像"你" | 结构化的记忆条目 |
| **和 llmwiki 的关系** | 互补——Claude Code 记偏好，llmwiki 记知识 | 理念相似但产出不同（内部状态 vs 公开文档） | 互补——Mem0 做快速检索，llmwiki 做深度消化 |

## 场景建议

**选 Claude Code 内置记忆** — 如果你：
- 日常用 Claude Code 开发
- 想让 Agent 记住你的编码习惯、项目约定、上次的纠正
- 不需要额外的部署和配置

**选 Letta** — 如果你：
- 在构建需要"人格"和长期记忆的 AI 应用
- 需要 Agent 能自我改进（不只是存记忆）
- 愿意接受平台绑定

**选 Mem0** — 如果你：
- 已有 Agent 系统，只想加一个"记忆层"
- 需要跨平台、跨 Agent 的通用记忆
- 不想改现有架构，API 一调就行

**选 llmwiki** — 如果你：
- 要构建给人看的知识库（不是给 Agent 的内部状态）
- 需要 Agent 无关——换工具不丢知识
- 想同时发布成网站、用 Obsidian 浏览

## 架构差异（核心理解）

```
Claude Code 内置记忆：
  用户纠正 Agent → Agent 写 feedback → 下次会话自动加载
  本质：偏好和约定的持久化，不是"知识"的存储

Letta：
  Agent 感知环境 → 修改 memory block → 状态持久化
  本质：Agent 有"自我"，能学习、能成长

Mem0：
  Agent 调 API 存 → 外部向量数据库 → 下次调 API 查
  本质：外挂硬盘，Agent 本身无状态

llmwiki：
  人/Agent 消化素材 → 生成 wiki 页面 → 文件系统持久化
  本质：给人看的百科全书，Agent 是维护者
```

## 实际场景演练

**场景：你在用 Claude Code 开发电力市场预测平台**

- **Claude Code 内置记忆**：记得你用 pytest 不用 unittest，偏好 snake_case，上次说过数据库用 SQLite。
- **Letta**：不适用——这是开发场景，不是"Agent 需要人格"的场景。
- **Mem0**：可以用来存每次开发会话的技术决策和 bug 修复记录，但需要额外部署。
- **llmwiki**：会议纪要、参考项目分析、技术选型文档——这些是给人看的知识，应该放 wiki。

**结论**：这个场景下 Claude Code 内置记忆 + llmwiki 是最佳组合。

## 相关

- [[claude-code]]
- [[letta]]
- [[mem0]]
- [[llmwiki-lucasastorian]]
- [[agent-memory-approaches]]
