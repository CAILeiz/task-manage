# Task List UI Specification

## ADDED Requirements

### Requirement: 任务卡片行内编辑

系统 SHALL 支持在任务卡片上直接编辑标题和描述。

#### Scenario: 行内编辑标题
- **WHEN** 用户单击任务卡片标题
- **THEN** 标题变为可编辑输入框，用户可直接修改

#### Scenario: 行内编辑保存
- **WHEN** 用户在行内编辑模式下按 Enter 或点击其他区域
- **THEN** 系统保存修改并更新任务卡片显示

#### Scenario: 行内编辑取消
- **WHEN** 用户在行内编辑模式下按 Escape
- **THEN** 取消编辑，恢复原始内容

### Requirement: 任务拖放交互优化

系统 SHALL 提供精细的拖放交互反馈。

#### Scenario: 任务拖动视觉反馈
- **WHEN** 用户开始拖动任务卡片
- **THEN** 卡片旋转 1°，透明度降至 0.9，阴影加深

#### Scenario: 任务放置区域指示
- **WHEN** 用户拖动任务到有效放置区域
- **THEN** 放置区域显示蓝色虚线边框

#### Scenario: 任务放置动画
- **WHEN** 用户释放拖动的任务
- **THEN** 任务卡片以 spring 曲线动画过渡到新位置

### Requirement: 任务空状态设计

系统 SHALL 为空任务列表提供友好的空状态设计。

#### Scenario: 空任务列表显示
- **WHEN** 用户查看没有任务的列表
- **THEN** 显示空状态插图和引导文案，以及"创建任务"按钮

#### Scenario: 搜索无结果状态
- **WHEN** 用户搜索后无匹配结果
- **THEN** 显示搜索无结果插图和调整搜索建议

## MODIFIED Requirements

### Requirement: 任务卡片视觉优化

系统 SHALL 优化任务卡片的视觉样式，提升可读性和层次感。

#### Scenario: 优先级视觉指示
- **WHEN** 任务卡片显示
- **THEN** 卡片左侧显示优先级色条（红色-高、橙色-中、绿色-低）

#### Scenario: 卡片悬停效果
- **WHEN** 用户悬停任务卡片
- **THEN** 卡片向上移动 2px，阴影加深，显示操作按钮

#### Scenario: 卡片标签显示
- **WHEN** 任务卡片有标签
- **THEN** 标签以彩色 pill 形式显示，最多显示 3 个，超出显示 +N

### Requirement: 任务创建弹窗优化

系统 SHALL 优化任务创建弹窗的布局和交互。

#### Scenario: 弹窗居中显示
- **WHEN** 用户点击新建任务
- **THEN** 弹窗居中显示，宽度 520px

#### Scenario: 表单字段布局
- **WHEN** 用户查看任务创建表单
- **THEN** 表单使用两列布局，标题和描述占满宽，其他字段分列

#### Scenario: 快捷键支持
- **WHEN** 用户在任务创建弹窗中按 Cmd/Ctrl + Enter
- **THEN** 任务创建表单提交