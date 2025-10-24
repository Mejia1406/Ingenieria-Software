import { Request, Response } from 'express';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import Report from '../models/Report';
import User from '../models/User';
import Company from '../models/Company';
import mongoose from 'mongoose';
import Notification from '../models/Notification';

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
      content,
      pros,
      cons,
      recommendToFriend,
      advice,
      location,
      salary
    } = req.body;
    

    // Fix the values that are causing problems
    const safeInterviewDifficulty = Number(interviewDifficulty) || Number(overallRating) || 3;
    const safeProcessTransparency = Number(processTransparency) || Number(overallRating) || 3;
    const safeOverallRating = Number(overallRating) || 3;
    const safeEmploymentStatus = employmentStatus === 'candidate' ? 'former' : employmentStatus;

    const review = await Review.create({
      author: userId,
      company,
      reviewType,
      jobTitle,
      department,
      employmentStatus: safeEmploymentStatus, // Use the safe value
      overallRating: safeOverallRating,
      ratings: {
        workLifeBalance: safeInterviewDifficulty,
        compensation: safeProcessTransparency,
        careerGrowth: safeOverallRating,
        management: safeOverallRating,
        culture: safeOverallRating
      },
      title: `Experiencia como ${jobTitle}`,
      content: req.body.content || reviewText || pros || "Sin contenido",
      pros,
      cons,
      recommendation: {
        wouldRecommend: Boolean(recommendToFriend),
        recommendToFriend: Boolean(recommendToFriend)
      }
    });

    // Recalcular promedio y cantidad de reseñas de la empresa
    if (company) {
      const approvedReviews = await Review.find({ company, moderationStatus: 'approved', isVisible: true });
      const totalReviews = approvedReviews.length;
      const overallRating = totalReviews > 0 ? (approvedReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / totalReviews) : 0;
      await Company.findByIdAndUpdate(company, {
        totalReviews,
        overallRating: Math.round(overallRating * 100) / 100 // redondear a 2 decimales
      });
    }

    res.status(201).json({
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
    const userId = (req as any).user?._id?.toString();
    const raw = await Review.find({ company: req.params.companyId, isVisible: true, moderationStatus: 'approved' })
      .populate('author', 'firstName lastName')
      .populate('recruiterResponse.responder', 'firstName lastName userType')
      .sort({ createdAt: -1 });

    const reviews = raw.map(r => {
      const helpfulVoters = (r as any).helpfulVoters?.map((v:any)=>v.toString()) || [];
      const unhelpfulVoters = (r as any).unhelpfulVoters?.map((v:any)=>v.toString()) || [];
      let userVote: 'helpful' | 'unhelpful' | null = null;
      if (userId) {
        if (helpfulVoters.includes(userId)) userVote = 'helpful';
        else if (unhelpfulVoters.includes(userId)) userVote = 'unhelpful';
      }
      return {
        ...r.toObject(),
        helpfulVotes: r.helpfulVotes || 0,
        unhelpfulVotes: (r as any).unhelpfulVotes || 0,
        totalVotes: r.totalVotes || 0,
        userVote
      };
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (err:any) {
    res.status(500).json({ success:false, error: err.message });
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

// Votar utilidad (Útil / No útil) - HU07
export const voteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body; // 'helpful' | 'unhelpful'
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success:false, message:'Authentication required' });
    }
    if (!['helpful','unhelpful'].includes(value)) {
      return res.status(400).json({ success:false, message:'Invalid value' });
    }

    const review = await Review.findById(id);
    if (!review || !review.isVisible) {
      return res.status(404).json({ success:false, message:'Review not found' });
    }

    const uid = userId.toString();
    const helpfulSet = new Set((review.helpfulVoters || []).map(v=>v.toString()));
    const unhelpfulSet = new Set((review.unhelpfulVoters || []).map(v=>v.toString()));

    const alreadyHelpful = helpfulSet.has(uid);
    const alreadyUnhelpful = unhelpfulSet.has(uid);

    // Idempotencia: si vuelve a enviar el mismo voto, no cambia nada
    if ((value === 'helpful' && alreadyHelpful) || (value === 'unhelpful' && alreadyUnhelpful)) {
      return res.json({
        success:true,
        message:'No change',
        data:{
          helpfulVotes: review.helpfulVotes,
          unhelpfulVotes: review.unhelpfulVotes,
          totalVotes: review.totalVotes,
          userVote: value
        }
      });
    }

    // Si cambia de un tipo a otro, ajustar conteos
    if (value === 'helpful') {
      if (alreadyUnhelpful) {
        // remover unhelpful
        review.unhelpfulVoters = review.unhelpfulVoters!.filter(v=>v.toString()!==uid) as any;
        review.unhelpfulVotes = Math.max(0, (review.unhelpfulVotes || 1) - 1);
        review.totalVotes = Math.max(0, (review.totalVotes || 1) - 1);
      }
      if (!alreadyHelpful) {
        (review.helpfulVoters as any).push(userId);
        review.helpfulVotes = (review.helpfulVotes || 0) + 1;
        review.totalVotes = (review.totalVotes || 0) + 1; // total suma solo votos positivos (o usa helpful+unhelpful, si prefieres cambia lógica)
      }
    } else { // unhelpful
      if (alreadyHelpful) {
        review.helpfulVoters = review.helpfulVoters!.filter(v=>v.toString()!==uid) as any;
        review.helpfulVotes = Math.max(0, (review.helpfulVotes || 1) - 1);
        review.totalVotes = Math.max(0, (review.totalVotes || 1) - 1);
      }
      if (!alreadyUnhelpful) {
        (review.unhelpfulVoters as any).push(userId);
        review.unhelpfulVotes = (review.unhelpfulVotes || 0) + 1;
        // Nota: si quieres que totalVotes represente todos los votos (útiles + no útiles) reemplaza el modelo del total.
      }
    }

    await review.save();

    res.json({
      success:true,
      message:'Vote registered',
      data:{
        helpfulVotes: review.helpfulVotes,
        unhelpfulVotes: review.unhelpfulVotes,
        totalVotes: review.totalVotes,
        userVote: value
      }
    });
  } catch (err:any) {
    console.error('voteReview error', err);
    res.status(500).json({ success:false, message:'Error voting review', error: process.env.NODE_ENV==='development'? err.message: undefined });
  }
};

