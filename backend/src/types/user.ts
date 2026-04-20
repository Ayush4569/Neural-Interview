import type { Types } from "mongoose";

export interface User {
    _id: Types.ObjectId;
    email: string;
    isGhost: boolean;
    interviewCount: number;
    refreshTokens: string[];
}