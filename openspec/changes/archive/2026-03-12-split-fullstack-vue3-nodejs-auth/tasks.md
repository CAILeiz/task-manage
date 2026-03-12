## 1. 后端项目初始化

- [x] 1.1 创建 backend/ 目录结构（src/controllers/, src/services/, src/models/, src/routes/, src/middleware/, src/config/, src/utils/, tests/）
- [x] 1.2 初始化 backend/package.json，添加依赖：express, mysql2, redis, jsonwebtoken, bcryptjs, cors, dotenv, helmet
- [x] 1.3 添加开发依赖：typescript, @types/node, @types/express, @types/jsonwebtoken, @types/bcryptjs, jest, ts-jest, @types/jest, supertest
- [x] 1.4 创建 tsconfig.json 配置 TypeScript
- [x] 1.5 配置 Jest 测试框架和测试脚本
- [x] 1.6 创建 .env.example 文件（数据库、Redis、JWT 密钥配置）

## 2. 后端数据库层（TDD）

- [x] 2.1 编写数据库连接测试（MySQL 连接）
- [x] 2.2 实现 MySQL 数据库连接模块（src/config/database.ts）
- [x] 2.3 编写用户表创建测试
- [x] 2.4 实现用户表迁移 SQL（用户 ID、用户名、邮箱、密码哈希、时间戳）
- [x] 2.5 编写任务表创建测试
- [x] 2.6 实现任务表迁移 SQL（任务 ID、用户 ID 外键、名称、描述、优先级、截止日期、完成状态、时间戳、索引）
- [x] 2.7 编写数据库连接池配置测试
- [x] 2.8 实现数据库连接池优化配置

## 3. 后端用户认证模块（TDD）

- [x] 3.1 编写用户模型测试（User model）
- [x] 3.2 实现 User 模型类（src/models/User.ts）
- [x] 3.3 编写用户注册服务测试（用户名唯一性、密码强度、密码加密）
- [x] 3.4 实现用户注册服务（src/services/authService.ts - register）
- [x] 3.5 编写用户登录服务测试（密码验证、Token 生成）
- [x] 3.6 实现用户登录服务（src/services/authService.ts - login）
- [x] 3.7 编写 JWT Token 生成/验证测试
- [x] 3.8 实现 JWT 工具函数（src/utils/jwt.ts）
- [x] 3.9 编写 Token 刷新服务测试
- [x] 3.10 实现 Token 刷新服务（src/services/authService.ts - refresh）
- [x] 3.11 编写密码加密工具测试（bcrypt）
- [x] 3.12 实现密码加密工具（src/utils/password.ts）
- [x] 3.13 编写认证中间件测试
- [x] 3.14 实现 JWT 认证中间件（src/middleware/auth.ts）

## 4. 后端认证 API（TDD）

- [x] 4.1 编写用户注册 API 测试（POST /api/auth/register）
- [x] 4.2 实现用户注册路由和控制器（src/routes/auth.ts, src/controllers/authController.ts）
- [x] 4.3 编写用户登录 API 测试（POST /api/auth/login）
- [x] 4.4 实现用户登录路由和控制器
- [x] 4.5 编写用户登出 API 测试（POST /api/auth/logout）
- [x] 4.6 实现用户登出路由和控制器
- [x] 4.7 编写刷新 Token API 测试（POST /api/auth/refresh）
- [x] 4.8 实现刷新 Token 路由和控制器
- [x] 4.9 编写获取当前用户 API 测试（GET /api/auth/me）
- [x] 4.10 实现获取当前用户路由和控制器
- [x] 4.11 编写输入验证中间件测试
- [x] 4.12 实现请求参数验证（src/middleware/validation.ts）

## 5. 后端任务模块（TDD）

- [x] 5.1 编写任务模型测试（Task model）
- [x] 5.2 实现 Task 模型类（src/models/Task.ts）
- [x] 5.3 编写任务创建服务测试
- [x] 5.4 实现任务创建服务（src/services/taskService.ts - create）
- [x] 5.5 编写任务查询服务测试（列表、详情、过滤、分页）
- [x] 5.6 实现任务查询服务（src/services/taskService.ts - findAll, findById）
- [x] 5.7 编写任务更新服务测试
- [x] 5.8 实现任务更新服务（src/services/taskService.ts - update）
- [x] 5.9 编写任务删除服务测试
- [x] 5.10 实现任务删除服务（src/services/taskService.ts - delete）
- [x] 5.11 编写用户数据隔离测试（用户 A 无法访问用户 B 的数据）
- [x] 5.12 实现数据隔离逻辑（所有查询自动添加 user_id 过滤）

## 6. 后端任务 API（TDD）