// Crear reporte sobre una review (HU15)
export const reportReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success:false, message:'Auth required' });
    const { id } = req.params; // review id
    const { reason, details } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success:false, message:'Review not found' });

    // Crear reporte
    const report = await Report.create({
      reporter: userId,
      targetType: 'review',
      targetId: review._id,
      reason,
      details
    });

    // Ocultar inmediatamente hasta moderación
    review.isVisible = false;
    review.moderationStatus = 'pending';
    await review.save();

    res.status(201).json({ success:true, message:'Reporte creado y review ocultada', data:{ reportId: report._id } });
  } catch (err:any) {
    console.error('reportReview error', err);
    res.status(500).json({ success:false, message:'Error reporting review', error: process.env.NODE_ENV==='development'? err.message: undefined });
  }
};

// (Admin) listar reportes
export const listReports = async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success:true, data:{ reports } });
  } catch (err:any) {
    res.status(500).json({ success:false, message:'Error listing reports' });
  }
};

// (Admin) resolver reporte
export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // report id
    const { action, note } = req.body; // 'dismiss' | 'confirm'
    if (!['dismiss','confirm'].includes(action)) return res.status(400).json({ success:false, message:'Invalid action' });
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success:false, message:'Report not found' });
    if (report.status !== 'pending') return res.status(409).json({ success:false, message:'Report already resolved' });

    report.status = action === 'confirm' ? 'confirmed' : 'dismissed';
    report.moderator = req.user?._id as any;
    if (note) report.resolutionNote = note;
    await report.save();

    // Si se descarta y era review, volver a visible
    if (report.targetType === 'review' && action === 'dismiss') {
      await Review.findByIdAndUpdate(report.targetId, { isVisible: true });
    }

    res.json({ success:true, message:'Report resolved', data:{ report } });
  } catch (err:any) {
    res.status(500).json({ success:false, message:'Error resolving report' });
  }
};

