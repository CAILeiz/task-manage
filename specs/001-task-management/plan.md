# Implementation Plan: 任务管理核心功能

**Branch**: `001-task-management` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-management/spec.md`

## Summary

构建任务管理应用的核心功能，支持任务创建、优先级管理、截止日期设置和完成状态标记。
技术选型：原生 JavaScript + Web Components 构建 UI，IndexedDB 持久化存储数据。
遵循宪章原则 VI（原生 Web API 优先）和 VII（性能优先<100ms）。

## Technical Context

**Language/Version**: JavaScript (ES2020+)
**Primary Dependencies**: 无（原生 Web API）
**Storage**: IndexedDB（浏览器内置数据库）
**Testing**: Web Test Runner 或原生测试框架
**Target Platform**: 现代 Web 浏览器（Chrome、Firefox、Safari、Edge）
**Project Type**: 单页 Web 应用（SPA）
**Performance Goals**: UI 响应 <100ms，列表加载 <1s（100 任务）
**Constraints**: 初始打包 <100KB gzipped，无第三方依赖
**Scale/Scope**: 本地存储，单用户使用，支持 1000+ 任务

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: 原生 Web API 优先（原则 VI）✅

- **决策**: 使用原生 JavaScript 和 Web Components
- **存储**: IndexedDB（原生浏览器 API）
- **无第三方框架**: 符合宪章要求
- **合规**: ✅ 通过

### Gate 2: 测试优先 + 90% 覆盖率（原则 III）✅

- **策略**: TDD 开发流程
- **工具**: 轻量级测试框架
- **目标**: 行覆盖率≥90%，分支覆盖率≥90%
- **合规**: ✅ 通过

### Gate 3: 性能优先 <100ms（原则 VII）✅

- **UI 响应**: 事件处理同步完成，DOM 操作批量执行
- **存储**: IndexedDB 异步操作，不阻塞 UI
- **测量**: INP 指标追踪，长任务日志
- **合规**: ✅ 通过

### Gate 4: 增量交付（原则 IV）✅

- **MVP**: 用户故事 1（创建和管理任务）
- **后续**: 用户故事 2-3（过滤功能）
- **合规**: ✅ 通过

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── task-schema.md
│   └── storage-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── task-list.js
│   ├── task-item.js
│   ├── task-form.js
│   └── filter-bar.js
├── storage/
│   ├── indexeddb.js
│   └── task-repository.js
├── models/
│   └── task.js
└── utils/
    └── date-utils.js

tests/
├── contract/
│   ├── task-schema.test.js
│   └── storage-api.test.js
├── integration/
│   └── task-flow.test.js
└── unit/
    ├── components/
    ├── storage/
    └── models/
```

**Structure Decision**: 单页 Web 应用结构，按功能模块组织：
- `components/`: Web Components UI 组件
- `storage/`: IndexedDB 封装层
- `models/`: 数据模型
- `utils/`: 工具函数
- `tests/`: 分层测试（单元、集成、合同）

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违宪行为，无需说明。

---

## Phase 0: Research & Technical Decisions

### Research Task 1: Web Components 最佳实践

**决策**: 使用原生 Custom Elements + Shadow DOM
- **Rationale**: 宪章原则 VI 要求，零依赖，浏览器原生支持
- **替代方案**: Lit（轻量级库）- 暂不需要，原生 API 足够

### Research Task 2: IndexedDB 封装模式

**决策**: 使用 Promise 封装 IndexedDB 异步 API
- **Rationale**: 简化异步操作，避免回调嵌套
- **模式**: Repository 模式，抽象存储细节

### Research Task 3: UI 性能优化策略

**决策**: 
- 批量 DOM 操作（DocumentFragment）
- 事件委托（列表事件绑定到父容器）
- 虚拟滚动（任务数量>100 时启用）
- **Rationale**: 确保<100ms UI 响应

### Research Task 4: 测试策略

**决策**: 
- 单元测试：组件逻辑、模型、工具函数
- 集成测试：任务创建→存储→显示的完整流程
- 合同测试：数据 Schema 验证、存储 API 接口
- **工具**: 原生 assert + 轻量级测试运行器

---

## Phase 1: Design & Contracts

### Data Model

详见：[data-model.md](./data-model.md)

**核心实体**:
- **Task**: id, name, priority, dueDate, completed, createdAt, updatedAt
- **Priority**: HIGH | MEDIUM | LOW（枚举）
- **Filter**: 优先级过滤、截止日期过滤

### API Contracts

详见：[contracts/](./contracts/)

1. **Task Schema**: 任务数据结构验证规则
2. **Storage API**: 存储层接口定义（CRUD 操作）

### Quick Start Guide

详见：[quickstart.md](./quickstart.md)

**开发环境搭建**:
1. 安装 Node.js（可选，仅用于开发工具）
2. 使用 Vite 启动开发服务器
3. 运行测试命令

### Agent Context Update

已运行 `.specify/scripts/bash/update-agent-context.sh qwen`
新技术栈已添加到 QWEN.md

---

## Phase 2: Constitution Re-Check

### Post-Design Verification

- [x] Gate 1: 原生 Web API 优先 - 设计使用 Web Components + IndexedDB，无第三方依赖
- [x] Gate 2: 测试策略 - 分层测试设计，支持 90% 覆盖率目标
- [x] Gate 3: 性能设计 - 批量 DOM、事件委托、异步存储
- [x] Gate 4: 增量交付 - MVP 范围明确，用户故事独立

**Result**: ✅ All gates passed

---

## Ready for Phase 2: Task Generation

运行 `/speckit.tasks` 生成实现任务列表。
