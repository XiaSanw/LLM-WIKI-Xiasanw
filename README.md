# LLM Wiki Base — Agent 无关的个人知识平台

基于 Karpathy llm-wiki 方法论，结合社区 20+ 开源项目的架构洞察，设计一个多领域、wiki+RAG 并存、**任何 Agent 都能调用的**个人知识库系统。

### 真正的动机

每天用 AI 的人都会遇到一个问题：每开一个新 Agent 会话，它就是一张白纸。上次讨论过的决策、学到的洞察、积累的上下文，全部归零，你需要重新解释背景。

这个系统要解决的问题不是"建个 wiki 方便搜索"，而是**让 AI 和你共享同一段知识记忆**——每次会话沉淀下来的知识，成为下次会话的起点。不管未来换什么 Agent 工具，知识只增不减。

### 一份知识，三个读者

同一份 Markdown 文件，不同的消费方式：

```
你（人类） ──→ 浏览 Quartz 静态网站 / 直接读 Markdown 文件
Agent     ──→ 通过统一接口读写，作为 context 注入新会话
RAG       ──→ 原始文档全文检索，查到 wiki 没消化到的细节
```

- **你看**：结构化、可浏览、可搜索的百科全书
- **Agent 看**：按需检索的上下文，注入到每次新会话
- **RAG 看**：原始文档的原文，确保细节不丢失

三者背后是同一份 Markdown 文件，文件系统是唯一真相源。

## 核心哲学：知识编译，而非检索增强

Karpathy 的核心批判：传统 RAG 的问题是"每次提问都重新搜一遍图书馆"，知识无法积累、无法关联、无法进化。

正确的做法是让 AI 当**知识编译器**——先把所有资料读一遍，整理成结构清晰、彼此关联的百科全书。以后提问，直接从百科书里找答案。

```
RAG：ingest → chunk → index → retrieve → rerank → prompt-pack → generate → cite
      ↑ 每次查询都走完整链路，知识不积累

Wiki：ingest → 理解 → 关联 → 编译 → 持久化 → 查询时直接引用
      ↑ 知识在写入时就已经被理解和关联了，越用越厚
```

但 wiki 不是 RAG 的替代品，两者是互补关系：

| | RAG | llm-wiki |
|---|---|---|
| 适合的问题 | "那个合同里违约金是多少？" | "我对 AI Agent 都有哪些认知？" |
| 数据量 | 海量文档、快速变化 | 个人/团队知识沉淀、中等规模 |
| 处理时机 | 查询时实时检索 | 预先消化整理 |
| 优势 | 不丢细节，原文可追溯 | 跨文档关联、综合洞察 |
| 劣势 | chunk 割裂上下文 | 预处理有成本，频繁更新跟不上 |

## 架构设计

### 整体结构

```
~/inbox/                          ← 唯一入口，零摩擦捕获
    │
    ▼  AI 定时扫描，自动分类路由
    │
~/kb/
├── work/                         ← 工作领域
│   ├── raw/                      ← 原始素材（AI 只读）
│   ├── wiki/                     ← 结构化知识（AI 维护）
│   │   ├── entities/             ← 实体页：具体的人、工具、概念
│   │   ├── topics/               ← 主题页：知识领域、学习路径
│   │   ├── sources/              ← 素材摘要
│   │   ├── comparisons/          ← 对比分析
│   │   └── synthesis/            ← 综合分析
│   └── .wiki-schema.md           ← 该领域的质量标准
├── research/                     ← 科研领域（同上结构）
├── stocks/                       ← 股票领域（同上结构）
├── projects/                     ← 横向课题（同上结构）
├── shared/                       ← 跨领域共享域
│   ├── wiki/entities/            ← 人物、工具、偏好（跨域通用）
│   └── wiki/topics/              ← 方法论、思维框架
└── global-search/                ← 全局检索层
    ├── fts-index/                ← SQLite FTS5 全文索引
    └── vector-index/             ← embedding 语义索引（可选）
```

### 设计原则

1. **Agent 无关** — 不绑定任何特定 Agent 工具。Markdown 文件是通用格式，任何 Agent 通过统一接口都能读写。今天用 Claude Code，明天换别的，知识不迁移
2. **入口只有一个** — ~/inbox/，扔进去就走，分类是 AI 的事
3. **领域隔离** — 每个领域独立 wiki，避免链接污染和检索噪音
4. **共享域做桥梁** — 跨域通用的工具、人物、方法论放 shared/
5. **raw 不可变 + wiki 可进化** — 原始文档永不丢失，wiki 持续生长
6. **RAG 做兜底** — wiki 消化会损失细节，RAG 保留原文全文检索
7. **文件系统是唯一真相源** — 数据库索引是派生的，可随时从文件重建。你随时能直接打开 Markdown 阅读

