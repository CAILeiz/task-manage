# Global Interactions Specification

## ADDED Requirements

### Requirement: 全局动画系统

系统 SHALL 建立统一的三层动画系统（反馈、过渡、惊喜）。

#### Scenario: 动画时长一致性
- **WHEN** 任何 UI 组件播放动画
- **THEN** 使用统一的时长变量（fast: 150ms, normal: 200ms, slow: 300ms）

#### Scenario: 动画缓动函数一致性
- **WHEN** 任何 UI 组件播放过渡动画
- **THEN** 使用统一的缓动函数（ease-out, ease-in-out, spring）

#### Scenario: 减少动画偏好支持
- **WHEN** 用户系统启用了 `prefers-reduced-motion`
- **THEN** 所有非功能性动画被禁用

### Requirement: 按钮交互反馈

系统 SHALL 为所有按钮提供一致的交互反馈。

#### Scenario: 按钮点击下沉效果
- **WHEN** 用户点击按钮
- **THEN** 按钮向下移动 1px，产生按下效果

#### Scenario: 按钮悬停效果
- **WHEN** 用户悬停按钮
- **THEN** 按钮向上移动 2px，阴影加深

#### Scenario: 按钮加载状态
- **WHEN** 按钮触发的操作正在进行
- **THEN** 按钮显示加载动画并禁用点击

### Requirement: 列表项动画

系统 SHALL 为列表项添加增删改动画。

#### Scenario: 列表项新增动画
- **WHEN** 新列表项被添加
- **THEN** 新项从上方淡入滑入

#### Scenario: 列表项删除动画
- **WHEN** 列表项被删除
- **THEN** 项向左滑出并淡出，其他项平滑上移填充空位

#### Scenario: 列表项更新高亮
- **WHEN** 列表项数据更新
- **THEN** 项背景短暂高亮 200ms

### Requirement: 全局加载状态

系统 SHALL 提供统一的加载状态设计。

#### Scenario: 页面加载骨架屏
- **WHEN** 页面正在加载内容
- **THEN** 显示骨架屏占位，带有微妙的闪烁动画

#### Scenario: 操作进行中指示
- **WHEN** 用户触发的操作需要时间
- **THEN** 显示进度指示器或加载动画

### Requirement: 成功反馈动画

系统 SHALL 为成功操作提供愉悦的反馈动画。

#### Scenario: 任务创建成功反馈
- **WHEN** 用户成功创建任务
- **THEN** 显示成功 Toast，带有对勾动画

#### Scenario: 任务完成反馈
- **WHEN** 用户标记任务完成
- **THEN** 复选框显示对勾动画，卡片短暂高亮

### Requirement: 错误边界设计

系统 SHALL 为错误状态提供友好的错误边界设计。

#### Scenario: 组件加载错误
- **WHEN** 组件加载失败
- **THEN** 显示错误边界界面，包含错误信息和重试按钮

#### Scenario: 网络错误提示
- **WHEN** 网络请求失败
- **THEN** 显示友好的错误提示，提供重试选项