## ADDED Requirements

### Requirement: 汉堡菜单按钮

系统 SHALL 在移动端显示汉堡菜单按钮，用于触发侧边栏抽屉。

#### Scenario: 移动端显示汉堡菜单
- **WHEN** 屏幕宽度小于 768px
- **THEN** Header 左侧显示汉堡菜单图标按钮

#### Scenario: 点击打开抽屉
- **WHEN** 用户点击汉堡菜单按钮
- **THEN** 侧边栏以抽屉形式从左侧滑入

#### Scenario: 桌面端隐藏汉堡菜单
- **WHEN** 屏幕宽度大于等于 768px
- **THEN** 汉堡菜单按钮隐藏

### Requirement: 抽屉式侧边栏

侧边栏 SHALL 在移动端以抽屉形式展示。

#### Scenario: 移动端抽屉模式
- **WHEN** 屏幕宽度小于 768px 且用户点击汉堡菜单
- **THEN** 侧边栏以 el-drawer 组件从左侧滑入，带有遮罩层

#### Scenario: 点击遮罩关闭抽屉
- **WHEN** 侧边栏抽屉打开且用户点击遮罩层
- **THEN** 抽屉关闭

#### Scenario: ESC 键关闭抽屉
- **WHEN** 侧边栏抽屉打开且用户按下 ESC 键
- **THEN** 抽屉关闭

### Requirement: 移动端 Header 简化

Header SHALL 在移动端简化显示，隐藏次要元素。

#### Scenario: 移动端隐藏搜索框
- **WHEN** 屏幕宽度小于 768px
- **THEN** Header 中的搜索框隐藏，可通过抽屉访问

#### Scenario: 移动端显示用户头像
- **WHEN** 屏幕宽度小于 768px
- **THEN** Header 右侧显示用户头像下拉菜单

### Requirement: 浮动操作按钮 (FAB)

系统 SHALL 在移动端提供浮动操作按钮，用于快捷新建任务。

#### Scenario: 移动端显示 FAB
- **WHEN** 屏幕宽度小于 768px 且用户已登录
- **THEN** 页面右下角显示浮动新建按钮

#### Scenario: FAB 点击新建任务
- **WHEN** 用户点击浮动新建按钮
- **THEN** 打开任务创建弹窗

#### Scenario: 桌面端隐藏 FAB
- **WHEN** 屏幕宽度大于等于 768px
- **THEN** 浮动操作按钮隐藏