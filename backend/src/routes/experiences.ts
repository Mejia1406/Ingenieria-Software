import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
    getExperiences,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,
    toggleLike,
    getMyExperiences,
    searchExperiences
} from '../controllers/experienceController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Get all public experiences with filters
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('experienceType').optional().isIn(['recruitment_process', 'work_experience', 'interview_only', 'internship']),
    query('company').optional().isMongoId().withMessage('Invalid company ID'),
    query('location').optional().isString().trim(),
    query('skills').optional().isString(),
    query('sortBy').optional().isIn(['createdAt', 'likes', 'views', 'engagementScore']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
], validateRequest, getExperiences);

// Search experiences with advanced filters
router.post('/search', [
    body('q').optional().isString().trim(),
    body('filters.experienceTypes').optional().isArray(),
    body('filters.companies').optional().isArray(),
    body('filters.skills').optional().isArray(),
    body('filters.technologies').optional().isArray(),
    body('filters.locations').optional().isArray(),
    body('filters.remote').optional().isBoolean()
], validateRequest, searchExperiences);

// Get user's own experiences (requires authentication)
router.get('/my-experiences', authenticate, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, getMyExperiences);

// Get single experience by ID
router.get('/:id', [
    param('id').isMongoId().withMessage('Invalid experience ID')
], validateRequest, optionalAuth, getExperience);

// Create new experience (requires authentication)
router.post('/', authenticate, [
    body('company')
        .isMongoId()
        .withMessage('Valid company ID is required'),
    body('experienceType')
        .isIn(['recruitment_process', 'work_experience', 'interview_only', 'internship'])
        .withMessage('Invalid experience type'),
    body('title')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Title must be between 10 and 200 characters'),
    body('jobPosition')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Job position must be between 2 and 100 characters'),
    body('department')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Department cannot exceed 50 characters'),
    body('dateRange.startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('Start date cannot be in the future');
            }
            return true;
        }),
    body('dateRange.endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date')
        .custom((value, { req }) => {
            if (value && req.body.dateRange?.startDate) {
                if (new Date(value) <= new Date(req.body.dateRange.startDate)) {
                    throw new Error('End date must be after start date');
                }
            }
            return true;
        }),
    body('content.description')
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    body('content.challenges')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 challenges allowed'),
    body('content.achievements')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 achievements allowed'),
    body('content.learnings')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 learnings allowed'),
    body('skillsUsed')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Maximum 20 skills allowed'),
    body('technologies')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Maximum 20 technologies allowed'),
    body('location.isRemote')
        .optional()
        .isBoolean()
        .withMessage('Remote status must be boolean'),
    body('location.hybrid')
        .optional()
        .isBoolean()
        .withMessage('Hybrid status must be boolean'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('Public status must be boolean'),
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('Anonymous status must be boolean'),
    body('processDetails.feedbackQuality')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Feedback quality must be between 1 and 5')
], validateRequest, createExperience);

// Update experience (only by author)
router.put('/:id', authenticate, [
    param('id').isMongoId().withMessage('Invalid experience ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Title must be between 10 and 200 characters'),
    body('jobPosition')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Job position must be between 2 and 100 characters'),
    body('content.description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    body('skillsUsed')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Maximum 20 skills allowed'),
    body('technologies')
        .optional()
        .isArray({ max: 20 })
        .withMessage('Maximum 20 technologies allowed'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('Public status must be boolean'),
    body('isAnonymous')
        .optional()
        .isBoolean()
        .withMessage('Anonymous status must be boolean')
], validateRequest, updateExperience);

// Delete experience (only by author)
router.delete('/:id', authenticate, [
    param('id').isMongoId().withMessage('Invalid experience ID')
], validateRequest, deleteExperience);

// Like/Unlike experience
router.post('/:id/like', authenticate, [
    param('id').isMongoId().withMessage('Invalid experience ID'),
    body('action')
        .isIn(['like', 'unlike'])
        .withMessage('Action must be either like or unlike')
], validateRequest, toggleLike);

export default router;