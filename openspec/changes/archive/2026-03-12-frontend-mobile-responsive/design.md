## Context

当前任务管理应用前端基于 Vue 3 + Element Plus 构建，仅针对桌面端设计（1280px+）。现有布局使用固定宽度侧边栏（64px/240px）和 CSS Grid 任务网格，在移动设备上存在以下问题：

1. **侧边栏占用过多空间**：固定侧边栏在小屏幕上挤压主内容区
2. **任务卡片布局拥挤**：`minmax(350px, 1fr)` 的网格在移动端显示不佳
3. **触摸交互不友好**：点击区域小、缺少触摸反馈
4. **筛选器难以操作**：下拉框在移动端体验差

**技术约束**：
- 使用 Element Plus 现有组件（Drawer、Dropdown）
- 不引入新的 UI 框架
- 保持与现有暗色模式兼容
- 不影响桌面端现有功能

## Goals / Non-Goals

**Goals:**
- 实现完整的移动端响应式适配（320px - 768px）
- 侧边栏在移动端改为抽屉式导航
- 任务列表支持移动端单列布局
- 触摸交互友好（点击区域 ≥ 44px）
- 保持桌面端现有功能不变

**Non-Goals:**
- 不开发原生移动应用
- 不添加 PWA 离线功能
- 不实现手势滑动删除（后续迭代）
- 不修改后端 API

## Decisions

### D1: 断点系统

**选择**: 使用 Element Plus 默认断点 + 自定义 CSS 变量

```
--breakpoint-sm: 576px   // 小手机
--breakpoint-md: 768px   // 平板竖屏
--breakpoint-lg: 992px   // 平板横屏/小桌面
--breakpoint-xl: 1200px  // 桌面
```

**理由**: Element Plus 的响应式组件（如 el-col）已内置这些断点，保持一致性可减少冲突。

**替代方案**: 使用 UnoCSS/Tailwind 断点 — 拒绝，因为项目未使用原子化 CSS 框架。

### D2: 移动端侧边栏实现

**选择**: 使用 Element Plus `el-drawer` 组件

**理由**:
- Element Plus 内置组件，无需额外依赖
- 支持遮罩层、动画、可访问性
- 与现有暗色主题兼容

**实现方式**:
- 桌面端：保持现有固定侧边栏
- 移动端（< 768px）：隐藏侧边栏，显示汉堡菜单按钮，点击打开 Drawer

**替代方案**: 
- `el-dialog` — 拒绝，Drawer 更符合侧边导航的视觉预期
- 自定义实现 — 拒绝，增加维护成本

### D3: 移动端任务布局

**选择**: 单列卡片布局 + 虚拟滚动（可选）

**理由**:
- 移动端屏幕宽度有限，单列最易阅读
- 卡片高度自适应内容
- 保持与桌面端 TaskCard 组件复用

**实现方式**:
```css
/* 桌面端 */
.task-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

/* 移动端 */
@media (max-width: 768px) {
  .task-grid {
    grid-template-columns: 1fr;
  }
}
```

### D4: 移动端筛选器

**选择**: 底部弹出抽屉（Bottom Sheet）

**理由**:
- 符合移动端操作习惯（拇指可达区域）
- 不遮挡任务列表
- Element Plus Drawer 支持 `direction="btt"`（bottom to top）

### D5: 断点检测工具

**选择**: 创建 `useBreakpoint` composable

**理由**:
- 响应式断点状态，可在 JS 中使用
- 支持组件条件渲染
- 可测试性强

**实现**:
```typescript
// composables/useBreakpoint.ts
export function useBreakpoint() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  
  const update = () => {
    const width = window.innerWidth
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 992
    isDesktop.value = width >= 992
  }
  
  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })
  
  return { isMobile, isTablet, isDesktop }
}
```

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Drawer 动画在低端设备卡顿 | 使用 CSS `will-change` 优化，提供 `prefers-reduced-motion` 支持 |
| 断点切换时布局闪烁 | 使用 CSS 过渡动画平滑切换 |
| 触摸事件与鼠标事件冲突 | 使用 `@click` 和 `@touchend` 分离处理 |
| 移动端筛选器状态丢失 | 筛选状态存储在 Pinia store，不随组件销毁 |

## Migration Plan

1. **Phase 1**: 添加断点系统和 useBreakpoint composable
2. **Phase 2**: 改造 Layout 组件，添加移动端汉堡菜单
3. **Phase 3**: 改造 Sidebar 组件，支持 Drawer 模式
4. **Phase 4**: 改造 Tasks 页面，添加移动端布局
5. **Phase 5**: 添加移动端筛选器抽屉
6. **Phase 6**: 触摸交互优化

**回滚策略**: 所有移动端代码通过 `isMobile` 条件渲染，回滚只需移除相关代码块。

## Open Questions

1. **是否需要移动端底部导航栏？** — 建议暂不实现，汉堡菜单 + Drawer 已足够
2. **是否需要 FAB（浮动操作按钮）？** — 建议实现，移动端新建任务更便捷