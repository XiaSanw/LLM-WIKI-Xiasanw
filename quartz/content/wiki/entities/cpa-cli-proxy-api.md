---
type: entity
confidence: emerging
created: 2026-05-24
updated: 2026-05-24
tags: [codex, proxy, api, opensource, gpt-plus, tool, cost-optimization]
sources: [codex-cpa-research]
---

# CPA 订阅转 API 代理工具

> 将 GPT Plus/Pro 订阅额度转为标准 OpenAI API 的开源代理 — CLI Proxy API

## 一句话

CPA 是一个本地运行的代理服务，把 GPT 订阅里的 Codex 额度包装成标准 OpenAI API，让任何兼容 OpenAI 接口的工具都能调用——不绑卡、不用买 API、十几块的订阅号就够。

## 核心特性

- **订阅转 API**：将 ChatGPT Codex、Gemini CLI、Claude Code 等 AI CLI 工具的订阅额度，包装为兼容 OpenAI API 格式的 HTTP 接口。一个 GPT Plus 账号约 **4 亿 tokens/月**的 Codex 额度，通过 CPA 可以全部转为 API 调用。
- **多账号池管理**：支持导入多个 GPT Plus/Pro/Team 账号，统一管理、自动路由分发。哪个号额度还够用哪个，单个号被封也不影响全局。
- **OAuth 认证导入**：通过标准 OAuth 流程将 GPT 账号导入 CPA，不需要手动提取 cookie、token 或 session key。降低门槛，也减少因手动操作导致的封号风险。
- **本地部署、零外部依赖**：单机运行，管理后台 `localhost:8317`，没有云端组件。你的账号凭证和数据流全部在本地。
- **兼容 OpenAI API 格式**：任何支持自定义 base_url 的 AI 客户端（Codex CLI、Cursor、ChatGPT 第三方客户端、自己写的脚本）都能直连。

## 为什么重要

理解 CPA 的价值要先理解一个定价差：

| 方案 | 月费 | 可用 tokens |
|---|---|---|
| GPT Plus 订阅 | $20（闲鱼 13-20 元） | ~4 亿 tokens/月（Codex 额度） |
| OpenAI API 付费 | 按量 | $200 = 约 2 亿 tokens |
| GPT Pro 订阅 | $200 | 额度更高 + 高级模型 |

同样的 4 亿 tokens，走 API 买要花 $200+，走 Plus 订阅只要 $20。但 Plus 的额度被锁在 OpenAI 官方客户端里——你只能在 ChatGPT 网页或 Codex CLI 里用。

**CPA 做的事就是把这把锁拆了**。它把 Plus 订阅的额度暴露成一个标准 OpenAI API，之后任何工具都能调。你的 Claude Code、Cursor、自己写的 Python 脚本，全部可以共享一个十几块的 Plus 号。

这就是"Codex 自由"的底层逻辑——不是找免费的，是让便宜的东西变得更可用。

## 技术架构

```
┌──────────────────────────────────────────┐
│              你的机器                     │
│                                          │
│  Claude Code / Codex CLI / Cursor         │
│         │                                │
│         ↓  HTTP (OpenAI API 格式)         │
│  ┌──────────────┐                        │
│  │  CPA :8317   │                        │
│  │              │                        │
│  │  ┌────────┐  │   OAuth + 代理/TUN     │
│  │  │ 号池管理 │──┼─────────────────────→ OpenAI 服务器
│  │  │ + 路由  │  │                        │
│  │  └────────┘  │                        │
│  │  GPT Plus #1 │                        │
│  │  GPT Plus #2 │  ← 多个订阅号轮换       │
│  │  GPT Team 号  │                        │
│  └──────────────┘                        │
└──────────────────────────────────────────┘
```

CPA 本质是一个**反向代理 + 认证转换层**：
1. 接收客户端的 OpenAI API 格式请求
2. 选一个可用的 GPT 账号
3. 用该账号的 OAuth 凭证向 OpenAI 服务器发起真实请求
4. 把响应转回 OpenAI API 格式，返回给客户端

