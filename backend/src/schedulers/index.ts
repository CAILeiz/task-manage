import cron from 'node-cron';
import {
  findUpcomingTasks,
  createNotification,
} from '../services/index';
import { sendNotification } from '../socket/index';
import { setValue, getValue } from '../config/redis';

export function startTaskReminderScheduler(): void {
  console.log('[Scheduler] Starting task reminder scheduler...');

  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running scheduled task check...');
    await checkUpcomingTasks();
  });

  console.log('[Scheduler] Running initial check...');
  checkUpcomingTasks().catch((err) => {
    console.error('[Scheduler] Initial check failed:', err);
  });
}

async function checkUpcomingTasks(): Promise<void> {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await findUpcomingTasks(now, tomorrow);

    console.log(`[Scheduler] Found ${tasks.length} upcoming tasks`);

    for (const task of tasks) {
      try {
        const today = now.toISOString().split('T')[0];
        const reminderKey = `reminder:${today}:${task.id}`;

        const alreadyReminded = await getValue(reminderKey);
        if (alreadyReminded) {
          continue;
        }

        const dueDate = task.due_date;
        if (!dueDate) continue;

        const hoursLeft = Math.round((new Date(dueDate).getTime() - now.getTime()) / (60 * 60 * 1000));
        const minutesLeft = Math.round((new Date(dueDate).getTime() - now.getTime()) / (60 * 1000));

        let content: string;
        if (minutesLeft <= 60) {
          content = `任务「${task.name}」将在 ${minutesLeft} 分钟后到期`;
        } else {
          content = `任务「${task.name}」将在 ${hoursLeft} 小时后到期`;
        }

        const notification = await createNotification({
          userId: task.user_id,
          type: 'task_reminder',
          title: '任务到期提醒',
          content,
          taskId: task.id,
        });

        sendNotification(task.user_id, notification);

        await setValue(reminderKey, '1', 24 * 60 * 60);

        console.log(`[Scheduler] Sent reminder for task ${task.id} to user ${task.user_id}`);
      } catch (err) {
        console.error(`[Scheduler] Failed to process task ${task.id}:`, err);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error checking upcoming tasks:', error);
  }
}