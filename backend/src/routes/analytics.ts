import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getRecruiterAnalytics } from '../controllers/analyticsController';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();

// GET /api/analytics/recruiter?companyId=...&range=30d&interval=week
router.get('/recruiter',
  authenticate,
  // Allow recruiters and admins
  authorize('recruiter','admin'),
  [
    query('companyId').optional().isMongoId().withMessage('Invalid companyId'),
    query('range').optional().isIn(['7d','30d','90d','180d','365d']).withMessage('Invalid range'),
    query('interval').optional().isIn(['day','week','month']).withMessage('Invalid interval')
  ],
  validateRequest,
  getRecruiterAnalytics
);

export default router;
