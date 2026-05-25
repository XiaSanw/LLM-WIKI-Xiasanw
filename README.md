# LLM Wiki

> 让 AI 和你共享同一段长期记忆 —— 基于 Karpathy llm-wiki 的 Agent 无关个人知识库系统。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.10+-green.svg)](https://www.python.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-success.svg)]()

---

## 为什么需要这个？

**每开一个 AI Agent 新会话，它就是一张白纸。** 你上次花半小时和它讨论的技术决策、发现的规律、积累的上下文 —— 全部归零。

传统 RAG 的做法是每次查询时重新检索文档，知识无法积累：

```
RAG：  ingest → chunk → index → retrieve → rerank → pack → generate
      └──────── 每次查询走完整链路，知识不积累 ────────┘

Wiki： ingest → 理解 → 关联 → 编译 → 持久化 → 查询时直接引用
      └────── 知识在写入时已被理解和关联，越用越厚 ──────┘
```

| | RAG | LLM Wiki |
|---|---|---|
| 适合的问题 | "那个合同里违约金是多少？" | "我对 AI Agent 都有哪些认知？" |
| 数据量 | 海量文档、快速变化 | 个人知识沉淀、中等规模 |
| 处理时机 | 查询时实时检索 | 预先消化整理 |
| 优势 | 不丢细节，原文可追溯 | 跨文档关联、综合洞察 |

## 核心设计

### 一份知识，三个消费者

同一份 Markdown 文件，不同角色各取所需：

```
你（人）  ──→ Quartz 静态网站 / Obsidian 直接浏览
Agent    ──→ agent.md 引导，读写 wiki，注入上下文
程序     ──→ HTTP API（GET/PUT /pages + POST /search）
```

### Agent 无关

知识库是纯 Markdown 文件系统，不绑定任何工具。Claude Code、Codex CLI、OpenClaw 或其他 Agent 都能直接读写同一份知识。你的知识，不属于任何一个平台。

### 消化流程

每次 ingest 走三个阶段：

1. **榨干素材** — 提取观点、数据、案例、实操内容，信息保留率 40%+
2. **深度写作 + 自审** — 写完追问"读者看完能做什么决策？"，答不上来继续写
3. **收尾验证** — 自动检查断链、内容深度、stale 页面，有问题当场修

## 快速开始

### 前置条件

- Python 3.10+
- Node.js 18+（仅网站浏览需要）
- Git

### 1. 初始化知识库

```bash
git clone https://github.com/your-username/llmwiki-base.git
cd llmwiki-base

# 创建你的个人知识库目录和初始文件
mkdir -p kb/wiki/{entities,topics,projects,sources,comparisons,synthesis}
mkdir -p kb/raw/images

# 写你的 about-me.md（Agent 启动时读取，了解你的背景）
cat > kb/about-me.md << 'EOF'
# 关于我
## 当前项目
- xxx
## 关注领域
- xxx
EOF
```

### 2. 主机模式（Claude Code / 本地 Agent）

Agent 打开项目后自动读 `agent.md`，然后按指引操作：

```bash
# 直接用自然语言，或 skill 命令
/llmwiki-ingest "https://example.com/article"   # 消化文章
/llmwiki-query "Agent 记忆方案有哪些"             # 搜索知识库
/llmwiki-lint                                    # 质量检查
```

### 3. 远程模式（HTTP API）

```bash
python server/wiki_api.py          # 启动 API → localhost:8001

# 读写页面
curl localhost:8001/health
curl localhost:8001/pages/wiki/entities/foo.md
curl -X PUT localhost:8001/pages/wiki/test.md -d '{"content":"# Hello"}'
curl -X POST 'localhost:8001/search?q=Agent'
```

### 4. 浏览网站

```bash
cd quartz && npx quartz build --serve   # → localhost:8080
```

### 5. Inbox 快速收集

扔文件到 `~/inbox/`，对 Agent 说"扫一下 inbox"，自动消化并清理。

## 项目结构

```
llmwiki-base/
├── agent.md              ← Agent 入口（自检路由 + 三阶段 ingest 流程）
├── server/
│   └── wiki_api.py       ← HTTP API（零依赖，纯标准库）
├── skill/                ← llm-wiki Skill 实现
│   ├── platforms/        ← Claude/Codex/OpenClaw 平台适配
│   └── scripts/          ← lint-wiki / source-registry
├── quartz/               ← Quartz v4 静态网站
├── quartz-skill/         ← Quartz 部署 Skill
├── kb/
│   ├── .wiki-schema.md   ← 质量标准 + 深度自审清单（6 种页面类型）
│   ├── about-me.md       ← 你的档案（框架模板，需自行填写）
│   ├── index.md          ← 内容索引
│   ├── log.md            ← 操作日志
│   ├── raw/              ← 原始素材存档（不可变）
│   └── wiki/
│       ├── entities/     ← 实体（工具、模型、人物、概念）
│       ├── topics/       ← 主题（知识领域、方法论）
│       ├── projects/     ← 项目跟踪
│       ├── sources/      ← 素材摘要
│       ├── comparisons/  ← 对比分析
│       └── synthesis/    ← 综合分析
└── .github/              ← CI / 模板（可选）
```

## 技术栈

```
存储：  Markdown 文件系统（唯一真相源）
索引：  grep 全文搜索
接口：  Skill 命令 + HTTP API
网站：  Quartz v4（双向链接 + 全文搜索 + 知识图谱）
API：   Python http.server（零外部依赖）
版本：  Git
```

全本地运行，零外部依赖。不需要 PostgreSQL、Redis、Docker。

## 核心理念

1. **Markdown 是唯一真相源** — 不绑定任何工具或平台
2. **Agent 无关** — 任何 AI Agent 都能读写同一份知识
3. **raw 不可变 + wiki 可进化** — 原文永不丢，理解持续生长
4. **先读再写** — 查看已有页面再决定是新建还是更新
5. **写完自查** — ingest 后自动质量检查，有问题当场修

## 参考

- [Karpathy llm-wiki](https://github.com/karpathy/llm-wiki) — 原始方法论
- [sdyckjq-lab/llm-wiki-skill](https://github.com/sdyckjq-lab/llm-wiki-skill) — 生产级 Skill 封装
- [lucasastorian/llmwiki](https://github.com/lucasastorian/llmwiki) — 文件系统真相源实现
- [jackyzha0/quartz](https://github.com/jackyzha0/quartz) — 静态网站生成器

## License

MIT
