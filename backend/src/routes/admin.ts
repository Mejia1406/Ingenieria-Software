import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listReviewsAdmin, moderateReview, adminStats } from '../controllers/adminReviewController';
import { adminListCompanies, adminGetCompany, /* adminCreateCompany */ adminUpdateCompany, adminDeleteCompany } from '../controllers/adminCompanyController';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminStats);


router.get('/companies', adminListCompanies);
router.get('/companies/:id', [param('id').isMongoId()], validateRequest, adminGetCompany);

router.post('/companies', (req, res) => {
  return res.status(410).json({ success: false, message: 'Company creation disabled temporarily' });
});
router.put('/companies/:id', [
  param('id').isMongoId(),
  body('name').optional().isString().trim().isLength({ min:2, max:100 }),
  body('industry').optional().isString().trim().notEmpty(),
  body('size').optional().isIn(['1-10','11-50','51-200','201-500','501-1000','1000+']),
  body('headquarters.city').optional().isString().trim().notEmpty(),
  body('headquarters.country').optional().isString().trim().notEmpty(),
  body('description').optional().isLength({ max:2000 }),
  body('website').optional({ values: 'falsy' }).isURL().withMessage('website debe ser una URL válida (https://...)'),
  body('foundedYear').optional().isInt({ min:1800, max: new Date().getFullYear() }),
  body('contactInfo.email').optional().isEmail(),
  body('keywords').optional().isArray()
], validateRequest, adminUpdateCompany);
router.delete('/companies/:id', [param('id').isMongoId()], validateRequest, adminDeleteCompany);


router.get('/reviews', [
  query('status').optional().isIn(['pending','approved','rejected']),
  query('rating').optional().isInt({ min:1, max:5 }),
  query('page').optional().isInt({ min:1 }),
  query('limit').optional().isInt({ min:1, max:100 }),
  query('sortBy').optional().isIn(['createdAt','overallRating']),
  query('sortOrder').optional().isIn(['asc','desc'])
], validateRequest, listReviewsAdmin);


router.patch('/reviews/:id/moderate', [
  param('id').isMongoId(),
  body('status').isIn(['approved','rejected']),
  body('reason').optional().isLength({ max:500 })
], validateRequest, moderateReview);

export default router;
