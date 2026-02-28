# 测试套件说明

本目录包含任务管理应用的所有测试用例，遵循 TDD（测试驱动开发）原则，确保代码质量和功能正确性。

## 📁 测试目录结构

```
tests/
├── contract/              # 合同测试
│   ├── task-schema.test.js    # Task 数据结构验证
│   └── storage-api.test.js    # Storage API 接口验证
├── integration/           # 集成测试
│   ├── task-flow.test.js      # 任务创建→存储→显示完整流程
│   ├── priority-filter.test.js # 优先级过滤功能
│   └── due-date-filter.test.js # 截止日期过滤功能
└── unit/                # 单元测试
    ├── components/        # 组件测试
    ├── models/           # 模型测试
    │   └── task.test.js      # Task 模型验证
    ├── storage/          # 存储层测试
    │   └── task-repository.test.js # TaskRepository CRUD 测试
    └── utils/            # 工具函数测试
        └── date-utils.test.js    # 日期工具函数测试
```

## 🧪 测试类型说明

### 1. 合同测试 (Contract Tests)

**位置**: `tests/contract/`

**目的**: 验证数据结构和 API 接口符合设计规范

**测试内容**:
- `task-schema.test.js`: Task 数据结构的验证规则
  - 验证 id、name、priority、dueDate、completed 等字段
  - 验证数据格式和边界条件
  - 验证错误处理

- `storage-api.test.js`: Storage API 接口规范
  - 验证 create、findAll、findById、update、delete 方法
  - 验证 findByPriority、findByDueDate 过滤方法
  - 验证错误类型和异常处理

### 2. 单元测试 (Unit Tests)

**位置**: `tests/unit/`

**目的**: 测试独立模块的功能正确性

**测试内容**:
- `models/task.test.js`: Task 模型测试
  - 验证 validateTask 函数
  - 验证 createTask 函数
  - 验证 updateTask 函数
  - 验证 Priority 枚举

- `storage/task-repository.test.js`: TaskRepository 测试
  - 测试 CRUD 操作
  - 测试 findByPriority 过滤
  - 测试 findByDueDate 过滤
  - 测试边界情况和错误处理

- `utils/date-utils.test.js`: 日期工具测试
  - 测试 formatDate、parseDate 函数
  - 测试 isToday、isPast、isUpcoming 函数
  - 测试 getRelativeDateLabel 函数

### 3. 集成测试 (Integration Tests)

**位置**: `tests/integration/`

**目的**: 测试多个模块协同工作的完整流程

**测试内容**:
- `task-flow.test.js`: 任务完整流程测试
  - 创建→存储→显示的完整流程
  - 多任务操作
  - 状态更新和持久化

- `priority-filter.test.js`: 优先级过滤测试
  - 按高/中/低优先级过滤
  - 过滤结果验证
  - 边界情况处理

- `due-date-filter.test.js`: 日期过滤测试
  - 今天到期、即将到期、已过期、无截止日期过滤
  - 日期计算逻辑验证
  - 组合过滤测试

## 🚀 运行测试

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

或

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve
```

### 运行特定测试文件

```bash
# 运行合同测试
npx web-test-runner "tests/contract/*.test.js" --node-resolve

# 运行单元测试
npx web-test-runner "tests/unit/**/*.test.js" --node-resolve

# 运行集成测试
npx web-test-runner "tests/integration/**/*.test.js" --node-resolve

# 运行单个测试文件
npx web-test-runner "tests/unit/models/task.test.js" --node-resolve
```

### 查看测试覆盖率

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve --coverage
```

覆盖率报告将生成在 `coverage/` 目录中。

## 📊 测试覆盖率目标

根据宪章原则 III 要求：
- **行覆盖率**: ≥90%
- **分支覆盖率**: ≥90%

## ✍️ 编写测试的最佳实践

### 1. 测试命名规范

```javascript
describe('Task Schema Contract', () => {
  describe('validateTask', () => {
    it('should accept valid task', () => {
      // ...
    });

    it('should reject task with empty name', () => {
      // ...
    });
  });
});
```

### 2. 使用 Arrange-Act-Assert 模式

```javascript
it('should create valid task with UUID', () => {
  // Arrange (准备)
  const taskData = {
    name: 'New Task',
    priority: Priority.HIGH
  };

  // Act (执行)
  const task = createTask(taskData);

  // Assert (断言)
  expect(task.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  expect(task.name).to.equal('New Task');
});
```

### 3. 测试边界情况

```javascript
it('should reject task with name too long', () => {
  const task = {
    id: 'test-id',
    name: 'A'.repeat(201),  // 超过 200 字符
    priority: Priority.HIGH,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const result = validateTask(task);
  expect(result.valid).to.be.false;
  expect(result.errors).to.contain('Name must be 1-200 characters');
});
```

### 4. 异步测试

```javascript
it('should create a new task', async () => {
  const task = createTask({
    name: 'Test Task',
    priority: Priority.HIGH
  });

  const created = await repository.create(task);
  expect(created.id).to.equal(task.id);
  expect(created.name).to.equal(task.name);
});
```

### 5. 测试前置和后置处理

```javascript
describe('TaskRepository', () => {
  let repository;

  beforeEach(async () => {
    // 每个测试前清空数据库
    repository = new TaskRepository();
    await clearDatabase();
  });

  afterAll(() => {
    // 所有测试后关闭连接
    closeDB();
  });
});
```

## 🔧 调试测试

### 在浏览器中运行测试

```bash
npx web-test-runner "tests/**/*.test.js" --node-resolve --open
```

### 添加调试日志

```javascript
it('should debug task creation', () => {
  console.log('Creating task...');
  const task = createTask({ name: 'Test', priority: 'HIGH' });
  console.log('Created task:', task);
  expect(task).to.exist;
});
```

## 📝 测试检查清单

在提交测试前，请确认：

- [ ] 测试文件命名正确（`.test.js` 后缀）
- [ ] 测试描述清晰说明测试意图
- [ ] 包含正常情况和异常情况测试
- [ ] 边界情况已覆盖
- [ ] 测试独立，不依赖其他测试
- [ ] 测试可重复运行，无副作用
- [ ] 使用了适当的断言
- [ ] 异步测试正确处理 Promise

## 🎯 测试覆盖的功能模块

| 模块 | 测试文件 | 覆盖率目标 |
|------|----------|------------|
| Task 模型 | `tests/unit/models/task.test.js` | ≥90% |
| TaskRepository | `tests/unit/storage/task-repository.test.js` | ≥90% |
| 日期工具 | `tests/unit/utils/date-utils.test.js` | ≥90% |
| 合同验证 | `tests/contract/*.test.js` | 100% |
| 任务流程 | `tests/integration/task-flow.test.js` | ≥90% |
| 优先级过滤 | `tests/integration/priority-filter.test.js` | ≥90% |
| 日期过滤 | `tests/integration/due-date-filter.test.js` | ≥90% |

## 📚 相关文档

- [Web Test Runner 文档](https://modern-web.dev/docs/test-runner/overview/)
- [Chai 断言库文档](https://www.chaijs.com/api/bdd/)
- [测试最佳实践](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Testing)
