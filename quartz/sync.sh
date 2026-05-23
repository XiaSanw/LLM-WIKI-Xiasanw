#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WIKI_DIR="$(cd "$SCRIPT_DIR/../kb" && pwd)"

echo "sync wiki → Quartz..."
cd "$SCRIPT_DIR"
rm -rf content
mkdir content
cp "$WIKI_DIR/.wiki-schema.md" content/
cp "$WIKI_DIR/about-me.md" content/
cp "$WIKI_DIR/Index.md" content/
cp "$WIKI_DIR/log.md" content/
cp -r "$WIKI_DIR/wiki" content/
cp -r "$WIKI_DIR/raw" content/

echo "build Quartz..."
npx quartz build
echo "done. preview: cd quartz && npx quartz build --serve"
