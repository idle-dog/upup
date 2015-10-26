#!/bin/bash

# 使用fis进行构建
fis release -r ./src -Documpd ./output

if [ -d output ]; then
    # 提交代码至gh-pages分支
    echo "➥ Commit files"
    git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/${REPO_SLUG}.git ${REPO_SLUG} > /dev/null
    rm -rf ${REPO_SLUG}/*
    cp -rf output/* ${REPO_SLUG}
    cd ${REPO_SLUG}
    git status
    git config user.email "travis@travis-ci.org"
    git config user.name "travis-ci"
    git add -A
    git commit -m "[ci skip] publish gh-pages"
    git push -fq origin gh-pages > /dev/null
else
    echo '➥ Fail'
    exit 1
fi