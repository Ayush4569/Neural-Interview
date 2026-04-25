import mongoose from "mongoose";
import { type Request, type Response, type NextFunction } from "express";
import Interview from "../models/Interview.js";
import Evaluation from "../models/Evaluation.js";
import {User} from "../models/User.js";
import {
  generateInterviewQuestion,
  evaluateInterview,
} from "../services/aiService.js";
import ErrorResponse from "../utils/errorResponse.js";

export const createInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
   const {jobTitle,techStack,duration,experienceLevel} = req.body;
   return res.status(200).json({success:true,message:"Interview created successfully"})
};

