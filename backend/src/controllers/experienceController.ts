import { Request, Response } from 'express';
import Experience from '../models/Experience';
import Company from '../models/Company';
import { AuthRequest } from '../middleware/auth';

// Get all experiences with pagination and filters
export const getExperiences = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const experienceType = req.query.experienceType as string;
        const company = req.query.company as string;
        const location = req.query.location as string;
        const skills = req.query.skills as string;
        const sortBy = req.query.sortBy as string || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query
        let query: any = { 
            moderationStatus: 'approved',
            isPublic: true 
        };

        if (experienceType) {
            query.experienceType = experienceType;
        }

        if (company) {
            query.company = company;
        }

        if (location) {
            query.$or = [
                { 'location.city': new RegExp(location, 'i') },
                { 'location.country': new RegExp(location, 'i') }
            ];
        }

        if (skills) {
            const skillsArray = skills.split(',').map(skill => skill.trim());
            query.skillsUsed = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
        }

        // Get experiences
        const experiences = await Experience.find(query)
            .populate('author', 'firstName lastName userType isVerified')
            .populate('company', 'name slug logo industry')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await Experience.countDocuments(query);

        res.json({
            success: true,
            data: {
                experiences,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Get experiences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching experiences',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Search experiences with advanced filters
export const searchExperiences = async (req: Request, res: Response) => {
    try {
        const { q, filters } = req.body;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        let query: any = {
            moderationStatus: 'approved',
            isPublic: true
        };

        // Text search
        if (q) {
            query.$text = { $search: q };
        }

        // Apply filters
        if (filters) {
            if (filters.experienceTypes && filters.experienceTypes.length > 0) {
                query.experienceType = { $in: filters.experienceTypes };
            }

            if (filters.companies && filters.companies.length > 0) {
                query.company = { $in: filters.companies };
            }

            if (filters.skills && filters.skills.length > 0) {
                query.skillsUsed = { $in: filters.skills.map((skill: string) => new RegExp(skill, 'i')) };
            }

            if (filters.technologies && filters.technologies.length > 0) {
                query.technologies = { $in: filters.technologies.map((tech: string) => new RegExp(tech, 'i')) };
            }

            if (filters.locations && filters.locations.length > 0) {
                query.$or = filters.locations.map((location: string) => ({
                    $or: [
                        { 'location.city': new RegExp(location, 'i') },
                        { 'location.country': new RegExp(location, 'i') }
                    ]
                }));
            }

            if (filters.remote !== undefined) {
                query['location.isRemote'] = filters.remote;
            }
        }

        const experiences = await Experience.find(query)
            .populate('author', 'firstName lastName userType isVerified')
            .populate('company', 'name slug logo industry')
            .sort({ engagementScore: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Experience.countDocuments(query);

        res.json({
            success: true,
            data: {
                experiences,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Search experiences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching experiences',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single experience by ID
export const getExperience = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const experience = await Experience.findById(id)
            .populate('author', 'firstName lastName userType isVerified profilePicture')
            .populate('company', 'name slug logo industry size headquarters');

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        // Check if experience is public or user has access
        if (!experience.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'This experience is private'
            });
        }

        // Increment view count
        await Experience.findByIdAndUpdate(id, { $inc: { views: 1 } });

        res.json({
            success: true,
            data: { experience }
        });

    } catch (error: any) {
        console.error('Get experience error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching experience',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create new experience
export const createExperience = async (req: AuthRequest, res: Response) => {
    try {
        const experienceData = req.body;
        const userId = req.user?._id;

        // Verify company exists
        const company = await Company.findById(experienceData.company);
        if (!company) {
            return res.status(400).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Create experience
        const experience = new Experience({
            ...experienceData,
            author: userId,
            moderationStatus: 'pending' // All experiences need moderation
        });

        await experience.save();

        // Populate the response
        const populatedExperience = await Experience.findById(experience._id)
            .populate('author', 'firstName lastName userType')
            .populate('company', 'name slug logo');

        res.status(201).json({
            success: true,
            message: 'Experience created successfully and is pending moderation',
            data: { experience: populatedExperience }
        });

    } catch (error: any) {
        console.error('Create experience error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating experience',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update experience (only by author)
export const updateExperience = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user?._id;

        // Find experience
        const experience = await Experience.findById(id);
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        // Check ownership
        if (experience.author.toString() !== userId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own experiences'
            });
        }

        // Remove fields that shouldn't be updated
        delete updates.author;
        delete updates.views;
        delete updates.likes;
        delete updates.shares;
        delete updates._id;

        // Update and set back to pending moderation if content changed
        if (updates.content || updates.title) {
            updates.moderationStatus = 'pending';
        }

        const updatedExperience = await Experience.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
        .populate('author', 'firstName lastName userType')
        .populate('company', 'name slug logo');

        res.json({
            success: true,
            message: 'Experience updated successfully',
            data: { experience: updatedExperience }
        });

    } catch (error: any) {
        console.error('Update experience error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating experience',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete experience (only by author)
export const deleteExperience = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        // Find experience
        const experience = await Experience.findById(id);
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        // Check ownership
        if (experience.author.toString() !== userId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own experiences'
            });
        }

        await Experience.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Experience deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete experience error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting experience',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Like/Unlike experience
export const toggleLike = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const experience = await Experience.findById(id);
        if (!experience) {
            return res.status(404).json({
                success: false,
                message: 'Experience not found'
            });
        }

        // For now, we'll just increment/decrement likes
        // In a more complex system, we'd track which users liked what
        const action = req.body.action; // 'like' or 'unlike'
        
        if (action === 'like') {
            await Experience.findByIdAndUpdate(id, { $inc: { likes: 1 } });
        } else if (action === 'unlike') {
            await Experience.findByIdAndUpdate(id, { $inc: { likes: -1 } });
        }

        const updatedExperience = await Experience.findById(id);

        res.json({
            success: true,
            message: `Experience ${action}d successfully`,
            data: { likes: updatedExperience?.likes }
        });

    } catch (error: any) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating like status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's own experiences
export const getMyExperiences = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const experiences = await Experience.find({ author: userId })
            .populate('company', 'name slug logo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Experience.countDocuments({ author: userId });

        res.json({
            success: true,
            data: {
                experiences,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Get my experiences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your experiences',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};