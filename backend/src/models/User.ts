import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'candidate' | 'employee' | 'recruiter';
    profilePicture?: string;
    
    // Professional info
    professionalSummary?: string;
    skills: string[];
    workExperience: {
        company: string;
        position: string;
        startDate: Date;
        endDate?: Date;
        description?: string;
    }[];
    education: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        graduationYear: number;
    }[];
    
    // Platform activity
    isVerified: boolean;
    reputation: number;
    location: {
        city: string;
        country: string;
    };
    
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    userType: {
        type: String,
        required: true,
        enum: ['candidate', 'employee', 'recruiter'],
        default: 'candidate'
    },
    profilePicture: {
        type: String,
        default: null
    },
    
    // Professional info
    professionalSummary: {
        type: String,
        maxlength: 1000
    },
    skills: [{
        type: String,
        trim: true
    }],
    workExperience: [{
        company: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        description: {
            type: String,
            maxlength: 500
        }
    }],
    education: [{
        institution: {
            type: String,
            required: true
        },
        degree: {
            type: String,
            required: true
        },
        fieldOfStudy: {
            type: String,
            required: true
        },
        graduationYear: {
            type: Number,
            required: true
        }
    }],
    
    // Platform activity
    isVerified: {
        type: Boolean,
        default: false
    },
    reputation: {
        type: Number,
        default: 0,
        min: 0
    },
    location: {
        city: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ 'location.city': 1, 'location.country': 1 });
UserSchema.index({ reputation: -1 });

export default mongoose.model<IUser>('User', UserSchema);