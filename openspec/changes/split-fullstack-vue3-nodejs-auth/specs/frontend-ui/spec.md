## ADDED Requirements

### Requirement: 前端使用 Vue 3 框架
系统 SHALL 使用 Vue 3 作为前端框架，采用组合式 API 和 TypeScript。

#### Scenario: Vue 3 项目结构
- **WHEN** 访问前端项目
- **THEN** 使用 Vue 3.4+ 版本
- **AND** 采用 `<script setup>` 语法
- **AND** 使用 TypeScript 编写组件

### Requirement: 前端使用 Element Plus UI 组件库
系统 SHALL 使用 Element Plus 作为 UI 组件库，保持统一的视觉风格。

#### Scenario: Element Plus 集成
- **WHEN** 查看前端页面
- **THEN** 使用 Element Plus 的 Button、Input、Table、Dialog 等组件
- **AND** 使用 Element Plus 的表单验证功能
- **AND** 主题色与品牌一致

### Requirement: 前端使用 Pinia 进行状态管理
系统 SHALL 使用 Pinia 管理应用状态，包括用户状态和任务状态。

#### Scenario: Pinia Store 结构
- **WHEN** 查看前端代码
- **THEN** 有独立的 authStore 管理用户认证状态
- **AND** 有独立的 taskStore 管理任务数据
- **AND** Store 中的状态变更通过 actions 完成

### Requirement: 前端实现用户登录页面
系统 SHALL 提供用户登录页面，包含用户名/邮箱输入框和密码输入框。

#### Scenario: 登录页面展示
- **WHEN** 访问登录页面
- **THEN** 显示用户名/邮箱输入框
- **AND** 显示密码输入框（密码隐藏）
- **AND** 显示登录按钮
- **AND** 提供跳转到注册页面的链接

#### Scenario: 登录成功
- **WHEN** 用户输入正确的用户名和密码点击登录
- **THEN** 系统调用后端登录 API
- **AND** 登录成功后跳转到任务列表页面
- **AND** 保存 Token 到 localStorage

#### Scenario: 登录失败
- **WHEN** 用户输入错误的密码点击登录
- **THEN** 系统显示错误提示 "用户名或密码错误"
- **AND** 保持在登录页面

### Requirement: 前端实现用户注册页面
系统 SHALL 提供用户注册页面，包含用户名、邮箱、密码和确认密码输入框。

#### Scenario: 注册页面展示
- **WHEN** 访问注册页面
- **THEN** 显示用户名输入框
- **AND** 显示邮箱输入框
- **AND** 显示密码输入框
- **AND** 显示确认密码输入框
- **AND** 显示注册按钮

#### Scenario: 注册成功
- **WHEN** 用户输入有效的信息点击注册
- **THEN** 系统调用后端注册 API
- **AND** 注册成功后自动登录并跳转到任务列表页面

#### Scenario: 密码不一致
- **WHEN** 用户输入的密码和确认密码不一致
- **THEN** 系统显示错误提示 "两次输入的密码不一致"

### Requirement: 前端实现任务列表页面
系统 SHALL 提供任务列表页面，展示用户的所有任务，支持过滤和分页。

#### Scenario: 任务列表展示
- **WHEN** 已登录用户访问任务列表页面
- **THEN** 显示当前用户的所有任务
- **AND** 每行显示任务名称、优先级、截止日期、完成状态
- **AND** 显示创建任务按钮

#### Scenario: 任务过滤
- **WHEN** 用户在任务列表页面选择优先级过滤器
- **THEN** 仅显示符合过滤条件的任务

#### Scenario: 标记任务完成
- **WHEN** 用户点击任务行的完成按钮
- **THEN** 任务状态变为已完成
- **AND** 视觉样式更新（如添加删除线）

### Requirement: 前端实现任务创建/编辑弹窗
系统 SHALL 提供任务创建和编辑的弹窗表单。

#### Scenario: 创建任务弹窗
- **WHEN** 用户点击创建任务按钮
- **THEN** 弹出任务创建表单
- **AND** 包含任务名称、描述、优先级、截止日期字段

#### Scenario: 编辑任务弹窗
- **WHEN** 用户点击任务行的编辑按钮
- **THEN** 弹出任务编辑表单
- **AND** 表单预填充当前任务数据

### Requirement: 前端使用 Vue Router 进行路由管理
系统 SHALL 使用 Vue Router 管理页面路由，实现路由守卫。

#### Scenario: 路由配置
- **WHEN** 查看前端路由配置
- **THEN** /login 对应登录页面
- **AND** /register 对应注册页面
- **AND** /tasks 对应任务列表页面

#### Scenario: 路由守卫
- **WHEN** 未登录用户访问 /tasks
- **THEN** 自动重定向到 /login 页面
- **AND** 登录成功后跳回原目标页面

### Requirement: 前端使用 Axios 进行 HTTP 请求
系统 SHALL 使用 Axios 封装 HTTP 请求，统一处理请求和响应。

#### Scenario: Axios 封装
- **WHEN** 查看前端 API 代码
- **THEN** 使用统一的 axios 实例
- **AND** 自动添加 Authorization Header
- **AND** 统一处理 401 错误（Token 过期）
