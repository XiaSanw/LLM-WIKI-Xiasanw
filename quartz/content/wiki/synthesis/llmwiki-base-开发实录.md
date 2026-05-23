---
type: synthesis
confidence: hypothesis
created: 2026-05-24
tags: [llm-wiki, knowledge-base, development, lessons-learned, architecture]
---

# llmwiki-base 开发实录：从设计到踩坑

> Building a Knowledge Base — 个人知识库系统的设计演变、工程陷阱和实操经验

## 触发素材

- [[claude-code]] — 开发全程使用的 AI 编程工具
- [[llm-wiki-skill]] — 参考的核心 skill 封装
- [[llmwiki-lucasastorian]] — "文件系统是唯一真相源" 的理念来源
- [[gupiao-project-analysis]] — 首次真实 ingest 测试
- [[codex-cpa-research]] — 第二次 ingest，暴露出深度问题

## 核心设计演变

### 1. 多域隔离 → 去域化

**最初设计**：kb/ai/、kb/work/、kb/stocks/……每个领域独立 wiki。

**为什么废弃**：第一次真实 ingest 就暴露了问题——gupiao 项目同时涉及 AI 技术、股票量化、软件架构三个方向。强制塞进一个域是错的。真实知识是网状的，不是树状的。

**最终方案**：全放 kb/ 下，用 tags + 双向链接 组织。分类从使用中涌现，不预设。

### 2. "最低标准" → "深度自审"

**最初设计**：schema 定义质量标准："实体页 >= 1500 字符"、"主题页 >= 5 条核心观点"。

**为什么失效**：Agent 把数字当成了目标而非底线。所有页面压在 1500 字左右，内容刚好及格但流于表面。

**最终方案**：保留数字在 lint 里做最后闸门，但写作流程中 Agent 追求的是深度自审清单——"读者看完能做什么决策？"答不上来就继续写。数字只出现在验证阶段。

### 3. Agent 入口：两套 → 一套自检

**最初设计**：agent.md（主机）+ agent-remote.md（远程），用户手动切换。

**为什么废弃**：认知负担。用户要记住自己在哪台机器上、该用哪套配置。

**最终方案**：一套 agent.md，启动时自检路由——能读本地文件 → 主机模式，否则试 API → 远程模式。用户不用想。

### 4. 文件名：带日期 → 去日期

**最初设计**：素材摘要文件名 `2026-05-24-xxx.md`。

**为什么废弃**：日期在文件名里让浏览不直观，而且 frontmatter 的 `created` 字段已经记录了日期。

**最终方案**：文件名只用主题词（如 `codex-cpa-research.md`），日期写在 frontmatter 里。

## 工程踩坑实录

### 坑 1：gitignore 让 Quartz 找不到文件

**现象**：Quartz 构建输出 "Found 0 input files"，但 content/ 下明明有 19 个 .md 文件。

**根因**：Quartz 内部使用 globby 扫描文件时，设置了 `gitignore: true`，会读取 `.gitignore`。我们在 `.gitignore` 里加了 `quartz/content/`，glob 就把整个 content 目录跳过了。

**教训**：工具的隐式行为（Quartz 尊重 gitignore）和仓库管理约定（忽略生成目录）会产生冲突。修复方式是把 `quartz/content/` 从 gitignore 移除，改用 `rm -rf content && mkdir content` 的同步策略。

### 坑 2：oklch 颜色让 D3 图谱崩溃

**现象**：图谱组件空白，浏览器控制台报错 "Unable to convert color lab(...)"。

**根因**：Quartz 的关系图谱用 D3.js 渲染 SVG，D3 的内部色值解析器只认识 hex/rgb，不认识 CSS Color Level 4 的 oklch() 语法。浏览器把 oklch 转成 lab() 传给 JS，D3 直接崩溃。

**教训**：CSS 新特性（oklch、color-mix 等）在 JS 操作 SVG 的场景下仍不兼容。网站美化时如果用到图谱/图表组件，颜色保持在 hex 最安全。用 `culori` 库可以把 oklch 精确转换为等价的 hex。

