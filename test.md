# 测试使用指南

本文档介绍如何运行、编写和调试任务管理应用的测试用例。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

这将安装：
- **Vite** - 开发构建工具
- **@web/test-runner** - 测试运行器
- **Chai** - 断言库

### 运行所有测试

```bash
npm test
```

或

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve
```

## 📋 测试命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npx web-test-runner "tests/**/*.test.js" --node-resolve` | 运行所有测试（详细） |
| `npx web-test-runner "tests/unit/**/*.test.js" --node-resolve` | 只运行单元测试 |
| `npx web-test-runner "tests/integration/**/*.test.js" --node-resolve` | 只运行集成测试 |
| `npx web-test-runner "tests/contract/**/*.test.js" --node-resolve` | 只运行合同测试 |
| `npx web-test-runner "tests/unit/models/task.test.js" --node-resolve` | 运行单个测试文件 |

## 📁 测试文件结构

```
tests/
├── contract/              # 合同测试
│   ├── task-schema.test.js    # Task 数据结构验证
│   └── storage-api.test.js    # Storage API 接口验证
├── integration/           # 集成测试
│   ├── task-flow.test.js      # 任务完整流程测试
│   ├── priority-filter.test.js # 优先级过滤测试
│   └── due-date-filter.test.js # 日期过滤测试
└── unit/                # 单元测试
    ├── models/
    │   └── task.test.js      # Task 模型测试
    ├── storage/
    │   └── task-repository.test.js # Repository 测试
    └── utils/
        └── date-utils.test.js    # 日期工具测试
```

## 🧪 测试类型

### 1. 单元测试 (Unit Tests)

测试独立的函数、类或模块。

**示例**: `tests/unit/models/task.test.js`

```javascript
import { expect } from 'chai';
import { validateTask, createTask, Priority } from '../../../src/models/task.js';

describe('Task Model', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      const task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Task',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
      expect(result.errors).to.eql([]);
    });

    it('should reject task with empty name', () => {
      const task = {
        id: 'test-id',
        name: '',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('Name must be 1-200 characters');
    });
  });
});
```

### 2. 集成测试 (Integration Tests)

测试多个模块协同工作的完整流程。

**示例**: `tests/integration/task-flow.test.js`

```javascript
import { expect } from 'chai';
import { TaskRepository } from '../../src/storage/task-repository.js';
import { createTask, Priority } from '../../src/models/task.js';
import { getDB, closeDB } from '../../src/storage/indexeddb.js';

describe('Task Flow Integration', () => {
  let repository;

  beforeEach(async () => {
    repository = new TaskRepository();
    // 清空数据库
    const db = await getDB();
    await db.transaction('tasks', 'readwrite')
      .objectStore('tasks')
      .clear();
  });

  afterAll(() => {
    closeDB();
  });

  it('should create → store → display task', async () => {
    // 1. 创建任务
    const task = createTask({
      name: 'Test Task',
      priority: Priority.HIGH
    });

    // 2. 存储任务
    await repository.create(task);

    // 3. 验证存储
    const stored = await repository.findById(task.id);
    expect(stored).to.exist;
    expect(stored.name).to.equal('Test Task');

    // 4. 验证列表
    const allTasks = await repository.findAll();
    expect(allTasks.length).to.equal(1);
  });
});
```

### 3. 合同测试 (Contract Tests)

验证数据结构和 API 接口符合设计规范。

**示例**: `tests/contract/task-schema.test.js`

```javascript
import { expect } from 'chai';
import { validateTask, createTask, Priority } from '../../src/models/task.js';

describe('Task Schema Contract', () => {
  it('should have required fields', () => {
    const task = createTask({
      name: 'Test',
      priority: Priority.HIGH
    });

    // 验证所有必需字段存在
    expect(task).to.have.property('id');
    expect(task).to.have.property('name');
    expect(task).to.have.property('priority');
    expect(task).to.have.property('dueDate');
    expect(task).to.have.property('completed');
    expect(task).to.have.property('createdAt');
    expect(task).to.have.property('updatedAt');
  });

  it('should validate UUID format', () => {
    const task = createTask({
      name: 'Test',
      priority: Priority.HIGH
    });

    expect(task.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});
```

## ✍️ 编写测试的最佳实践

### 1. 测试命名

使用描述性的测试名称，说明测试的场景和预期结果：

```javascript
// ❌ 不好的命名
it('should work', () => {});

// ✅ 好的命名
it('should reject task with empty name', () => {});
it('should create task with UUID when name is valid', () => {});
```

### 2. Arrange-Act-Assert 模式

```javascript
it('should create valid task', () => {
  // Arrange (准备数据)
  const taskData = {
    name: 'New Task',
    priority: Priority.HIGH,
    description: 'Test description'
  };

  // Act (执行操作)
  const task = createTask(taskData);

  // Assert (验证结果)
  expect(task.name).to.equal('New Task');
  expect(task.priority).to.equal(Priority.HIGH);
  expect(task.description).to.equal('Test description');
});
```

### 3. 测试边界情况

