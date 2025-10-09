import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

// GET /api/notifications
export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success:false, message:'Auth required' });

    const onlyUnread = (req.query.unread as string) === 'true';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const query: any = { user: userId };
    if (onlyUnread) query.readAt = { $exists: false };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('company', 'name slug')
      .populate('review', '_id');

    res.json({ success:true, data:{ notifications } });
  } catch (err:any) {
    console.error('listNotifications error', err);
    res.status(500).json({ success:false, message:'Error listing notifications' });
  }
};

// POST /api/notifications/:id/read
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success:false, message:'Auth required' });

    const notif = await Notification.findOne({ _id: id, user: userId });
    if (!notif) return res.status(404).json({ success:false, message:'Notification not found' });
    if (!notif.readAt) {
      notif.readAt = new Date();
      await notif.save();
    }
    res.json({ success:true, data:{ notification: notif } });
  } catch (err:any) {
    console.error('markNotificationRead error', err);
    res.status(500).json({ success:false, message:'Error marking notification as read' });
  }
};

// POST /api/notifications/mark-all-read
export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success:false, message:'Auth required' });

  const result = await Notification.updateMany({ user: userId, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
  // Mongoose 6/7 returns UpdateResult with matchedCount/modifiedCount
  const matched = (result as any).matchedCount ?? 0;
  const modified = (result as any).modifiedCount ?? 0;
  res.json({ success:true, data:{ matched, modified } });
  } catch (err:any) {
    console.error('markAllNotificationsRead error', err);
    res.status(500).json({ success:false, message:'Error marking all notifications as read' });
  }
};
