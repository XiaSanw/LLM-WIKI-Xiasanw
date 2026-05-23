---
type: topic
confidence: hypothesis
created: 2026-05-06
updated: 2026-05-24
tags: [memory, agent, knowledge-base, comparison, architecture]
sources: []
---

# Agent 记忆方案全景对比

> Agent Memory Approaches — Mem0 vs Letta vs llm-wiki 等方案横评

## 一句话
当前 Agent 记忆方案分三派：API 记忆中间件（Mem0）、有状态 Agent（Letta）、文件系统真相源（llmwiki 系列）。

## 三派对比

| | API 记忆中间件 | 有状态 Agent | 文件系统真相源 |
|---|---|---|---|
| 代表 | Mem0 | Letta (MemGPT) | llmwiki, llm-wiki-skill, llmwiki-base |
| 记忆是什么 | 结构化事实 + embedding | 命名 memory block | Markdown wiki 页面 |
| 谁管记忆 | 外部服务 | Agent 自己 | 文件系统 + Agent 工具 |
| 写入方式 | add-only 追加 | Agent 主动编辑 block | Agent 写 wiki 页面 |
| 消费者 | Agent 检索注入 | Agent 自身状态 | 人浏览 + Agent 检索 + RAG |
| 优势 | Agent 无关、部署灵活 | 记忆是活的、可自我改进 | 人可读、格式通用、永不锁死 |
| 劣势 | 不产生人类可读知识 | 内部状态不透明 | 消化成本高、需要 schema 约束 |

## 这些方案不是互斥的

它们解决的是不同层面的问题：

```
Layer 1 — 文件系统 wiki（llmwiki-base）
    ↑ 给人看的知识，Agent 也能检索
    ↑ 长期的、结构化的、可追溯的

Layer 2 — API 记忆层（Mem0）  
    ↑ 给 Agent 用的短期/偏好记忆
    ↑ "用户喜欢用 fish shell" "上次讨论过这个方案被否决了"

Layer 3 — Agent 内部状态（Letta）
    ↑ Agent 的自我认知和行为模式
    ↑ "我是一个知识管理助手" "我应该先读 agent.md"
```

一个完整的个人知识系统可能需要三层都做——llmwiki 做知识消化（semantic memory）、Mem0 做交互记忆（episodic memory）、Letta 的思路用来设计 Agent 的人格一致性。

但 MVP 阶段只做 Layer 1 就够了，它解决最核心的问题：**你的知识不绑定任何工具，永远是你的。**

## 为什么我们选文件系统真相源派

1. **首要原则**：知识本身 > 工具。Mem0 和 Letta 再强，数据在它们那里。文件系统的 Markdown 永远是自己的
2. **三个读者**：你 / Agent / RAG ——只有文件系统方案能同时服务三者
3. **可以后来加**：先有 wiki 底座，后续可以接 Mem0 做偏好记忆层，接 Letta 做 Agent 状态层

## 争议 / 未解问题

- Mem0 的 append-only 模式是否适用于知识管理？知识会过时会修正，不能只追加
- Letta 的 memory block 方案对 Agent 的自主性要求太高——Agent 删错了重要记忆怎么办？
- 文件系统方案最大的瓶颈不是技术，是 AI 消化质量——如果 AI 生成的 wiki 质量不如你自己写的笔记，这个方案就失败了

## 我的立场

**先做 Layer 1，验证 AI 消化质量。** 如果 AI 生成的 wiki 质量达不到人类笔记的 80%，整个方案的根基就不成立。

验证通过后，Layer 2（Mem0 式偏好记忆）是自然扩展——"用户上次选择了方案 A"、"用户的 fish shell 配置在 xx 路径"这类短平快的记忆不需要走 wiki 消化流程。

Layer 3（Agent 自我状态）是最远的，对于个人知识库场景可能也不需要。

## 相关
- [[mem0]]
- [[letta]]
- [[llmwiki-lucasastorian]]
- [[llm-wiki-skill]]
- [[fashion-ai]]
- episodic-vs-semantic-memory（待收录）
