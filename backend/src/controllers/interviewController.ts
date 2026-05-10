import mongoose, { mongo } from "mongoose";
import { type Request, type Response, type NextFunction } from "express";
import Interview from "../models/Interview.js";
import Transcript from "../models/Transcript.js";
import { User } from "../models/User.js";
import {
  generateInterviewQuestion,
  evaluateInterview,
} from "../services/aiService.js";
import ErrorResponse from "../utils/errorResponse.js";
import { InterviewSchema } from "../schema/interview.js";

export const createInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user.id) {
    throw new ErrorResponse("No user found with this id", 404);
  }
  const {
    jobTitle,
    techStack,
    duration,
    experienceLevel,
    scheduledAt,
    optionalPrompt,
    mode,
  } = req.body;

  const result = InterviewSchema.safeParse({
    jobTitle,
    techStack,
    duration,
    experienceLevel,
    scheduledAt,
    optionalPrompt,
    mode,
  });

  if (!result.success) {
    console.log(result.error.issues);
    
    throw new ErrorResponse("Invalid input data", 400);
  }

  const now = new Date();
  let finalScheduledAt;
  if (mode === "now") {
    finalScheduledAt = now;
  } else {
    finalScheduledAt = new Date(scheduledAt);

    if (finalScheduledAt < now)
      throw new ErrorResponse("Cannot schedule interview in the past", 400);
    if (finalScheduledAt.getTime() - now.getTime() < 5 * 60 * 1000)
      throw new ErrorResponse(
        "Interview should be scheduled at least 5 minutes from now",
        400,
      );
  }

  const interview = await Interview.create({
    jobTitle,
    techStack,
    userId: req.user.id,
    plannedDuration: duration,
    experienceLevel,
    scheduledAt: finalScheduledAt,
    optionalPrompt,
    status: mode === "now" ? "live" : "scheduled",
    ...(optionalPrompt && { optionalPrompt }),
  });

  return res.status(200).json({
    success: true,
    interviewId: interview._id,
    status: interview.status,
    scheduledAt: interview.scheduledAt,
  });
};

export const startInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user.id) {
    throw new ErrorResponse("No user found with this id", 404);
  }
  const { id } = req.params;

  const interview = await Interview.findById(id);

  if (!interview) throw new ErrorResponse("Interview not found", 404);

  switch (interview.status) {
    case "failed":
      throw new ErrorResponse("Interview was failed", 404);

    case "expired":
      throw new ErrorResponse("Interview expired", 404);

    case "completed":
      throw new ErrorResponse("Interview completed", 404);
  }

  if (interview.status == "scheduled") {
    const now = new Date();
    const graceTime = 15 * 60 * 1000;
    if (now < interview.scheduledAt) {
      throw new ErrorResponse("Interview not started yet", 404);
    } else if (now.getTime() - interview.scheduledAt.getTime() > graceTime) {
      interview.status = "expired";
      await interview.save();
      throw new ErrorResponse("Interview has expired", 404);
    } else {
      interview.status = "live";
      interview.startTime = new Date();
      await interview.save();
    }
  }

  // First get the interview transcript so far (if any)
  const transcript = await Transcript.findOneAndUpdate(
    { interviewId: new mongoose.Types.ObjectId(id as string) },
    {
      $setOnInsert: {
        interviewId: new mongoose.Types.ObjectId(id as string),
        messages: [],
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
  const lastAssistantMessage = [...transcript.messages]
    .reverse()
    .find((msg) => msg.role === "ai");

  if (lastAssistantMessage) {
    return res.status(200).json({
      success: true,
      message: "Interview resumed",
      interviewId: interview._id,
      status: interview.status,
      nextQuestion: lastAssistantMessage.text,
    });
  }
  // generate next set of questions based on the transcript so far
  const nextQuestion = await generateInterviewQuestion(
    interview.jobTitle,
    interview.techStack,
    interview.experienceLevel,
    transcript.messages,
  );

  if (!nextQuestion || nextQuestion.length === 0)
    throw new ErrorResponse("Failed to generate question", 500);

  await Transcript.findOneAndUpdate(
    {
      interviewId: interview._id,
    },
    {
      $push: {
        messages: {
          role: "assistant",
          text: nextQuestion,
          createdAt: new Date(),
        },
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: "Interview in-progress",
    interviewId: id,
    status: interview.status,
    nextQuestion,
  });
};

export const getInterview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user.id) {
    throw new ErrorResponse("Unauthorized", 404);
  }
  const { id } = req.params;

  const interview = await Interview.findById(id).select(
    "-deletedAt -createdAt -updatedAt -transcriptId -actualDuration -optionalPrompt -userId -startTime -endTime -errorReason -__v",
  );

  if (!interview) throw new ErrorResponse("Interview not found", 404);

  return res.status(200).json({
    success: true,
    interview,
  });
};
export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || !req.user.id) throw new ErrorResponse("Unauthorized", 404);
  const userId = req.user.id;
  const interviews = await Interview.find({ userId })
    .sort({ createdAt: -1 })
  return res.status(200).json({
    success: true,
    interviews,
  });
};
