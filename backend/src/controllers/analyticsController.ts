import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

function parseRange(range?: string): { startDate: Date; rangeLabel: string } {
  const allowed = new Set(['7d','30d','90d','180d','365d']);
  const fallback = '30d';
  const use = (range && allowed.has(range)) ? range : fallback;
  const days = parseInt(use.replace('d',''), 10);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { startDate, rangeLabel: use };
}

function decideInterval(range: string, interval?: string): 'day' | 'week' | 'month' {
  if (interval && ['day','week','month'].includes(interval)) return interval as any;
  const days = parseInt(range.replace('d',''), 10);
  if (days <= 30) return 'day';
  if (days <= 90) return 'week';
  return 'month';
}

export const getRecruiterAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { companyId: companyIdQuery, range, interval } = req.query as { [key: string]: string };

    const { startDate, rangeLabel } = parseRange(range);
    const finalInterval = decideInterval(rangeLabel, interval);

    let companyId: string | undefined = companyIdQuery;
    const isAdmin = req.user.userType === 'admin';
    const isRecruiter = req.user.userType === 'recruiter';

    if (!isAdmin && isRecruiter) {
      if (!req.user.recruiterInfo || !req.user.recruiterInfo.companyId) {
        return res.status(400).json({ success: false, message: 'Reclutador no está asociado a una empresa aún' });
      }
      companyId = req.user.recruiterInfo.companyId.toString();
    }

    if (isAdmin && !companyId) {
      return res.status(400).json({ success: false, message: 'companyId es requerido para la consulta de analíticas de admin' });
    }

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'no se pudo resolver el companyId' });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'companyId no es válido' });
    }

    const match: any = {
      company: new mongoose.Types.ObjectId(companyId),
      moderationStatus: 'approved',
      isVisible: true,
      createdAt: { $gte: startDate }
    };

    let trendGroupId: any;
    if (finalInterval === 'day') {
      trendGroupId = {
        y: { $year: '$createdAt' },
        m: { $month: '$createdAt' },
        d: { $dayOfMonth: '$createdAt' }
      };
    } else if (finalInterval === 'week') {
      trendGroupId = {
        yw: { $isoWeekYear: '$createdAt' },
        w: { $isoWeek: '$createdAt' }
      };
    } else { // month
      trendGroupId = {
        y: { $year: '$createdAt' },
        m: { $month: '$createdAt' }
      };
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                avgRating: { $avg: '$overallRating' },
                reviewsWithResponse: { $sum: { $cond: [{ $ifNull: ['$recruiterResponse', false] }, 1, 0] } }
              }
            }
          ],
          distribution: [
            {
              $group: {
                _id: '$overallRating',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          trend: [
            {
              $group: {
                _id: trendGroupId,
                count: { $sum: 1 },
                avgRating: { $avg: '$overallRating' }
              }
            },
            { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1, '_id.yw': 1, '_id.w': 1 } }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                overallRating: 1,
                createdAt: 1,
                recruiterResponded: { $cond: [{ $ifNull: ['$recruiterResponse', false] }, true, false] }
              }
            }
          ]
        }
      }
    ];

    const aggResult = await Review.aggregate(pipeline);
    const data = aggResult[0] || {};

    const summaryRaw = (data.summary && data.summary[0]) || null;
    const totalReviews = summaryRaw ? summaryRaw.totalReviews : 0;
    const avgRating = summaryRaw && summaryRaw.avgRating ? Number(summaryRaw.avgRating.toFixed(2)) : null;
    const reviewsWithResponse = summaryRaw ? summaryRaw.reviewsWithResponse : 0;

    const distributionRaw: Array<{ _id: number; count: number }> = data.distribution || [];
    const ratingDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    distributionRaw.forEach(item => {
      if (item && item._id != null) {
        ratingDistribution[String(item._id)] = item.count;
      }
    });

    const trendRaw: Array<any> = data.trend || [];
    const trend = trendRaw.map(bucket => {
      const id = bucket._id || {};
      let label: string;
      if (finalInterval === 'day') {
        label = `${id.y}-${String(id.m).padStart(2,'0')}-${String(id.d).padStart(2,'0')}`;
      } else if (finalInterval === 'week') {
        label = `W${id.w}-${id.yw}`;
      } else { // month
        label = `${id.y}-${String(id.m).padStart(2,'0')}`;
      }
      return {
        date: label,
        count: bucket.count,
        avgRating: bucket.avgRating ? Number(bucket.avgRating.toFixed(2)) : null
      };
    });

    const recent = (data.recent || []).map((r: any) => ({
      id: r._id,
      overallRating: r.overallRating,
      createdAt: r.createdAt,
      recruiterResponded: r.recruiterResponded
    }));

    res.json({
      success: true,
      meta: {
        companyId,
        range: rangeLabel,
        interval: finalInterval,
        generatedAt: new Date().toISOString()
      },
      metrics: {
        totalReviews,
        avgRating,
        reviewsWithResponse,
        responseRate: totalReviews > 0 ? Number((reviewsWithResponse / totalReviews * 100).toFixed(2)) : 0,
        ratingDistribution,
        trend,
        recent
      }
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Error generando analíticas', error: err.message });
  }
};
