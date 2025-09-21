import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createReview,
  getCompanyReviews,
  getMyReviews,
  deleteReview
} from '../controllers/reviewController';
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

export default router;
