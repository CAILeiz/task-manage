import { Request, Response } from 'express';
import { createTask, findTasksByUserId, findTaskById, updateTask, deleteTask } from '../services';
import { successResponse, errorResponse, paginationResponse } from '../utils/response';
import Task from '../models/Task';
import { Priority } from '../models/types';

export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const priority = req.query.priority as Priority | undefined;
    const completed = req.query.completed !== undefined
      ? req.query.completed === 'true'
      : undefined;
    const dueDateFilter = req.query.dueDateFilter as 'today' | 'upcoming' | 'overdue' | 'none' | undefined;

    const filter = {
      ...(priority && { priority }),
      ...(completed !== undefined && { completed }),
      ...(dueDateFilter && { dueDateFilter }),
    };

    const { tasks, total } = await findTasksByUserId(userId, filter, page, limit);
    res.json(paginationResponse(tasks, total, page, limit));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '获取任务列表失败', 500));
  }
}

export async function getTaskById(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { id } = req.params;
    const task = await findTaskById(id, userId);

    if (!task) {
      res.status(404).json(errorResponse('任务不存在', 404));
      return;
    }

    res.json(successResponse(task, '获取成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '获取任务失败', 500));
  }
}

export async function createTaskHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { name, description, priority, dueDate } = req.body;

    const validation = Task.validateCreateRequest({ name, description, priority, dueDate });
    if (!validation.valid) {
      res.status(400).json(errorResponse(validation.message!, 400));
      return;
    }

    const task = await createTask(userId, { name, description, priority, dueDate });
    res.status(201).json(successResponse(task, '任务创建成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '创建任务失败', 500));
  }
}

export async function updateTaskHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { id } = req.params;
    const { name, description, priority, dueDate, completed } = req.body;

    const validation = Task.validateUpdateRequest({ name, description, priority, dueDate, completed });
    if (!validation.valid) {
      res.status(400).json(errorResponse(validation.message!, 400));
      return;
    }

    const task = await updateTask(id, userId, { name, description, priority, dueDate, completed });
    if (!task) {
      res.status(404).json(errorResponse('任务不存在', 404));
      return;
    }

    res.json(successResponse(task, '任务更新成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '更新任务失败', 500));
  }
}

export async function deleteTaskHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(errorResponse('未授权', 401));
      return;
    }

    const { id } = req.params;
    const success = await deleteTask(id, userId);

    if (!success) {
      res.status(404).json(errorResponse('任务不存在', 404));
      return;
    }

    res.json(successResponse(null, '任务删除成功'));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message || '删除任务失败', 500));
  }
}

export default {
  getTasks,
  getTaskById,
  createTask: createTaskHandler,
  updateTask: updateTaskHandler,
  deleteTask: deleteTaskHandler,
};
