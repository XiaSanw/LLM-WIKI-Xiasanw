# 关于我

> Personal Profile — Agent 启动时读取，了解用户背景和当前关注点

## 当前项目

| 项目 | 状态 | 说明 |
|---|---|---|
| llmwiki-base 个人知识库 | 进行中 | Agent 无关的个人知识管理平台 |
| 电力市场预测平台 | 筹备中 |参考 gupiao 等量化系统的架构|

## 关注领域

- AI 编程工具（Claude Code、Codex CLI、Cursor）
- 量化分析与数据看板（股票、电力市场）
- 个人知识管理（llm-wiki、Obsidian）
- AI Agent 记忆方案
- 低成本 AI 工具链（CPA、公益站）

## 日常场景

- 浏览技术文章/开源项目 → 消化进知识库
- 开会 → 会议纪要存入对应项目
- 做新项目 → 在知识库里找之前的参考
- 调研新技术 → 搜 L 站/V2EX 后整理入库

## 使用偏好

- 语言：中文为主，技术术语保留英文
- 知识库交互：Skill 命令为主（/llmwiki-ingest、/llmwiki-query）
- 文件名：英文 kebab-case，标题中文 + 英文副标题
- 日期不放文件名，写在 frontmatter 里

## 当前知识库规模

<!-- Agent 每次 ingest 后更新以下数字 -->
- Wiki 页面：12 篇（实体 8 + 主题 2 + 素材 2）
- 项目：0 个
- API 服务：localhost:8000（读写 + 搜索）
- 网站：http://localhost:8080
- Inbox：~/inbox/（扔文件进去 → "扫一下 inbox"）

## 常用命令

```bash
# 启动 API
python server/wiki_api.py

# 启动网站
cd quartz && npx quartz build --serve

# 质量检查
bash skill/scripts/lint-wiki.sh kb all
```
