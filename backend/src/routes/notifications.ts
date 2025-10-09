import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController';

const router = Router();

// Listar notificaciones del usuario autenticado
router.get('/', authenticate, listNotifications);

// Marcar una notificación como leída
router.post(
  '/:id/read',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validateRequest,
  markNotificationRead
);

// Marcar todas como leídas
router.post('/mark-all-read', authenticate, markAllNotificationsRead);

export default router;
