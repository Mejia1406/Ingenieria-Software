import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ingenieria-software-1-ayxk.onrender.com/api';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  featuredImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  relatedCompanies?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  slug: string;
  name: string;
  count: number;
}

export interface BlogTag {
  name: string;
  count: number;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
}

export interface BlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
}

export interface BlogTagsResponse {
  success: boolean;
  data: BlogTag[];
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all blog posts with filters
export const getAllBlogPosts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  status?: string;
  search?: string;
}): Promise<BlogListResponse> => {
  const response = await axios.get(`${API_URL}/blog`, { params });
  return response.data;
};

// Get single blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPostResponse> => {
  const response = await axios.get(`${API_URL}/blog/slug/${slug}`);
  return response.data;
};

// Get blog post by ID (admin)
export const getBlogPostById = async (id: string): Promise<BlogPostResponse> => {
  const response = await axios.get(`${API_URL}/blog/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Create new blog post (admin)
export const createBlogPost = async (data: Partial<BlogPost>): Promise<BlogPostResponse> => {
  const response = await axios.post(`${API_URL}/blog`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update blog post (admin)
export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<BlogPostResponse> => {
  const response = await axios.put(`${API_URL}/blog/${id}`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Delete blog post (admin)
export const deleteBlogPost = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axios.delete(`${API_URL}/blog/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get blog categories
export const getBlogCategories = async (): Promise<BlogCategoriesResponse> => {
  const response = await axios.get(`${API_URL}/blog/categories`);
  return response.data;
};

// Get popular tags
export const getPopularTags = async (): Promise<BlogTagsResponse> => {
  const response = await axios.get(`${API_URL}/blog/tags`);
  return response.data;
};

// Get related posts
export const getRelatedPosts = async (slug: string, limit?: number): Promise<BlogListResponse> => {
  const response = await axios.get(`${API_URL}/blog/slug/${slug}/related`, {
    params: { limit }
  });
  return response.data;
};

export const categoryLabels: Record<string, string> = {
  'career-advice': 'Consejos de Carrera',
  'company-insights': 'Insights de Empresas',
  'interview-tips': 'Tips de Entrevistas',
  'salary-trends': 'Tendencias Salariales',
  'workplace-culture': 'Cultura Laboral',
  'industry-news': 'Noticias de Industria',
  'job-search': 'Búsqueda de Empleo'
};
