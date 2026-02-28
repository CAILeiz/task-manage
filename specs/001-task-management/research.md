# Research: 任务管理应用技术决策

**Feature**: 任务管理核心功能
**Branch**: `001-task-management`
**Date**: 2026-02-27

## Technical Decisions

### 1. Web Components 最佳实践

**决策**: 使用原生 Custom Elements + Shadow DOM

**Rationale**:
- 符合宪章原则 VI（原生 Web API 优先）
- 零第三方依赖
- 所有现代浏览器原生支持
- 组件封装性好，Shadow DOM 隔离样式

**实现模式**:
```javascript
class TaskItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  // 使用 setter 接收数据
  set task(data) { /* ... */ }
  
  // 事件通过 CustomEvent 抛出
  this.dispatchEvent(new CustomEvent('task-action', { detail }));
}
```

**替代方案考虑**:
- **Lit**: 轻量级库（~5KB），提供装饰器和模板 - 暂不需要，原生 API 足够
- **Stencil**: 编译时方案 - 过于重量级，违反原则 VI

---

### 2. IndexedDB 封装模式

**决策**: 使用 Promise 封装 IndexedDB 异步 API，采用 Repository 模式

**Rationale**:
- IndexedDB 原生 API 基于回调，Promise 封装简化异步流程
- Repository 模式抽象存储细节，便于测试和替换
- 支持事务操作，保证数据一致性

**实现模式**:
```javascript
// Repository 模式
class TaskRepository {
  constructor(db) {
    this.db = db;
  }
  
  async create(task) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      const request = store.add(task);
      request.onsuccess = () => resolve(task);
      request.onerror = () => reject(request.error);
    });
  }
  
  async findAll() {
    // ...
  }
}
```

**替代方案考虑**:
- **idb**: 轻量级 Promise 封装库 - 可自行实现，避免依赖
- **localForage**: 多存储后端 - 过于重量级，功能过剩

---

### 3. UI 性能优化策略

**决策**: 批量 DOM 操作 + 事件委托 + 条件虚拟滚动

**Rationale**:
- 确保 UI 响应 <100ms（宪章原则 VII）
- 减少重排重绘次数
- 降低事件监听器数量

**实现模式**:

**批量 DOM 操作**:
```javascript
// 使用 DocumentFragment 批量插入
const fragment = document.createDocumentFragment();
tasks.forEach(task => {
  const el = document.createElement('task-item');
  el.task = task;
  fragment.appendChild(el);
});
listElement.appendChild(fragment); // 单次重排
```

**事件委托**:
```javascript
// 列表事件绑定到父容器
listElement.addEventListener('task-toggle', (e) => {
  const taskId = e.detail.id;
  // 处理切换逻辑
});
```

**虚拟滚动（条件启用）**:
```javascript
// 当任务数量 > 100 时启用
if (tasks.length > 100) {
  enableVirtualScroll();
}
```

**性能目标**:
- UI 响应时间：<100ms
- 列表渲染（100 任务）：<1s
- 内存占用：<50MB 基线

---

### 4. 测试策略

**决策**: 分层测试架构

**测试金字塔**:

```
        /\
       /  \      E2E Tests (可选)
      /----\
     /      \    Integration Tests
    /--------\
   /          \  Unit Tests
  /------------\
```

**单元测试**:
- **目标**: 组件逻辑、模型方法、工具函数
- **框架**: 原生 assert + 轻量级测试运行器
- **覆盖率目标**: ≥90% 行覆盖率，≥90% 分支覆盖率

**集成测试**:
- **目标**: 任务创建→存储→显示的完整流程
- **方法**: 模拟用户操作，验证端到端行为
- **示例**: 创建任务 → 验证 IndexedDB 存储 → 验证 UI 更新

**合同测试**:
- **目标**: 数据 Schema 验证、存储 API 接口
- **方法**: 验证输入输出符合合同定义
- **示例**: Task Schema 验证、Storage API 接口测试

**测试示例**:
```javascript
// 单元测试示例
test('Task validation rejects empty name', () => {
  const task = { name: '', priority: 'HIGH' };
  const result = validateTask(task);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.includes('Name is required'));
});

// 集成测试示例
test('Create task flow', async () => {
  // 1. 填写表单
  // 2. 提交创建
  // 3. 验证存储
  // 4. 验证 UI 更新
});
```

**测试工具选项**:
- **Web Test Runner**: 现代 Web 测试运行器，支持 ESM
- **Tape**: 极简测试库，符合原生原则
- **自研**: 基于原生 assert 实现简单测试运行器

---

## Browser Compatibility

### Web Components Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 54+ | Full support |
| Firefox | 63+ | Full support |
| Safari | 10.1+ | Full support |
| Edge | 79+ | Full support (Chromium) |

### IndexedDB Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 24+ | Full support |
| Firefox | 16+ | Full support |
| Safari | 8+ | Full support |
| Edge | 12+ | Full support |

**最低支持策略**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Performance Benchmarks

### Target Metrics (宪章原则 VII)

| Metric | Target | Measurement |
|--------|--------|-------------|
| UI Response Time | <100ms | Interaction to Next Paint (INP) |
| List Render (100 tasks) | <1s | Time to first paint |
| Memory Baseline | <50MB | Chrome DevTools Memory |
| Bundle Size (gzipped) | <100KB | Webpack Bundle Analyzer |

### Optimization Techniques

1. **Code Splitting**: 按需加载组件
2. **Lazy Loading**: 过滤组件条件渲染
3. **Debouncing**: 输入防抖（300ms）
4. **Request Idle Callback**: 非关键任务空闲执行

---

## Security Considerations

### XSS Prevention

- 所有用户输入必须转义后显示
- 使用 `textContent` 而非 `innerHTML`
- Content Security Policy (CSP) 头

### Data Validation

- 所有输入在存储前验证
- Schema 验证在边界层执行
- 错误信息不泄露内部实现

---

## References

- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Web Performance Best Practices](https://web.dev/performance/)
