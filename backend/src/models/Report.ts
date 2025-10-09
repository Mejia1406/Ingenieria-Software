import mongoose, { Document, Schema } from 'mongoose';

export type ReportTargetType = 'review' | 'company'; // Tipos de entidades que se pueden reportar cualquiera de las dos
export type ReportReason = 'spam' | 'ofensivo' | 'discriminacion' | 'informacion_privada' | 'engano' | 'otro';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId; // user who reports
  targetType: ReportTargetType;
  targetId: mongoose.Types.ObjectId; // ID of review or company
  reason: ReportReason;
  details?: string; // Esto es opcional, puede ser que el usuario no quiera dar detalles adicionales
  status: 'pending' | 'dismissed' | 'confirmed';
  moderator?: mongoose.Types.ObjectId;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['review','company'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  reason: { type: String, enum: ['spam','ofensivo','discriminacion','informacion_privada','engano','otro'], required: true },
  details: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending','dismissed','confirmed'], default: 'pending' },
  moderator: { type: Schema.Types.ObjectId, ref: 'User' },
  resolutionNote: { type: String, maxlength: 500 }
},{ timestamps: true });

ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IReport>('Report', ReportSchema);
