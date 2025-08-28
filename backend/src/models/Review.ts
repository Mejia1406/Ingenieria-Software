import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    author: mongoose.Types.ObjectId; // Reference to User
    company: mongoose.Types.ObjectId; // Reference to Company
    
    // Review type and position
    reviewType: 'interview' | 'employee' | 'intern' | 'contractor';
    jobTitle: string;
    department?: string;
    
    // Employment details
    employmentStatus: 'current' | 'former';
    workDuration?: {
        startDate: Date;
        endDate?: Date;
    };
    
    // Ratings (1-5 scale)
    overallRating: number;
    ratings: {
        workLifeBalance: number;
        compensation: number;
        careerGrowth: number;
        management: number;
        culture: number;
    };
    
    // Interview specific (if reviewType is 'interview')
    interviewExperience?: {
        difficulty: number; // 1-5 scale
        outcome: 'hired' | 'rejected' | 'pending' | 'declined';
        interviewProcess: string; // Description of the process
        questions: string[]; // Common questions asked
        preparationTips?: string;
    };
    
    // Review content
    title: string;
    content: string;
    pros: string;
    cons: string;
    
    // Additional details
    recommendation: {
        wouldRecommend: boolean;
        recommendToFriend: boolean;
    };
    
    // Salary information (optional)
    salaryInfo?: {
        baseSalary?: number;
        currency: string;
        benefits?: string[];
        bonuses?: string;
    };
    
    // Moderation and verification
    isVerified: boolean;
    isAnonymous: boolean;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    moderatedBy?: mongoose.Types.ObjectId;
    
    // Interaction metrics
    helpfulVotes: number;
    totalVotes: number;
    
    // SEO and visibility
    isVisible: boolean;
    tags: string[];
    
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
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
    
    // Review type and position
    reviewType: {
        type: String,
        required: true,
        enum: ['interview', 'employee', 'intern', 'contractor']
    },
    jobTitle: {
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
    
    // Employment details
    employmentStatus: {
        type: String,
        required: true,
        enum: ['current', 'former']
    },
    workDuration: {
        startDate: Date,
        endDate: Date
    },
    
    // Ratings
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    ratings: {
        workLifeBalance: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        compensation: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        careerGrowth: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        management: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        culture: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        }
    },
    
    // Interview specific
    interviewExperience: {
        difficulty: {
            type: Number,
            min: 1,
            max: 5
        },
        outcome: {
            type: String,
            enum: ['hired', 'rejected', 'pending', 'declined']
        },
        interviewProcess: {
            type: String,
            maxlength: 1000
        },
        questions: [{
            type: String,
            maxlength: 500
        }],
        preparationTips: {
            type: String,
            maxlength: 500
        }
    },
    
    // Review content
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    content: {
        type: String,
        required: true,
        maxlength: 3000
    },
    pros: {
        type: String,
        required: true,
        maxlength: 1000
    },
    cons: {
        type: String,
        required: true,
        maxlength: 1000
    },
    
    // Recommendations
    recommendation: {
        wouldRecommend: {
            type: Boolean,
            required: true
        },
        recommendToFriend: {
            type: Boolean,
            required: true
        }
    },
    
    // Salary information
    salaryInfo: {
        baseSalary: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'COP',
            maxlength: 3
        },
        benefits: [{
            type: String,
            maxlength: 100
        }],
        bonuses: {
            type: String,
            maxlength: 300
        }
    },
    
    // Moderation
    isVerified: {
        type: Boolean,
        default: false
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    moderationStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Interaction metrics
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    totalVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // SEO and visibility
    isVisible: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }]
}, {
    timestamps: true
});

// Compound indexes for performance
ReviewSchema.index({ company: 1, moderationStatus: 1, isVisible: 1 });
ReviewSchema.index({ author: 1 });
ReviewSchema.index({ reviewType: 1, company: 1 });
ReviewSchema.index({ overallRating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ helpfulVotes: -1 });

// Text index for search
ReviewSchema.index({ 
    title: 'text', 
    content: 'text', 
    jobTitle: 'text',
    pros: 'text',
    cons: 'text'
});

// Virtual for helpful percentage
ReviewSchema.virtual('helpfulPercentage').get(function() {
    if ((this as any).totalVotes === 0) return 0;
    return Math.round(((this as any).helpfulVotes / (this as any).totalVotes) * 100);
});

export default mongoose.model<IReview>('Review', ReviewSchema);