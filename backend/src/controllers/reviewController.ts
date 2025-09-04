import { Request, Response } from 'express';
import Review from '../models/Review';

// Crear review
export const createReview = async (req: Request, res: Response) => {
  try {
    
    const userId = (req as any).user?._id || null;

    const {
      company,
      reviewType,
      jobTitle,
      department,
      employmentStatus,
      overallRating,
      interviewDifficulty,
      processTransparency,
      reviewText,
      pros,
      cons,
      recommendToFriend,
      advice,
      location,
      salary
    } = req.body;

    const review = await Review.create({
      author: userId,
      company,
      reviewType,
      jobTitle,
      department,
      employmentStatus,
      overallRating: Number(overallRating),
      ratings: {
        workLifeBalance: Number(interviewDifficulty),
        compensation: Number(processTransparency),
        careerGrowth: Number(overallRating),
        management: Number(overallRating),
        culture: Number(overallRating)
      },
      title: `Experiencia como ${jobTitle}`,
      content: reviewText,
      pros,
      cons,
      recommendation: {
        wouldRecommend: Boolean(recommendToFriend),
        recommendToFriend: Boolean(recommendToFriend)
      }
    });

    res.status(201 ).json({
      success: true,
      data: review,
      message: 'Review creada correctamente'
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


// Obtener reviews de una empresa
export const getCompanyReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ company: req.params.companyId })
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Obtener mis reviews (necesita auth)
export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const reviews = await Review.find({ author: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Eliminar review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

