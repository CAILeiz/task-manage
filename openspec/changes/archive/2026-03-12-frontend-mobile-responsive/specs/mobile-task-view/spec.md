## ADDED Requirements

### Requirement: 移动端单列布局

任务列表 SHALL 在移动端使用单列卡片布局。

#### Scenario: 移动端单列显示
- **WHEN** 屏幕宽度小于 768px
- **THEN** 任务卡片以单列形式垂直排列，宽度 100%

#### Scenario: 卡片间距适配
- **WHEN** 屏幕宽度小于 768px
- **THEN** 卡片之间的间距为 12px

### Requirement: 移动端筛选器抽屉

筛选器 SHALL 在移动端以底部抽屉形式展示。

#### Scenario: 移动端筛选按钮
- **WHEN** 屏幕宽度小于 768px
- **THEN** 任务列表顶部显示筛选按钮（带筛选计数徽章）

#### Scenario: 打开筛选抽屉
- **WHEN** 用户点击筛选按钮
- **THEN** 筛选器以底部抽屉（Bottom Sheet）形式弹出

#### Scenario: 筛选抽屉内容
- **WHEN** 筛选抽屉打开
- **THEN** 显示优先级筛选、状态筛选、日期筛选选项，以及"重置"和"应用"按钮

#### Scenario: 应用筛选后关闭
- **WHEN** 用户点击"应用"按钮
- **THEN** 筛选生效，抽屉关闭

### Requirement: 移动端视图切换简化

视图切换 SHALL 在移动端简化或隐藏。

#### Scenario: 移动端隐藏看板视图
- **WHEN** 屏幕宽度小于 768px
- **THEN** 隐藏看板视图选项，仅保留卡片和列表视图

#### Scenario: 移动端视图切换位置
- **WHEN** 屏幕宽度小于 768px
- **THEN** 视图切换按钮移至筛选抽屉内

### Requirement: 移动端分页适配

分页组件 SHALL 在移动端适配小屏幕。

#### Scenario: 移动端简化分页
- **WHEN** 屏幕宽度小于 768px
- **THEN** 分页组件仅显示上一页、下一页和页码输入，隐藏页码列表

#### Scenario: 移动端无限滚动（可选）
- **WHEN** 用户滚动到列表底部
- **THEN** 自动加载下一页任务