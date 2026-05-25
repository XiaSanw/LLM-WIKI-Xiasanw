# Cloudflare Tunnel 部署指南

将 Quartz 知识库站点通过 Cloudflare Tunnel 绑定到域名 `llmwiki.xiasanw.cn`。

## 前置条件

- Cloudflare 托管域名（xiasanw.cn，NS 已指向 Cloudflare）
- macOS（LaunchAgent + LaunchDaemon 自启）
- Node.js >= 22 + npm（Quartz 依赖）

## 一、安装 cloudflared

```bash
brew install cloudflare/cloudflare/cloudflared
```

## 二、创建隧道

```bash
# 登录 Cloudflare（会打开浏览器授权）
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create llmwiki
```

记录输出的 Tunnel ID 和 credentials 文件路径。

## 三、添加 DNS 记录

```bash
cloudflared tunnel route dns llmwiki llmwiki.xiasanw.cn
```

这会在 Cloudflare DNS 中创建一条 CNAME 记录：
`llmwiki` → `<tunnel-id>.cfargotunnel.com`（橙色云朵，Proxied）

## 四、配置 ingress

编辑 `~/.cloudflared/config.yml`：

```yaml
tunnel: <你的-tunnel-uuid>
credentials-file: /Users/<用户名>/.cloudflared/<你的-tunnel-uuid>.json

loglevel: info

ingress:
  - hostname: llmwiki.xiasanw.cn
    service: http://localhost:8080

  - service: http_status:404
```

## 五、设置自启

### cloudflared（系统级 LaunchDaemon，需要 sudo）

```bash
sudo cloudflared service install
```

这会注册一个 LaunchDaemon，开机自动启动 cloudflared，读取 `~/.cloudflared/config.yml`。

验证：
```bash
sudo launchctl list | grep cloudflared
```

### Quartz（用户级 LaunchAgent）

创建 `~/Library/LaunchAgents/com.llmwiki.quartz.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.llmwiki.quartz</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npx</string>
        <string>quartz</string>
        <string>build</string>
        <string>--serve</string>
        <string>--port</string>
        <string>8080</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/你的用户名/Nutstore Files/ai/project/llmwiki-base/quartz</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/llmwiki-quartz.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/llmwiki-quartz.err.log</string>
</dict>
</plist>
```

加载：
```bash
launchctl load ~/Library/LaunchAgents/com.llmwiki.quartz.plist
```

### 验证

```bash
# 检查 Quartz
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
# 应返回 200

# 检查隧道
cloudflared tunnel info llmwiki
```

## 六、日常维护

| 操作 | 命令 |
|------|------|
| 重启 Quartz | `launchctl unload ~/Library/LaunchAgents/com.llmwiki.quartz.plist && launchctl load ~/Library/LaunchAgents/com.llmwiki.quartz.plist` |
| 查看 Quartz 日志 | `tail -f /tmp/llmwiki-quartz.err.log` |
| 查看 cloudflared 日志 | `log show --predicate 'process == "cloudflared"' --last 1h` |
| 升级 cloudflared | `brew upgrade cloudflared` |
| 检查隧道状态 | `cloudflared tunnel info llmwiki` |

## 七、知识库内容更新流程

内容通过坚果云自动同步。当 `kb/wiki/` 下有变更时：

```bash
# Quartz 检测到文件变更会自动增量构建（chokidar watch 模式）
# 无需手动操作

# 如果是大量变更后想强制全量重建：
cd quartz && npx quartz build
# 然后重启 Quartz
launchctl unload ~/Library/LaunchAgents/com.llmwiki.quartz.plist
launchctl load ~/Library/LaunchAgents/com.llmwiki.quartz.plist
```

## 八、Cloudflare Zero Trust 登录保护

Quartz 是纯静态 HTML，没办法自带登录功能。但 Cloudflare Tunnel 架构下可以用 **Zero Trust Access** 在请求到达 Quartz 之前拦一道认证——不改一行代码。

免费版支持 50 个用户，个人使用完全够。

