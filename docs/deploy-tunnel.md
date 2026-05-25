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

## 八、新机器部署

如果要在另一台 Mac 上部署相同隧道：

1. 安装 cloudflared
2. 从原机器复制 `~/.cloudflared/cert.pem` 和 `~/.cloudflared/<tunnel-id>.json`
3. 复制 `~/.cloudflared/config.yml`
4. `sudo cloudflared service install`
5. 创建并加载 Quartz LaunchAgent
