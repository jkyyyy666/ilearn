@echo off
cd /d "D:\englearn\chinese-learning"

echo === 初始化 Git 仓库 ===
git init
git add .
git commit -m "🎉 婉儿中文学习日记"

echo === 连接 GitHub 仓库 ===
git branch -M main
git remote add origin https://github.com/jkyyyy666/englearn.git

echo === 推送到 GitHub ===
git push -u origin main

echo.
echo ✅ 完成！部署地址：https://jkyyyy666.github.io/englearn/
pause
