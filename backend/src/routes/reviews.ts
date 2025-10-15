import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createReview,
  getCompanyReviews,
  getMyReviews,
  deleteReview,
  voteReview,
  reportReview
} from '../controllers/reviewController';
import { respondToReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Crear review
router.post(
  '/',
  authenticate,
  [
    body('company').isMongoId().withMessage('Valid company ID is required'),
    body('reviewType').isIn(['interview', 'employee', 'intern', 'contractor']),
    body('jobTitle').isString().notEmpty().withMessage('Job title is required'),
    body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1–5'),
  ],
  validateRequest,
  createReview
);

// Obtener reviews de una empresa
router.get(
  '/company/:companyId',
  [param('companyId').isMongoId().withMessage('Invalid company ID')],
  validateRequest,
  getCompanyReviews
);

// Obtener mis reviews
router.get('/my-reviews', authenticate, getMyReviews);

// Eliminar review
router.delete(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid review ID')],
  validateRequest,
  deleteReview
);

// Votar utilidad (helpful / unhelpful)
router.post(
  '/:id/vote',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
    body('value').isIn(['helpful','unhelpful']).withMessage('Value must be helpful or unhelpful')
  ],
  validateRequest,
  voteReview
);

// Reportar review
router.post(
  '/:id/report',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
    body('reason').isIn(['spam','ofensivo','discriminacion','informacion_privada','engano','otro']).withMessage('Invalid reason'),
    body('details').optional().isLength({ max:1000 })
  ],
  validateRequest,
  reportReview
);

// Responder review (recruiter/admin)
router.post(
  '/:id/reply',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid review ID'),
    body('content').isString().trim().isLength({ min:5, max:2000 }).withMessage('Content 5-2000 chars')
  ],
  validateRequest,
  respondToReview
);

export default router;
