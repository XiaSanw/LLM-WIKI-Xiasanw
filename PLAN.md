# llmwiki-base 实施计划

## 项目目标

构建一个 **Agent 无关的个人知识平台**，让 AI 和你共享同一段知识记忆。Markdown 文件是唯一真相源，任何 Agent 都能读写。

## 交互模型

```
日常使用（Skill 命令为主）：
  打开 Claude Code（任何目录）
    ├─ /llmwiki-ingest  → 扔链接/文件 → Agent 消化入库
    ├─ /llmwiki-query   → 问问题 → Agent 检索回答
    └─ /llmwiki-lint    → 跑检查 → Agent 修问题

浏览知识：
  Quartz 静态网站 → 目录浏览 + 双向链接 + 全文搜索 + 知识图谱
```

### 核心交互决策

- **Agent 启动**：一套 agent.md，自检路由（能读本地文件→主机模式，否则 API→远程模式）
- **写入素材**：对话直接 ingest + inbox 手动触发扫描（处理完自动删源文件）
- **外挂大脑**：用户指令触发 → Agent 读 index+log → grep wiki → 注入 context
- **Review**：Agent 变更通知，人不反对即确认
- **质量**：Agent 自查 + lint-wiki.sh 双重检查
- **老化**：5 状态（draft→verified→stale→archived），lint 时自动检测 stale
- **多域路由**：人指定 inbox + Agent 自动分类
- **Shared 域**：只放个人元认知（偏好、框架、原则）

### 系统架构

```
Mac Mini 主机
┌──────────────────────────────┐
│  kb/  (Markdown 文件系统)     │
│       ↕                     │
│  agent.md (自检路由)          │  ← Agent 直接读写（主机模式）
│  Skill 脚本                   │
│                              │
│  最小只读 API :8000 (第二批)   │  ← GET + 搜索（远程模式）
└──────────┬───────────────────┘
           │ HTTP
    其他电脑 ──→ agent.md (自检路由 → 远程模式，只能查)
```

## 第一批：核心闭环 + Quartz

### 任务 1：重写 agent.md

**目标**：Agent 启动时自动判断主机/远程模式，支持写入和外挂大脑两种工作模式。

**要求**：
- 自检路由：尝试读 `kb/ai/index.md` → 成功=主机模式（直接文件），失败=尝试 API → 远程模式
- 双模式：写入模式（ingest 工作流）、外挂大脑模式（query 工作流）
- Agent-agnostic：不绑定特定 Agent 工具，任何能读 Markdown 的 Agent 都能用
- 引用新增的 domain 级文件：index.md、log.md

**涉及文件**：`agent.md`

### 任务 2：增强 lint-wiki.sh

**目标**：质量检查脚本加入 stale 检测，覆盖 schema v2.0 全部标准。

**现有检查项**：links、sources、content、depth、index

**新增检查项**：
- stale 检测：扫描所有页面 `updated` 字段，超过 90 天标记为 stale
- 悬空链接禁止：检查 `[[待创建]]` 格式（改为纯文本）
- schema v2.0 合规：实体页 1500 字符下限、主题页 5 条核心观点、摘要 40% 信息保留率

**涉及文件**：`skill/scripts/lint-wiki.sh`

### 任务 3：回填 8 篇 wiki 到 schema v2.0

**目标**：现有 8 篇 wiki 页面全部达到 schema v2.0 硬性标准。

**检查项**：
- 实体页 sources 字段回填
- 实体页字数检查（是否达 1500 字符）
- 主题页核心观点是否达 5 条
- 禁止占位文本（"待补充"、"暂无"）
- 悬空链接修复（`[[待创建 xx]]` → 纯文本标注）

**涉及文件**：
- `kb/ai/wiki/entities/claude-code.md`
- `kb/ai/wiki/entities/fashion-ai.md`
- `kb/ai/wiki/entities/letta.md`
- `kb/ai/wiki/entities/llm-wiki-skill.md`
- `kb/ai/wiki/entities/llmwiki-lucasastorian.md`
- `kb/ai/wiki/entities/mem0.md`
- `kb/ai/wiki/topics/agent-memory-approaches.md`
- `kb/ai/wiki/topics/ai-ecommerce-image-generation.md`

### 任务 4：Quartz 发布

**目标**：将 wiki 发布为可浏览的静态网站。

**使用**：项目已有的 `quartz-skill/`

**产出**：一个可部署的静态网站，支持目录浏览、双向链接、全文搜索、知识图谱。

**涉及文件**：`quartz-skill/`、Quartz 配置

---

## 第二批：基础设施

### 任务 5：最小只读 API

**目标**：让远程 Agent 能查询知识库。

**范围**：
- 一个 Python 文件，标准库 http.server，不引入框架
- GET /pages/... — 读取 wiki 页面
- POST /search?q=... — grep 全文搜索
- 不做写入，不做 lint，不做认证

### 任务 6：移植 source-registry

**目标**：从参考系统移植 source-registry.sh + source-registry.tsv，标准化来源路由。

**来源**：`/ai/reference/llm-wiki/.claude/skills/llm-wiki-skill/scripts/source-registry.sh`

### 任务 7：移植 adapter-state

**目标**：从参考系统移植 adapter-state.sh，标准化来源状态检测。

**来源**：`/ai/reference/llm-wiki/.claude/skills/llm-wiki-skill/scripts/adapter-state.sh`

---

## 当前状态

```
kb/ai/
├── .wiki-schema.md    ← v2.0（含硬性数字标准）
├── index.md           ← v2.0 新建
├── log.md             ← v2.0 新建
├── raw/ (1 篇)
└── wiki/
    ├── entities/ (6 篇)
    └── topics/ (2 篇)
```

## 版本记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-24 | v0.3 | Grill 完成，确定交互模型 + 架构 + 两批实施计划 |
| 2026-05-12 | v0.2 | Schema 硬性标准化 (v2.0)，新增 index.md + log.md |
| 2026-05-06 | v0.1 | 项目方向校准，AI 领域 Schema + 3 Skill + 3 篇 wiki |
