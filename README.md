# 任务管理应用 (重构版)

前后端分离架构，数据存储在 MySQL 数据库中，支持用户注册登录，数据按用户隔离。

## 🏗️ 项目结构

```
task-manage/
├── backend/          # Node.js 后端
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── config/        # 配置
│   │   └── utils/         # 工具函数
│   └── tests/            # 测试
├── frontend/         # Vue 3 前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── router/        # Vue Router
│   │   ├── api/           # API 请求
│   │   └── types/         # TypeScript 类型
│   └── tests/            # 测试
└── docker-compose.yml    # Docker 编排
```

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 启动所有服务（MySQL + Redis + 后端）
docker-compose up -d

# 后端运行在 http://localhost:3000
```

### 方式二：手动启动

```bash
# 1. 启动 MySQL 和 Redis
# 确保 MySQL 运行在 localhost:3306，Redis 运行在 localhost:6379

# 2. 启动后端
cd backend
cp .env.example .env
npm install
npm run dev

# 3. 启动前端（新终端）
cd frontend
npm install
npm run dev

# 访问 http://localhost:5173
```

## 🛠️ 技术栈

**后端**:
- Node.js 18 + Express
- TypeScript
- MySQL 8.0 + mysql2
- Redis 7
- JWT (jsonwebtoken)
- bcryptjs (密码加密)

**前端**:
- Vue 3.4 + TypeScript
- Vite 5
- Element Plus (UI 组件)
- Pinia (状态管理)
- Vue Router 4
- Axios

## 📚 API 文档

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 任务
- `GET /api/tasks` - 获取任务列表（支持过滤、分页）
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取单个任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务

## 🧪 测试

```bash
# 后端测试
cd backend && npm test

# 前端测试
cd frontend && npm test
```

## 📦 部署

### 生产环境部署

```bash
# 1. 构建后端
cd backend
npm ci --only=production
npm run build

# 2. 构建前端
cd frontend
npm ci
npm run build

# 3. 使用 Docker Compose 部署
docker-compose -f docker-compose.yml up -d
```

## 📝 数据库 Schema

**users 表**:
- id (VARCHAR(36), PK)
- username (VARCHAR(50), UNIQUE)
- email (VARCHAR(100), UNIQUE)
- password_hash (VARCHAR(255))
- created_at, updated_at (TIMESTAMP)

**tasks 表**:
- id (VARCHAR(36), PK)
- user_id (VARCHAR(36), FK -> users.id)
- name (VARCHAR(200))
- description (VARCHAR(100))
- priority (ENUM: HIGH, MEDIUM, LOW)
- due_date (DATE)
- completed (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

## 🔒 安全特性

- JWT Token 认证 (Access Token 2小时，Refresh Token 7天)
- 密码 bcrypt 加密
- SQL 注入防护 (参数化查询)
- CORS 配置
- Helmet 安全中间件
- 数据隔离 (用户只能访问自己的数据)

## 📄 License

MIT
