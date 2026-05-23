#!/bin/bash
# 同步 wiki 内容到 Quartz 并构建
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WIKI_DIR="$(cd "$SCRIPT_DIR/../kb" && pwd)"

echo "同步 wiki → Quartz content..."
cd "$SCRIPT_DIR"
rm -rf content/*
cp "$WIKI_DIR/.wiki-schema.md" content/
cp "$WIKI_DIR/index.md" content/
cp "$WIKI_DIR/log.md" content/
cp -r "$WIKI_DIR/wiki" content/
cp -r "$WIKI_DIR/raw" content/

echo "构建 Quartz..."
npx quartz build

echo "完成。本地预览: cd quartz && npx quartz build --serve"
