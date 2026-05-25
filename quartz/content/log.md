# 操作日志

> 记录知识库的所有变更历史。每次操作必须写日志，标注标签。

## 日志标签

| 标签 | 含义 |
|---|---|
| `[ingest]` | 从外部素材消化入库 |
| `[content]` | 创建或更新 wiki 页面 |
| `[comparison]` | 触发自动对比分析 |
| `[synthesis]` | 触发自动综合分析 |
| `[fix]` | 质量修复（lint 问题、断链、格式） |
| `[system]` | 系统级变更（schema、脚本、agent.md、基础设施） |
| `[style]` | 网站美化、UI 调整 |
| `[init]` | 初始化操作 |
| `[seed]` | 点子孵化——种子创建、讨论、充实 |
| `[task]` | 任务管理——待办增删、排序、归档 |
| `[asset]` | 资产管理——资产增改、锐评、到期提醒 |
| `[review]` | Agent 定期巡检——种子归档、任务清理、域名到期检查 |

---

## 2026-05-26 — KB 三模块扩展

- **标签**: `[system]` `[seed]` `[task]` `[asset]`
- **操作**：从"纯知识库"升级为"个人操作系统"，新增三个功能模块
- **新增**：
  - `kb/seeds/` — 点子孵化器（两阶段生长：一句话 → Agent 讨论 → 成熟度评分，30 天未讨论自动归档）
  - `kb/tasks/todo.md` — 极简任务看板（勾选格式 + @项目 + 截止日，Agent 排序呈现）
  - `kb/assets/` — 数字/实体资产簿（每资产一文件 + 自动汇总看板，Agent 锐评，密码脱敏）
- **更新**：
  - `.wiki-schema.md` v2.1：新增 Seed/Task/Asset 三种页面类型及其深度自审清单
  - `agent.md`：新增三个工作模式（点子孵化/任务管理/资产管理）+ 启动扫描 + 定期巡检
  - `about-me.md`：拆为「工作画像」（Agent 必读）+「个人画像」（Agent 自动生成）
  - `index.md`：纳管新模块入口
  - `.gitignore`：新增 seeds/tasks/assets 目录排除
- **设计决策**：
  - 三个模块放在 `kb/` 下与 `wiki/` 平级（语义隔离：知道 vs 想做 vs 拥有）
  - seeds 用混合触发（Agent 提醒 + 用户决定何时孵化）
  - assets 敏感字段用占位符，不存真实密码
  - Quartz 需配 exclude 排除 seeds/tasks/assets（私密内容不公开）
- **规模**：14 页（8 实体 + 2 主题 + 2 素材 + 1 对比 + 1 综合）+ 3 新模块

## 2026-05-24 — 开发实录

- **标签**: `[synthesis]` `[content]`
- **操作**：将整个开发过程中的设计演变和踩坑经验整理为综合分析
- **新增**：综合分析 1 篇（llmwiki-base-开发实录）
- **规模**：14 页（8 实体 + 2 主题 + 2 素材 + 1 对比 + 1 综合）

---

## 2026-05-24 — Agent 记忆方案三方对比

- **标签**: `[comparison]` `[content]`
- **操作**：首次自动综合检测触发。tag=[agent] 下 3 实体满足 comparison 阈值
- **新增**：对比分析 1 篇（claude-code-vs-letta-vs-mem0）
- **规模**：13 页

---

## 2026-05-24 — 写作流程改造 + 基础设施

- **标签**: `[system]` `[fix]`
- **操作**：
  - schema 深度自审清单取代最低标准
  - agent.md ingest 改三阶段（榨干→深度写作→验证）
  - lint-wiki.sh 新增 check_thresholds（第 7 项）
  - 自动综合检测加固（agent.md 步骤 12 强制执行）
  - 全部 12 页标题中文化 + 英文副标题
  - 文件名去日期前缀
  - 新增 projects/ 页面类型 + 目录
  - 新增 about-me.md 用户档案
  - 新增图片素材支持（raw/images/ + source-registry）
  - Inbox 扫描逻辑
  - API 新增 PUT 写入端点
  - git init
- **更新**：Claude Code 700→5871 字，Letta 1463→5975 字，CPA 1500→10943 字
- **规模**：12 页

---

## 2026-05-24 — 第二批基建完成

- **标签**: `[system]`
- **操作**：
  - 最小 API 服务（GET/PUT /pages + POST /search）
  - 移植 source-registry（10 种来源路由）
  - 移植 adapter-state（5 状态检测）
  - 去域化（kb/ai/ → kb/）
  - Quartz 浏览引导优化

---

## 2026-05-24 — Codex / CPA 订阅方案

- **标签**: `[ingest]` `[content]`
- **操作**：调研 Linux.do 论坛，消化 CPA 搭建、GPT Plus 购买、Codex 免费方案
- **新增**：素材摘要 1 篇（codex-cpa-research）+ 实体页 1 篇（cpa-cli-proxy-api）
- **规模**：12 页

---

## 2026-05-24 — gupiao 股票量化系统

- **标签**: `[ingest]` `[content]`
- **操作**：消化 GitHub 开源项目 gupiao，作为电力市场预测平台的架构参考
- **来源**：https://github.com/zxc1518343069/gupiao
- **新增**：素材摘要 1 篇 + 实体页 1 篇
- **规模**：10 页

---

## 2026-05-12 — Schema v2.0

- **标签**: `[system]`
- **操作**：全面升级质量标准，加入硬性量化标准、内容分级、自动触发规则
- **新增**：index.md、log.md

---

## 2026-05-06 — 质量修复

- **标签**: `[fix]`
- **操作**：修复 14 个死链接，改为纯文本待收录标注

---

## 2026-05-06 — Agent Memory 生态

- **标签**: `[ingest]` `[content]`
- **操作**：消化 Agent 记忆方案相关素材
- **新增**：实体页 3 篇 + 主题页 1 篇

---

## 2026-05-05 — 初始化

- **标签**: `[init]`
- **操作**：创建知识库
- **新增**：实体页 3 篇 + 主题页 1 篇 + Raw 素材 1 篇