### 坑 3：Bash 的 `set -e` 让 lint 脚本静默失败

**现象**：lint-wiki.sh 运行到一半无输出退出。

**根因**：`grep "^sources:"` 没找到匹配时返回 exit code 1，而脚本头有 `set -e`（遇错即停）。脚本直接死在半路，不给任何错误信息。

**教训**：`set -e` 脚本里，任何可能返回非零的命令都要加 `|| true`。`grep "^sources:"` → `grep "^sources:" || true`。

### 坑 4：Shell 的 `for link in $ALL_LINKS` 按空格拆词

**现象**：lint 脚本报虚假的断链 【待创建】 和 【xx】，但文件里明明是 【待创建 xx】。

**根因**：`$ALL_LINKS` 不加引号时，shell 按空格拆成多个词。`待创建 xx` 被拆成 `待创建` 和 `xx` 两个"链接"。

**教训**：含空格的文本用 `while IFS= read -r line; do ... done <<< "$VAR"` 而非 `for item in $VAR`。

### 坑 5：Agent 把字数下限当目标

**现象**：所有 entity 页面精准压在 1500 字。

**根因**：schema 写了"最少 1500 字符"，数字给了 Agent 一个可优化的目标——写到 1500 就停。

**教训**：数字标准放在最后验证（lint），写作过程中用描述性的深度问题引导（"读者看完能做什么决策？"），不让 Agent 有"已经够字数了"的停止信号。

### 坑 6：自动触发规则没人记得执行

**现象**：8 个实体中 Mem0/Letta/llmwiki 天然可对比（tag=[agent]），阈值 3+ 早已满足，但第一份 comparison 迟迟没生成。

**根因**：自动触发规则只写在 schema 里，Agent ingress 完成后没有人主动检查。

**教训**：依赖记忆的规则一定会被遗忘。把检查写成强制执行步骤（agent.md 步骤 12）和 lint 检查项（check_thresholds），双重保障。

## 设计哲学沉淀

### "数字是底线，不是目标"

1500 字、5 条观点、40% 信息保留率——这些数字只在 lint 里做验证闸门。写作过程中 Agent 追求的是深度问题："读者能做什么决策？""这个工具跟同类有什么不同？"

### "分类从使用中涌现"

不要在设计阶段预设知识分类体系。先往里放内容，用 tags 和链接自然组织。分类会在使用中自然形成——那时候再建的才是真分类，不是纸上谈兵。

### "先跑通最小闭环，再盖基础设施"

第一批（agent.md + lint + wiki 回填 + Quartz）一天做完，系统就能用了。第二批（API + source-registry + adapter-state）是锦上添花。如果顺序反过来——先建 API 再写内容——可能一周过去了还没看到任何知识。

### "Agent-agnostic 不是说出来的，是试出来的"

README 写了"Agent 无关"，但真正考验是：换个 Agent 能用吗？skill/platforms/ 下有 claude/codex/openclaw 的适配，source-registry 不绑定特定提取工具，API 只是文件系统网关——这些设计让"Agent 无关"变成了可验证的事实。

### "文件系统是唯一真相源"

Markdown 文件放哪都能读。数据库索引是派生的，可以随时从文件重建。Quartz 网站是渲染层，坏了就重新 build。只有 kb/ 目录里的 .md 文件是不能丢的。

## 后续要追踪的

- Obsidian 实测：在 Obsidian 里打开 kb/，双向链接和图谱是否能正常工作？
- Codex/Kimi 实测：把 agent.md 喂给非 Claude 的 Agent，自检路由能跑通吗？
- FTS5 全文检索：wiki 到 50+ 页时 grep 会不会太慢？
- Quartz 公网部署：Cloudflare Pages 免费部署，手机也能随时查知识

## 相关

- [[agent-memory-approaches]] — 记忆方案对比的方法论
- [[claude-code]] — 开发全程使用的工具
- [[cpa-cli-proxy-api]] — 第二批基建的组成部分
