import { Request, Response } from 'express';
import {
  findNotificationsByUserId,
  getNotificationUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/index';

export const notificationController = {
  getNotifications: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ code: 401, data: null, message: '未授权' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await findNotificationsByUserId(userId, page, limit);

      res.json({
        code: 200,
        data: {
          list: result.list,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
        message: 'success',
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ code: 500, data: null, message: '获取通知列表失败' });
    }
  },

  getUnreadCount: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ code: 401, data: null, message: '未授权' });
        return;
      }

      const count = await getNotificationUnreadCount(userId);

      res.json({
        code: 200,
        data: { count },
        message: 'success',
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ code: 500, data: null, message: '获取未读数量失败' });
    }
  },

  markAsRead: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ code: 401, data: null, message: '未授权' });
        return;
      }

      const { id } = req.params;
      const success = await markNotificationAsRead(id, userId);

      if (!success) {
        res.status(404).json({ code: 404, data: null, message: '通知不存在或已读' });
        return;
      }

      res.json({ code: 200, data: null, message: '已标记已读' });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ code: 500, data: null, message: '标记已读失败' });
    }
  },

  markAllAsRead: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ code: 401, data: null, message: '未授权' });
        return;
      }

      const count = await markAllNotificationsAsRead(userId);

      res.json({
        code: 200,
        data: { count },
        message: `已标记 ${count} 条通知为已读`,
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ code: 500, data: null, message: '标记全部已读失败' });
    }
  },
};