import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience extends Document {
    author: mongoose.Types.ObjectId; // Reference to User
    company: mongoose.Types.ObjectId; // Reference to Company
    
    // Experience type
    experienceType: 'recruitment_process' | 'work_experience' | 'interview_only' | 'internship';
    
    // Basic info
    title: string;
    jobPosition: string;
    department?: string;
    
    // Timeline
    dateRange: {
        startDate: Date;
        endDate?: Date;
        duration?: string; // e.g., "6 months", "2 years"
    };
    
    // Detailed experience
    content: {
        description: string;
        challenges: string[];
        achievements: string[];
        learnings: string[];
    };
    
    // Process details (for recruitment experiences)
    processDetails?: {
        applicationMethod: 'online' | 'referral' | 'recruiter' | 'direct' | 'other';
        stagesCompleted: string[];
        totalTimeToHire?: number; // in days
        responseTime?: number; // in days
        feedbackQuality: number; // 1-5 scale
    };
    
    // Skills and technologies involved
    skillsUsed: string[];
    technologies: string[];
    
    // Location
    location: {
        city?: string;
        country?: string;
        isRemote: boolean;
        hybrid?: boolean;
    };
    
    // Verification and moderation
    isVerified: boolean;
    verificationMethod?: 'email' | 'linkedin' | 'document' | 'manual';
    moderationStatus: 'pending' | 'approved' | 'rejected';
    
    // Engagement metrics
    views: number;
    likes: number;
    shares: number;
    comments: mongoose.Types.ObjectId[]; // References to Comment model
    
    // SEO optimization
    keywords: string[];
    metaTags: string[];
    
    // Privacy settings
    isPublic: boolean;
    isAnonymous: boolean;
    allowComments: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}

const ExperienceSchema: Schema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    
    // Experience type
    experienceType: {
        type: String,
        required: true,
        enum: ['recruitment_process', 'work_experience', 'interview_only', 'internship']
    },
    
    // Basic info
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    jobPosition: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    department: {
        type: String,
        trim: true,
        maxlength: 50
    },
    
    // Timeline
    dateRange: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: Date,
        duration: {
            type: String,
            maxlength: 50
        }
    },
    
    // Detailed content
    content: {
        description: {
            type: String,
            required: true,
            maxlength: 5000
        },
        challenges: [{
            type: String,
            maxlength: 500
        }],
        achievements: [{
            type: String,
            maxlength: 500
        }],
        learnings: [{
            type: String,
            maxlength: 500
        }]
    },
    
    // Process details
    processDetails: {
        applicationMethod: {
            type: String,
            enum: ['online', 'referral', 'recruiter', 'direct', 'other']
        },
        stagesCompleted: [{
            type: String,
            maxlength: 100
        }],
        totalTimeToHire: {
            type: Number,
            min: 0,
            max: 365 // Max 1 year in days
        },
        responseTime: {
            type: Number,
            min: 0,
            max: 90 // Max 3 months in days
        },
        feedbackQuality: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    
    // Skills and technologies
    skillsUsed: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    technologies: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    
    // Location
    location: {
        city: {
            type: String,
            trim: true,
            maxlength: 100
        },
        country: {
            type: String,
            trim: true,
            maxlength: 100
        },
        isRemote: {
            type: Boolean,
            default: false
        },
        hybrid: {
            type: Boolean,
            default: false
        }
    },
    
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationMethod: {
        type: String,
        enum: ['email', 'linkedin', 'document', 'manual']
    },
    moderationStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    
    // Engagement
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    shares: {
        type: Number,
        default: 0,
        min: 0
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    
    // SEO
    keywords: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    metaTags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    
    // Privacy
    isPublic: {
        type: Boolean,
        default: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    allowComments: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for performance and search
ExperienceSchema.index({ company: 1, moderationStatus: 1, isPublic: 1 });
ExperienceSchema.index({ author: 1 });
ExperienceSchema.index({ experienceType: 1 });
ExperienceSchema.index({ createdAt: -1 });
ExperienceSchema.index({ likes: -1 });
ExperienceSchema.index({ views: -1 });

// Compound index for location-based search
ExperienceSchema.index({ 
    'location.country': 1, 
    'location.city': 1, 
    'location.isRemote': 1 
});

// Text index for search functionality
ExperienceSchema.index({
    title: 'text',
    jobPosition: 'text',
    'content.description': 'text',
    skillsUsed: 'text',
    technologies: 'text'
});

// Virtual for engagement score calculation
ExperienceSchema.virtual('engagementScore').get(function() {
    return ((this as any).likes * 2) + ((this as any).shares * 3) + ((this as any).views * 0.1);
});

export default mongoose.model<IExperience>('Experience', ExperienceSchema);