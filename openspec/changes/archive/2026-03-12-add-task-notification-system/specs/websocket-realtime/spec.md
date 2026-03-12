# WebSocket Realtime Specification

## Capability

WebSocket 实时通信基础设施，支持服务端主动推送消息到客户端，包括连接管理、心跳检测、重连机制。

## ADDED Requirements

### REQ-001: WebSocket 连接建立

**优先级**: P0

用户登录后，前端 MUST 自动建立 WebSocket 连接。

**验收标准**:
- [ ] 使用 Socket.IO 客户端建立连接
- [ ] 连接时携带 JWT token 进行身份验证
- [ ] 连接成功后进入用户专属房间
- [ ] 连接失败时自动重试（最多3次）

#### Scenario: 成功建立连接
- **WHEN** 已登录用户打开应用
- **THEN** 系统自动建立 WebSocket 连接
- **AND** 用户进入专属房间 `user:{userId}`

#### Scenario: 连接认证失败
- **WHEN** JWT token 无效或过期
- **THEN** 服务端拒绝连接
- **AND** 客户端触发重新登录流程

### REQ-002: 心跳与重连机制

**优先级**: P0

WebSocket 连接 MUST 保持活跃，断线后自动重连。

**验收标准**:
- [ ] 服务端每25秒发送心跳 ping
- [ ] 客户端收到 ping 后必须回复 pong
- [ ] 连接断开后自动重连（指数退避：1s, 2s, 4s, 最多30s）
- [ ] 重连成功后自动重新加入用户房间

#### Scenario: 正常心跳
- **WHEN** WebSocket 连接已建立
- **THEN** 服务端每25秒发送一次心跳
- **AND** 客户端响应心跳保持连接

#### Scenario: 网络中断后重连
- **WHEN** 网络中断导致 WebSocket 断开
- **THEN** 客户端自动尝试重连
- **AND** 重连成功后恢复消息接收

### REQ-003: 消息推送机制

**优先级**: P0

服务端 MUST 能够向特定用户推送实时消息。

**验收标准**:
- [ ] 支持向单个用户推送消息（通过用户房间）
- [ ] 消息格式包含 type、payload、timestamp
- [ ] 消息顺序保证（使用消息队列）
- [ ] 支持消息类型：notification、task_update、counts_update

#### Scenario: 推送通知消息
- **WHEN** 服务端需要通知用户
- **THEN** 消息通过 WebSocket 发送到用户房间
- **AND** 客户端收到消息后触发对应处理

#### Scenario: 用户离线时推送
- **WHEN** 用户 WebSocket 未连接
- **THEN** 消息保存到数据库
- **AND** 用户下次连接时可查询未读消息

### REQ-004: 连接状态管理

**优先级**: P1

前端 MUST 提供连接状态查询和管理接口。

**验收标准**:
- [ ] 提供连接状态：connecting、connected、disconnected
- [ ] 提供手动重连方法
- [ ] 连接状态变化时触发事件
- [ ] Vue 组件可通过 composable 访问连接状态

#### Scenario: 查询连接状态
- **WHEN** 组件调用 `useWebSocket()` composable
- **THEN** 返回当前连接状态和连接实例
- **AND** 可监听状态变化

## Technical Constraints

### TC-001: 后端实现
- 使用 Socket.IO v4.x
- 集成现有 JWT 认证中间件
- 支持 CORS 配置

### TC-002: 前端实现
- 使用 socket.io-client
- 封装为 Vue composable：`useWebSocket()`
- 单例模式管理连接实例

### TC-003: 安全性
- WebSocket 连接必须验证 JWT
- 每个用户只能进入自己的房间
- 禁止跨用户消息发送