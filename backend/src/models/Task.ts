import { ITask, ICreateTaskRequest, IUpdateTaskRequest, Priority } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 任务模型
 */
export class Task implements ITask {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<ITask>) {
    this.id = data.id || uuidv4();
    this.userId = data.userId || '';
    this.name = data.name || '';
    this.description = data.description || null;
    this.priority = data.priority || 'MEDIUM';
    this.dueDate = data.dueDate || null;
    this.completed = data.completed || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * 标记任务为完成
   */
  complete(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  /**
   * 标记任务为未完成
   */
  uncomplete(): void {
    this.completed = false;
    this.updatedAt = new Date();
  }

  /**
   * 检查任务是否过期
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.dueDate < today;
  }

  /**
   * 检查任务今天是否到期
   */
  isDueToday(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }

  isUpcoming(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 1;
  }

  /**
   * 从数据库行创建任务实例
   */
  static fromRow(row: any): Task {
    return new Task({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      priority: row.priority,
      dueDate: row.due_date ? new Date(row.due_date) : null,
      completed: row.completed === 1 || row.completed === true,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * 验证任务名称
   */
  static validateName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: '任务名称不能为空' };
    }
    if (name.trim().length > 200) {
      return { valid: false, message: '任务名称不能超过 200 个字符' };
    }
    return { valid: true };
  }

  /**
   * 验证描述
   */
  static validateDescription(description?: string): { valid: boolean; message?: string } {
    if (description && description.length > 100) {
      return { valid: false, message: '任务描述不能超过 100 个字符' };
    }
    return { valid: true };
  }

  /**
   * 验证优先级
   */
  static validatePriority(priority: string): { valid: boolean; message?: string } {
    const validPriorities: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
    if (!validPriorities.includes(priority as Priority)) {
      return { valid: false, message: '优先级必须是 HIGH、MEDIUM 或 LOW' };
    }
    return { valid: true };
  }

  /**
   * 验证截止日期
   */
  static validateDueDate(dueDate?: string): { valid: boolean; message?: string } {
    if (!dueDate) {
      return { valid: true };
    }
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) {
      return { valid: false, message: '截止日期格式不正确' };
    }
    return { valid: true };
  }

  /**
   * 验证创建任务请求
   */
  static validateCreateRequest(data: ICreateTaskRequest): { valid: boolean; message?: string } {
    const nameValidation = Task.validateName(data.name);
    if (!nameValidation.valid) {
      return nameValidation;
    }

    const descValidation = Task.validateDescription(data.description);
    if (!descValidation.valid) {
      return descValidation;
    }

    const priorityValidation = Task.validatePriority(data.priority);
    if (!priorityValidation.valid) {
      return priorityValidation;
    }

    const dueDateValidation = Task.validateDueDate(data.dueDate);
    if (!dueDateValidation.valid) {
      return dueDateValidation;
    }

    return { valid: true };
  }

  /**
   * 验证更新任务请求
   */
  static validateUpdateRequest(data: IUpdateTaskRequest): { valid: boolean; message?: string } {
    if (data.name !== undefined) {
      const nameValidation = Task.validateName(data.name);
      if (!nameValidation.valid) {
        return nameValidation;
      }
    }

    if (data.description !== undefined) {
      const descValidation = Task.validateDescription(data.description);
      if (!descValidation.valid) {
        return descValidation;
      }
    }

    if (data.priority !== undefined) {
      const priorityValidation = Task.validatePriority(data.priority);
      if (!priorityValidation.valid) {
        return priorityValidation;
      }
    }

    if (data.dueDate !== undefined) {
      const dueDateValidation = Task.validateDueDate(data.dueDate);
      if (!dueDateValidation.valid) {
        return dueDateValidation;
      }
    }

    return { valid: true };
  }
}

export default Task;
