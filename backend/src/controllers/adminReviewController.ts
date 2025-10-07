import { Request, Response } from 'express';
import Review from '../models/Review';
import Company from '../models/Company';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const listReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
    const companyId = req.query.company as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const query: any = {};
    if (status) query.moderationStatus = status;
    if (typeof rating === 'number') query.overallRating = rating;
    if (companyId) query.company = companyId;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('author', 'firstName lastName userType')
        .populate('company', 'name slug')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query)
    ]);

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
  } catch (error:any) {
    console.error('listReviewsAdmin error', error);
    res.status(500).json({ success:false, message:'Error listing reviews', error: process.env.NODE_ENV==='development'? error.message: undefined });
  }
};

export const moderateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body as { status: 'approved' | 'rejected'; reason?: string };

    if (!['approved','rejected'].includes(status)) {
      return res.status(400).json({ success:false, message:'Invalid status' });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success:false, message:'Review not found' });

    if (review.moderationStatus !== 'pending') {
      return res.status(409).json({ success:false, message:'Review already moderated' });
    }

    review.moderationStatus = status;
    review.moderatedAt = new Date();
    if (req.user?._id) {
      review.moderatedBy = req.user._id as any;
    }
    if (reason) review.moderationReason = reason;

    if (status === 'rejected') {
      review.isVisible = false;
    } else if (status === 'approved') {
      // Al aprobar se restablece visibilidad
      review.isVisible = true;
    }

    await review.save();

    // Opcional: marcar reportes pendientes sobre esta review como "dismissed" si fue aprobada
    if (status === 'approved') {
      try {
        const Report = (await import('../models/Report')).default;
        await Report.updateMany({ targetType: 'review', targetId: review._id, status: 'pending' }, { $set: { status: 'dismissed' } });
      } catch (innerErr) {
        console.error('No se pudieron actualizar reportes al aprobar review', innerErr);
      }
    }

    res.json({ success:true, message:'Review moderated', data: { review } });
  } catch (error:any) {
    console.error('moderateReview error', error);
    res.status(500).json({ success:false, message:'Error moderating review', error: process.env.NODE_ENV==='development'? error.message: undefined });
  }
};

export const adminStats = async (_req: Request, res: Response) => {
  try {
    const [pendingReviews, totalReviews, totalCompanies, totalUsers] = await Promise.all([
      Review.countDocuments({ moderationStatus: 'pending' }),
      Review.countDocuments({}),
      Company.countDocuments({}),
      User.countDocuments({}),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7*24*3600*1000);
    const newReviewsLast7d = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({ success:true, data:{ pendingReviews, totalReviews, totalCompanies, totalUsers, newReviewsLast7d } });
  } catch (error:any) {
    console.error('adminStats error', error);
    res.status(500).json({ success:false, message:'Error fetching admin stats' });
  }
};
