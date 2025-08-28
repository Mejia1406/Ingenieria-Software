import { Router } from 'express';
import { body } from 'express-validator';
import { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    changePassword, 
    logout 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// nistration validation
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('userType')
        .optional()
        .isIn(['candidate', 'employee', 'recruiter'])
        .withMessage('User type must be candidate, employee, or recruiter')
];

// Login validation
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Update profile validation
const updateProfileValidation = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('professionalSummary')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Professional summary cannot exceed 1000 characters'),
    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array'),
    body('location.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City name cannot exceed 100 characters'),
    body('location.country')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Country name cannot exceed 100 characters')
];

// Change password validation
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Public routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, validateRequest, changePassword);
router.post('/logout', authenticate, logout);

export default router;