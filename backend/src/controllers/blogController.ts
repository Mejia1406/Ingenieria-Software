import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import Company from '../models/Company';

export const getAllBlogPosts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      tag, 
      status = 'published',
      search 
    } = req.query;

    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (tag) {
      filter.tags = tag;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-content') // Exclude full content from list
      .lean();

    const total = await BlogPost.countDocuments(filter);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los posts del blog',
      error: error.message 
    });
  }
};

// Get single blog post by slug
export const getBlogPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await BlogPost.findOne({ slug })
      .populate('relatedCompanies', 'name slug logo industry')
      .lean();

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post del blog no encontrado' 
      });
    }

    // Increment view count
    await BlogPost.updateOne({ slug }, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el post del blog',
      error: error.message 
    });
  }
};

// Get blog post by ID (for admin)
export const getBlogPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id)
      .populate('relatedCompanies', 'name slug logo industry')
      .lean();

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post del blog no encontrado' 
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener el post del blog',
      error: error.message 
    });
  }
};

// Create new blog post (admin only)
export const createBlogPost = async (req: Request, res: Response) => {
  try {
    const postData = req.body;

    // Auto-generate SEO fields if not provided
    if (!postData.metaTitle) {
      postData.metaTitle = postData.title.substring(0, 60);
    }
    if (!postData.metaDescription) {
      postData.metaDescription = postData.excerpt.substring(0, 160);
    }

    const post = new BlogPost(postData);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Post del blog creado correctamente',
      data: post
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear el post del blog',
      error: error.message 
    });
  }
};

// Update blog post (admin only)
export const updateBlogPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post del blog no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Post del blog actualizado correctamente',
      data: post
    });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar el post del blog',
      error: error.message
    });
  }
};

// Delete blog post (admin only)
export const deleteBlogPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post del blog no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Post del blog eliminado correctamente'
    });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar el post del blog',
      error: error.message 
    });
  }
};

// Get blog categories with post count
export const getBlogCategories = async (req: Request, res: Response) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryMap: any = {
      'career-advice': 'Consejos de Carrera',
      'company-insights': 'Insights de Empresas',
      'interview-tips': 'Tips de Entrevistas',
      'salary-trends': 'Tendencias Salariales',
      'workplace-culture': 'Cultura Laboral',
      'industry-news': 'Noticias de Industria',
      'job-search': 'Búsqueda de Empleo'
    };

    const formattedCategories = categories.map(cat => ({
      slug: cat._id,
      name: categoryMap[cat._id] || cat._id,
      count: cat.count
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las categorías',
      error: error.message 
    });
  }
};

// Get popular tags
export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener las etiquetas',
      error: error.message 
    });
  }
};

// Get related posts
export const getRelatedPosts = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const limit = Number(req.query.limit) || 3;

    const currentPost = await BlogPost.findOne({ slug }).select('category tags');
    
    if (!currentPost) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post del blog no encontrado' 
      });
    }

    const relatedPosts = await BlogPost.find({
      _id: { $ne: currentPost._id },
      status: 'published',
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } }
      ]
    })
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();

    res.json({
      success: true,
      data: relatedPosts
    });
  } catch (error: any) {
    console.error('Error fetching related posts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los posts relacionados',
      error: error.message 
    });
  }
};