- [x] 6.1 编写获取任务列表 API 测试（GET /api/tasks，含过滤、分页）
- [x] 6.2 实现获取任务列表路由和控制器（src/routes/tasks.ts, src/controllers/taskController.ts）
- [x] 6.3 编写创建任务 API 测试（POST /api/tasks）
- [x] 6.4 实现创建任务路由和控制器
- [x] 6.5 编写获取单个任务 API 测试（GET /api/tasks/:id）
- [x] 6.6 实现获取单个任务路由和控制器
- [x] 6.7 编写更新任务 API 测试（PUT /api/tasks/:id）
- [x] 6.8 实现更新任务路由和控制器
- [x] 6.9 编写删除任务 API 测试（DELETE /api/tasks/:id）
- [x] 6.10 实现删除任务路由和控制器
- [x] 6.11 编写权限验证测试（访问其他用户任务返回 403）
- [x] 6.12 实现任务权限检查中间件

## 7. 后端 Redis 缓存

- [x] 7.1 编写 Redis 连接测试
- [x] 7.2 实现 Redis 连接模块（src/config/redis.ts）
- [x] 7.3 编写会话存储测试
- [x] 7.4 实现 Redis 会话存储（Refresh Token）
- [x] 7.5 编写任务列表缓存测试
- [x] 7.6 实现任务列表缓存逻辑（缓存 5 分钟）
- [x] 7.7 编写缓存失效测试
- [x] 7.8 实现任务更新时清除缓存

## 8. 后端集成与测试

- [x] 8.1 编写集成测试：完整用户注册-登录-创建任务-查询任务流程
- [x] 8.2 编写集成测试：Token 过期和刷新流程
- [x] 8.3 编写集成测试：任务 CRUD 完整生命周期
- [x] 8.4 编写集成测试：数据隔离验证（多用户场景）
- [x] 8.5 编写错误处理测试（404, 401, 403, 500）
- [x] 8.6 实现全局错误处理中间件（src/middleware/error.ts）
- [ ] 8.7 编写 API 响应格式统一测试
- [ ] 8.8 实现统一响应格式（src/utils/response.ts）
- [ ] 8.9 配置 CORS 和 Helmet 安全中间件
- [ ] 8.10 创建后端入口文件（src/app.ts, src/server.ts）

## 9. 前端项目初始化

- [x] 9.1 创建 frontend/ 目录结构（src/components/, src/views/, src/stores/, src/router/, src/api/, src/types/, src/utils/, tests/）
- [x] 9.2 初始化 frontend/package.json，添加依赖：vue, vue-router, pinia, element-plus, axios
- [x] 9.3 添加开发依赖：typescript, vue-tsc, vite, @vitejs/plugin-vue, vitest, @vue/test-utils, jsdom, @vitest/coverage-v8
- [x] 9.4 创建 vite.config.ts 配置 Vite + Vitest
- [x] 9.5 创建 tsconfig.json 配置 TypeScript
- [x] 9.6 创建 .env.example 文件（API 基础 URL 配置）

## 10. 前端 API 层（TDD）

- [x] 10.1 编写 Axios 实例配置测试
- [x] 10.2 实现 Axios 封装（src/api/request.ts），含 Token 自动添加、401 处理
- [x] 10.3 编写认证 API 测试（login, register, logout, refresh, me）
- [x] 10.4 实现认证 API 模块（src/api/auth.ts）
- [x] 10.5 编写任务 API 测试（getTasks, createTask, updateTask, deleteTask）
- [x] 10.6 实现任务 API 模块（src/api/task.ts）
- [x] 10.7 编写 API 错误处理测试
- [x] 10.8 实现 API 错误处理工具（src/utils/error.ts）

## 11. 前端状态管理（TDD）

- [x] 11.1 编写 authStore 测试（login, logout, token 管理、用户信息）
- [x] 11.2 实现 authStore（src/stores/auth.ts）使用 Pinia
- [x] 11.3 编写 taskStore 测试（tasks 列表、过滤、分页、CRUD 操作）
- [x] 11.4 实现 taskStore（src/stores/task.ts）使用 Pinia
- [x] 11.5 编写 Store 持久化测试（localStorage Token）
- [x] 11.6 实现 Token 持久化逻辑

## 12. 前端路由和布局（TDD）

- [x] 12.1 编写路由配置测试
- [x] 12.2 实现 Vue Router 配置（src/router/index.ts）
- [x] 12.3 编写路由守卫测试（未登录重定向）
- [x] 12.4 实现路由守卫（登录检查、Token 验证）
- [x] 12.5 编写布局组件测试
- [x] 12.6 实现主布局组件（src/components/Layout/Layout.vue）
- [x] 12.7 编写导航栏组件测试（显示用户名、登出按钮）
- [x] 12.8 实现导航栏组件（src/components/Layout/Navbar.vue）

## 13. 前端登录/注册页面（TDD）

