import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  transcriptId: mongoose.Types.ObjectId;
  jobTitle: string;
  techStack: string[];
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+";
  plannedDuration: number; // in minutes
  actualDuration: number; // in minutes
  optionalPrompt?: string;
  scheduledAt: Date;
  status: "scheduled" | "live" | "completed" | "failed" | "expired";
  startTime?: Date;
  endTime?: Date;
  errorReason?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transcriptId: { type: Schema.Types.ObjectId, ref: "Transcript" },
    jobTitle: { type: String, required: true },
    techStack: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ["0-1", "1-3", "3-5", "5+"],
      required: true,
    },
    plannedDuration: { type: Number, required: true },
    actualDuration: { type: Number },
    optionalPrompt: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    errorReason: { type: String },
    deletedAt: { type: Date },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "failed", "expired"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IInterview>("Interview", InterviewSchema);
