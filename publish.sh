#!/bin/bash
# earnings-tracker 发布脚本
# GitHub 用户名: Indomi
# 仓库地址: https://github.com/Indomi/earnings-tracker

echo "🚀 开始发布 earnings-tracker 到 GitHub..."
echo "GitHub 用户名: Indomi"
echo "仓库名: earnings-tracker"
echo ""

# 进入项目目录
cd /workspace/projects/workspace/skills/earnings-tracker

# 检查 Git 状态
echo "📋 检查 Git 状态..."
git status

# 添加远程仓库
echo ""
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/Indomi/earnings-tracker.git

# 重命名分支为 main (GitHub 默认)
echo ""
echo "📝 重命名分支为 main..."
git branch -m main

# 推送到 GitHub
echo ""
echo "⬆️  推送到 GitHub..."
git push -u origin main

echo ""
echo "✅ 发布完成！"
echo ""
echo "📍 仓库地址: https://github.com/Indomi/earnings-tracker"
echo ""
echo "🔧 安装命令:"
echo "   npx skills add Indomi/earnings-tracker"
