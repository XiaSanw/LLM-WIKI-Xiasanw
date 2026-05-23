---
type: source
confidence: emerging
created: 2026-05-24
source_url: [https://linux.do]
raw_files: [codex-cpa-research]
tags: [codex, gpt-plus, cpa, proxy-api, cost-optimization]
---

# Codex CLI 接入与 GPT Plus 订阅方案调研

> CPA、GPT Plus 购买渠道、Codex 免费方案 — Linux.do 论坛综合整理

## 一句话

## 核心观点

- **CPA 是 L 站主流方案**：通过 CLI Proxy API 将 GPT Plus 的 Codex 额度（约 4 亿 tokens/月/号）转为标准 OpenAI API，实现"买订阅 → 转 API → 任意客户端调用"的链路。
- **Codex Free 永久可用**：OpenAI 已将 GPT Free 正式纳入 Codex 使用范围，免费账号可永久使用 Codex CLI，只是 token 速率约为 Plus 的一半（0.5X）。
- **GPT Plus 最低成本渠道是闲鱼**：13-20 元/月，但需注意账号来源和稳定性。正价卡网约 140 元/月。拼车 Team 方案成本可压到近乎零。
- **封号风险可控**：付费 Plus 整体稳定，固定 IP 请求比多 IP 安全，CPA 自用场景比 sub2api 更不易被标记。免费/试用号基本是日抛。
- **白嫖组合**：GPT Free（Codex 免费额度） + 公益站 API（L 站用户提供） + DeepSeek/Gemini 免费额度 + 必要时买 Plus/Team 拼车。日常够用且成本极低。

## 实操内容保留

### 配置示例

CPA 搭建后 Codex CLI 配置（~/.codex/config.toml）：
```toml
model_provider = "custom"
base_url = "http://localhost:8317/v1"
```

认证文件（~/.codex/auth.json）：
```json
{
  "api_key": "sk-your-cpa-key"
}
```

### 操作步骤

1. 从 GitHub 下载 CPA 最新 release
2. 配置 config.yaml，设置 secret-key
3. 启动 CPA：`./cpa`
4. 访问 http://localhost:8317/management.html 管理后台
5. 通过 OAuth 导入 GPT Plus 账号（需代理/TUN 模式）
6. 配置 Codex CLI 指向 CPA 的 base_url
7. 配合 CC-Switch 等工具管理多个 API 端点

### Prompt 模板

（本文无 Prompt 模板/步骤）

## 我的收获

之前以为用 Codex 必须花 $20/月买 Plus，调研后发现路径很多：免费账号就够用（速率慢点但能用），公益站可以直接嫖，想稳定就闲鱼十几块买个 Plus 号走 CPA 自建。关键是 CPA 这个工具打通了"订阅额度 → 标准 API"的转换，让 Plus 订阅的 Codex 额度不再被 OpenAI 客户端绑定。

## 原文精彩摘录

> CPA 是一个开源项目，可将 ChatGPT Codex、Gemini CLI、Claude Code 等包装为兼容 OpenAI API 的服务，主要用于将 GPT Plus/Pro 等订阅的 Codex 额度转化为 API 调用，无需绑卡即可使用。

> GPT Free 已正式写入 Codex 使用范围，免费账号可以永久使用 Codex CLI，不会像之前那样被回收。

> 最省钱的组合：GPT 免费账号（Codex）+ 公益站 API + DeepSeek/Gemini 白嫖 + 必要时买 Plus/Team 拼车，日常够用且成本极低。

## 值得引用吗

值得。这是实现"Codex 自由"的实操路线图，涉及工具选型、成本优化、风险控制的完整决策链。

## 相关

- [[claude-code]] — Claude Code 也可以通过 CPA 接入
- ai-coding-tool-cost-comparison（待收录） — AI 编程工具成本对比
- codex-cli-setup（待收录） — Codex CLI 配置指南
