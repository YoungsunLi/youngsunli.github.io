#!/usr/bin/env bash

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd dist

# 发布到自定义域名
echo 'lsun.net' > CNAME

git init
git add -A
git commit -m 'deploy'

# 发布到 https://<USERNAME>.github.io
git push -f git@github.com:YoungsunLi/youngsunli.github.io.git master

cd -
