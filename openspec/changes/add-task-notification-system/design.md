## Context

### 当前状态
- **后端**: Express + MySQL + Redis，纯 REST API，无实时通信能力
- **前端**: Vue 3 + Pinia + Element Plus，TaskCard 已有复选框 UI 但交互不完整
- **任务 Store**: 已实现 `fetchTaskCounts()` 方法，但未在正确时机调用
- **设计文档明确**: "暂不支持实时协作（WebSocket）"作为非目标

### 约束
- 需要保持向后兼容，现有 REST API 不能破坏
- Redis 已部署，可用于 WebSocket 房间管理和消息广播
- 需要支持多用户独立会话，每个用户只接收自己的通知

### 利益相关者
- 前端开发者：需要 WebSocket 客户端集成接口
- 后端开发者：需要 WebSocket 服务端架构和定时任务调度
- 产品：需要通知功能和用户体验提升

## Goals / Non-Goals

**Goals:**
- 实现任务完成状态的一键切换交互
- 实现侧边栏任务数量的实时同步
- 建立 WebSocket 实时通信基础设施
- 实现任务到期提醒（每小时检查一次，提醒24小时内到期任务）
- 实现任务状态变更通知

**Non-Goals:**
- 任务评论/协作功能
- 浏览器推送通知（仅应用内通知）
- 移动端推送通知
- 通知的邮件/短信发送
- 富文本通知内容

## Decisions

### D1: WebSocket 库选择 - Socket.IO

**选择**: Socket.IO

**理由**:
- 自动重连和心跳检测开箱即用
- 房间（Room）机制天然支持用户隔离
- 降级兼容：自动 fallback 到 HTTP long-polling
- 客户端 SDK 成熟，Vue 集成简单

**备选方案**:
- `ws`: 更轻量，但需要手动实现重连、房间管理、心跳
- Server-Sent Events (SSE): 单向通信，无法支持未来的双向交互需求

### D2: 定时任务调度 - node-cron

**选择**: node-cron

**理由**:
- 类 cron 语法，简单直观
- 轻量级，无额外依赖
- 支持时区配置

**备选方案**:
- `agenda`: MongoDB 依赖，当前项目使用 MySQL
- `bull`: Redis 队列，功能强大但对当前需求过重

### D3: 通知存储策略

**选择**: MySQL 持久化 + Redis 缓存最近通知

**理由**:
- 通知需要持久化以支持历史查询
- Redis 缓存未读通知数量，提升读取性能
- 通知表设计简单，不需要复杂查询

**表结构**:
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('task_reminder', 'task_completed', 'task_uncompleted') NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  task_id VARCHAR(36),
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_read (user_id, read_at),
  INDEX idx_user_created (user_id, created_at)
);
```

### D4: WebSocket 消息格式

**选择**: 标准化消息结构

```typescript
interface WebSocketMessage {
  type: 'notification' | 'task_update' | 'counts_update';
  payload: any;
  timestamp: number;
}

// 示例：任务完成通知
{
  type: 'notification',
  payload: {
    id: 'notif-xxx',
    type: 'task_completed',
    title: '任务已完成',
    content: '您已完成任务「完成项目报告」',
    taskId: 'task-xxx',
    createdAt: '2024-01-15T10:30:00Z'
  },
  timestamp: 1705315800000
}

// 示例：统计数量更新
{
  type: 'counts_update',
  payload: {
    all: 10,
    today: 2,
    overdue: 1,
    upcoming: 3,
    none: 2,
    completed: 4
  },
  timestamp: 1705315800000
}
```

### D5: 任务完成交互流程

**选择**: 前端乐观更新 + 后端确认

```
用户点击复选框
    ↓
前端立即更新 UI（乐观）
    ↓
发送 API 请求
    ↓
后端更新数据库
    ↓
后端推送 WebSocket 消息：
  1. counts_update（更新侧边栏数量）
  2. notification（任务完成通知）
    ↓
前端接收消息，更新状态
```

## Risks / Trade-offs

### R1: WebSocket 连接管理复杂度
**风险**: 多标签页、断线重连、认证失败等场景处理复杂
**缓解**: 
- 使用 Socket.IO 内置重连机制
- 连接时验证 JWT，失败则拒绝连接
- 前端维护单一 WebSocket 连接实例

### R2: 定时任务遗漏提醒
**风险**: 服务重启可能导致定时任务中断，错过提醒时间点
**缓解**:
- 服务启动时检查是否有需要立即提醒的任务
- 考虑将定时任务状态持久化（后续迭代）

### R3: 通知数量增长
**风险**: 长期使用后通知表数据量大
**缓解**:
- 定期清理已读超过30天的通知
- 分页查询历史通知

### R4: WebSocket 性能
**风险**: 大量用户同时在线时连接数压力大
**缓解**:
- 使用 Redis Adapter 支持横向扩展
- 当前用户规模（<1000）单实例足够

## Migration Plan

### 阶段一：基础设施（无破坏性变更）
1. 安装 Socket.IO、node-cron 依赖
2. 创建 WebSocket 服务端（独立模块，不影响现有 API）
3. 创建通知数据表
4. 前端 WebSocket 连接管理器

### 阶段二：功能集成
1. 修改任务更新 API，集成 WebSocket 消息推送
2. 实现定时任务检查逻辑
3. 前端通知中心组件

### 阶段三：UI 完善
1. 完善任务卡片勾选交互
2. 侧边栏数量实时更新
3. 通知展示和已读管理

### 回滚策略
- WebSocket 服务可独立关闭，不影响 REST API
- 通知功能可降级为无通知模式
- 数据库迁移通过版本控制管理

## Open Questions

1. **通知保留策略**: 是否需要用户可配置的通知保留时间？（默认30天清理已读通知）
2. **提醒频率**: 用户是否可以自定义提醒频率？（当前固定每小时检查）
3. **通知声音**: 是否需要新通知的提示音？（建议后续迭代）