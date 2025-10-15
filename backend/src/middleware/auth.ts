import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

interface JwtPayload {
    userId: string;
}

// Middleware to verify JWT token
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
    // Read Bearer token from Authorization header only
    const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();

    } catch (error: any) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error during authentication'
        });
    }
};

// Middleware to check if user is authenticated (optional auth)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return next(); // Continue without user
        }

        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'your-secret-key'
        ) as JwtPayload;

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
            req.user = user;
        }

        next();

    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};

// Middleware to authorize specific user types
export const authorize = (...userTypes: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        if (!userTypes.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required user type: ${userTypes.join(' or ')}`
            });
        }

        next();
    };
};

// Middleware to check if user owns the resource
export const checkOwnership = (resourceIdParam: string = 'id') => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // This is a generic check - specific controllers should implement their own ownership logic
            if (resourceId !== userId) {
                // For now, we'll let the controller handle the ownership check
                // since different models have different ownership patterns
            }

            next();

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error checking ownership'
            });
        }
    };
};