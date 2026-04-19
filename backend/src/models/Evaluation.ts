import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluation extends Document {
  interviewId: mongoose.Types.ObjectId;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    score: { type: Number, required: true },
    feedback: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvements: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IEvaluation>('Evaluation', EvaluationSchema);
