import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'candidate' | 'employee' | 'recruiter' | 'admin';
    profilePicture?: string;
    recruiterInfo?: {
        companyName: string; // Nombre de la empresa que declara
        companyId?: mongoose.Types.ObjectId; // Cuando se asocie a una Company existente (opcional)
        companyEmail: string; // Correo corporativo usado para validar dominio
        roleTitle?: string; // Título del cargo (Recruiter, HR Manager, Talent Acquisition, etc.)
        status: 'pending' | 'approved' | 'rejected';
        requestedAt: Date;
        approvedAt?: Date;
        rejectedAt?: Date;
        adminNote?: string; // Mensaje de rechazo o nota de aprobación
    };
    
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
    // Updated regex: permite TLD de longitud variable (>=2) y formato más amplio (RFC simplificado)
    match: [/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/ , 'Please enter a valid email']
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
        enum: ['candidate', 'employee', 'recruiter', 'admin'],
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
    },
    recruiterInfo: {
        companyName: { type: String, trim: true },
        companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
        companyEmail: { type: String, trim: true, lowercase: true },
        roleTitle: { type: String, trim: true, maxlength: 100 },
        status: { type: String, enum: ['pending', 'approved', 'rejected'] },
        requestedAt: { type: Date },
        approvedAt: { type: Date },
        rejectedAt: { type: Date },
        adminNote: { type: String, trim: true, maxlength: 300 }
    }
}, {
    timestamps: true
});

// Indexes for performance - REMOVED DUPLICATE EMAIL INDEX
UserSchema.index({ userType: 1 });
UserSchema.index({ 'location.city': 1, 'location.country': 1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ 'recruiterInfo.status': 1 });

export default mongoose.model<IUser>('User', UserSchema);