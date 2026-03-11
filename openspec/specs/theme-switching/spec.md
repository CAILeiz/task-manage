# Theme Switching Specification

## Capability

主题切换功能，支持浅色/深色模式。

## Requirements

### REQ-001: 深色模式支持

**优先级**: P2

提供深色主题切换。

**验收标准**:
- [ ] 顶部导航栏提供主题切换按钮
- [ ] 点击切换浅色/深色模式
- [ ] 主题偏好保存到 localStorage
- [ ] 页面刷新保持主题设置
- [ ] 默认跟随系统主题

### REQ-002: 主题色彩定义

**优先级**: P2

定义浅色和深色主题的配色方案。

**浅色主题**:
```css
--bg-primary: #ffffff
--bg-secondary: #f5f5f5
--text-primary: #1f2937
--text-secondary: #6b7280
--border-color: #e5e7eb
```

**深色主题**:
```css
--bg-primary: #1f2937
--bg-secondary: #111827
--text-primary: #f9fafb
--text-secondary: #9ca3af
--border-color: #374151
```

### REQ-003: Element Plus 主题适配

**优先级**: P2

深色模式下适配 Element Plus 组件样式。

**验收标准**:
- [ ] 使用 Element Plus 深色模式 CSS 变量
- [ ] 所有 Element Plus 组件在深色模式下正常显示
- [ ] 自定义组件样式使用 CSS 变量

## Technical Constraints

### TC-001: 实现方式
- 使用 CSS 变量定义主题色
- 使用 `prefers-color-scheme` 检测系统主题
- 使用 `html` 元素的 `class` 切换主题

### TC-002: Element Plus 集成
```typescript
// 使用 Element Plus 内置深色模式
import 'element-plus/theme-chalk/dark/css-vars.css'

// 切换方式
document.documentElement.classList.toggle('dark')
```

## Out of Scope

- 自定义主题色
- 多套主题方案
- 主题编辑器