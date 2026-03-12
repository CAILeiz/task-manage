# Notification System Specification

## Capability

通知系统，管理应用内通知的创建、展示、已读状态和历史记录，支持多种通知类型。

## ADDED Requirements

### REQ-001: 通知数据模型

**优先级**: P0

系统 MUST 支持通知的持久化存储。

**验收标准**:
- [ ] 通知包含：id、userId、type、title、content、taskId、readAt、createdAt
- [ ] 支持通知类型：task_reminder、task_completed、task_uncompleted
- [ ] 支持按用户查询通知
- [ ] 支持分页查询历史通知

#### Scenario: 创建通知
- **WHEN** 系统需要通知用户
- **THEN** 通知记录保存到数据库
- **AND** 同时通过 WebSocket 推送给在线用户

### REQ-002: 未读通知数量

**优先级**: P0

系统 MUST 实时显示用户的未读通知数量。

**验收标准**:
- [ ] 导航栏显示未读通知数量徽章
- [ ] 数量实时更新（WebSocket 推送）
- [ ] 点击通知后数量减少
- [ ] 未读数量支持 Redis 缓存

#### Scenario: 收到新通知
- **WHEN** 用户收到新通知
- **THEN** 导航栏未读徽章数量+1
- **AND** 徽章显示动画效果

#### Scenario: 标记通知已读
- **WHEN** 用户点击或查看通知
- **THEN** 通知标记为已读
- **AND** 未读数量-1

### REQ-003: 通知中心组件

**优先级**: P0

系统 MUST 提供通知中心展示所有通知。

**验收标准**:
- [ ] 点击导航栏通知图标打开通知面板
- [ ] 显示最近20条通知
- [ ] 支持加载更多历史通知
- [ ] 未读通知有视觉标识
- [ ] 点击任务相关通知跳转到对应任务

#### Scenario: 打开通知中心
- **WHEN** 用户点击通知图标
- **THEN** 显示通知面板/抽屉
- **AND** 展示最近的未读通知

#### Scenario: 点击任务通知跳转
- **WHEN** 用户点击任务完成/提醒通知
- **THEN** 跳转到任务详情或任务列表
- **AND** 高亮对应任务卡片

### REQ-004: 通知已读管理

**优先级**: P1

系统 MUST 支持标记通知为已读。

**验收标准**:
- [ ] 支持单条通知标记已读
- [ ] 支持"全部标记已读"功能
- [ ] 已读通知样式区分（灰色/淡化）
- [ ] 已读状态持久化

#### Scenario: 标记单条已读
- **WHEN** 用户点击通知
- **THEN** 该通知标记为已读
- **AND** 样式变为已读状态

#### Scenario: 全部标记已读
- **WHEN** 用户点击"全部已读"按钮
- **THEN** 所有未读通知标记为已读
- **AND** 未读数量清零

### REQ-005: 通知 API

**优先级**: P0

后端 MUST 提供通知相关的 REST API。

**验收标准**:
- [ ] GET /api/notifications - 获取通知列表（分页）
- [ ] GET /api/notifications/unread-count - 获取未读数量
- [ ] PUT /api/notifications/:id/read - 标记已读
- [ ] PUT /api/notifications/read-all - 全部标记已读

#### Scenario: 获取通知列表
- **WHEN** 前端请求 GET /api/notifications?page=1&limit=20
- **THEN** 返回用户的通知列表
- **AND** 按创建时间倒序排列

## Technical Constraints

### TC-001: 数据库
- 通知表使用 MySQL
- 已读通知定期清理（超过30天）

### TC-002: 缓存
- 未读数量使用 Redis 缓存
- 缓存键：`notifications:unread:{userId}`

### TC-003: 前端组件
- 使用 Element Plus `el-badge`、`el-drawer`、`el-list` 组件
- 封装为独立组件 `NotificationCenter.vue`