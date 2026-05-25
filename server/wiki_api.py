#!/usr/bin/env python3
"""llmwiki-base Wiki API

远程 Agent 通过此服务读写知识库。
零外部依赖，纯 Python 标准库。

端点：
  GET    /health              — 健康检查
  GET    /pages/{path}        — 读取 wiki 页面（Markdown 原文）
  POST   /search?q={keyword}  — grep 全文搜索
  PUT    /pages/{path}        — 创建/更新 wiki 页面
"""

import json
import os
import subprocess
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

KB_ROOT = Path(__file__).resolve().parent.parent / "kb"
PORT = 8001


class WikiAPIHandler(BaseHTTPRequestHandler):
    """知识库只读 API 请求处理器"""

    def log_message(self, format, *args):
        """简洁日志"""
        print(f"[{self.command}] {args[0]}")

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode())

    def _send_text(self, text, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(text.encode())

    def _resolve_path(self, page_path):
        """解析页面路径，禁止目录穿越"""
        clean = page_path.lstrip("/").replace("\\", "/")
        full = (KB_ROOT / clean).resolve()
        if not str(full).startswith(str(KB_ROOT.resolve())):
            return None
        return full

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/health":
            self._send_json({"status": "ok", "wiki_root": str(KB_ROOT)})
            return

        if parsed.path.startswith("/pages/"):
            page_path = parsed.path[len("/pages/"):]
            filepath = self._resolve_path(page_path)

            if filepath is None or not filepath.is_file():
                self._send_json({"error": "not found", "path": page_path}, 404)
                return

            try:
                content = filepath.read_text(encoding="utf-8")
                self._send_text(content)
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
            return

        self._send_json({"error": "unknown endpoint"}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/search":
            params = urllib.parse.parse_qs(parsed.query)
            query = params.get("q", [""])[0].strip()

            if not query:
                self._send_json({"error": "missing query parameter 'q'"}, 400)
                return

            try:
                wiki_dir = KB_ROOT / "wiki"
                result = subprocess.run(
                    ["grep", "-rn", "--include=*.md", query, str(wiki_dir)],
                    capture_output=True, text=True, timeout=10
                )

                lines = []
                for line in result.stdout.strip().split("\n"):
                    if not line:
                        continue
                    parts = line.split(":", 2)
                    if len(parts) >= 3:
                        rel_path = os.path.relpath(parts[0], str(KB_ROOT))
                        lines.append({
                            "file": rel_path,
                            "line": parts[1],
                            "content": parts[2].strip()[:200],
                        })

                self._send_json({
                    "query": query,
                    "results": lines[:50],  # 最多 50 条
                    "total": len(lines),
                })
            except subprocess.TimeoutExpired:
                self._send_json({"error": "search timeout"}, 500)
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
            return

        self._send_json({"error": "unknown endpoint"}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)

        if not parsed.path.startswith("/pages/"):
            self._send_json({"error": "unknown endpoint"}, 404)
            return

        page_path = parsed.path[len("/pages/"):]
        if not page_path or page_path.endswith("/"):
            self._send_json({"error": "invalid path"}, 400)
            return

        filepath = self._resolve_path(page_path)
        if filepath is None:
            self._send_json({"error": "path traversal denied"}, 403)
            return

        # 读取请求体
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8")

        try:
            data = json.loads(body)
            content = data.get("content", "")
        except json.JSONDecodeError:
            self._send_json({"error": "invalid JSON body"}, 400)
            return

        if not content.strip():
            self._send_json({"error": "content is empty"}, 400)
            return

        try:
            filepath.parent.mkdir(parents=True, exist_ok=True)
            filepath.write_text(content, encoding="utf-8")
            self._send_json({
                "ok": True,
                "path": page_path,
                "size": len(content),
            })
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


def main():
    print(f"llmwiki-base API 启动")
    print(f"  知识库: {KB_ROOT}")
    print(f"  地址: http://localhost:{PORT}")
    print(f"  健康检查: curl localhost:{PORT}/health")
    print(f"  读取页面: curl localhost:{PORT}/pages/wiki/entities/claude-code.md")
    print(f"  搜索:     curl -X POST 'localhost:{PORT}/search?q=Agent'")
    print(f"  写入:     curl -X PUT localhost:{PORT}/pages/wiki/test.md -d '{{\"content\":\"# Test\"}}'")
    print()

    server = HTTPServer(("0.0.0.0", PORT), WikiAPIHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")
        server.server_close()


if __name__ == "__main__":
    main()
