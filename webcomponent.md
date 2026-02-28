# Web Components 使用指南

本指南介绍项目中 Web Components 的主要用法和最佳实践。

## 📖 什么是 Web Components

Web Components 是一套浏览器原生支持的组件化技术，允许创建可复用的自定义 HTML 元素。它由三个主要标准组成：

1. **Custom Elements** - 定义自定义元素及其行为
2. **Shadow DOM** - 封装样式和 DOM 结构
3. **HTML Templates** - 定义可复用的模板

## 🎯 项目中的 Web Components

本任务管理应用使用原生 Web Components 构建，无需任何框架依赖。

### 组件列表

| 组件 | 文件路径 | 功能描述 |
|------|----------|----------|
| `<task-form>` | `src/components/task-form.js` | 新建任务弹窗表单 |
| `<task-list>` | `src/components/task-list.js` | 任务列表容器 |
| `<task-item>` | `src/components/task-item.js` | 单个任务展示项 |
| `<filter-bar>` | `src/components/filter-bar.js` | 过滤器工具栏 |

## 📦 Custom Elements 基础

### 定义自定义元素

```javascript
class TaskItem extends HTMLElement {
  constructor() {
    super();
    // 附加 Shadow DOM
    this.attachShadow({ mode: 'open' });
  }

  // 元素插入 DOM 时调用
  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* 组件样式 */
      </style>
      <div class="task-item">
        <!-- 组件内容 -->
      </div>
    `;
  }
}

// 注册自定义元素
customElements.define('task-item', TaskItem);
```

### 使用自定义元素

```html
<!-- HTML 中直接使用 -->
<task-item></task-item>

<!-- JavaScript 中操作 -->
const taskItem = document.createElement('task-item');
document.body.appendChild(taskItem);
```

## 🌳 Shadow DOM

### 什么是 Shadow DOM

Shadow DOM 允许将组件的 DOM 结构和样式与主文档隔离，避免样式冲突。

### 模式选择

```javascript
// open - 可通过 JavaScript 访问
this.attachShadow({ mode: 'open' });

// closed - 无法从外部访问
this.attachShadow({ mode: 'closed' });
```

### 样式隔离

```javascript
render() {
  this.shadowRoot.innerHTML = `
    <style>
      /* 样式只在组件内部生效 */
      .task-name {
        color: #1f2937;
        font-weight: 600;
      }
    </style>
    <div class="task-name">任务名称</div>
  `;
}
```

## 📡 组件通信

### 通过 Properties 传递数据

```javascript
class TaskItem extends HTMLElement {
  set task(taskData) {
    this._task = taskData;
    this.render();
  }

  get task() {
    return this._task;
  }

  render() {
    // 使用 this._task 渲染
  }
}

// 使用
const taskItem = document.querySelector('task-item');
taskItem.task = {
  id: '123',
  name: '任务名称',
  priority: 'HIGH'
};
```

### 通过 Events 发送消息

```javascript
// 组件内部触发事件
this.dispatchEvent(new CustomEvent('task-toggle', {
  detail: { id: this._task.id },
  bubbles: true,      // 事件冒泡
  composed: true      // 穿透 Shadow DOM
}));

// 父组件监听事件
document.addEventListener('task-toggle', (e) => {
  console.log('Task toggled:', e.detail.id);
});
```

## 🎨 项目组件详解

### 1. TaskForm - 任务创建表单

**功能**: 弹窗形式的新建任务表单

**事件**:
- `task-create` - 创建新任务时触发

**使用**:
```javascript
const taskForm = document.querySelector('task-form');

// 显示表单
taskForm.show();

