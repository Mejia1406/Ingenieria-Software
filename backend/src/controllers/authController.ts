import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe con este correo electrónico'
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // No permitir crear directamente recruiter
        const sanitizedUserType = (userType === 'recruiter') ? 'candidate' : (userType || 'candidate');

        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            userType: sanitizedUserType,
            location: location || { city: '', country: '' }
        });

        await user.save();

        const token = generateToken((user._id as any).toString());

        const userResponse = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            location: user.location,
            isVerified: user.isVerified,
            reputation: user.reputation,
            recruiterInfo: user.recruiterInfo,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User registrado correctamente',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando cuenta de usuario',
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
                message: 'Correo electrónico o contraseña inválidos'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Correo electrónico o contraseña inválidos'
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
            recruiterInfo: user.recruiterInfo,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error durante el login',
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
                message: 'Usuario no encontrado'
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
            message: 'Error al obtener el perfil del usuario',
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

        // Proteger recruiterInfo y userType en update profile
        delete (updates as any).recruiterInfo;
        delete (updates as any).userType;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: { user }
        });

    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el perfil',
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
                message: 'Usuario no encontrado'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
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
            message: 'Contraseña cambiada correctamente'
        });

    } catch (error: any) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar la contraseña',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout (client-side token removal, but we can track it server-side if needed)
export const logout = async (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logout exitoso'
    });
};