# Login Page UI Specification

## ADDED Requirements

### Requirement: 登录页品牌展示区

系统 SHALL 在登录页左侧展示品牌展示区，包含渐变背景、产品 Logo 和核心特性描述。

#### Scenario: 品牌展示区默认显示
- **WHEN** 用户访问登录页
- **THEN** 左侧显示品牌展示区，包含渐变背景、产品 Logo、产品名称和 3 个核心特性

#### Scenario: 品牌展示区响应式适配
- **WHEN** 用户在屏幕宽度小于 768px 的设备上访问
- **THEN** 品牌展示区隐藏，仅显示登录表单

### Requirement: 登录表单零摩擦设计

系统 SHALL 提供简化的登录表单，支持邮箱/密码登录和 SSO 登录。

#### Scenario: SSO 登录优先显示
- **WHEN** 用户查看登录表单
- **THEN** SSO 登录按钮（Google、GitHub）显示在邮箱登录表单上方

#### Scenario: 表单验证即时反馈
- **WHEN** 用户输入无效邮箱格式
- **THEN** 输入框显示红色边框，并在下方显示错误提示

#### Scenario: 登录按钮悬停效果
- **WHEN** 用户悬停在登录按钮上
- **THEN** 按钮向上移动 2px 并加深阴影

### Requirement: 登录页入场动画

系统 SHALL 在页面加载时播放入场动画，增强品牌感。

#### Scenario: 页面加载动画
- **WHEN** 用户首次加载登录页
- **THEN** 品牌 Logo 在 300ms 内淡入，登录表单在 200ms 内从下方滑入

#### Scenario: 减少动画偏好支持
- **WHEN** 用户系统设置启用了 `prefers-reduced-motion`
- **THEN** 入场动画被禁用

## MODIFIED Requirements

### Requirement: 登录表单布局优化

系统 SHALL 使用现代单列表单布局，优化间距和视觉层次。

#### Scenario: 表单字段布局
- **WHEN** 用户查看登录表单
- **THEN** 表单字段垂直排列，标签位于输入框上方，间距为 16px

#### Scenario: 输入框聚焦样式
- **WHEN** 用户聚焦输入框
- **THEN** 输入框显示 3px 品牌色边框，并显示轻微阴影