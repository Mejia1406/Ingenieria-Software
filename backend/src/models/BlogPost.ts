import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
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
  publishedAt?: Date;
  viewCount: number;
  
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  
  // Related content
  relatedCompanies?: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300
    },
    content: {
      type: String,
      required: true
    },
    author: {
      name: {
        type: String,
        required: true
      },
      avatar: {
        type: String
      }
    },
    featuredImage: {
      type: String
    },
    category: {
      type: String,
      required: true,
      enum: [
        'career-advice',
        'company-insights',
        'interview-tips',
        'salary-trends',
        'workplace-culture',
        'industry-news',
        'job-search'
      ]
    },
    tags: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: {
      type: Date
    },
    viewCount: {
      type: Number,
      default: 0
    },
    
    // SEO Fields
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    metaKeywords: [{
      type: String
    }],
    canonicalUrl: {
      type: String
    },
    
    // Related content
    relatedCompanies: [{
      type: Schema.Types.ObjectId,
      ref: 'Company'
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better search performance
BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Auto-generate slug from title if not provided
BlogPostSchema.pre<IBlogPost>('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/--+/g, '-') // Replace multiple - with single -
      .trim();
  }
  next();
});

// Set publishedAt when status changes to published
BlogPostSchema.pre<IBlogPost>('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
