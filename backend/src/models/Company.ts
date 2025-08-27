import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
    name: string;
    slug: string; // URL-friendly version of name
    description?: string;
    website?: string;
    logo?: string;
    coverImage?: string;
    
    // Company details
    industry: string;
    size: string; // '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
    foundedYear?: number;
    headquarters: {
        city: string;
        country: string;
        address?: string;
    };
    
    // Contact info
    contactInfo: {
        phone?: string;
        email?: string;
        linkedIn?: string;
        twitter?: string;
    };
    
    // Platform metrics
    overallRating: number;
    totalReviews: number;
    ratings: {
        workLifeBalance: number;
        compensation: number;
        careerGrowth: number;
        management: number;
        culture: number;
    };
    
    // Verification status
    isVerified: boolean;
    verifiedBy?: mongoose.Types.ObjectId; // User who verified (admin/recruiter)
    
    // SEO fields
    metaDescription?: string;
    keywords: string[];
    
    createdAt: Date;
    updatedAt: Date;
}

const CompanySchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
        type: String,
        maxlength: 2000
    },
    website: {
        type: String,
        validate: {
            validator: function(v: string) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Website must be a valid URL'
        }
    },
    logo: String,
    coverImage: String,
    
    // Company details
    industry: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: String,
        required: true,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    foundedYear: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
    },
    headquarters: {
        city: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            trim: true
        }
    },
    
    // Contact info
    contactInfo: {
        phone: String,
        email: {
            type: String,
            validate: {
                validator: function(v: string) {
                    return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                },
                message: 'Please enter a valid email'
            }
        },
        linkedIn: String,
        twitter: String
    },
    
    // Platform metrics
    overallRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    ratings: {
        workLifeBalance: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        compensation: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        careerGrowth: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        management: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        culture: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // SEO fields
    metaDescription: {
        type: String,
        maxlength: 160
    },
    keywords: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Indexes for performance and search
CompanySchema.index({ name: 'text', description: 'text' });
CompanySchema.index({ slug: 1 });
CompanySchema.index({ industry: 1 });
CompanySchema.index({ 'headquarters.city': 1, 'headquarters.country': 1 });
CompanySchema.index({ overallRating: -1 });
CompanySchema.index({ totalReviews: -1 });
CompanySchema.index({ size: 1 });

// Pre-save middleware to generate slug
CompanySchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with single
    }
    next();
});

export default mongoose.model<ICompany>('Company', CompanySchema);