# 最小只读 API：远程查询知识库

## 目标

一个 Python 单文件 HTTP 服务，让远程 Agent 能只读查询 Mac Mini 上的知识库。

## 需求

- 一个 Python 文件，标准库 `http.server`，零外部依赖
- GET `/health` — 健康检查，Agent 自检路由用
- GET `/pages/{path}` — 读取 wiki 页面内容（返回 Markdown 原文）
- POST `/search?q={关键词}` — grep 全文搜索，返回匹配文件名 + 片段
- 只读，不做写入

## 涉及文件

- `server/wiki_api.py` — 新建

## 完成标准

- [ ] `python server/wiki_api.py` 启动，监听 8000
- [ ] `curl localhost:8000/health` 返回 200
- [ ] `curl localhost:8000/pages/wiki/entities/claude-code.md` 返回文件内容
- [ ] `curl -X POST localhost:8000/search?q=Agent` 返回匹配结果
