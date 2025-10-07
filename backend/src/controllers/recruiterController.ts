import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Company from '../models/Company';
import mongoose from 'mongoose';

/**
 * POST /api/recruiters/request
 * Un usuario existente solicita rol de recruiter.
 */
export const requestRecruiterRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { companyName, companyEmail, roleTitle } = req.body;

    if (req.user.userType === 'recruiter') {
      return res.status(400).json({ success: false, message: 'Already a recruiter' });
    }

    if (req.user.userType === 'admin') {
      return res.status(400).json({ success: false, message: 'Admins no necesitan solicitar rol recruiter' });
    }

    const domain = (companyEmail || '').split('@')[1];
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Invalid corporate email' });
    }

    // (Opcional futuro: validar MX del dominio)

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.recruiterInfo = {
      companyName,
      companyEmail: companyEmail.toLowerCase(),
      roleTitle,
      status: 'pending',
      requestedAt: new Date()
    } as any;

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Recruiter request submitted. An admin will review it.',
      data: { recruiterInfo: user.recruiterInfo }
    });
  } catch (error: any) {
    console.error('requestRecruiterRole error', error);
    res.status(500).json({ success: false, message: 'Error submitting recruiter request' });
  }
};

/**
 * GET /api/recruiters/requests?status=pending
 * Lista de solicitudes (admin)
 */
export const listRecruiterRequests = async (req: AuthRequest, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const allowed = ['pending', 'approved', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status filter' });
    }

    const requests = await User.find({ 'recruiterInfo.status': status }, 'firstName lastName email userType recruiterInfo').sort({ 'recruiterInfo.requestedAt': -1 });

    res.json({ success: true, data: { requests } });
  } catch (error) {
    console.error('listRecruiterRequests error', error);
    res.status(500).json({ success: false, message: 'Error fetching recruiter requests' });
  }
};

/**
 * POST /api/recruiters/approve/:userId
 * Aprueba solicitud (admin) y convierte userType a recruiter.
 */
export const approveRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user || !user.recruiterInfo || user.recruiterInfo.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending recruiter request not found' });
    }

    user.userType = 'recruiter';
    user.recruiterInfo.status = 'approved';
    user.recruiterInfo.approvedAt = new Date();

    // Intentar asociar a una Company existente por nombre
    const company = await Company.findOne({ name: new RegExp(`^${user.recruiterInfo.companyName}$`, 'i') });
    if (company) {
      (user.recruiterInfo as any).companyId = company._id;
    }

    await user.save();

    res.json({ success: true, message: 'Recruiter approved', data: { userId: user._id, recruiterInfo: user.recruiterInfo } });
  } catch (error) {
    console.error('approveRecruiter error', error);
    res.status(500).json({ success: false, message: 'Error approving recruiter request' });
  }
};

/**
 * POST /api/recruiters/reject/:userId
 * Rechaza solicitud (admin)
 */
export const rejectRecruiter = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { adminNote } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user || !user.recruiterInfo || user.recruiterInfo.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Pending recruiter request not found' });
    }

    user.recruiterInfo.status = 'rejected';
    user.recruiterInfo.rejectedAt = new Date();
    if (adminNote) user.recruiterInfo.adminNote = adminNote;

    await user.save();

    res.json({ success: true, message: 'Recruiter request rejected', data: { userId: user._id, recruiterInfo: user.recruiterInfo } });
  } catch (error) {
    console.error('rejectRecruiter error', error);
    res.status(500).json({ success: false, message: 'Error rejecting recruiter request' });
  }
};

/**
 * GET /api/recruiters/me/request
 * Ver estado de la solicitud (usuario autenticado)
 */
export const getMyRecruiterRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const user = await User.findById(req.user._id, 'recruiterInfo userType');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { recruiterInfo: user.recruiterInfo, userType: user.userType } });
  } catch (error) {
    console.error('getMyRecruiterRequest error', error);
    res.status(500).json({ success: false, message: 'Error fetching recruiter request status' });
  }
};
