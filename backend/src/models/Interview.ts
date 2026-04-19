import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  techStack: string[];
  experienceLevel: 'Entry' | 'Junior' | 'Senior' | 'Expert';
  duration: number; // in minutes
  scheduledAt: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'expired';
  transcript: { role: 'ai' | 'user'; content: string; timestamp: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobTitle: { type: String, required: true },
    techStack: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Junior', 'Senior', 'Expert'],
      required: true,
    },
    duration: { type: Number, required: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'expired'],
      default: 'pending',
    },
    transcript: [
      {
        role: { type: String, enum: ['ai', 'user'] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