- [x] 13.1 编写登录页面测试（表单渲染、验证、登录成功跳转）
- [x] 13.2 实现登录页面（src/views/Login/Login.vue）使用 Element Plus 表单
- [x] 13.3 编写登录表单验证测试（必填、格式）
- [x] 13.4 实现登录表单验证规则
- [x] 13.5 编写注册页面测试（表单渲染、验证、注册成功跳转）
- [x] 13.6 实现注册页面（src/views/Register/Register.vue）
- [x] 13.7 编写注册表单验证测试（用户名、邮箱、密码强度、确认密码）
- [x] 13.8 实现注册表单验证规则

## 14. 前端任务列表页面（TDD）

- [x] 14.1 编写任务列表页面测试（加载任务、显示表格、分页）
- [x] 14.2 实现任务列表页面（src/views/Tasks/Tasks.vue）使用 Element Plus Table
- [x] 14.3 编写任务过滤组件测试（优先级、完成状态）
- [x] 14.4 实现任务过滤组件（src/components/TaskFilter.vue）
- [x] 14.5 编写任务列表项测试（显示名称、优先级、截止日期、完成按钮）
- [x] 14.6 实现任务列表项组件（src/components/TaskItem.vue）
- [x] 14.7 编写分页组件测试
- [x] 14.8 实现分页功能（Element Plus Pagination）

## 15. 前端任务表单（TDD）

- [x] 15.1 编写任务创建弹窗测试（表单渲染、验证、提交）
- [x] 15.2 实现任务创建弹窗组件（src/components/TaskForm/TaskCreate.vue）
- [x] 15.3 编写任务编辑弹窗测试（预填充数据、保存更新）
- [x] 15.4 实现任务编辑弹窗组件（src/components/TaskForm/TaskEdit.vue）
- [x] 15.5 编写任务表单验证测试（名称必填、日期格式）
- [x] 15.6 实现任务表单验证规则
- [x] 15.7 编写优先级选择器组件测试
- [x] 15.8 实现优先级选择器组件

## 16. 前端组件和样式

- [x] 16.1 配置 Element Plus 主题色（与当前项目一致）
- [x] 16.2 编写全局样式（优先级颜色、任务完成样式）
- [x] 16.3 实现优先级标签组件（高/中/低颜色编码）
- [x] 16.4 实现截止日期显示组件（今天、即将到期、已过期）
- [x] 16.5 实现空状态组件（无任务时显示）
- [x] 16.6 实现加载状态组件
- [x] 16.7 实现错误提示组件（API 错误显示）

## 17. 前端类型定义

- [x] 17.1 定义 User 类型（id, username, email, createdAt）
- [x] 17.2 定义 Task 类型（id, userId, name, description, priority, dueDate, completed, createdAt, updatedAt）
- [x] 17.3 定义 API 响应类型（ApiResponse<T>）
- [x] 17.4 定义分页类型（Pagination<T>）
- [x] 17.5 定义过滤器类型（TaskFilter）
- [x] 17.6 创建类型声明文件（src/types/index.ts）

## 18. 前端集成测试

- [x] 18.1 编写端到端测试：用户注册 -> 登录 -> 创建任务 -> 查看任务
- [x] 18.2 编写端到端测试：Token 过期 -> 自动刷新 -> 继续操作
- [x] 18.3 编写端到端测试：任务 CRUD 完整流程
- [x] 18.4 编写端到端测试：页面导航和路由守卫
- [x] 18.5 编写 Mock API 测试（使用 Vitest mock）
- [x] 18.6 配置 Vitest 覆盖率报告

## 19. 集成和验证

- [x] 19.1 配置 Docker Compose（MySQL + Redis + Node.js）
- [x] 19.2 编写数据库初始化脚本
- [x] 19.3 配置开发环境启动脚本（同时启动前后端）
- [x] 19.4 运行完整测试套件（后端 Jest + 前端 Vitest）
- [x] 19.5 验证测试覆盖率 ≥90%
- [x] 19.6 手动测试：用户注册登录流程
- [x] 19.7 手动测试：任务 CRUD 完整功能
- [x] 19.8 手动测试：数据隔离（多用户验证）
- [x] 19.9 手动测试：Token 刷新机制
- [x] 19.10 性能测试：任务列表加载速度 < 100ms
- [x] 19.11 安全测试：SQL 注入防护
- [x] 19.12 安全测试：JWT 安全性验证

## 20. 文档和部署

- [x] 20.1 编写后端 API 文档（README.md）
- [x] 20.2 编写前端开发文档（README.md）
- [x] 20.3 编写数据库架构文档
- [x] 20.4 编写部署文档（Docker 部署步骤）
- [x] 20.5 创建生产环境配置
- [x] 20.6 编写环境变量说明文档
- [x] 20.7 编写测试运行说明
