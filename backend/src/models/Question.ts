import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnswer {
  content: string;
  author: Types.ObjectId;
  createdAt: Date;
}

export interface IQuestion extends Document {
  content: string;
  author: Types.ObjectId;
  answers: IAnswer[];
  createdAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new Schema<IQuestion>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: [AnswerSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);