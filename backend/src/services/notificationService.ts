import {
  createNotification,
  getTaskCounts,
} from './index';
import { sendNotification, broadcastCountsUpdate } from '../socket/index';

type NotificationType = 'task_reminder' | 'task_completed' | 'task_uncompleted' | 'task_created';

export class NotificationService {
  static async notifyTaskCreated(
    userId: string,
    task: { id: string; name: string }
  ): Promise<void> {
    try {
      const notification = await createNotification({
        userId,
        type: 'task_created',
        title: '新任务已创建',
        content: `任务「${task.name}」已成功创建`,
        taskId: task.id,
      });

      sendNotification(userId, notification);
      await this.updateTaskCounts(userId);
    } catch (error) {
      console.error('[NotificationService] Failed to send task created notification:', error);
    }
  }

  static async notifyTaskStatusChange(
    userId: string,
    task: { id: string; name: string },
    completed: boolean
  ): Promise<void> {
    try {
      const type: NotificationType = completed ? 'task_completed' : 'task_uncompleted';
      const title = completed ? '任务已完成' : '任务已取消完成';
      const content = `任务「${task.name}」${completed ? '已标记为完成' : '已取消完成状态'}`;

      const notification = await createNotification({
        userId,
        type,
        title,
        content,
        taskId: task.id,
      });

      sendNotification(userId, notification);
    } catch (error) {
      console.error('[NotificationService] Failed to send task status notification:', error);
    }
  }

  static async updateTaskCounts(userId: string): Promise<void> {
    try {
      const counts = await getTaskCounts(userId);
      broadcastCountsUpdate(userId, counts);
    } catch (error) {
      console.error('[NotificationService] Failed to update task counts:', error);
    }
  }

  static async handleTaskStatusChange(
    userId: string,
    task: { id: string; name: string },
    completed: boolean
  ): Promise<void> {
    await this.notifyTaskStatusChange(userId, task, completed);
    await this.updateTaskCounts(userId);
  }
}