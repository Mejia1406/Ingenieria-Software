// models/Review.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  author?: mongoose.Types.ObjectId; // Reference to User
  company?: mongoose.Types.ObjectId; // Reference to Company

  // Review info
  reviewType: "interview" | "employee" | "intern" | "contractor";
  jobTitle?: string;
  department?: string;

  // Employment details
  employmentStatus?: "current" | "former";
  workDuration?: {
    startDate?: Date;
    endDate?: Date;
  };

  // Ratings (1-5 scale)
  overallRating?: number;
  ratings?: {
    workLifeBalance?: number;
    compensation?: number;
    careerGrowth?: number;
    management?: number;
    culture?: number;
  };

  // Review content
  title?: string;
  content?: string;
  pros?: string;
  cons?: string;

  // Recommendation
  recommendation?: {
    wouldRecommend?: boolean;
    recommendToFriend?: boolean;
  };

  // Extra
  isVerified?: boolean;
  isAnonymous?: boolean;
  moderationStatus?: "pending" | "approved" | "rejected";

  helpfulVotes?: number;
  totalVotes?: number;

  isVisible?: boolean;
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: false,
    },

    reviewType: {
      type: String,
      enum: ["interview", "employee", "intern", "contractor"],
      default: "employee",
    },
    jobTitle: { type: String, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 50 },

    employmentStatus: {
      type: String,
      enum: ["current", "former"],
      default: "current",
    },
    workDuration: {
      startDate: Date,
      endDate: Date,
    },

    overallRating: { type: Number, min: 1, max: 5 },
    ratings: {
      workLifeBalance: { type: Number, min: 1, max: 5, default: 3 },
      compensation: { type: Number, min: 1, max: 5, default: 3 },
      careerGrowth: { type: Number, min: 1, max: 5, default: 3 },
      management: { type: Number, min: 1, max: 5, default: 3 },
      culture: { type: Number, min: 1, max: 5, default: 3 },
    },

    title: { type: String, trim: true, maxlength: 150 },
    content: { type: String, maxlength: 3000 },
    pros: { type: String, maxlength: 1000 },
    cons: { type: String, maxlength: 1000 },

    recommendation: {
      wouldRecommend: { type: Boolean, default: false },
      recommendToFriend: { type: Boolean, default: false },
    },

    isVerified: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    helpfulVotes: { type: Number, default: 0 },
    totalVotes: { type: Number, default: 0 },

    isVisible: { type: Boolean, default: true },
    tags: [{ type: String, trim: true, maxlength: 30 }],
  },
  { timestamps: true }
);

// Índices básicos
ReviewSchema.index({ company: 1, moderationStatus: 1, isVisible: 1 });
ReviewSchema.index({ author: 1 });
ReviewSchema.index({ overallRating: -1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>("Review", ReviewSchema);