### 进入 Zero Trust 面板

Cloudflare Dashboard → 左侧菜单 **Zero Trust** → 跳转到 `one.dash.cloudflare.com`

### 创建 Access Application

左侧 **Access** → **Applications** → **Add an application** → 选 **Self-hosted**

基础配置：

| 字段 | 值 |
|------|-----|
| Application name | `LLM Wiki` |
| Session duration | `1 week`（不用频繁登录） |
| Application domain | `llmwiki.xiasanw.cn` |
| Identity providers | 按下方方法配置后回到此处勾选 |

### 验证方式一：GitHub OAuth（推荐）

**Step 1：在 Cloudflare 添加 GitHub 登录方式**

Settings → Authentication → Login methods → Add new → **GitHub**

会跳转到 GitHub 创建 OAuth App。Cloudflare 已自动填好 Callback URL，直接点 Create。

拿到 `Client ID` 和 `Client Secret` 后粘贴回 Cloudflare，其他默认，点 Save。

**Step 2：创建访问策略**

回到 Access → Applications → 你刚建的 LLM Wiki → Add policy：

| 字段 | 值 |
|------|-----|
| Policy name | `Allow me` |
| Action | `Allow` |
| Include → Login Method | 勾 `GitHub` |
| Include → Emails | 填你的 GitHub 邮箱（限制只有你能登录） |

**体验**：打开 `llmwiki.xiasanw.cn` → GitHub 授权 → 进入 Quartz

### 验证方式二：邮件一次性验证码

**Step 1：在 Cloudflare 添加 Email 方式**

Settings → Authentication → Login methods → Add new → **Email**

不需要任何第三方配置，直接点 Save。

**Step 2：创建访问策略**

| 字段 | 值 |
|------|-----|
| Policy name | `Allow my email` |
| Action | `Allow` |
| Include → Emails | 填你的邮箱（可填多个，逗号分隔） |
| Include → Login Method | 勾 `Email` |

**体验**：打开 `llmwiki.xiasanw.cn` → 输入邮箱 → 收验证码 → 点链接 → 进去。最简单，没有第三方依赖。

### 验证方式三：Google OAuth

**Step 1：在 Cloudflare 添加 Google 登录方式**

Settings → Authentication → Login methods → Add new → **Google**

OAuth Client ID 和 Secret：（用 Cloudflare 预置的即可，也可用自己的）

- 勾选 **"Use the Cloudflare-managed Google OAuth application"**（推荐，零配置）
- 或者自行去 Google Cloud Console 创建 OAuth 2.0 Client ID，填入 Cloudflare

点 Save。

**Step 2：创建访问策略**

| 字段 | 值 |
|------|-----|
| Policy name | `Allow my Google` |
| Action | `Allow` |
| Include → Login Method | 勾 `Google` |
| Include → Emails | 填你的 Gmail（限制只有你能登录） |

**体验**：打开 `llmwiki.xiasanw.cn` → 弹出 Google 登录 → 选账号 → 进去

### 允许多种验证方式

如果上面三种你都配了，回到 Application → Overview → **Identity providers** 全部勾上 → 策略里把对应 Login Method 都 Include 进来。登录页面会同时显示三个选项。

### 效果

```
浏览器 → llmwiki.xiasanw.cn
  → Cloudflare Access 拦截（GitHub/Email/Google 验证）
    → 验证通过 → Cloudflare Tunnel → localhost:8080
    → 验证失败 → 403 Forbidden
```

用户看不到 Quartz 的任何内容，直到认证通过。整个过程不在你服务器上跑任何代码，Cloudflare 全托管。

## 九、新机器部署

如果要在另一台 Mac 上部署相同隧道：

1. 安装 cloudflared
2. 从原机器复制 `~/.cloudflared/cert.pem` 和 `~/.cloudflared/<tunnel-id>.json`
3. 复制 `~/.cloudflared/config.yml`
4. `sudo cloudflared service install`
5. 创建并加载 Quartz LaunchAgent
