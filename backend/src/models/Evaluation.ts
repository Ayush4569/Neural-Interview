import mongoose, { Schema, Document } from "mongoose";

export interface IEvaluation extends Document {
  interviewId: mongoose.Types.ObjectId;
  status: "processing" | "completed" | "failed";
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  errorReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema: Schema = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    score: { type: Number },
    feedback: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvements: [{ type: String }],
    errorReason: { type: String },
  },
  { timestamps: true },
);
EvaluationSchema.pre("save", function () {
  if (this.status === "completed") {
    if (!this.score || !this.feedback) {
      throw new Error("Missing evaluation result");
    }
  }
});
export default mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);
