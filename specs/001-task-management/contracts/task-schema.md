# Contract: Task Schema

**Purpose**: Define and validate task data structure
**Version**: 1.0.0

## Schema Definition

```typescript
interface Task {
  id: string;           // UUID v4
  name: string;         // 1-200 characters
  priority: Priority;   // HIGH | MEDIUM | LOW
  dueDate: string | null;  // ISO 8601 date (YYYY-MM-DD)
  completed: boolean;   // false | true
  createdAt: number;    // Unix timestamp (ms)
  updatedAt: number;    // Unix timestamp (ms)
}

type Priority = "HIGH" | "MEDIUM" | "LOW";
```

## Validation Rules

### id
- **Type**: string
- **Format**: UUID v4
- **Pattern**: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
- **Required**: Yes
- **Immutable**: Yes

### name
- **Type**: string
- **Length**: 1-200 characters
- **Trim**: Leading/trailing whitespace removed
- **Required**: Yes

### priority
- **Type**: string (enum)
- **Allowed Values**: `"HIGH"`, `"MEDIUM"`, `"LOW"`
- **Case**: Uppercase only
- **Required**: Yes

### dueDate
- **Type**: string | null
- **Format**: ISO 8601 date (`YYYY-MM-DD`)
- **Pattern**: `^\d{4}-\d{2}-\d{2}$`
- **Required**: No (nullable)
- **Validation**: Must be a valid date if provided

### completed
- **Type**: boolean
- **Default**: `false`
- **Required**: Yes

### createdAt
- **Type**: number
- **Format**: Unix timestamp in milliseconds
- **Required**: Yes
- **Immutable**: Yes (set on creation)

### updatedAt
- **Type**: number
- **Format**: Unix timestamp in milliseconds
- **Required**: Yes
- **Mutable**: Yes (updated on each modification)

## Validation Function

```javascript
function validateTask(task) {
  const errors = [];
  
  // id validation
  if (!task.id || !isUUID(task.id)) {
    errors.push("Invalid or missing id");
  }
  
  // name validation
  if (!task.name || typeof task.name !== "string") {
    errors.push("Name is required");
  } else if (task.name.trim().length === 0 || task.name.length > 200) {
    errors.push("Name must be 1-200 characters");
  }
  
  // priority validation
  const validPriorities = ["HIGH", "MEDIUM", "LOW"];
  if (!validPriorities.includes(task.priority)) {
    errors.push("Priority must be HIGH, MEDIUM, or LOW");
  }
  
  // dueDate validation (if provided)
  if (task.dueDate !== null && !isValidISODate(task.dueDate)) {
    errors.push("dueDate must be ISO 8601 format (YYYY-MM-DD)");
  }
  
  // completed validation
  if (typeof task.completed !== "boolean") {
    errors.push("completed must be a boolean");
  }
  
  // timestamp validation
  if (typeof task.createdAt !== "number") {
    errors.push("createdAt must be a timestamp");
  }
  if (typeof task.updatedAt !== "number") {
    errors.push("updatedAt must be a timestamp");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

## Error Responses

```javascript
// Validation error response format
{
  valid: false,
  errors: [
    "Name is required",
    "Priority must be HIGH, MEDIUM, or LOW"
  ]
}
```