## 关键机制

### 1. 素材生命周期

```
你看到感兴趣的东西
      │
      ▼
  丢进 ~/inbox/
      │
      ▼  AI 定时扫描（每小时/每天）
      │
  去重检测（SHA256）
      │
      ├─ 重复 → 跳过，记录日志
      │
      └─ 新素材 → 自动分类路由
                    │
                    ├─ 明确归域 → 进入对应领域候选区
                    └─ 不确定 → 标记 [待确认]，通知你
      │
      ▼
  候选区 approval queue
      │
      ├─ 你确认 → AI ingest（消化→提取概念→更新wiki→建立链接）
      └─ 你纠正 → 重新路由
      │
      ▼
  wiki 页面生成，状态标记为 draft
      │
      ├─ 你确认 / 被多次引用 → verified
      ├─ 90 天未更新 → stale（检索降权，不删除）
      └─ 你标记过时 → archived（隐藏但可找回）
```

### 2. 分类路由

AI 根据素材内容自动判断归属领域：

- 涉及公司、财报、股价、行业趋势 → stocks/
- 涉及论文、研究方法、学术前沿 → research/
- 涉及项目交付、合同、合作方 → projects/
- 涉及日常开发、技术决策、会议纪要 → work/
- 跨两个以上领域、或属于通用方法论 → shared/

同一素材可以出现在多个领域的不同视角中。比如一篇"用 AI 做量化预测"的论文：
- 在 research/ 里关注方法论和模型设计
- 在 stocks/ 里关注实际交易策略和回测结果
- 两边各有一个摘要页，互相链接但不污染

### 3. 知识老化管理

| 状态 | 含义 | 检索行为 |
|---|---|---|
| draft | AI 刚创建，未经人工确认 | 正常检索 |
| verified | 人工确认或长期被引用 | 检索加权提升 |
| stale | 90 天未更新且无新素材引用 | 检索降权 + 标注 ⚠️ |
| archived | 确认过时 | 默认不显示，可手动查找 |

关键原则：**永远不自动删除任何东西。** 过时只是降权或隐藏，随时可找回。

### 4. 去重机制

- 素材级别：SHA256 hash，同一内容不重复存储
- 去重缓存跨领域共享
- 去重数据库可随时从 raw/ 文件重建

### 5. 检索策略

```
用户查询
    │
    ├── ① 标题/标签精确匹配（SQLite FTS5）
    │
    ├── ② Wiki 页面语义搜索（embedding）
    │      verified 页面加权 > draft > stale
    │
    └── ③ RAG raw 文档兜底
           前两步结果不足时自动触发
```

结果排序：verified wiki > 高引用 wiki > draft wiki > raw RAG > stale wiki

## 潜在问题及对策

| 问题 | 对策 |
|---|---|
| AI 分类出错你看不见 | approval queue + 每日摘要通知，可一键纠正 |
| 领域边界模糊 | 一素材可关联多域，shared/ 做跨域桥梁 |
| 知识老化变噪音 | 5 状态生命周期，stale 降权不删除 |
| 入口太方便导致过载 | AI 定期输出"本周值得精读的 N 篇" |
| wiki 消化丢失细节 | RAG 保留原始文档全文检索兜底 |
| 旧版观点残留 | wiki 页面有时序意识 + git 历史追溯 |
| 分类过细制造摩擦 | taxonomy 从使用中涌现，不预设死 |

## 技术栈

```
存储：    本地 Markdown 文件 + SQLite FTS5 全文索引
接口：    统一的读写 CLI/API，任何 Agent 都能调用（不绑定特定平台）
Agent：   Claude Agent SDK（初始驱动）+ 后续扩展其他平台
Skill：   复用 llm-wiki-skill 的 ingest/query/lint/digest 工作流
发布：    Quartz v4 生成静态 wiki 网站（人浏览用）
检索：    grep/FTS5 精确匹配 → embedding 语义搜索 → RAG 兜底
版本：    git 追踪一切变更
```

全部本地运行，不引入 PostgreSQL、Redis、Docker 等额外依赖。

## 参考项目

### 核心参考

- **Karpathy llm-wiki gist** — 原始方法论，三层架构（raw/wiki/schema），三操作（ingest/query/lint）
- **sdyckjq-lab/llm-wiki-skill** (1.3k stars) — 生产级 skill 封装，SHA256 去重，四级 confidence 标签，多平台适配
- **Astro-Han/karpathy-llm-wiki** (718 stars) — 最简实现，agentskills.io 标准，7 天 94 篇文章的实战验证