```javascript
describe('name validation', () => {
  it('should accept name with 1 character', () => {
    const task = createTask({ name: 'A', priority: Priority.HIGH });
    expect(task.name).to.equal('A');
  });

  it('should accept name with 200 characters', () => {
    const longName = 'A'.repeat(200);
    const task = createTask({ name: longName, priority: Priority.HIGH });
    expect(task.name.length).to.equal(200);
  });

  it('should reject name with 201 characters', () => {
    const tooLongName = 'A'.repeat(201);
    expect(() => {
      createTask({ name: tooLongName, priority: Priority.HIGH });
    }).to.throw();
  });
});
```

### 4. 异步测试

```javascript
it('should save task to database', async () => {
  const task = createTask({ name: 'Test', priority: Priority.HIGH });
  
  await repository.create(task);
  
  const saved = await repository.findById(task.id);
  expect(saved).to.exist;
  expect(saved.name).to.equal(task.name);
});
```

### 5. 前置和后置处理

```javascript
describe('TaskRepository', () => {
  let repository;

  // 每个测试前执行
  beforeEach(async () => {
    repository = new TaskRepository();
    await clearDatabase();
  });

  // 所有测试后执行
  afterAll(() => {
    closeDB();
  });
});
```

## 🔧 调试测试

### 在浏览器中运行

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve --open
```

这将在浏览器中打开测试页面，方便查看详细信息。

### 添加日志输出

```javascript
it('should debug task creation', () => {
  console.log('Creating task...');
  const task = createTask({ name: 'Test', priority: 'HIGH' });
  console.log('Created task:', task);
  expect(task).to.exist;
});
```

### 测试单个用例

```bash
# 运行特定测试文件
npx web-test-runner "tests/unit/models/task.test.js" --node-resolve

# 使用 --watch 模式自动重新运行
npx web-test-runner "tests/**/*.test.js" --node-resolve --watch
```

## 📊 测试覆盖率

### 运行覆盖率检查

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve --coverage
```

覆盖率报告将生成在 `coverage/` 目录中。

### 查看覆盖率报告

```bash
# 在浏览器中打开覆盖率报告
open coverage/index.html
```

### 覆盖率目标

根据宪章原则 III 要求：
- **行覆盖率**: ≥90%
- **分支覆盖率**: ≥90%

## 🐛 常见错误和解决方案

### 1. `expect is not defined`

**原因**: 未导入 Chai 的 expect

**解决**:
```javascript
import { expect } from 'chai';
```

### 2. `describe is not defined`

**原因**: 测试框架未正确配置

**解决**: 确保 `web-test-runner.config.mjs` 配置正确：
```javascript
export default {
  nodeResolve: true,
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '10000'
    }
  }
};
```

### 3. 异步测试失败

**原因**: 未等待 Promise

**解决**:
```javascript
// ❌ 错误
it('should save task', () => {
  repository.create(task);
  // 未等待
});

// ✅ 正确
it('should save task', async () => {
  await repository.create(task);
});
```

### 4. Shadow DOM 元素找不到

**原因**: 尝试从 light DOM 查询 shadow DOM 内的元素

**解决**:
```javascript
// ❌ 错误
const el = document.querySelector('task-item');
const button = el.querySelector('.toggle-complete');

// ✅ 正确
const el = document.querySelector('task-item');
const button = el.shadowRoot.querySelector('.toggle-complete');
```

## 📚 测试检查清单

提交测试前确认：

- [ ] 测试文件以 `.test.js` 结尾
- [ ] 测试描述清晰说明测试意图
- [ ] 包含正常和异常情况测试
- [ ] 边界情况已覆盖
- [ ] 测试独立，不依赖其他测试
- [ ] 使用了适当的断言（Chai）
- [ ] 异步测试正确使用 async/await
- [ ] 测试可重复运行，无副作用
- [ ] 清理了测试数据（数据库、DOM 等）

## 🎯 示例：完整测试文件

```javascript
/**
 * Task Model Unit Tests
 *
 * 测试 Task 模型的验证和创建逻辑
 */

import { expect } from 'chai';
import { validateTask, createTask, Priority } from '../../src/models/task.js';

describe('Task Model', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      const task = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Task',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.true;
      expect(result.errors).to.eql([]);
    });

    it('should reject task with empty name', () => {
      const task = {
        id: 'test-id',
        name: '',
        priority: Priority.HIGH,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const result = validateTask(task);
      expect(result.valid).to.be.false;
      expect(result.errors).to.include('Name must be 1-200 characters');
    });
  });

  describe('createTask', () => {
    it('should create task with UUID', () => {
      const task = createTask({
        name: 'New Task',
        priority: Priority.HIGH
      });

      expect(task.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(task.name).to.equal('New Task');
      expect(task.priority).to.equal(Priority.HIGH);
      expect(task.completed).to.be.false;
    });

    it('should trim task name', () => {
      const task = createTask({
        name: '  Trimmed Task  ',
        priority: Priority.MEDIUM
      });

      expect(task.name).to.equal('Trimmed Task');
    });
  });
});
```

## 📖 相关文档

- [tests/README.md](./tests/README.md) - 测试套件详细说明
- [webcomponent.md](./webcomponent.md) - Web Components 使用指南
- [Web Test Runner 文档](https://modern-web.dev/docs/test-runner/overview/)
- [Chai 断言库文档](https://www.chaijs.com/api/bdd/)

## 🆘 获取帮助

如有问题，请：
1. 查看本文档的"常见错误"部分
2. 查看测试文件的注释
3. 在浏览器中运行测试查看详细错误
4. 添加 `console.log` 调试输出
