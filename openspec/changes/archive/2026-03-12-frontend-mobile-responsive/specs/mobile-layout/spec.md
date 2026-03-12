## ADDED Requirements

### Requirement: 响应式断点系统

系统 SHALL 提供统一的响应式断点系统，支持移动端、平板、桌面三种设备类型检测。

#### Scenario: 检测移动端设备
- **WHEN** 屏幕宽度小于 768px
- **THEN** `isMobile` 状态为 true，`isTablet` 和 `isDesktop` 为 false

#### Scenario: 检测平板设备
- **WHEN** 屏幕宽度在 768px 到 991px 之间
- **THEN** `isTablet` 状态为 true，`isMobile` 和 `isDesktop` 为 false

#### Scenario: 检测桌面设备
- **WHEN** 屏幕宽度大于等于 992px
- **THEN** `isDesktop` 状态为 true，`isMobile` 和 `isTablet` 为 false

### Requirement: 断点 CSS 变量

系统 SHALL 在 CSS 中定义断点变量，供样式使用。

#### Scenario: CSS 变量可用
- **WHEN** 应用加载完成
- **THEN** CSS 中存在以下变量：`--breakpoint-sm: 576px`、`--breakpoint-md: 768px`、`--breakpoint-lg: 992px`、`--breakpoint-xl: 1200px`

### Requirement: useBreakpoint composable

系统 SHALL 提供 `useBreakpoint` composable 函数，返回响应式断点状态。

#### Scenario: 组件中使用断点
- **WHEN** 组件调用 `const { isMobile, isTablet, isDesktop } = useBreakpoint()`
- **THEN** 返回的值为响应式 ref，随窗口大小变化自动更新

#### Scenario: 组件卸载时清理
- **WHEN** 使用 useBreakpoint 的组件卸载
- **THEN** resize 事件监听器被正确移除

### Requirement: 移动端容器适配

主容器 SHALL 根据设备类型自适应布局。

#### Scenario: 移动端全宽布局
- **WHEN** 屏幕宽度小于 768px
- **THEN** 主容器宽度为 100%，内边距为 12px

#### Scenario: 桌面端居中布局
- **WHEN** 屏幕宽度大于等于 1200px
- **THEN** 主容器最大宽度为 1400px，水平居中