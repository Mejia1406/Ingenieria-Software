import { Request, Response } from 'express';
import Company from '../models/Company';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

// Get all companies with pagination and search
export const getCompanies = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        
        const search = req.query.search as string || '';
        const industry = req.query.industry as string;
        const size = req.query.size as string;
        const location = req.query.location as string;
        const sortBy = req.query.sortBy as string || 'overallRating';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query
        let query: any = {};
        
        // Search in name and description
        if (search) {
            query.$text = { $search: search };
        }
        
        // Filter by industry
        if (industry) {
            query.industry = new RegExp(industry, 'i');
        }
        
        // Filter by company size
        if (size) {
            query.size = size;
        }
        
        // Filter by location
        if (location) {
            query.$or = [
                { 'headquarters.city': new RegExp(location, 'i') },
                { 'headquarters.country': new RegExp(location, 'i') }
            ];
        }

        // Get companies
        const companies = await Company.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .select('-keywords -metaDescription');

        // Get total count for pagination
        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            data: {
                companies,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las empresas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single company by slug with detailed info
export const getCompany = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const company = await Company.findOne({ slug });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company no encontrada'
            });
        }

        // Get recent reviews for this company
        const recentReviews = await Review.find({ 
            company: company._id, 
            moderationStatus: 'approved',
            isVisible: true 
        })
        .populate('author', 'firstName lastName userType isVerified')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title overallRating reviewType jobTitle createdAt recommendation');

        res.json({
            success: true,
            data: {
                company,
                recentReviews
            }
        });

    } catch (error: any) {
        console.error('Get company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la empresa',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create new company (for recruiters/admins)
export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const companyData = req.body;
        
        // Check if company already exists
        const existingCompany = await Company.findOne({ 
            name: new RegExp(`^${companyData.name}$`, 'i') 
        });
        
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company already exists with this name'
            });
        }

        // Create company
        const company = new Company({
            ...companyData,
            verifiedBy: req.user?._id,
            isVerified: req.user?.userType === 'recruiter' || req.user?.userType === 'admin'
        });

        await company.save();

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: { company }
        });

    } catch (error: any) {
        console.error('Create company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update company (only for verified recruiters of that company or admins)
export const updateCompany = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated via this endpoint
        delete updates.overallRating;
        delete updates.totalReviews;
        delete updates.ratings;
        delete updates._id;

        const company = await Company.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company updated successfully',
            data: { company }
        });

    } catch (error: any) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get company reviews
export const getCompanyReviews = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const reviewType = req.query.reviewType as string;
        const rating = req.query.rating as string;
        const sortBy = req.query.sortBy as string || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Find company
        const company = await Company.findOne({ slug });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Build query for reviews
        let reviewQuery: any = { 
            company: company._id, 
            moderationStatus: 'approved',
            isVisible: true 
        };

        if (reviewType) {
            reviewQuery.reviewType = reviewType;
        }

        if (rating) {
            reviewQuery.overallRating = parseInt(rating);
        }

        // Get reviews
        const reviews = await Review.find(reviewQuery)
            .populate('author', 'firstName lastName userType isVerified')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        // Get total count
        const total = await Review.countDocuments(reviewQuery);

        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Get company reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching company reviews',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Search companies with advanced filters
export const searchCompanies = async (req: Request, res: Response) => {
    try {
        const { q, filters } = req.body;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        let query: any = {};

        // Text search
        if (q) {
            query.$text = { $search: q };
        }

        // Apply filters
        if (filters) {
            if (filters.industries && filters.industries.length > 0) {
                query.industry = { $in: filters.industries };
            }

            if (filters.sizes && filters.sizes.length > 0) {
                query.size = { $in: filters.sizes };
            }

            if (filters.countries && filters.countries.length > 0) {
                query['headquarters.country'] = { $in: filters.countries };
            }

            if (filters.minRating) {
                query.overallRating = { $gte: filters.minRating };
            }

            if (filters.verified) {
                query.isVerified = true;
            }
        }

        const companies = await Company.find(query)
            .sort({ overallRating: -1, totalReviews: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Company.countDocuments(query);

        res.json({
            success: true,
            data: {
                companies,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        console.error('Search companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching companies',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

