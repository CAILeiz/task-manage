# Tasks: 任务管理核心功能

**Input**: Design documents from `/specs/001-task-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: 包含测试任务（宪章原则 III 要求：测试优先 + ≥90% 覆盖率）

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基础结构

- [X] T001 创建项目目录结构（src/components, src/storage, src/models, src/utils, tests/*）
- [X] T002 [P] 创建 index.html 主页面（包含基本 HTML 结构和样式）
- [X] T003 [P] 配置 Vite 开发服务器（package.json, vite.config.js）
- [X] T004 [P] 配置 ESLint 和代码格式化工具

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施 - 所有用户故事开始前必须完成

**⚠️ CRITICAL**: 在此阶段完成前不得开始任何用户故事实现

- [X] T005 [P] 创建 Task 模型类 src/models/task.js（数据结构、验证逻辑）
- [X] T006 [P] 创建 IndexedDB 初始化模块 src/storage/indexeddb.js（数据库连接、schema 创建）
- [X] T007 创建 TaskRepository 仓储类 src/storage/task-repository.js（CRUD 接口）
- [X] T008 [P] 创建日期工具函数 src/utils/date-utils.js（日期格式化、比较、过滤逻辑）
- [X] T009 [P] 创建 UUID 生成工具 src/utils/uuid.js

**Checkpoint**: 基础架构就绪 - 现在可以开始用户故事实现（可并行）

---

## Phase 3: User Story 1 - 创建和管理任务 (Priority: P1) 🎯 MVP

**Goal**: 用户可以创建任务、设置优先级和截止日期、标记完成状态

**Independent Test**: 用户可以创建任务、设置属性、标记完成，即使没有过滤功能也能完成基本的任务管理

### Tests for User Story 1 (TDD - 先写测试) ⚠️

> **NOTE**: 必须先编写这些测试并确保失败，然后实现

- [X] T010 [P] [US1] 合同测试：Task Schema 验证 tests/contract/task-schema.test.js
- [X] T011 [P] [US1] 合同测试：Storage API 接口 tests/contract/storage-api.test.js
- [X] T012 [P] [US1] 单元测试：Task 模型验证 tests/unit/models/task.test.js
- [X] T013 [P] [US1] 单元测试：TaskRepository CRUD 操作 tests/unit/storage/task-repository.test.js
- [X] T014 [US1] 集成测试：任务创建→存储→显示完整流程 tests/integration/task-flow.test.js

### Implementation for User Story 1

- [X] T015 [P] [US1] 创建 TaskForm Web Component src/components/task-form.js（表单输入、提交）
- [X] T016 [P] [US1] 创建 TaskItem Web Component src/components/task-item.js（单个任务展示、完成按钮）
- [X] T017 [US1] 创建 TaskList Web Component src/components/task-list.js（任务列表容器、渲染逻辑）
- [X] T018 [US1] 实现任务创建逻辑（连接 TaskForm → TaskRepository → TaskList）
- [X] T019 [US1] 实现优先级选择功能（高/中/低三级选择器）
- [X] T020 [US1] 实现截止日期选择功能（日期输入、ISO 格式存储）
- [X] T021 [US1] 实现完成状态切换功能（点击按钮切换 completed 状态）
- [X] T022 [US1] 实现任务列表显示（名称、优先级标识、截止日期、完成状态视觉反馈）
- [X] T023 [US1] 添加输入验证和错误处理（空名称验证、错误提示）
- [X] T024 [US1] 添加操作日志（console.log 或轻量级日志）

**Checkpoint**: 此时用户故事 1 应完全功能并可独立测试 - MVP 完成！

---

## Phase 4: User Story 2 - 按优先级过滤任务 (Priority: P2)

**Goal**: 用户可以根据优先级（高/中/低）过滤任务列表

**Independent Test**: 用户可以单独测试高优先级过滤，查看仅显示高优先级任务，与完整任务列表功能独立

### Tests for User Story 2 (TDD - 先写测试) ⚠️

- [X] T025 [P] [US2] 单元测试：优先级过滤逻辑 tests/unit/storage/task-repository.test.js（新增测试用例）
- [X] T026 [US2] 集成测试：优先级过滤完整流程 tests/integration/priority-filter.test.js

### Implementation for User Story 2

- [X] T027 [P] [US2] 创建 FilterBar Web Component src/components/filter-bar.js（过滤器 UI 容器）
- [X] T028 [P] [US2] 实现优先级选择器 UI（下拉菜单或按钮组）
- [X] T029 [US2] 实现优先级过滤逻辑（TaskRepository.findByPriority 集成）
- [X] T030 [US2] 实现过滤状态管理（当前激活的过滤器、清除过滤功能）
- [X] T031 [US2] 实现列表动态更新（过滤条件变化时重新渲染列表）
- [X] T032 [US2] 添加过滤视觉反馈（高亮当前激活的过滤器）

**Checkpoint**: 此时用户故事 1 和 2 都应独立功能并可测试

---

## Phase 5: User Story 3 - 按截止日期过滤任务 (Priority: P3)

**Goal**: 用户可以根据截止日期过滤任务（今天到期、即将到期、已过期、无截止日期）

**Independent Test**: 用户可以单独测试截止日期过滤功能，与优先级过滤和其他功能独立

### Tests for User Story 3 (TDD - 先写测试) ⚠️

- [X] T033 [P] [US3] 单元测试：日期过滤逻辑 tests/unit/utils/date-utils.test.js
- [X] T034 [P] [US3] 单元测试：TaskRepository 日期过滤 tests/unit/storage/task-repository.test.js（新增测试用例）
- [X] T035 [US3] 集成测试：截止日期过滤完整流程 tests/integration/due-date-filter.test.js

### Implementation for User Story 3

- [X] T036 [P] [US3] 实现截止日期选择器 UI（下拉菜单：今天到期、即将到期、已过期、无截止日期）
- [X] T037 [US3] 实现"今天到期"过滤逻辑（date-utils.js 比较当天日期）
- [X] T038 [US3] 实现"即将到期"过滤逻辑（未来 7 天内到期的任务）
- [X] T039 [US3] 实现"已过期"过滤逻辑（截止日期已过且未完成的任务）
- [X] T040 [US3] 实现"无截止日期"过滤逻辑（dueDate 为 null 的任务）
- [X] T041 [US3] 实现多过滤器组合支持（优先级 + 截止日期同时过滤）
- [X] T042 [US3] 添加过滤结果计数显示（显示"显示 X/Y 个任务"）

**Checkpoint**: 所有用户故事现在都应独立功能并可测试

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 改进和跨功能优化

- [X] T043 [P] 更新 README.md 项目说明和快速开始指南
- [ ] T044 [P] 代码清理和重构（移除重复代码、优化命名）
- [ ] T045 性能优化（批量 DOM 操作、事件委托、条件虚拟滚动）
- [ ] T046 [P] 补充单元测试确保覆盖率≥90%
- [ ] T047 [P] 添加错误边界处理（IndexedDB 失败、无效输入）
- [ ] T048 运行 quickstart.md 验证开发环境搭建流程
- [ ] T049 [P] 添加基础无障碍支持（ARIA 标签、键盘导航）
- [ ] T050 [P] 最终宪章合规性检查（原则 VI、VII、III、IV）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖 - 可立即开始
- **Phase 2 (Foundational)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **Phase 3+ (User Stories)**: 依赖 Foundational 完成
  - 用户故事可并行执行（如有多人力）
  - 或按优先级顺序执行（P1 → P2 → P3）
- **Phase 6 (Polish)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后可开始 - 独立于 US1
- **User Story 3 (P3)**: Foundational 完成后可开始 - 独立于 US1/US2

### Within Each User Story

- 测试（如包含）必须在实现前编写并确保失败
- 模型/工具 → 组件 → 集成逻辑
- 故事完成前不移动到下一优先级

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 可并行
- **Phase 2**: T005, T006, T008, T009 可并行
- **Phase 2 完成后**: 所有用户故事可并行（如多人力）
- **Within Stories**: 
  - US1: T010-T014 测试可并行，T015-T016 组件可并行
  - US2: T025 测试、T027-T028 组件可并行
  - US3: T033-T034 测试、T036 组件可并行

---

## Parallel Example: User Story 1

```bash
# 并行启动所有 US1 测试（TDD 流程）:
Task: "合同测试：Task Schema 验证 tests/contract/task-schema.test.js"
Task: "合同测试：Storage API 接口 tests/contract/storage-api.test.js"
Task: "单元测试：Task 模型验证 tests/unit/models/task.test.js"
Task: "单元测试：TaskRepository CRUD 操作 tests/unit/storage/task-repository.test.js"

