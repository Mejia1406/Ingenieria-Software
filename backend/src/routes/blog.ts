import express from 'express';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  getPopularTags,
  getRelatedPosts
} from '../controllers/blogController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public routes (ORDEN IMPORTANTE: rutas específicas primero)
// Usamos optionalAuth para permitir tokens expirados sin que fallen las peticiones
router.get('/categories', optionalAuth, getBlogCategories);
router.get('/tags', optionalAuth, getPopularTags);
router.get('/slug/:slug', optionalAuth, getBlogPostBySlug);
router.get('/slug/:slug/related', optionalAuth, getRelatedPosts);
router.get('/', optionalAuth, getAllBlogPosts);

// Admin routes (protected) - van al final porque usan parámetros dinámicos
router.get('/:id', authenticate, authorize('admin'), getBlogPostById);
router.post('/', authenticate, authorize('admin'), createBlogPost);
router.put('/:id', authenticate, authorize('admin'), updateBlogPost);
router.delete('/:id', authenticate, authorize('admin'), deleteBlogPost);

export default router;
