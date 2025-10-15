import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  requestRecruiterRole,
  listRecruiterRequests,
  approveRecruiter,
  rejectRecruiter,
  getMyRecruiterRequest
} from '../controllers/recruiterController';

const router = Router();

// Usuario solicita rol recruiter
router.post('/request',
  authenticate,
  [
    body('companyName').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Invalid company name'),
    body('companyEmail').isEmail().withMessage('Valid corporate email required'),
    body('roleTitle').optional().isString().trim().isLength({ max: 100 }).withMessage('Role title too long')
  ],
  validateRequest,
  requestRecruiterRole
);

// Ver mi solicitud
router.get('/me/request', authenticate, getMyRecruiterRequest);

// Listar solicitudes (admin)
router.get('/requests',
  authenticate,
  authorize('admin'),
  [
    query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
  ],
  validateRequest,
  listRecruiterRequests
);

// Aprobar
router.post('/approve/:userId',
  authenticate,
  authorize('admin'),
  [param('userId').isMongoId().withMessage('Invalid userId')],
  validateRequest,
  approveRecruiter
);

// Rechazar
router.post('/reject/:userId',
  authenticate,
  authorize('admin'),
  [
    param('userId').isMongoId().withMessage('Invalid userId'),
    body('adminNote').optional().isString().trim().isLength({ max: 300 }).withMessage('Note too long')
  ],
  validateRequest,
  rejectRecruiter
);

export default router;
