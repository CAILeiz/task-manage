# 任务管理应用

一个轻量级、高性能的任务管理 Web 应用，使用原生 JavaScript 和 IndexedDB 构建。

## 🌐 在线预览

### 方式一：GitHub Pages（推荐）

```bash
# 安装部署工具
npm install -D gh-pages

# 构建并部署到 GitHub Pages
npm run deploy:gh-pages
```

部署完成后，访问 `https://CAILeiz.github.io/task-manage/` 即可在线体验。

### 方式二：Vercel 一键部署

1. 访问 [Vercel](https://vercel.com)
2. 导入此 GitHub 仓库
3. 自动构建并生成预览链接

### 方式三：Netlify 一键部署

1. 访问 [Netlify](https://netlify.com)
2. 连接 GitHub 仓库
3. 设置构建命令：`npm run build`
4. 设置发布目录：`dist`

### 方式四：本地预览

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview
```

## 🎯 特性

- ✅ **任务创建和管理** - 快速创建任务，设置优先级和截止日期
- 🎨 **优先级管理** - 高/中/低三级优先级，颜色编码
- 📅 **截止日期跟踪** - 今天到期、即将到期、已过期过滤
- 🔍 **智能过滤** - 按优先级和截止日期组合过滤
- 💾 **本地存储** - IndexedDB 持久化，数据不丢失
- 🚀 **高性能** - UI 响应 <100ms，支持 1000+ 任务
- 📱 **响应式设计** - 适配桌面和移动设备

## 🛠️ 技术栈

- **原生 JavaScript (ES2020+)** - 无框架依赖
- **Web Components** - 可复用的自定义组件
- **IndexedDB** - 浏览器内置数据库
- **Vite** - 现代开发构建工具

## 📦 快速开始

### 前置要求

- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- Node.js 18+（可选，仅用于开发工具）

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd my-task-app

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx web-test-runner "tests/unit/storage/task-repository.test.js" --node-resolve
```

## 📁 项目结构

```
my-task-app/
├── src/
│   ├── components/
│   │   ├── task-form.js      # 任务创建表单
│   │   ├── task-item.js      # 单个任务展示
│   │   ├── task-list.js      # 任务列表容器
│   │   └── filter-bar.js     # 过滤器工具栏
│   ├── storage/
│   │   ├── indexeddb.js      # IndexedDB 初始化
│   │   └── task-repository.js # 任务 CRUD 操作
│   ├── models/
│   │   └── task.js           # Task 模型和验证
│   ├── utils/
│   │   ├── date-utils.js     # 日期工具函数
│   │   └── uuid.js           # UUID 生成
│   └── main.js               # 应用入口
├── tests/
│   ├── contract/             # 合同测试
│   ├── integration/          # 集成测试
│   └── unit/                 # 单元测试
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 使用指南

### 创建任务

1. 在表单中输入任务名称
2. 选择优先级（高/中/低）
3. （可选）设置截止日期
4. 点击"创建任务"按钮

### 管理任务

- **标记完成** - 点击任务右侧的 ✅ 按钮
- **取消完成** - 点击已完成任务的 ↩️ 按钮
- **查看优先级** - 彩色圆点表示优先级（红=高，橙=中，绿=低）

### 过滤任务

**按优先级过滤：**
- 选择"高优先级"查看紧急任务
- 选择"中优先级"查看计划任务
- 选择"低优先级"查看可延后任务

**按截止日期过滤：**
- "今天到期" - 查看今日任务
- "即将到期" - 查看未来 7 天任务
- "已过期" - 查看逾期未完成任务
- "无截止日期" - 查看未设置日期的任务

## 🧪 测试覆盖率

项目遵循 TDD 开发流程，测试覆盖率目标 ≥90%。

```bash
# 运行测试并生成覆盖率报告
npx web-test-runner "tests/**/*.test.js" --node-resolve --coverage
```

### 测试分类

- **合同测试** - 验证数据结构和 API 接口
- **单元测试** - 测试模型、工具函数、组件逻辑
- **集成测试** - 测试完整流程和端到端场景

## 🔒 数据隐私

- 所有数据存储在本地浏览器 IndexedDB 中
- 不上传任何数据到服务器
- 清除浏览器数据会删除所有任务

## 🎨 自定义

### 修改主题颜色

编辑 `index.html` 中的 CSS 变量：

```css
:root {
  --priority-high: #ef4444;    /* 高优先级颜色 */
  --priority-medium: #f59e0b;  /* 中优先级颜色 */
  --priority-low: #10b981;     /* 低优先级颜色 */
}
```

### 添加新功能

1. 在 `src/components/` 创建新的 Web Component
2. 在 `src/models/` 添加数据模型
3. 在 `tests/` 添加对应测试

## 📊 性能指标

| 指标 | 目标 | 实测 |
|------|------|------|
| UI 响应时间 | <100ms | ✅ |
| 列表渲染 (100 任务) | <1s | ✅ |
| 内存占用 | <50MB | ✅ |
| 打包大小 | <100KB (gzip) | ✅ |

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发原则

本项目遵循以下开发原则：

- **原生 Web API 优先** - 使用浏览器原生 API，零第三方依赖
- **测试优先** - TDD 开发，覆盖率 ≥90%
- **性能优先** - UI 响应 <100ms
- **增量交付** - MVP 先行，逐步迭代

## 📄 许可证

MIT License

## 🙏 致谢

- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Vite](https://vitejs.dev/)
