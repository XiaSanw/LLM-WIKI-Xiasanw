---
type: entity
confidence: emerging
created: 2026-05-06
updated: 2026-05-24
tags: [memory, agent, opensource, api, embedding]
sources: []
---

# Mem0 记忆中间件

> Agent-agnostic 的记忆中间件，提供 API + embedding 记忆服务

## 一句话
开源的多级 Agent 记忆中间件——add-only 追加式存储，任何 Agent 都能通过统一 API 读写记忆。

## 核心要点
- 提供 `memory.add()` / `memory.search()` / `memory.update()` 统一接口，Agent 无关
- 三级记忆分层：User（跨会话）、Session（当前会话）、Agent（行为事实）
- v3 算法（2026/04）：append-only 模式，记忆只追加不覆盖，多 Agent 并发写无冲突
- 检索融合三种信号：语义向量 + BM25 关键词 + 实体匹配，并行打分后融合
- 三种部署：pip/npm 库（原型）、Docker 自托管（团队）、云平台（生产零运维）
- 插件式 LLM：默认 gpt-5-mini，可换成任意模型
- Apache 2.0 开源

## 为什么重要
Mem0 是目前最接近"Agent 无关记忆层"这一理想的开源方案。

它把记忆从 Agent 框架中剥离出来变成独立服务——任何一个 Agent（Claude Code、ChatGPT、LangChain、CrewAI）都通过同一套 API 读写，记忆不绑定工具。

和 llmwiki 的区别：Mem0 关心的是"怎么记住用户说过什么、做过什么"，llmwiki 关心的是"怎么消化外部知识把它变成你自己的认知"。前者是 episodic memory，后者是 semantic memory。两者互补。

## 关键设计
- **append-only**：不覆写，记忆只增不减。多个 Agent 同时写入不会互相破坏
- **entity linking**：实体被自动提取、embedding，跨记忆链接，检索时加权提升
- **agent facts 一等化**：Agent 执行过的动作被写入记忆，和用户输入同等权重
- Benchmark: LoCoMo 91.6 (+20pts), LongMemEval 93.4 (+26pts), 单次调用 ~7K tokens, ~1 秒延迟

## 来源
- GitHub: https://github.com/mem0ai/mem0
- 采集时间: 2026-05-06

## 相关
- [[letta]]
- [[llmwiki-lucasastorian]]
- [[llm-wiki-skill]]
- agent-agnostic-memory（待收录）
- episodic-vs-semantic-memory（待收录）
