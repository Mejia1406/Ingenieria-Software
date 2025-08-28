import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Register new user
export const register = async (req: Request, res: Response) => {
    try {
        const { 
            email, 
            password, 
            firstName, 
            lastName, 
            userType,
            location 
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            userType: userType || 'candidate',
            location: location || { city: '', country: '' }
        });

        await user.save();

        // Generate token
        const token = generateToken((user._id as any).toString());

        // Remove password from response
        const userResponse = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            location: user.location,
            isVerified: user.isVerified,
            reputation: user.reputation,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken((user._id as any).toString());

        // Remove password from response
        const userResponse = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            location: user.location,
            isVerified: user.isVerified,
            reputation: user.reputation,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const updates = req.body;

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.isVerified;
        delete updates.reputation;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        // Get user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout (client-side token removal, but we can track it server-side if needed)
export const logout = async (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};