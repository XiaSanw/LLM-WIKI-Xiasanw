# LLM Wiki

基于 Karpathy llm-wiki 方法论的 Agent 无关个人知识库系统。

**核心问题**：每开一个新 Agent 会话，它就是一张白纸。上次讨论的决策、学到的洞察、积累的上下文全部归零。

**解决方案**：让 AI 和你共享同一段知识记忆。每次会话沉淀下来的知识成为下次会话的起点。Markdown 文件是唯一真相源，不绑定任何 Agent 工具。

## 一份知识，三个读者

同一份 Markdown 文件，不同的消费方式：

```
你（人）   ──→ Quartz 静态网站 / Obsidian 直接浏览
Agent     ──→ agent.md 引导，读写 wiki，注入上下文
RAG       ──→ raw/ 原始文档兜底，查到 wiki 没消化到的细节
```

## 知识编译，而非检索增强

Karpathy 的核心批判：传统 RAG 每次提问都重新搜一遍图书馆，知识无法积累。正确做法是让 AI 当**知识编译器**——先把资料读一遍，整理成结构清晰、彼此关联的百科全书。

```
RAG：ingest → chunk → index → retrieve → rerank → prompt-pack → generate
      ↑ 每次查询走完整链路，知识不积累

Wiki：ingest → 理解 → 关联 → 编译 → 持久化 → 查询时直接引用
      ↑ 知识在写入时已经被理解和关联了，越用越厚
```

| | RAG | LLM Wiki |
|---|---|---|
| 适合的问题 | "那个合同里违约金是多少？" | "我对 AI Agent 都有哪些认知？" |
| 数据量 | 海量文档、快速变化 | 个人知识沉淀、中等规模 |
| 处理时机 | 查询时实时检索 | 预先消化整理 |
| 优势 | 不丢细节，原文可追溯 | 跨文档关联、综合洞察 |

## 项目结构

```
llmwiki-base/
├── agent.md              ← Agent 入口（自检路由 + 三阶段 ingest）
├── README.md             ← 本文件
├── 迭代报告.md            ← 迭代记录
├── kb/                   ← 知识库本体
│   ├── about-me.md       ← 用户档案（Agent 启动必读）
│   ├── .wiki-schema.md   ← 质量标准 + 深度自审清单（6 种页面类型）
│   ├── Index.md          ← 内容索引
│   ├── log.md            ← 操作日志
│   ├── raw/              ← 原始素材（不可变，含 images/）
│   └── wiki/
│       ├── entities/     ← 实体（工具、模型、人物、概念）
│       ├── topics/       ← 主题（知识领域、方法论）
│       ├── projects/     ← 项目跟踪（进展、决策、会议）
│       ├── sources/      ← 素材摘要
│       ├── comparisons/  ← 对比分析
│       └── synthesis/    ← 综合分析
├── server/
│   └── wiki_api.py       ← API 服务（GET/PUT /pages + POST /search）
├── skill/                ← llm-wiki skill（平台适配 + 脚本）
│   ├── platforms/        ← claude/codex/openclaw 适配
│   └── scripts/          ← lint-wiki / source-registry / adapter-state
└── quartz/               ← Quartz v4 静态网站
```

## 如何使用

### 主机上（Mac Mini）

Claude Code 中直接：

```
/llmwiki-ingest    → 消化素材，生成 wiki
/llmwiki-query     → 搜索知识库，注入上下文
/llmwiki-lint      → 质量检查
```

或自然语言："帮我消化这个链接" / "关于 XX 我有什么"

其他 Agent 打开项目 → 读 agent.md → 按指引操作。

### 远程

```bash
# 主机启动 API
python server/wiki_api.py    # → localhost:8000

# 远程调用
curl localhost:8000/health
curl localhost:8000/pages/wiki/entities/claude-code.md
curl -X PUT localhost:8000/pages/wiki/test.md -d '{"content":"# 测试"}'
curl -X POST 'localhost:8000/search?q=Agent'
```

### 浏览网站

```bash
cd quartz && npx quartz build --serve    # → localhost:8080
```

### Inbox

扔文件到 `~/inbox/`，然后对 Agent 说"扫一下 inbox"。处理完自动删源文件。

## 核心设计

### 写作质量：深度自审，而非凑字数

agent.md 的 ingest 分三阶段：
1. **榨干素材**：提取所有观点、数据、案例、实操。信息保留率 40%+
2. **深度写作 + 自审**：写完后逐条过 schema 的深度自审清单。"读者能做什么决策？"答不上来继续写
3. **收尾验证**：lint-wiki.sh 最终检查——1500 字符是底线，不是写作目标

### 质量保障：lint-wiki.sh 7 项检查

```
links · sources · content · depth · index · stale · thresholds
```

自动检测断链、空 sources、内容深度、stale 页面、自动综合阈值。

### 知识组织：标签 + 双向链接

不预设领域分类。同一份素材可以同时链接到项目、知识领域和工具实体。tags 和 `[[双向链接]]` 自动织成网。

### 来源管理：source-registry

10 种素材来源分三类：
- **核心主线**（PDF/Markdown/文本/图片）— 直接处理
- **可选外挂**（网页/X/公众号/YouTube/知乎）— 自动提取，失败回退手动
- **手动入口**（小红书）— 只接受粘贴

## 当前规模

| 类型 | 数量 |
|---|---|
| 实体页 | 8 |
| 主题页 | 2 |
| 素材摘要 | 2 |
| 对比分析 | 1 |
| 项目 | 0 |
| **总计** | **13** |

## 技术栈

```
存储：    Markdown 文件系统（唯一真相源）
索引：    grep / FTS5（计划中）
接口：    Skill 命令 + HTTP API
网站：    Quartz v4（双向链接 + 全文搜索 + 知识图谱）
脚本：    Bash（lint / source-registry / adapter-state）
API：     Python 标准库 http.server（零外部依赖）
版本：    Git
```

全部本地运行，无 PostgreSQL、Redis、Docker 等外部依赖。

## 版本

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-24 | v0.3 | 第二批基建 + 去域化 + 深度自审改造 + 首次 comparison |
| 2026-05-12 | v0.2 | Schema 硬性标准化 |
| 2026-05-06 | v0.1 | 项目初始化 |

## 参考

- [Karpathy llm-wiki](https://github.com/karpathy/llm-wiki) — 原始方法论
- [sdyckjq-lab/llm-wiki-skill](https://github.com/sdyckjq-lab/llm-wiki-skill) — 生产级 skill 封装
- [lucasastorian/llmwiki](https://github.com/lucasastorian/llmwiki) — 文件系统真相源
- [jackyzha0/quartz](https://github.com/jackyzha0/quartz) — 静态网站生成器
