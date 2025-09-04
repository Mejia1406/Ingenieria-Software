import { Request, Response } from 'express';
import Review from '../models/Review';

// Crear review
export const createReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.create({
      ...req.body,
      author: (req as any).user?._id || null, // si usas auth
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err: any) {
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
