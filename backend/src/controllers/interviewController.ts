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
import {
  InterviewSchema,
  QuestionResponseSchema,
} from "../schema/interview.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createInterview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("Unauthorized", 404);
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
  },
);

export const startInterview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

    // Ensure the transcript exists
    let transcript = await Transcript.findOneAndUpdate(
      { interviewId: interview._id },
      {
        $setOnInsert: {
          interviewId: interview._id,
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

    // Need to generate initial question. Acquire optimistic lock.
    const lockedTranscript = await Transcript.findOneAndUpdate(
      { _id: transcript._id, isProcessing: { $ne: true } },
      { $set: { isProcessing: true } },
      { new: true },
    );

    if (!lockedTranscript) {
      throw new ErrorResponse(
        "Interview is currently processing. Please wait.",
        429,
      );
    }

    try {
      let nextQuestion = "";
      try {
        nextQuestion = await generateInterviewQuestion(
          interview.jobTitle,
          interview.techStack,
          interview.experienceLevel,
          transcript.messages,
        );
      } catch (error: any) {
        interview.status = "failed";
        const msg =
          error instanceof ErrorResponse
            ? error.message
            : "AI generation failed";
        interview.errorReason = msg;
        await interview.save();
        throw new ErrorResponse(`Interview aborted: ${msg}`, 500);
      }

      if (!nextQuestion || nextQuestion.length === 0) {
        interview.status = "failed";
        interview.errorReason = "Failed to generate initial question";
        await interview.save();
        throw new ErrorResponse(
          "Failed to generate initial question. The interview has been aborted.",
          500,
        );
      }

      await Transcript.findByIdAndUpdate(transcript._id, {
        $push: {
          messages: {
            role: "ai" as const,
            text: nextQuestion,
            createdAt: new Date(),
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: "Interview in-progress",
        interviewId: id,
        status: interview.status,
        nextQuestion,
      });
    } finally {
      await Transcript.findByIdAndUpdate(transcript._id, {
        $set: { isProcessing: false },
      });
    }
  },
);

export const getInterview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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
  },
);

export const getHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) throw new ErrorResponse("Unauthorized", 404);
    const userId = req.user.id;
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      interviews,
    });
  },
);

export const submitAnswer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("Unauthorized", 404);
    }

    const { answer } = req.body;
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id as string,
      userId: req.user.id,
    });

    if (!interview || interview.status !== "live") {
      throw new ErrorResponse("Invalid interview", 404);
    }

    const result = QuestionResponseSchema.safeParse(answer);
    if (!result.success) {
      throw new ErrorResponse("Answer cannot be empty", 400);
    }

    // Attempt to acquire optimistic lock on the transcript
    const transcript = await Transcript.findOneAndUpdate(
      { interviewId: interview._id, isProcessing: { $ne: true } },
      { $set: { isProcessing: true } },
      { new: true },
    );

    if (!transcript) {
      throw new ErrorResponse(
        "An answer is already being processed. Please wait.",
        429,
      );
    }

    try {
      const endTimeTime =
        interview.startTime!.getTime() + interview.plannedDuration * 60 * 1000;
      const isTimeUp = Date.now() > endTimeTime;

      const userMessage = {
        role: "user" as const,
        text: answer,
        createdAt: new Date(),
      };

      if (isTimeUp) {
        interview.status = "completed";
        interview.endTime = new Date();
        interview.actualDuration = Math.max(
          1,
          Math.round(
            (interview.endTime.getTime() - interview.startTime!.getTime()) /
              60000,
          ),
        );
        await interview.save();

        await Transcript.findByIdAndUpdate(transcript._id, {
          $push: { messages: userMessage },
        });

        return res.status(200).json({
          success: true,
          message: "Interview time completed. Your final answer was saved.",
          isCompleted: true,
        });
      }

      // Prepare context with user's answer appended in memory
      const memoryMessages = [...transcript.messages, userMessage];

      let nextQuestion = "";
      let retries = 2;
      let aiErrorMsg =
        "AI failed to generate a question after multiple attempts.";

      while (retries >= 0) {
        try {
          const generated = await generateInterviewQuestion(
            interview.jobTitle,
            interview.techStack,
            interview.experienceLevel,
            memoryMessages,
          );
          if (generated && generated.length > 0) {
            nextQuestion = generated;
            break;
          }
        } catch (error: any) {
          console.error(
            `AI generation failed. Retries left: ${retries}`,
            error,
          );
          if (error instanceof ErrorResponse) {
            aiErrorMsg = error.message;
            // Break immediately on rate limit to avoid spamming
            if (error.statusCode === 429 || retries === 0) {
              retries = -1; // ensure loop exits
              break;
            }
          }
          if (retries > 0) {
            await new Promise((res) => setTimeout(res, 1500));
          }
        }
        retries--;
      }

      if (!nextQuestion || nextQuestion.length === 0) {
        // Abort the interview if all retries fail
        interview.status = "failed";
        interview.errorReason = aiErrorMsg;
        interview.endTime = new Date();
        interview.actualDuration = Math.max(
          1,
          Math.round(
            (interview.endTime.getTime() - interview.startTime!.getTime()) /
              60000,
          ),
        );
        await interview.save();

        throw new ErrorResponse(`Interview aborted: ${aiErrorMsg}`, 500);
      }

      const aiMessage = {
        role: "ai" as const,
        text: nextQuestion,
        createdAt: new Date(),
      };

      // Atomic update of both messages
      await Transcript.findByIdAndUpdate(transcript._id, {
        $push: { messages: { $each: [userMessage, aiMessage] } },
      });

      return res.status(200).json({
        success: true,
        message: "Answer submitted successfully",
        nextQuestion,
      });
    } finally {
      // Always release the lock
      await Transcript.findByIdAndUpdate(transcript._id, {
        $set: { isProcessing: false },
      });
    }
  },
);