### 架构参考

- **lucasastorian/llmwiki** (788 stars) — "文件系统是唯一真相源"，SQLite 是派生索引可随时重建
- **Pratiyush/llm-wiki** (215 stars) — 5 状态生命周期（draft→reviewed→verified→stale→archived），从 agent 会话提取知识
- **Oshayr/LLM-Wiki** (38 stars) — 10 个自治 agent 分工，9 级新鲜度系统，FSRS 间隔复习
- **dimknaf/braindb** (47 stars) — 带 certainty/importance 的实体类型，5 种关系类型，时间衰减权重
- **praneybehl/llm-wiki-plugin** (35 stars) — token 效率优化，分片索引，BM25 兜底
- **pin-llm-wiki** (56 stars) — 分级 fetch（brief/standard/deep），软删除归档

### 跨域/多领域参考

- **Amb2rZhou/intern-clawd** (51 stars) — 双域架构（work/life）+ shared-wiki，定时 ritual
- **swarmclawai/swarmvault** (335 stars) — approval queue，epistemic tags，代码感知 ingest
- **asakin/llm-context-base** (65 stars) — emergent taxonomy，分类从使用中涌现不预设
- **tieubao/til** (65 stars) — Zettelkasten + llm-wiki 混合，inbox 分流模式

### 非 llm-wiki 的对比参考

- **kiwifs/kiwifs** (359 stars) — 多协议知识文件系统，janitor 检测 stale，episodic memory
- **kytmanov/obsidian-llm-wiki-local** (463 stars) — 双模型 pipeline，rejection feedback loop，人工编辑保护
- **mem0** — agent-agnostic 记忆中间件，append-only 的利弊
- **cognee** — knowledge graph + 双存储模型，improve 反馈循环
- **Letta (MemGPT)** — 结构化 memory block 的 trade-off

## 认知笔记

### wiki 和 RAG 的真正关系

llm-wiki 圈子里常喊"wiki over RAG"，但这不是非此即彼。真正的问题不是二选一，而是**什么信息走什么路径**：

- 需要原文精确引用的 → RAG
- 需要理解和关联的 → wiki
- 两者都需要的 → 先 wiki 后 fallback RAG

Karpathy 没说只用 wiki 就够了。他说的是大部分人**只做了 RAG 那一步**，缺了更重要的知识内化环节。wiki 是 RAG 的上游加工，不是替代品。

### 编译的价值不在于整理，在于积累

RAG 每次查询都是从零开始，上次查过什么不影响这次。wiki 的核心优势不是"整理得好看"，而是**上一次的消化成果会成为下一次查询的起点**。知识复利。

### schema 是 AI 知识库的质量命门

没有 schema，AI 每次整理随心所欲。有了 schema：
- 不同模型产出的质量一致
- 人可以 review rule，而不需要 review 每篇文章
- 质量是可量化、可检查的，不是靠感觉

### 知识老化是比检索速度更重要的问题

检索慢 100ms 你能忍，但搜索出一堆两年前已经过时的观点你会不信任这个系统。知识库的死亡不是被填满，是被不再信任。

### 入口摩擦决定使用率

如果每次丢东西进去要填分类、打标签、写摘要，一周后你就不会用了。必须做到：**扔进去就走，AI 处理剩下的。** 宁可 AI 分错了你纠正一次，也不要让你每次都自己分。

### 真正的价值不在搜索，在跨会话积累

建 wiki 不是为了"以后搜索方便"，而是**让每次新 Agent 会话不是从零开始**。Wiki 是 Agent 的长期记忆——上次消化过的知识成为下次查询的起点。

### 知识库必须 Agent-无关

技术栈会变，Agent 工具会换。今天用 Claude Code，明天可能是 ChatGPT、Cursor，或者还没出现的工具。所以知识存储不能用任何平台专属格式——Markdown 文件是最大公约数。Agent 只负责读写，知识本身永远是你的。

### 一份知识，三种用途

同一份 Markdown 文件服务于三个完全不同的场景：给你浏览（Quartz 网页）、给 Agent 做上下文（skill 接口）、给 RAG 做精确检索（原文查找）。不是三个系统，是三套接口，背后一份数据。

### 自动化程度越高，review 机制越重要

AI 自动分类 ingest 的准确率不会是 100%，而且错误会在静默中蔓延。必须要有 approval queue 或每日摘要这种轻量 review 机制，让纠错成本趋近于零。

### 不预设分类体系

这是 asakin/llm-context-base 的核心洞察：taxonomy 应该从使用中涌现，不是在设计阶段就定死。领域会合并、分裂、重组，预设的分类体系半年后自己都不认识。
