import mongoose from "mongoose";
import { Schema } from "mongoose";

interface Messages {
  role: "ai" | "user";
  text: string;
  createdAt: Date;
}

interface ITranscript extends Document {
  interviewId: mongoose.Types.ObjectId;
  messages: Messages[];
  isProcessing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TranscriptSchema = new Schema<ITranscript>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true
    },
    messages: [
      {
        role: { type: String, enum: ["ai", "user"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isProcessing: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ITranscript>("Transcript", TranscriptSchema);
