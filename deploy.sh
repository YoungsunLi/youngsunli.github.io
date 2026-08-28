#!/usr/bin/env bash

# 手动部署：构建后将 dist/ 强推到 master 分支（GitHub Pages 源）
# CNAME 与站点验证文件已放在 docs/public/，构建时自动带入 dist/
set -e

npm run build

cd dist

git init -b master
git add -A
git commit -m 'deploy'

git push -f git@github.com:YoungsunLi/youngsunli.github.io.git master

cd -
