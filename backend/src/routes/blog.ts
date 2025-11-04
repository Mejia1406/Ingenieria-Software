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
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllBlogPosts);
router.get('/categories', getBlogCategories);
router.get('/tags', getPopularTags);
router.get('/slug/:slug', getBlogPostBySlug);
router.get('/slug/:slug/related', getRelatedPosts);

// Admin routes (protected)
router.get('/:id', authenticate, authorize('admin'), getBlogPostById);
router.post('/', authenticate, authorize('admin'), createBlogPost);
router.put('/:id', authenticate, authorize('admin'), updateBlogPost);
router.delete('/:id', authenticate, authorize('admin'), deleteBlogPost);

export default router;