// 监听创建事件
taskForm.addEventListener('task-create', (e) => {
  console.log('New task:', e.detail);
  // e.detail = { name, description, priority, dueDate }
});
```

**主要方法**:
```javascript
taskForm.show();  // 显示表单
taskForm.hide();  // 隐藏表单
```

### 2. TaskList - 任务列表

**功能**: 显示任务列表，支持空状态

**属性**:
```javascript
const taskList = document.querySelector('task-list');
taskList.tasks = [/* 任务数组 */];
```

**事件**:
- `task-toggle` - 切换任务完成状态
- `task-edit` - 请求编辑任务
- `task-delete` - 请求删除任务

**使用**:
```javascript
// 设置任务列表
taskList.tasks = [
  { id: '1', name: '任务 1', priority: 'HIGH', completed: false },
  { id: '2', name: '任务 2', priority: 'LOW', completed: true }
];

// 监听事件
taskList.addEventListener('task-toggle', (e) => {
  console.log('Toggle task:', e.detail.id);
});

taskList.addEventListener('task-edit', (e) => {
  console.log('Edit task:', e.detail);
});

taskList.addEventListener('task-delete', (e) => {
  console.log('Delete task:', e.detail.id);
});
```

### 3. FilterBar - 过滤器

**功能**: 提供优先级和截止日期过滤选项

**事件**:
- `filter-change` - 过滤条件变化时触发

**使用**:
```javascript
const filterBar = document.querySelector('filter-bar');

filterBar.addEventListener('filter-change', (e) => {
  const { type, value } = e.detail;
  console.log(`Filter ${type} changed to ${value}`);
  // type: 'priority' | 'dueDate'
  // value: 'HIGH' | 'MEDIUM' | 'LOW' | 'today' | 'upcoming' | 'overdue' | 'none'
});
```

## 🔧 最佳实践

### 1. 组件生命周期

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    // 初始化
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // 元素插入 DOM 时
    this.render();
    this.attachEvents();
  }

  disconnectedCallback() {
    // 元素从 DOM 移除时
    // 清理事件监听器、定时器等
    this.cleanup();
  }

  static get observedAttributes() {
    // 监听属性变化
    return ['task-data'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 属性变化时
    if (name === 'task-data') {
      this.render();
    }
  }
}
```

### 2. 事件委托

在父元素上监听子元素事件，提高性能：

```javascript
// 在 task-list 中
attachEvents() {
  this.shadowRoot.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.toggle-complete');
    if (toggleBtn) {
      const taskId = toggleBtn.dataset.taskId;
      this.dispatchEvent(new CustomEvent('task-toggle', {
        detail: { id: taskId },
        bubbles: true,
        composed: true
      }));
    }
  });
}
```

### 3. 防止 XSS 攻击

转义用户输入：

```javascript
escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 使用
render() {
  this.shadowRoot.innerHTML = `
    <div class="task-name">${this.escapeHtml(this._task.name)}</div>
  `;
}
```

### 4. 性能优化

**批量 DOM 操作**:
```javascript
render() {
  const html = `
    <style>...</style>
    ${this.tasks.map(task => this.renderTask(task)).join('')}
  `;
  this.shadowRoot.innerHTML = html;
}
```

**条件渲染**:
```javascript
render() {
  if (this.tasks.length === 0) {
    this.renderEmpty();
    return;
  }
  this.renderList();
}
```

## 🎯 组件开发流程

1. **创建组件文件**: `src/components/my-component.js`

2. **定义类**:
```javascript
export class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.attachEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>/* 样式 */</style>
      <div>内容</div>
    `;
  }

  attachEvents() {
    // 事件处理
  }
}

customElements.define('my-component', MyComponent);
```

3. **在 HTML 中引入**:
```html
<script type="module" src="src/main.js"></script>
```

4. **在 main.js 中导入**:
```javascript
import './components/my-component.js';
```

5. **在 HTML 中使用**:
```html
<my-component></my-component>
```

## 📚 相关资源

- [MDN Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM Spec](https://dom.spec.whatwg.org/#shadow-trees)
- [Web Components 最佳实践](https://web.dev/web-components-io-2019/)

## 🚀 下一步

- 查看 `src/components/` 目录中的组件实现
- 尝试修改现有组件样式
- 创建新的自定义组件
- 阅读测试文档了解如何测试组件
