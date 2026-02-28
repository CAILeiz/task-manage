# Contract: Storage API

**Purpose**: Define IndexedDB storage interface for task persistence
**Version**: 1.0.0

## Interface Definition

```typescript
interface TaskStorage {
  // Initialize database connection
  init(): Promise<void>;
  
  // Create a new task
  create(task: Task): Promise<Task>;
  
  // Read all tasks
  findAll(): Promise<Task[]>;
  
  // Read task by ID
  findById(id: string): Promise<Task | null>;
  
  // Update existing task
  update(task: Task): Promise<Task>;
  
  // Delete task by ID
  delete(id: string): Promise<void>;
  
  // Find tasks by priority
  findByPriority(priority: Priority): Promise<Task[]>;
  
  // Find tasks by due date filter
  findByDueDate(filter: DueDateFilter): Promise<Task[]>;
  
  // Close database connection
  close(): void;
}

type DueDateFilter = "today" | "upcoming" | "overdue" | "none";
```

## Method Specifications

### init()

Initialize database connection and create object stores if needed.

**Returns**: `Promise<void>`

**Errors**:
- `DatabaseError`: If database cannot be opened

**Example**:
```javascript
const storage = new IndexedDBStorage();
await storage.init();
```

---

### create(task)

Create a new task in the database.

**Parameters**:
- `task` (Task): Task object to create

**Returns**: `Promise<Task>` - The created task

**Errors**:
- `ValidationError`: If task fails validation
- `DatabaseError`: If database operation fails

**Example**:
```javascript
const task = {
  id: "uuid-123",
  name: "Complete report",
  priority: "HIGH",
  dueDate: "2026-03-01",
  completed: false,
  createdAt: Date.now(),
  updatedAt: Date.now()
};
const created = await storage.create(task);
```

---

### findAll()

Retrieve all tasks from the database.

**Returns**: `Promise<Task[]>` - Array of all tasks

**Example**:
```javascript
const tasks = await storage.findAll();
```

---

### findById(id)

Retrieve a single task by its ID.

**Parameters**:
- `id` (string): Task UUID

**Returns**: `Promise<Task | null>` - Task if found, null otherwise

**Example**:
```javascript
const task = await storage.findById("uuid-123");
if (!task) {
  console.log("Task not found");
}
```

---

### update(task)

Update an existing task.

**Parameters**:
- `task` (Task): Task object with updated fields

**Returns**: `Promise<Task>` - The updated task

**Errors**:
- `NotFoundError`: If task with given ID doesn't exist
- `ValidationError`: If updated task fails validation
- `DatabaseError`: If database operation fails

**Example**:
```javascript
task.completed = true;
task.updatedAt = Date.now();
const updated = await storage.update(task);
```

---

### delete(id)

Delete a task by its ID.

**Parameters**:
- `id` (string): Task UUID

**Returns**: `Promise<void>`

**Errors**:
- `DatabaseError`: If database operation fails

**Example**:
```javascript
await storage.delete("uuid-123");
```

---

### findByPriority(priority)

Find all tasks with a specific priority.

**Parameters**:
- `priority` (Priority): Priority level to filter by

**Returns**: `Promise<Task[]>` - Array of matching tasks

**Example**:
```javascript
const highPriorityTasks = await storage.findByPriority("HIGH");
```

---

### findByDueDate(filter)

Find tasks by due date criteria.

**Parameters**:
- `filter` (DueDateFilter): Date filter criteria
  - `"today"`: Tasks due today
  - `"upcoming"`: Tasks due within next 7 days
  - `"overdue"`: Tasks past due date and not completed
  - `"none"`: Tasks without a due date

**Returns**: `Promise<Task[]>` - Array of matching tasks

**Example**:
```javascript
const overdueTasks = await storage.findByDueDate("overdue");
```

---

### close()

Close the database connection.

**Returns**: `void`

**Example**:
```javascript
storage.close();
```

## Error Types

```typescript
class StorageError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "StorageError";
  }
}

class ValidationError extends StorageError {
  constructor(message: string, errors?: string[]) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

class NotFoundError extends StorageError {
  constructor(resourceId: string) {
    super(`Resource not found: ${resourceId}`);
    this.name = "NotFoundError";
  }
}
```

## Implementation Notes

1. **Transaction Handling**: All write operations (create, update, delete) must use IndexedDB transactions
2. **Schema Versioning**: Database version should increment on schema changes
3. **Error Propagation**: All IndexedDB errors should be wrapped in StorageError
4. **Validation**: Task validation must occur before any write operation
