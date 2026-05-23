---
type: entity
confidence: emerging
created: 2026-05-06
updated: 2026-05-24
tags: [llm-wiki, knowledge-base, opensource, mcp, local-first]
sources: []
---

# llmwiki 个人知识库系统

> 文件系统是唯一真相源的 llm-wiki 实现，支持 MCP 协议

## 一句话
Karpathy llm-wiki 概念的开源实现——本地优先、文件系统是唯一真相源、通过 MCP 让 Claude 直接读写知识库。

## 核心要点
- GitHub: lucasastorian/llmwiki, 788 stars, Apache 2.0
- 核心理念：**文件系统是第一真相源，SQLite 是派生索引可随时重建**
- 每个研究文件夹独立成一个 MCP workspace，上下文隔离
- PDF/Markdown/HTML/Excel/CSV/Office 全格式处理
- MCP server 暴露 5 个工具给 Claude: guide/search/read/write/delete
- 搜索用 SQLite FTS5 + Porter Stemming（无需向量库）
- 托管版 llmwiki.app 升级到 PGroonga

## 为什么重要
这是"文件系统做真相源"理念最彻底的实现。

和我们的 llmwiki-base 设计直接相关：
1. 他证明了"SQLite 索引可随时从文件重建"这条路径是可行的
2. MCP server 作为 Agent 接口是比 skill 更标准的方案
3. 本地优先 + 零云依赖 + Wiki 即普通 Markdown 的选择被 788 stars 验证了

但和我们设计的差异：
- 他用 MCP（Claude 专属），我们要的是 Agent-无关的接口层
- 他的粒度是一个文件夹一个 workspace，我们的粒度是一个领域一个 kb
- 他的 search 只有 FTS5，我们计划三层（FTS5 + embedding + RAG）

## 关键设计
- 写入顺序：先落盘 → 再更新索引。这保证文件永远是最新的
- `.llmwiki/` 目录可随时删除重建，不影响知识内容
- 文件监听器在后台检测外部修改（你用编辑器改了 wiki，索引自动更新）
- 一个 workspace 只对应一个 research folder，防止跨项目污染

## 来源
- GitHub: https://github.com/lucasastorian/llmwiki
- 采集时间: 2026-05-06

## 相关
- [[llm-wiki-skill]]
- [[mem0]]
- [[letta]]
- agent-agnostic-memory（待收录）
- mcp-protocol（待收录）
- file-system-truth-source（待收录）
