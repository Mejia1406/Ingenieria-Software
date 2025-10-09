import { Request, Response } from 'express';
import Review from '../models/Review';
import Company from '../models/Company';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const listReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending'; // ese es el estado en que esta la review (pendiente, aprobada, rechazada), siempre empieza como pending
    const page = parseInt(req.query.page as string) || 1; // pagina actual, si no viene en la query se pone 1 por defecto
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // limite de reviews por pagina, si no viene en la query se pone 20 por defecto, pero nunca puede ser mas de 100
    const skip = (page - 1) * limit; // se calcula el numero de reviews a saltar para la paginacion como en el codigo de adminCompanyController
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined; // se filtra por calificacion si viene en la query y si no viene se pone undefined
    const companyId = req.query.company as string | undefined; // se filtra por id de empresa si viene en la query y si no viene se pone undefined
    const sortBy = (req.query.sortBy as string) || 'createdAt'; // se ordena por la fecha de creacion
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1; // se ordena de forma mas nuevas a mas viejas

    const query: any = {}; // se crea un objeto vacio para ir agregando los filtros
    if (status) query.moderationStatus = status; // si viene el esstado se agrega al query o sea si es pending, approved o rejected va a estar en el query(o sea en la consulta a la base de datos)
    if (typeof rating === 'number') query.overallRating = rating; // si viene la calificacion se agrega al query
    if (companyId) query.company = companyId; // si viene el id de la empresa se agrega al query

    // todo este bloque que viene es para que el admin pueda ver todas las reviews, incluso las que no son visibles para los usuarios normales
    // porque las reviews que estan rechazadas o que fueron reportadas y estan en revision no son visibles para los usuarios normales
    // pero el admin tiene que poder verlas para poder moderarlas y decidir si las aprueba o las rechaza 
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('author', 'firstName lastName userType') // aca se usa populate para traer los datos del autor de la review (nombre, apellido y tipo de usuario)
        .populate('company', 'name slug') // lo mismo pero con la empresa (nombre y slug) el slug es el identificador unico en la URL
        .sort({ [sortBy]: sortOrder }) // se ordena por la fecha de creacion
        .skip(skip) // se saltan las reviews de las paginas anteriores
        .limit(limit), // se limita el numero de reviews por pagina
      Review.countDocuments(query) // se cuenta el total de reviews que cumplen con el query (filtros)
    ]);

    // ya despues todo se responde con un json que tiene las reviews y la informacion
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