对客户端来说，CPA 就是"一个 OpenAI API 服务器"。对 OpenAI 服务器来说，每个请求都来自合法的订阅用户。

## 完整搭建指南

### 环境准备

- 一台常开的机器（Mac Mini 就很合适）
- 稳定的网络环境
- 如果需要 OAuth 导入，必须配置代理/TUN 模式（让 CPA 能模拟浏览器登录）
- 至少一个 GPT Plus 账号

### 搭建步骤

**1. 下载 CPA**

从 GitHub releases 页面下载最新版本（务必用最新版——旧版可能无法识别新模型或 OAuth 流程已失效）。

**2. 配置 config.yaml**

```yaml
secret-key: "your-strong-password-here"  # 客户端调用 API 时用的 key
port: 8317
# 其他按需配置
```

`secret-key` 就是你的 API key。客户端配置 `Authorization: Bearer sk-your-strong-password-here` 就能调用。

**3. 启动 CPA**

```bash
./cpa  # Linux/macOS
# 或 cpa.exe  # Windows
```

**4. 导入 GPT 账号**

打开 `http://localhost:8317/management.html`，进入管理后台。通过 OAuth 流程导入你的 GPT Plus 账号——这个过程会弹出浏览器窗口，完成 OpenAI 的 OAuth 授权。授权完成后 CPA 就会获得该账号的调用凭证。

核心要点：**OAuth 导入需要代理/TUN 模式**。因为 OpenAI 的 OAuth 流程要求浏览器环境和 IP 一致，CPA 通过 TUN 模式确保流量路由正确。

**5. 配置客户端**

Codex CLI 配置 `~/.codex/config.toml`：
```toml
model_provider = "custom"
base_url = "http://localhost:8317/v1"
```

认证文件 `~/.codex/auth.json`：
```json
{
  "api_key": "sk-your-strong-password-here"
}
```

Claude Code 也可以通过配置 `ANTHROPIC_BASE_URL` 环境变量指向 CPA，实现用 GPT 模型替代 Claude。

**6. 多账号池（可选但推荐）**

导入多个 GPT 号后，CPA 自动管理号池——哪个号额度充足、哪个号快到限额、哪个号被限流，都由 CPA 内部路由。你只需要确保号池里有可用的账号。

配合 **CC-Switch** 等工具，可以在多个 API 端点（CPA、公益站、官方 API）之间自动切换，做到更高可用性。

### 常见故障排查

| 问题 | 可能原因 | 解决 |
|---|---|---|
| 客户端连不上 CPA | CPA 没启动或端口被占用 | 检查 `lsof -i :8317` |
| OAuth 导入失败 | 代理/TUN 模式未开启 | 确认 TUN 配置，重启 CPA |
| 请求返回 401 | secret-key 不匹配 | 检查 config.yaml 和客户端 api_key 一致 |
| 模型不识别 | CPA 版本太旧 | 下载最新 release |
| 请求被限流 | 单号额度用尽 | 添加更多号到号池 |

## 与其他方案的对比

### CPA vs sub2api

| 维度 | CPA | sub2api |
|---|---|---|
| 部署方式 | 本地单机 | 本地/Docker |
| 账号安全 | 固定 IP + 自用，风险较低 | 部分用户反映更容易被标记 |
| 社区活跃度 | L 站广泛使用 | 使用较少 |
| 多模型支持 | Codex + Gemini + Claude | 主要面向 ChatGPT |
| 结论 | 个人自用首选 | 不推荐（封号风险更高） |

### CPA vs 直接买 API

| 维度 | CPA + Plus 号 | 直接买 OpenAI API |
|---|---|---|
| 月费 | 13-20 元/月 | $200+ 才够 4 亿 tokens |
| tokens/月 | ~4 亿 | 按量计费 |
| 复杂度 | 需要搭建维护 | 即买即用 |
| 模型覆盖 | Plus 支持的模型 | 全部 API 模型 |
| 结论 | 成本优势巨大，适合个人 | 即用即走，适合企业 |

### CPA vs 公益站

