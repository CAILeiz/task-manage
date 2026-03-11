## Context

当前项目是一个基于原生 JavaScript + Web Components + IndexedDB 的单页任务管理应用。数据存储在浏览器本地的 IndexedDB 中，存在以下问题：

1. **数据易失性**: 清除浏览器缓存会导致所有数据丢失
2. **无用户隔离**: 所有数据混在一起，无法支持多用户
3. **无法跨设备**: 数据绑定到单个浏览器，无法在其他设备访问
4. **协作困难**: 架构限制无法支持多人协作

本次变更将重构为前后端分离架构，引入服务端持久化存储和用户认证系统。

## Goals / Non-Goals

**Goals:**
- 实现前后端分离架构，前端使用 Vue3 + TypeScript + Element Plus
- 后端使用 Node.js + Express + MySQL + Redis
- 实现完整的用户注册、登录、JWT 认证系统
- 实现任务 CRUD API，数据按用户 ID 隔离
- 前后端均采用 TDD 开发，测试覆盖率 ≥90%
- 提供清晰的项目结构和开发规范

**Non-Goals:**
- 暂不支持实时协作（WebSocket）
- 暂不支持文件上传附件
- 暂不支持第三方登录（OAuth）
- 暂不支持移动端 App
- 暂不支持数据导出/导入功能

## Decisions

### 1. 技术栈选择

**前端: Vue 3 + TypeScript + Vite + Element Plus**
- **理由**: Vue 3 提供优秀的 TypeScript 支持和组合式 API，适合中大型应用；Element Plus 提供丰富的 UI 组件，减少开发时间
- **替代方案**: React + Ant Design - 学习曲线更陡，Element Plus 对中文支持更好

**后端: Node.js + Express + TypeScript**
- **理由**: 团队已有 JavaScript 基础，Node.js 生态丰富，Express 轻量灵活
- **替代方案**: NestJS - 功能更全但学习成本高，Express 更适合渐进式开发

**数据库: MySQL 8.0**
- **理由**: 关系型数据库适合任务管理的数据模型，MySQL 社区支持好，运维简单
- **替代方案**: PostgreSQL - 功能更强但配置复杂，MySQL 足够满足需求

**缓存: Redis**
- **理由**: 支持会话存储和热点数据缓存，性能优秀，生态成熟
- **替代方案**: Memcached - 功能单一，Redis 支持更多数据结构

### 2. 项目结构

```
task-manage/
├── frontend/                 # Vue3 前端项目
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   ├── components/      # 组件
│   │   ├── views/           # 页面
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── router/          # Vue Router
│   │   ├── types/           # TypeScript 类型定义
│   │   └── utils/           # 工具函数
│   ├── tests/               # 测试文件
│   └── package.json
├── backend/                  # Node.js 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由定义
│   │   ├── middleware/      # 中间件
│   │   ├── config/          # 配置文件
│   │   └── utils/           # 工具函数
│   ├── tests/               # 测试文件
│   └── package.json
└── docker-compose.yml        # 开发环境编排
```

### 3. 认证方案

**JWT (JSON Web Token) + Bearer Token**
- **Access Token**: 有效期 2 小时，存储在 localStorage
- **Refresh Token**: 有效期 7 天，存储在 httpOnly cookie
- **理由**: 无状态认证，适合前后端分离；Refresh Token 机制减少登录频率
- **替代方案**: Session + Cookie - 有状态，不利于横向扩展

### 4. 数据库设计

**用户表 (users)**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**任务表 (tasks)**
```sql
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(100),
  priority ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_priority (priority),
  INDEX idx_due_date (due_date),
  INDEX idx_completed (completed)
);
```

### 5. API 设计规范

**RESTful API 设计**
- 使用 HTTP 方法表示操作: GET (查询), POST (创建), PUT (更新), DELETE (删除)
- 状态码规范: 200 (成功), 201 (创建成功), 400 (请求错误), 401 (未授权), 403 (禁止访问), 404 (不存在), 500 (服务器错误)
- 响应格式统一: `{ code: number, data: any, message: string }`

**API 端点**
```
POST   /api/auth/register      # 用户注册
POST   /api/auth/login         # 用户登录
POST   /api/auth/logout        # 用户登出
POST   /api/auth/refresh       # 刷新 Token
GET    /api/auth/me            # 获取当前用户信息

GET    /api/tasks              # 获取任务列表
POST   /api/tasks              # 创建任务
GET    /api/tasks/:id          # 获取单个任务
PUT    /api/tasks/:id          # 更新任务
DELETE /api/tasks/:id          # 删除任务
```

### 6. 测试策略

**前端测试**
- **单元测试**: Vitest + Vue Test Utils，测试组件和工具函数
- **集成测试**: Vitest + MSW，测试 API 调用和状态管理

**后端测试**
- **单元测试**: Jest，测试服务层和工具函数
- **集成测试**: Jest + Supertest，测试 API 端点
- **数据库测试**: 使用独立测试数据库，每个测试后清理数据

**TDD 流程**
1. 编写失败的测试
2. 编写最小实现使测试通过
3. 重构代码
4. 重复以上步骤

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据迁移丢失 | 高 | 迁移前备份 IndexedDB 数据；提供导出功能 |
| API 性能问题 | 中 | 使用 Redis 缓存；数据库索引优化；分页查询 |
| 安全问题 | 高 | JWT 密钥管理；密码 bcrypt 加密；输入验证；CORS 配置 |
| 开发时间增加 | 中 | 采用敏捷迭代，MVP 优先；前后端并行开发 |
| 学习成本 | 低 | Vue3 文档完善；提供代码示例和规范 |

## Migration Plan

**阶段 1: 后端开发 (Week 1-2)**
1. 搭建后端项目结构和基础配置
2. 实现数据库模型和迁移
3. 实现用户认证 API（注册、登录、JWT）
4. 实现任务 CRUD API
5. 编写后端测试

**阶段 2: 前端开发 (Week 2-3)**
1. 搭建前端项目结构和基础配置
2. 实现登录/注册页面
3. 实现任务列表页面
4. 实现任务创建/编辑功能
5. 编写前端测试

**阶段 3: 集成测试 (Week 3)**
1. 前后端联调
2. 端到端测试
3. 性能测试和优化
4. 安全审计

**部署策略**
- 开发环境: Docker Compose 一键启动
- 生产环境: 前端 CDN + 后端服务器 + RDS MySQL + ElastiCache Redis

## Open Questions

1. 是否需要保留旧版应用的某些数据？如何引导用户迁移？
2. 生产环境的域名和 SSL 证书如何配置？
3. 是否需要实现限流和防刷机制？
4. 是否需要支持多语言（i18n）？
