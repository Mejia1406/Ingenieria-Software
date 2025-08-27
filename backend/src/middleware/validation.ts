import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// Middleware to handle validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((error: ValidationError) => ({
            field: 'field' in error ? error.field : error.type,
            message: error.msg,
            value: 'value' in error ? error.value : undefined
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};

// Custom validation functions
export const customValidations = {
    // Validate if a string is a valid ObjectId
    isValidObjectId: (value: string) => {
        return /^[0-9a-fA-F]{24}$/.test(value);
    },

    // Validate if a URL is valid
    isValidUrl: (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validate if an array has unique values
    hasUniqueValues: (array: any[]) => {
        return array.length === new Set(array).size;
    },

    // Validate rating (1-5 scale)
    isValidRating: (rating: number) => {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    },

    // Validate phone number (basic pattern)
    isValidPhone: (phone: string) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    // Validate if a date is not in the future
    isNotFutureDate: (date: Date) => {
        return new Date(date) <= new Date();
    },

    // Validate if end date is after start date
    isEndDateAfterStartDate: (startDate: Date, endDate: Date) => {
        return new Date(endDate) > new Date(startDate);
    },

    // Validate if a string contains only allowed characters for slugs
    isValidSlug: (slug: string) => {
        return /^[a-z0-9-]+$/.test(slug);
    },

    // Validate if array length is within bounds
    isArrayLengthValid: (array: any[], min: number, max: number) => {
        return array.length >= min && array.length <= max;
    },

    // Validate if a string is a valid currency code
    isValidCurrency: (currency: string) => {
        const validCurrencies = ['USD', 'COP', 'EUR', 'GBP', 'CAD', 'MXN'];
        return validCurrencies.includes(currency.toUpperCase());
    },

    // Validate if a password meets strength requirements
    isStrongPassword: (password: string) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    },

    // Validate if a string is a valid company size
    isValidCompanySize: (size: string) => {
        const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
        return validSizes.includes(size);
    },

    // Validate if a string is a valid review type
    isValidReviewType: (type: string) => {
        const validTypes = ['interview', 'employee', 'intern', 'contractor'];
        return validTypes.includes(type);
    },

    // Validate if a string is a valid experience type
    isValidExperienceType: (type: string) => {
        const validTypes = ['recruitment_process', 'work_experience', 'interview_only', 'internship'];
        return validTypes.includes(type);
    },

    // Validate if a string is a valid user type
    isValidUserType: (type: string) => {
        const validTypes = ['candidate', 'employee', 'recruiter'];
        return validTypes.includes(type);
    },

    // Validate if a string is a valid employment status
    isValidEmploymentStatus: (status: string) => {
        const validStatuses = ['current', 'former'];
        return validStatuses.includes(status);
    },

    // Validate if a string is a valid interview outcome
    isValidInterviewOutcome: (outcome: string) => {
        const validOutcomes = ['hired', 'rejected', 'pending', 'declined'];
        return validOutcomes.includes(outcome);
    },

    // Validate if a string is a valid moderation status
    isValidModerationStatus: (status: string) => {
        const validStatuses = ['pending', 'approved', 'rejected'];
        return validStatuses.includes(status);
    }
};

// Sanitization functions
export const sanitizers = {
    // Remove HTML tags and scripts
    stripHtml: (text: string) => {
        return text.replace(/<[^>]*>/g, '');
    },

    // Normalize whitespace
    normalizeWhitespace: (text: string) => {
        return text.replace(/\s+/g, ' ').trim();
    },

    // Convert to lowercase and remove special characters for slugs
    createSlug: (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with single
    },

    // Capitalize first letter of each word
    capitalizeWords: (text: string) => {
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    // Format phone number
    formatPhone: (phone: string) => {
        return phone.replace(/[\s\-\(\)]/g, '');
    }
};