# 重写 agent.md：自检路由 + 双模式入口

## 目标

将 agent.md 从当前的静态指令文件升级为**智能入口**：Agent 启动时自动判断自己是在主机（直接文件访问）还是远程（API 访问），并支持写入模式和外挂大脑模式两种工作模式。

## 需求

### 1. 自检路由

Agent 启动时执行自检：

```
1. 尝试 Read kb/ai/index.md
   → 成功 → 主机模式（使用 Read/Write/Grep/Bash 直接操作文件）
   → 失败 → 进入步骤 2
2. 尝试 HTTP GET localhost:8000/health (或配置的 API URL)
   → 成功 → 远程模式（通过 API 调用操作知识库）
   → 失败 → 告知用户无法连接知识库，提示检查主机状态或切换环境
```

### 2. 双工作模式

**写入模式**（ingest）：
- 触发：用户说"消化"、"整理"、"收录"、"/llmwiki-ingest"、给链接/文件
- 流程：读 schema → 读 index+log → 提取素材 → 去重 → 存 raw → 生成/更新 wiki → 更新 index+log → 跑 lint → 报告变更

**外挂大脑模式**（query）：
- 触发：用户说"关于XX"、"查一下"、"/llmwiki-query"、问知识库相关问题
- 流程：读 index → grep/wiki 搜索 → 读相关页 → 综合回答 + 引用来源 → 建议是否保存新发现

### 3. Agent-agnostic

- 不绑定任何特定 Agent 工具（Claude Code、OpenClaw、Codex-CLI 等均可用）
- 不依赖特定平台的文件系统路径
- 不假设特定的工具调用语法（Read vs cat、Grep vs grep）

### 4. 保留内容

- 项目结构说明（更新版，含 index.md + log.md）
- 可用 Skill 列表（/llmwiki-ingest、/llmwiki-query、/llmwiki-lint）
- 核心原则（5 条）

### 5. 新增内容

- 自检路由逻辑
- 主机模式操作规范（直接文件系统）
- 远程模式操作规范（API 调用，最小只读 API 的范围）
- 模式切换说明

## 涉及文件

- `agent.md` — 重写

## 完成标准

- [ ] 自检路由逻辑清晰，Agent 能独立判断模式
- [ ] 写入模式和外挂大脑模式有明确触发条件和操作流程
- [ ] 主机模式操作路径完整（读 index → schema → ingest/query → lint）
- [ ] 远程模式操作路径清晰（API 端点调用方式）
- [ ] 不包含任何特定 Agent 工具的专属语法
- [ ] 项目结构图更新（含 index.md、log.md）
