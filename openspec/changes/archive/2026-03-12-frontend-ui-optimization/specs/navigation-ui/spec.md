# Navigation UI Specification

## ADDED Requirements

### Requirement: 侧边栏折叠功能

系统 SHALL 支持侧边栏折叠和展开，优化屏幕空间利用。

#### Scenario: 侧边栏默认展开
- **WHEN** 用户首次访问应用
- **THEN** 侧边栏以展开状态显示，宽度为 240px

#### Scenario: 侧边栏折叠切换
- **WHEN** 用户点击折叠按钮
- **THEN** 侧边栏在 200ms 内收起至 64px 宽度，仅显示图标

#### Scenario: 折叠态悬停提示
- **WHEN** 用户在折叠态下悬停导航项
- **THEN** 显示 Tooltip 提示完整导航项名称

### Requirement: 全局命令面板

系统 SHALL 提供全局命令面板，支持快速导航和操作。

#### Scenario: 命令面板快捷键打开
- **WHEN** 用户按下 Cmd/Ctrl + K
- **THEN** 命令面板居中弹出，搜索框自动聚焦

#### Scenario: 命令面板模糊搜索
- **WHEN** 用户在命令面板输入关键词
- **THEN** 系统实时过滤匹配的导航项和操作，高亮匹配文本

#### Scenario: 命令面板键盘导航
- **WHEN** 用户在命令面板中按下上下方向键
- **THEN** 选中项在结果列表中移动，按 Enter 执行选中项

### Requirement: 导航项视觉反馈增强

系统 SHALL 为导航项提供精细的悬停和选中状态反馈。

#### Scenario: 导航项悬停效果
- **WHEN** 用户悬停导航项
- **THEN** 导航项背景色变浅，左侧显示 3px 品牌色指示条

#### Scenario: 导航项选中效果
- **WHEN** 导航项被选中
- **THEN** 导航项背景色加深，文字显示品牌色

## MODIFIED Requirements

### Requirement: 头部导航样式优化

系统 SHALL 优化头部导航的视觉样式，提升品牌感。

#### Scenario: 头部渐变背景
- **WHEN** 用户查看应用头部
- **THEN** 头部显示品牌色渐变背景，从左侧到右侧渐变

#### Scenario: 头部搜索框样式
- **WHEN** 用户查看头部搜索框
- **THEN** 搜索框显示玻璃态背景效果，聚焦时边框高亮