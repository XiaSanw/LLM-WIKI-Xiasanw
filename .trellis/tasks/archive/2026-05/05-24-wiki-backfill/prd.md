# 回填 8 篇 wiki 到 schema v2.0 标准

## 目标

将现有 8 篇 wiki 页面全部提升至 schema v2.0 硬性标准，通过 lint 全量检查。

## Lint 发现的当前问题

- **断链 20+ 处**：`[[待创建]]` 占位符、不存在的实体链接
- **sources 字段**：部分实体页可能缺少或为空
- **字数**：部分实体页可能不达 1500 字符

## 涉及文件

- `kb/ai/.wiki-schema.md` — 清理自身包含的 [[待创建]] 示例
- `kb/ai/wiki/entities/claude-code.md`
- `kb/ai/wiki/entities/fashion-ai.md`
- `kb/ai/wiki/entities/letta.md`
- `kb/ai/wiki/entities/llm-wiki-skill.md`
- `kb/ai/wiki/entities/llmwiki-lucasastorian.md`
- `kb/ai/wiki/entities/mem0.md`
- `kb/ai/wiki/topics/agent-memory-approaches.md`
- `kb/ai/wiki/topics/ai-ecommerce-image-generation.md`

## 修复策略

1. `[[待创建 xx]]` → 改为纯文本标注（无链接格式）
2. 不存在的实体链接 → 如果文档中已经有足够信息，直接创建该页面；否则改为纯文本
3. 检查并回填 frontmatter 的 `sources` 字段
4. 实体页不满 1500 字符的补充内容
5. 主题页不达 5 条核心观点的补充

## 完成标准

- [ ] `bash lint-wiki.sh kb/ai all` 全部 PASS
- [ ] 无断链
- [ ] 所有实体页 sources 非空
- [ ] 所有页面无占位文本