// Responder a una review (reclutador/admin) - HU responder feedback
export const respondToReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // review id
    const { content } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ success:false, message:'Auth required' });
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success:false, message:'Content is required' });
    }

    // Solo reclutadores aprobados o admin
    if (!(user.userType === 'admin' || (user.userType === 'recruiter' && user.recruiterInfo?.status === 'approved'))) {
      return res.status(403).json({ success:false, message:'No autorizado para responder reviews' });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success:false, message:'Review not found' });
    if (!review.isVisible || review.moderationStatus !== 'approved') {
      return res.status(409).json({ success:false, message:'Review no visible o sin aprobar' });
    }

    // Validar que el reclutador pertenezca a la compañía de la review (si no es admin)
    if (user.userType !== 'admin') {
      const dbUser = await User.findById(user._id, 'recruiterInfo userType');
      if (!dbUser) return res.status(401).json({ success:false, message:'Usuario no encontrado' });

  let recruiterCompanyId = dbUser.recruiterInfo?.companyId as mongoose.Types.ObjectId | undefined;

      // Fallback: si no hay companyId, intentar asociar por nombre aproximado
      if (!recruiterCompanyId && dbUser.recruiterInfo?.companyName) {
        const nameRegex = new RegExp('^' + dbUser.recruiterInfo.companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
        const matchedCompany = await Company.findOne({ name: nameRegex });
        if (matchedCompany) {
          recruiterCompanyId = matchedCompany._id as mongoose.Types.ObjectId;
          // Guardar asociación para futuras validaciones (no bloquear si falla save)
          try {
            (dbUser.recruiterInfo as any).companyId = matchedCompany._id as mongoose.Types.ObjectId;
            await dbUser.save();
          } catch (e) {
            console.warn('No se pudo persistir companyId en recruiterInfo', e);
          }
        }
      }

      // Segunda capa: normalización más flexible (sin acentos, minúsculas, sin signos)
      const normalizeName = (str: string) => str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

      if (!recruiterCompanyId && dbUser.recruiterInfo?.companyName && review.company) {
        try {
          const companyDoc = await Company.findById(review.company).select('name');
          if (companyDoc) {
            const userNorm = normalizeName(dbUser.recruiterInfo.companyName);
            const reviewNorm = normalizeName(companyDoc.name);
            if (userNorm && reviewNorm && userNorm === reviewNorm) {
              recruiterCompanyId = companyDoc._id as mongoose.Types.ObjectId;
              try {
                (dbUser.recruiterInfo as any).companyId = companyDoc._id;
                await dbUser.save();
              } catch (e) {
                console.warn('Persistencia companyId (normalization) falló', e);
              }
            }
          }
        } catch (e) {
          console.warn('Error en normalización de nombre de empresa', e);
        }
      }

      if (!recruiterCompanyId || !review.company || review.company.toString() !== recruiterCompanyId.toString()) {
        let extra: any = undefined;
        if (process.env.NODE_ENV === 'development') {
          extra = {
            recruiterCompanyName: dbUser.recruiterInfo?.companyName,
            recruiterCompanyId: recruiterCompanyId?.toString(),
            reviewCompanyId: review.company?.toString()
          };
        }
        return res.status(403).json({ success:false, message:'Solo recruiters de la empresa pueden responder', ...(extra? { debug: extra }: {}) });
      }
    }

    const now = new Date();
    const responderId: any = (user as any)._id; // cast para evitar TS unknown
    if (!review.recruiterResponse) {
      (review as any).recruiterResponse = {
        responder: responderId,
        content: content.trim(),
        createdAt: now
      };
    } else {
      review.recruiterResponse.content = content.trim();
      review.recruiterResponse.updatedAt = now;
      // mantener responder original
    }
    await review.save();

    // Crear notificación para el autor de la review (si existe y no es el mismo que responde)
    const responderIdStr = responderId?.toString?.();
    if (review.author && responderIdStr && review.author.toString() !== responderIdStr) {
      try {
        await Notification.create({
          user: review.author,
            type: 'review_reply',
            review: review._id,
            company: review.company,
            message: 'Tu review recibió una respuesta del equipo de la empresa.'
        });
      } catch (notifyErr) {
        console.error('Error creando notificación review_reply', notifyErr);
      }
    }

    const populated = await Review.findById(review._id)
      .populate('recruiterResponse.responder', 'firstName lastName userType')
      .lean();

    res.json({ success:true, message:'Respuesta registrada', data: { review: populated } });
  } catch (err:any) {
    console.error('respondToReview error', err);
    res.status(500).json({ success:false, message:'Error respondiendo review', error: process.env.NODE_ENV==='development'? err.message: undefined });
  }
};

