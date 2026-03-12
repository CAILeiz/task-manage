## 1. 后端基础设施

- [x] 1.1 安装 WebSocket 和定时任务依赖（socket.io、node-cron）
- [x] 1.2 创建 notifications 数据表（MySQL migration）
- [x] 1.3 创建 Notification 数据模型（backend/src/models/Notification.ts）
- [x] 1.4 创建 Notification Controller（CRUD API）

## 2. WebSocket 服务端

- [x] 2.1 创建 Socket.IO 服务端模块（backend/src/socket/index.ts）
- [x] 2.2 实现 JWT 认证中间件（WebSocket 连接验证）
- [x] 2.3 实现用户房间管理（每个用户进入专属房间）
- [x] 2.4 实现心跳检测和连接状态管理
- [x] 2.5 集成 Redis Adapter（支持横向扩展）

## 3. 定时任务提醒服务

- [x] 3.1 创建定时任务调度器模块（backend/src/schedulers/index.ts）
- [x] 3.2 实现任务到期检查逻辑（每小时执行）
- [x] 3.3 实现提醒去重机制（Redis 缓存已提醒任务）
- [x] 3.4 实现服务启动时的即时检查（补救遗漏提醒）
- [x] 3.5 集成通知发送（检查到即将到期任务时创建通知并推送）

## 4. 通知系统集成

- [x] 4.1 创建通知服务模块（backend/src/services/notificationService.ts）
- [x] 4.2 实现 WebSocket 消息推送封装
- [x] 4.3 修改 Task Controller，在任务状态变更时触发通知
- [x] 4.4 修改 Task Controller，在任务状态变更时推送 counts_update

## 5. 前端 WebSocket 客户端

- [x] 5.1 安装 Socket.IO 客户端依赖
- [x] 5.2 创建 WebSocket composable（frontend/src/composables/useWebSocket.ts）
- [x] 5.3 实现连接管理（连接、重连、断开）
- [x] 5.4 实现消息监听和分发机制
- [x] 5.5 集成到应用入口（main.ts 或 App.vue）

## 6. 前端通知中心

- [x] 6.1 创建通知 Store（frontend/src/stores/notification.ts）
- [x] 6.2 创建通知中心组件（NotificationCenter.vue）
- [x] 6.3 实现通知列表展示（未读/已读状态）
- [x] 6.4 实现未读数量徽章（导航栏）
- [x] 6.5 实现标记已读功能（单条/全部）
- [x] 6.6 实现通知跳转（点击任务通知跳转到任务）

## 7. 任务卡片完成交互优化

- [x] 7.1 优化 TaskCard.vue 复选框交互（乐观更新）
- [x] 7.2 实现任务完成样式变化（删除线、淡化）
- [x] 7.3 实现 API 请求失败时的 UI 回滚
- [x] 7.4 修改 Tasks.vue 正确处理 update 事件
- [x] 7.5 集成 WebSocket 消息处理（收到 counts_update 更新侧边栏）

## 8. 侧边栏数量实时更新

- [x] 8.1 修改 Sidebar.vue 监听 WebSocket counts_update 消息
- [x] 8.2 实现数量更新动画效果
- [x] 8.3 确保任务状态变更后立即刷新数量

## 9. 测试与验证

- [ ] 9.1 测试 WebSocket 连接和重连机制
- [ ] 9.2 测试任务完成/取消完成交互
- [ ] 9.3 测试侧边栏数量同步更新
- [ ] 9.4 测试任务到期提醒功能
- [ ] 9.5 测试通知创建、展示、已读管理