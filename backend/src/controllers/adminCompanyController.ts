import { Request, Response } from 'express';
import Company from '../models/Company';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const adminListCompanies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const industry = req.query.industry as string;
    const verified = req.query.verified as string;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (industry) query.industry = industry;
    if (verified === 'true') query.isVerified = true;
    if (verified === 'false') query.isVerified = false;

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const companyIds = companies.map(c => c._id);
    let reviewStats: Record<string, { average: number; count: number }> = {};
    if (companyIds.length) {
      const agg = await Review.aggregate([
        { $match: { company: { $in: companyIds }, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } },
        { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } }
      ]);
      reviewStats = agg.reduce((acc: any, r: any) => {
        acc[r._id.toString()] = { average: r.average, count: r.count }; return acc;
      }, {});
    }

    const enriched = companies.map(c => {
      const stats = reviewStats[c._id.toString()] || { average: 0, count: 0 };
      return { ...c, overallRating: Number(stats.average?.toFixed?.(1) || 0), totalReviews: stats.count };
    });

    res.json({
      success: true,
      data: { companies: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error listing companies', error: err.message });
  }
};

export const adminGetCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid company id' });
    }
    const company = await Company.findById(id).lean();
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    const stat = await Review.aggregate([
      { $match: { company: company._id, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } },
      { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]);
    const average = stat[0]?.average || 0;
    const count = stat[0]?.count || 0;
    res.json({ success: true, data: { company: { ...company, overallRating: Number(average.toFixed(1)), totalReviews: count } } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching company', error: err.message });
  }
};

export const adminCreateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const existing = await Company.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company name already exists' });
    }
    const generatedSlug = data.name?.toLowerCase()?.trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (generatedSlug) {
      const slugExists = await Company.findOne({ slug: generatedSlug });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Another company already uses resulting slug (choose a more unique name)' });
      }
    }
    const company = new Company({
      ...data,
      verifiedBy: req.user?._id,
      isVerified: true
    });
    await company.save();
  res.status(201).json({ success: true, data: { company: { ...company.toObject(), overallRating: 0, totalReviews: 0 } } });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key (name or slug) already exists' });
    }
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e:any)=>({ field: e.path, message: e.message }));
      return res.status(400).json({ success:false, message:'Model validation failed', errors: details });
    }
    res.status(500).json({ success: false, message: 'Error creating company', error: err.message, errorDetail: err.stack });
  }
};

export const adminUpdateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.name) {
      const existing = await Company.findOne({ _id: { $ne: id }, name: new RegExp(`^${updates.name}$`, 'i') });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another company already uses this name' });
      }
      const futureSlug = updates.name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      const slugConflict = await Company.findOne({ _id: { $ne: id }, slug: futureSlug });
      if (slugConflict) {
        return res.status(400).json({ success: false, message: 'Another company already uses resulting slug (pick a different name)' });
      }
    }
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    Object.assign(company, updates);
    await company.save();
    const stat = await Review.aggregate([
      { $match: { company: company._id, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } },
      { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]);
    const average = stat[0]?.average || 0;
    const count = stat[0]?.count || 0;
    res.json({ success: true, data: { company: { ...company.toObject(), overallRating: Number(average.toFixed(1)), totalReviews: count } } });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key (name or slug) already exists' });
    }
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e:any)=>({ field: e.path, message: e.message }));
      return res.status(400).json({ success:false, message:'Model validation failed', errors: details });
    }
    res.status(500).json({ success: false, message: 'Error updating company', error: err.message, errorDetail: err.stack });
  }
};

export const adminDeleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting company', error: err.message });
  }
};