# 并行启动所有 US1 组件:
Task: "创建 TaskForm Web Component src/components/task-form.js"
Task: "创建 TaskItem Web Component src/components/task-item.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational（CRITICAL - 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试用户故事 1
5. 部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础架构就绪
2. 添加用户故事 1 → 独立测试 → 部署/演示（MVP!）
3. 添加用户故事 2 → 独立测试 → 部署/演示
4. 添加用户故事 3 → 独立测试 → 部署/演示
5. 每个故事增加价值且不破坏之前的故事

### Parallel Team Strategy

多人协作时：

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A: 用户故事 1
   - 开发者 B: 用户故事 2
   - 开发者 C: 用户故事 3
3. 故事独立完成后集成

---

## Task Summary

| Phase | 任务数 | 说明 |
|-------|--------|------|
| Phase 1: Setup | 4 | 项目初始化 |
| Phase 2: Foundational | 5 | 核心基础设施 |
| Phase 3: US1 (MVP) | 15 | 创建和管理任务（含 5 个测试） |
| Phase 4: US2 | 8 | 按优先级过滤（含 2 个测试） |
| Phase 5: US3 | 10 | 按截止日期过滤（含 3 个测试） |
| Phase 6: Polish | 8 | 优化和收尾 |
| **Total** | **50** | 总计 50 个任务 |

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签映射任务到具体用户故事用于追踪
- 每个用户故事应可独立完成和测试
- TDD 流程：先写测试 → 确保失败 → 实现 → 测试通过
- 每个任务或逻辑组后提交代码
- 在任何检查点停止验证故事独立性
- 避免：模糊任务、同文件冲突、跨故事依赖破坏独立性