| 维度 | CPA 自建 | 公益站 |
|---|---|---|
| 稳定性 | 取决于你的号 | 取决于站长心情 |
| 隐私 | 全部本地 | 请求经过第三方 |
| 成本 | 十几块/月 | 免费 |
| 适合场景 | 长期主力使用 | 临时/备用 |

## 安全与防封策略

**核心原则：模拟正常用户行为，不要让 OpenAI 觉得你在跑 API。**

1. **固定 IP**：所有请求从同一个 IP 出去，不要频繁切换。这就是为什么 CPA 建议部署在 Mac Mini 这种固定位置的机器上。
2. **不要超量**：单个 Plus 号月配额约 4 亿 tokens，不要短时间榨干。多号轮换是正道。
3. **付费号 > 免费号**：免费/试用号基本上"日抛"。要长期稳定，至少用 Plus 付费号。
4. **OAuth 导入优于手动提取**：手动提取 token 可能触发 OpenAI 的安全检测，OAuth 是正规流程。
5. **不要混用**：一个号不要同时在官方客户端和 CPA 之间高频切换，行为模式不一致容易被标记。

## GPT Plus 购买渠道参考

| 渠道 | 价格 | 稳定性 | 适合场景 |
|---|---|---|---|
| 闲鱼（海鲜市场） | 13-20 元/月 | 中等，需甄别来源 | 低成本入门 |
| 卡网 | ~140 元/月（正价） | 高，正规订阅 | 长期稳定使用 |
| 苹果礼品卡 | 美区 App Store 充值 | 高，无 Pro | 有美区 Apple ID |
| Google Play | 同上 | 同上 | Android 用户 |
| 拼车 Team | 极低甚至免费 | 中等 | 预算极限 |
| GPT Free 账号 | 免费 | 永久但速率减半 | 白嫖起步 |

## 不同素材中的观点

来源：[[codex-cpa-research]]
> CPA 是 L 站主流方案。通过 CLI Proxy API 将 GPT Plus 的 Codex 额度（约 4 亿 tokens/月/号）转为标准 OpenAI API。部分用户认为 CPA 自用场景比 sub2api 更安全，固定 IP 请求比多 IP 请求风险低。

> GPT Free 已正式写入 Codex 使用范围，免费账号可以永久使用 Codex CLI，不会像之前那样被回收。免费账号 token 速率约为 Plus 的一半。

> 最省钱的组合：GPT 免费账号（Codex）+ 公益站 API + DeepSeek/Gemini 白嫖 + 必要时买 Plus/Team 拼车，日常够用且成本极低。

> 付费 Plus 整体较稳，但有个别"可疑活动"警告案例。固定 IP 请求比多 IP 安全。

## 推荐使用路径

**入门（0 元）**：
```
GPT Free 账号 → 直接用 Codex CLI（速率慢但够用）
```

**进阶（~15 元/月）**：
```
闲鱼 Plus 号 → CPA 自建 → Codex CLI + Claude Code 共享额度
```

**稳定（~140 元/月）**：
```
正价 Plus → CPA 多号池 → 全家桶随意调用
```

**最优性价比（推荐）**：
```
1 个 Plus 号（闲鱼/拼车） + CPA 自建 + Free 号备用 + 公益站兜底
```

## 实用信息

- 获取方式：GitHub releases 下载最新版（旧版可能不识别新模型、OAuth 失效）
- 管理后台：http://localhost:8317/management.html
- API 端点：http://localhost:8317/v1
- 客户端配置：base_url 指向 CPA，api_key 使用 config.yaml 中的 secret-key
- 运行环境：任何能跑 Go 二进制（或对应平台的 release）的机器
- 代理/TUN：OAuth 导入时必须开启，否则授权流程无法完成

## 来源

- Linux.do 论坛多帖综合调研
- raw/codex-cpa-research.md

## 相关

- [[claude-code]] — Claude Code 可通过环境变量配置 base_url 接入 CPA，使用 GPT 模型
- codex-cli-setup（待收录） — Codex CLI 完整配置指南
- ai-coding-tool-cost-comparison（待收录） — AI 编程工具的全面成本对比与选型
