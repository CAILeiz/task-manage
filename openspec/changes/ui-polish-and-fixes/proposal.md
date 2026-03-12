# UI Polish and Fixes

## Why

用户反馈了5个UI问题需要修复：

1. **侧边栏消息数量徽章位置不美观** - 徽章显示在文字下方，布局不合理
2. **列表视图缺少任务描述** - 切换到列表模式后，表格没有显示任务描述列
3. **创建任务后侧边栏计数未更新** - 新建任务后，今日/过期等快捷视图的数量没有刷新
4. **暗色模式UI不美观** - 切换暗色模式后，颜色对比度低，视觉效果差
5. **整体UI需要进一步美化** - 整体视觉层次和美观度需要提升

## What Changes

### 问题修复

1. **Sidebar.vue** - 调整徽章位置，使其与文字对齐
2. **Tasks.vue** - 在表格视图中添加任务描述列
3. **task.ts (store)** - 创建/删除任务后调用 `fetchTaskCounts()`
4. **theme.css** - 优化暗色模式的颜色变量和组件样式
5. **全局样式优化** - 提升整体视觉效果

### 样式优化

- 优化卡片阴影和圆角
- 改善暗色模式的对比度
- 统一间距和对齐
- 提升按钮和标签的视觉效果

## Impact

### 前端文件修改

- `frontend/src/components/Layout/Sidebar.vue` - 徽章布局修复
- `frontend/src/views/Tasks/Tasks.vue` - 添加描述列
- `frontend/src/stores/task.ts` - 任务计数刷新
- `frontend/src/styles/variables.css` - 暗色模式颜色优化
- `frontend/src/styles/theme.css` - 全局样式美化

### 无后端变更

所有修改仅涉及前端，无需后端配合。