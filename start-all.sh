#!/bin/bash

# 任务管理应用启动脚本
# 一键启动 MySQL、Redis、后端和前端

echo "🚀 启动任务管理应用..."

# 1. 启动 Docker 服务
echo "📦 启动 Docker 服务 (MySQL + Redis)..."
docker compose up -d mysql redis

# 等待服务启动
echo "⏳ 等待数据库服务启动..."
sleep 5

# 2. 启动后端服务
echo "🔧 启动后端服务..."
cd backend
npm run dev &
cd ..

# 等待后端启动
sleep 3

# 3. 启动前端服务
echo "💻 启动前端服务..."
cd frontend
npm run dev &
cd ..

echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "访问地址："
echo "  - 前端页面: http://localhost:5173"
echo "  - 后端 API: http://localhost:3000"
echo ""
echo "数据库："
echo "  - MySQL: localhost:3306"
echo "  - Redis: localhost:6379"
echo ""
echo "停止服务："
echo "  - 后端: pkill -f 'ts-node-dev'"
echo "  - 前端: pkill -f 'vite'"
echo "  - Docker: docker compose down"
