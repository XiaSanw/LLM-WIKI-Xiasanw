---
type: entity
confidence: emerging
created: 2026-05-06
updated: 2026-05-24
tags: [llm-wiki, knowledge-base, opensource, skill, production]
sources: []
---

# llm-wiki-skill 知识库构建工具

> 生产级 llm-wiki Skill 封装，多平台适配，社区 1.3k stars

## 一句话
目前 Star 最多的 llm-wiki 生产级实现——1.3k stars，多平台通用，完整的 ingest/query/lint/digest 工作流。

## 核心要点
- GitHub: sdyckjq-lab/llm-wiki-skill, 1.3k stars, 177 forks, v3.6.2, MIT
- 同时支持 Claude Code、Codex、OpenClaw、Hermes 四个平台
- 统一安装器 `install.sh --platform <name>`，自动适配不同平台
- 完整的 4 操作闭环：ingest → query → lint → digest
- Ingest 分两步：analysis phase（链式思考）→ generation phase（按 schema 输出）
- 每篇 wiki 带 4 级 confidence 标签（EXTRACTED/INFERRED/AMBIGUOUS/UNVERIFIED）
- 内置离线可视化知识图谱（HTML + 拖拽画布 + 社区聚类）
- Obsidian 兼容：所有输出都是标准 wikilinks 语法的 Markdown

## 为什么重要
这是 llm-wiki 社区最成熟的参考实现，也是我们设计 llmwiki-base 的核心参考。

**值得借鉴的设计：**
1. confidence 标签分了 4 级（EXTRACTED → INFERRED → AMBIGUOUS → UNVERIFIED），比我们的 4 级（confirmed/emerging/opinion/hypothesis）更面向"信息提取行为"而非"知识状态"。两个体系各有优势
2. 两步 ingest 链式思考——长内容先分析再生成，避免一次性吞太多信息导致质量下降
3. 知识图谱可视化——离线 HTML，社区聚类，拖拽交互。这个可以作为后面的参考
4. session-start hook 自动注入上下文——和我们 agent.md 的思路一致
5. 级联删除——删了 source 自动清理关联页面和反向链接

**和我们设计的差异：**
- 它用 `--platform` 适配多平台，我们计划用统一 API/CLI 做到真正的 Agent-无关
- 它的缓存是 JSON 文件，我们计划用 SQLite，检索能力更强
- 它的知识图谱是离线 HTML，我们考虑用 Quartz 做静态网站

## 来源
- GitHub: https://github.com/sdyckjq-lab/llm-wiki-skill
- 采集时间: 2026-05-06

## 相关
- [[llmwiki-lucasastorian]]
- agent-agnostic-memory（待收录）
- ingest-two-step-pipeline（待收录）
- knowledge-graph-visualization（待收录）
