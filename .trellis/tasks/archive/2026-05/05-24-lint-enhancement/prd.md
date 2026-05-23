# 增强 lint-wiki.sh：stale 检测 + schema v2.0 合规

## 目标

在现有 5 项检查的基础上，增加知识老化检测能力。

## 需求

### 1. Stale 检测（新检查项）

扫描所有 wiki 页面（entities/、topics/、sources/），解析 frontmatter 中的 `updated:` 字段，计算距今天数。超过 90 天的标记为 stale。

输出格式：
```
⚠️  stale: entities/xxx.md (updated: 2026-01-15, 129 天未更新)
```

### 2. 保留现有检查

- links：断链检查
- sources：sources 字段完整性
- content：必填节检查（实操内容保留、原文摘录）
- depth：实体页 1500 字符下限
- index：index.md 一致性

### 3. 命令行参数

```bash
bash lint-wiki.sh <知识库路径> [检查项...]
# 检查项：links, sources, content, depth, index, stale, all（默认）
```

## 涉及文件

- `skill/scripts/lint-wiki.sh` — 增加 stale 检查函数

## 完成标准

- [ ] stale 检测函数可用，正确计算天数
- [ ] frontmatter 无 updated 字段时给出 WARN 而非崩溃
- [ ] 所有现有检查保持不变
- [ ] `bash lint-wiki.sh kb/ai stale` 可单独运行 stale 检测
- [ ] `bash lint-wiki.sh kb/ai all` 包含 stale 检测
