# Quick Filters Specification

## Capability

快捷筛选视图，利用后端已有API实现今日/过期/即将到期/无期限任务筛选。

## Requirements

### REQ-001: 今日任务视图

**优先级**: P1

显示今天到期的任务。

**验收标准**:
- [ ] 调用 `GET /api/tasks?dueDateFilter=today`
- [ ] 显示当天 00:00 - 23:59 到期的任务
- [ ] 列表标题显示"今日任务"
- [ ] 显示今日任务计数

### REQ-002: 过期任务视图

**优先级**: P1

显示已过期未完成的任务。

**验收标准**:
- [ ] 调用 `GET /api/tasks?dueDateFilter=overdue`
- [ ] 显示截止日期早于当前时间且未完成的任务
- [ ] 列表标题显示"过期任务"
- [ ] 过期任务卡片有视觉警示（红色提示）

### REQ-003: 即将到期视图

**优先级**: P1

显示未来7天内到期的任务。

**验收标准**:
- [ ] 调用 `GET /api/tasks?dueDateFilter=upcoming`
- [ ] 显示截止日期在未来7天内的任务
- [ ] 列表标题显示"即将到期"
- [ ] 按截止日期升序排列

### REQ-004: 无期限视图

**优先级**: P1

显示未设置截止日期的任务。

**验收标准**:
- [ ] 调用 `GET /api/tasks?dueDateFilter=none`
- [ ] 显示 dueDate 为 null 的任务
- [ ] 列表标题显示"无期限"

### REQ-005: 优先级筛选

**优先级**: P1

支持按优先级筛选任务。

**验收标准**:
- [ ] 提供高/中/低优先级下拉筛选
- [ ] 调用 `GET /api/tasks?priority=high|medium|low`
- [ ] 可与视图筛选组合使用

## API Mapping

| 视图 | API参数 |
|------|---------|
| 今日 | `?dueDateFilter=today` |
| 过期 | `?dueDateFilter=overdue` |
| 即将到期 | `?dueDateFilter=upcoming` |
| 无期限 | `?dueDateFilter=none` |
| 高优先级 | `?priority=high` |
| 中优先级 | `?priority=medium` |
| 低优先级 | `?priority=low` |

## Technical Constraints

### TC-001: 后端兼容
- 后端已实现所有筛选参数
- 无需后端修改

### TC-002: 状态管理
- 当前筛选状态存储在 URL query 参数
- 页面刷新保持筛选状态

## Out of Scope

- 自定义筛选条件
- 筛选条件保存
- 多条件组合筛选（AND/OR逻辑）