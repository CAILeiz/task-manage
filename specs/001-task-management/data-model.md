# Data Model: 任务管理

**Feature**: 任务管理核心功能
**Branch**: `001-task-management`
**Date**: 2026-02-27

## Core Entities

### Task（任务）

代表一个待办事项。

**Fields**:
- `id` (string, UUID): 唯一标识符
- `name` (string, 1-200 字符): 任务名称
- `priority` (enum): 优先级 - `HIGH` | `MEDIUM` | `LOW`
- `dueDate` (string, ISO 8601 date | null): 截止日期
- `completed` (boolean): 完成状态 - `false` (未完成) | `true` (已完成)
- `createdAt` (number, timestamp): 创建时间
- `updatedAt` (number, timestamp): 最后更新时间

**Validation Rules**:
- `name` 不能为空，最大长度 200 字符
- `priority` 必须是三个枚举值之一
- `dueDate` 可选，如果提供必须是有效的 ISO 8601 日期格式
- `completed` 默认为 `false`
- `createdAt` 和 `updatedAt` 由系统自动生成

**State Transitions**:
```
创建 → 未完成（默认状态）
未完成 → 已完成（用户标记完成）
已完成 → 未完成（用户取消完成）
```

### Priority（优先级）

任务的紧急程度分类。

**Values**:
- `HIGH` (高): 紧急且重要，需要立即处理
- `MEDIUM` (中): 重要但不紧急，计划处理
- `LOW` (低): 不紧急不重要，有空时处理

### Filter（过滤器）

用于筛选任务的条件。

**Types**:
1. **PriorityFilter** (优先级过滤)
   - `type`: `"priority"`
   - `value`: `HIGH` | `MEDIUM` | `LOW`

2. **DueDateFilter** (截止日期过滤)
   - `type`: `"dueDate"`
   - `value`: `"today"` | `"upcoming"` | `"overdue"` | `"none"`
   - **today**: 今天到期的任务
   - **upcoming**: 未来 7 天内到期的任务
   - **overdue**: 截止日期已过且未完成的任务
   - **none**: 没有设置截止日期的任务

## Relationships

```
Task (1) ── has ──> Priority (enum)
Task (1) ── has ──> DueDate (optional)
Task (1) ── has ──> completed (boolean)
```

## IndexedDB Schema

**Database Name**: `task-manager-db`
**Version**: 1

### Object Store: `tasks`

**Key Path**: `id`
**Indexes**:
- `priority`: 按优先级查询
- `dueDate`: 按截止日期查询
- `completed`: 按完成状态查询
- `createdAt`: 按创建时间排序

**Example Record**:
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "完成项目报告",
  priority: "HIGH",
  dueDate: "2026-03-01",
  completed: false,
  createdAt: 1709020800000,
  updatedAt: 1709020800000
}
```

## Data Access Patterns

### Create
```javascript
const task = {
  id: generateUUID(),
  name: "任务名称",
  priority: "HIGH",
  dueDate: "2026-03-01",
  completed: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
};
await taskRepository.create(task);
```

### Read All (with filters)
```javascript
// Get all tasks
const allTasks = await taskRepository.findAll();

// Filter by priority
const highPriority = await taskRepository.findByPriority("HIGH");

// Filter by due date
const overdue = await taskRepository.findByDueDate("overdue");
```

### Update
```javascript
task.completed = true;
task.updatedAt = Date.now();
await taskRepository.update(task);
```

### Delete
```javascript
await taskRepository.delete(taskId);
```
