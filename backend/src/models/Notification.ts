import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId; // target user who will receive notification
  type: 'review_reply';
  review?: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId;
  message: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['review_reply'], required: true, index: true },
  review: { type: Schema.Types.ObjectId, ref: 'Review', index: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  message: { type: String, required: true, maxlength: 500 },
  readAt: { type: Date }
}, { timestamps: true });

NotificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
