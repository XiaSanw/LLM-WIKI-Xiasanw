# Codex CLI 使用与 GPT Plus 订阅方案 — 调研原始记录

> 来源：Linux.do 论坛多帖综合
> 调研日期：2026-05-24

## CPA (CLI Proxy API) 概述

CPA 是一个开源工具，将 ChatGPT Codex、Gemini CLI、Claude Code 等 AI CLI 工具包装为兼容 OpenAI API 的服务。主要用于将 GPT Plus/Pro 订阅的 Codex 额度转化为标准 API 调用。

**核心价值**：
- 一个 GPT Plus 账号约 4 亿 tokens/月（Codex 额度）
- 通过 CPA 将这些额度转为 API，供 Codex CLI 或其他工具调用
- 支持多账号池管理，统一接口调用，无需切换账号
- 无需绑卡即可使用

**搭建要点**：
- 从 GitHub releases 下载最新版（旧版可能不识别新模型）
- 配置 config.yaml，设置 secret-key
- 管理后台：http://localhost:8317/management.html
- 通过 OAuth 认证导入 GPT Plus 账号
- 需要配置代理/TUN 模式
- 客户端 base_url 配置为 http://localhost:8317/v1

## GPT Plus 购买渠道

| 渠道 | 价格 | 稳定性 |
|------|------|--------|
| 闲鱼（海鲜市场） | 13-20元/月 | 中，注意账号来源 |
| 卡网 | ~140元/月（正价） | 高，正规订阅 |
| 苹果礼品卡 | 美区 App Store 充值 | 高，但无 Pro 选项 |
| Google Play | 同上 | 同上 |
| 拼车 Team | 极低甚至免费 | 中，多人共享 |

## Codex 免费方案

- GPT Free 账号已永久支持 Codex CLI，不会被回收
- 免费账号 token 速率约为 Plus 的一半（0.5X）
- 公益站 API：L 站多名用户提供免费中转 API
- 配置方式：修改 ~/.codex/config.toml 中 model_provider 为 "custom"，base_url 指向公益站

## 封号风险

- 付费 Plus 整体较稳，但有个别"可疑活动"警告案例
- 免费/试用号基本是"日抛"
- 固定 IP 比多 IP 安全
- 部分用户认为 CPA 比 sub2api 更安全（自用场景）

## 最低成本方案

纯免费组合：GPT Free（Codex） + 公益站 API + DeepSeek/Gemini 白嫖
低成本组合：GPT Plus 拼车（~0-20元/月） + CPA 自建 + 固定 IP
