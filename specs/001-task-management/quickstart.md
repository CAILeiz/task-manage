# Quick Start: 任务管理应用

**Feature**: 任务管理核心功能
**Branch**: `001-task-management`
**Date**: 2026-02-27

## 开发环境搭建

### 前置要求

- **浏览器**: 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- **Node.js**: 18+（可选，仅用于开发工具）
- **包管理器**: npm 或 pnpm（可选）

### 项目初始化

```bash
# 1. 确认你在功能分支上
git checkout 001-task-management

# 2. 创建项目结构
mkdir -p src/components src/storage src/models src/utils
mkdir -p tests/contract tests/integration tests/unit/components tests/unit/storage tests/unit/models

# 3. 创建基础 HTML 文件
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>任务管理应用</title>
  <style>
    :root {
      --priority-high: #ef4444;
      --priority-medium: #f59e0b;
      --priority-low: #10b981;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    
    h1 {
      margin-bottom: 20px;
      color: #111827;
    }
    
    .task-form {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .task-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .task-item {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .task-item:last-child {
      border-bottom: none;
    }
    
    .task-priority {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    
    .task-priority.HIGH { background: var(--priority-high); }
    .task-priority.MEDIUM { background: var(--priority-medium); }
    .task-priority.LOW { background: var(--priority-low); }
    
    .task-name {
      flex: 1;
      color: #374151;
    }
    
    .task-name.completed {
      text-decoration: line-through;
      color: #9ca3af;
    }
    
    .task-actions {
      display: flex;
      gap: 8px;
    }
    
    button {
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background: #f3f4f6;
    }
    
    .filter-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <h1>📋 任务管理</h1>
  
  <task-form></task-form>
  
  <div class="filter-bar">
    <select id="priority-filter">
      <option value="">所有优先级</option>
      <option value="HIGH">高优先级</option>
      <option value="MEDIUM">中优先级</option>
      <option value="LOW">低优先级</option>
    </select>
    
    <select id="due-date-filter">
      <option value="">所有日期</option>
      <option value="today">今天到期</option>
      <option value="upcoming">即将到期</option>
      <option value="overdue">已过期</option>
      <option value="none">无截止日期</option>
    </select>
  </div>
  
  <div class="task-list">
    <task-list></task-list>
  </div>
  
  <script type="module" src="src/main.js"></script>
</body>
</html>
EOF
```

### 启动开发服务器

**选项 1: 使用 Vite（推荐）**

```bash
# 安装 Vite（如果未安装）
npm install -D vite

# 启动开发服务器
npx vite
```

**选项 2: 使用 Python**

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

**选项 3: 使用 Node.js http-server**

```bash
npm install -g http-server
http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080`

## 运行测试

### 测试框架设置

创建 `package.json`（可选）：

```bash
npm init -y
npm install -D @web/test-runner
```

### 运行测试命令

```bash
# 使用 Web Test Runner
npx web-test-runner "tests/**/*.test.js" --node-resolve

# 或使用原生测试脚本
bash run-tests.sh
```

## 开发工作流

### 1. 创建第一个 Web Component

创建 `src/components/task-item.js`:

```javascript
class TaskItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  set task(data) {
    this._task = data;
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* 组件样式 */
      </style>
      <div class="task-item">
        <div class="task-priority ${this._task.priority}"></div>
        <span class="task-name ${this._task.completed ? 'completed' : ''}">
          ${this._task.name}
        </span>
        <div class="task-actions">
          <button @click="${() => this.toggleComplete()}">
            ${this._task.completed ? '↩️' : '✅'}
          </button>
        </div>
      </div>
    `;
  }
  
  toggleComplete() {
    this.dispatchEvent(new CustomEvent('task-toggle', {
      detail: { id: this._task.id }
    }));
  }
}

customElements.define('task-item', TaskItem);
```

### 2. 初始化 IndexedDB

创建 `src/storage/indexeddb.js`:

```javascript
const DB_NAME = 'task-manager-db';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('dueDate', 'dueDate', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}
```

## 宪章合规检查

### ✅ 原生 Web API 优先

- [x] 使用原生 Web Components
- [x] 使用原生 IndexedDB
- [x] 无第三方框架依赖

### ✅ 测试优先

- [ ] 编写组件测试（TDD 流程）
- [ ] 编写存储层测试
- [ ] 编写集成测试
- [ ] 确保覆盖率 ≥90%

### ✅ 性能优先

- [ ] UI 响应 <100ms
- [ ] 列表加载 <1s（100 任务）
- [ ] 使用事件委托和批量 DOM 操作

## 下一步

1. 阅读 [data-model.md](./data-model.md) 了解数据结构
2. 阅读 [contracts/](./contracts/) 了解接口规范
3. 运行 `/speckit.tasks` 生成实现任务列表
4. 开始 TDD 开发流程
