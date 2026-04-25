import { Schema, model, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

interface refreshToken {
  token: string;
  device: string;
  createdAt: Date;
}
interface UserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IUser extends Document {
  email?: string;
  username: string;
  password: string;
  interviewCount: number;
  isGhost: boolean;
  refreshTokens: refreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true },
    username: { type: String, lowercase: true, trim: true },
    password: { type: String },
    interviewCount: { type: Number, default: 0 },
    isGhost: { type: Boolean, default: false },
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.pre("save", async function () {
  if (this.refreshTokens && this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5) as refreshToken[];
  } else return;
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model<IUser, Model<IUser, {}, UserMethods>>(
  "User",
  UserSchema,
);
