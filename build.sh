#!/bin/sh
# Copies the files the site shares with the extension (sinif-paneli) into this folder.
set -e
EXT="${1:-../sinif-paneli}"
cd "$(dirname "$0")"
mkdir -p shared/books fonts icons
for f in creatures.js lore.js shopdata.js shopart.js portalkit.js books.js; do cp "$EXT/$f" shared/; done
cp "$EXT"/books/*.js shared/books/
cp "$EXT"/fonts/*.woff2 fonts/
cp "$EXT"/icons/icon16.png "$EXT"/icons/icon32.png "$EXT"/icons/icon48.png "$EXT"/icons/icon128.png icons/
echo "shared files copied"
