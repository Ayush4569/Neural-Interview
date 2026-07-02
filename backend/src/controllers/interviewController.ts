import { type Request, type Response, type NextFunction } from "express";
import Interview from "../models/Interview.js";
import Transcript from "../models/Transcript.js";
import { AiService } from "../services/ai.service.js";
import ErrorResponse from "../utils/errorResponse.js";
import { InterviewSchema } from "../schema/interview.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TTL = 30 * 60 * 60

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
      interview
    });
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

export const endInterview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("Unauthorized", 404);
    }
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id as string,
      userId: req.user.id,
    });

    if (!interview || interview.status !== "live") {
      throw new ErrorResponse("Invalid interview", 404);
    }

    interview.status = "completed";
    interview.endTime = new Date();
    interview.actualDuration = Math.max(
      1,
      Math.round(
        (interview.endTime.getTime() - interview.startTime!.getTime()) / 60000,
      ),
    );
    await interview.save();

    await Transcript.findOneAndUpdate(
      { interviewId: interview._id },
      { $set: { isProcessing: false } }
    );

    return res.status(200).json({
      success: true,
      message: "Interview ended successfully",
    });
  },
);

export const startInterview = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new ErrorResponse("Unauthorized", 401);
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      throw new ErrorResponse("Invalid interview id", 400);
    }


    const interview = await Interview.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!interview) {
      throw new ErrorResponse("Interview not found", 404);
    }


    switch (interview.status) {
      case "completed":
        throw new ErrorResponse("Interview already completed", 400);

      case "failed":
        throw new ErrorResponse("Interview failed", 400);

      case "expired":
        throw new ErrorResponse("Interview expired", 400);
    }


    let transcript = await Transcript.findOne({
      interviewId: interview._id,
    });

    if (!transcript) {
      transcript = await Transcript.create({
        interviewId: interview._id,
        messages: [],
        isProcessing: false,
      });
    }


    const hasConversationStarted =
      interview.status === "live" &&
      transcript.messages.length > 0;

    if (hasConversationStarted) {
      const lastAIMessage = [...transcript.messages]
        .reverse()
        .find((msg) => msg.role === "ai")
        ;

      return res.status(200).json({
        success: true,
        question: lastAIMessage?.text ?? null,
        resumed: true,
      });
    }


    if (interview.status === "scheduled") {
      const now = new Date();

      if (
        now.getTime() - interview.scheduledAt.getTime() >
        TTL
      ) {
        interview.status = "expired";
        interview.errorReason =
          "Interview was not started within the allowed time window.";

        await interview.save();

        throw new ErrorResponse(
          "Interview expired due to inactivity",
          400
        );
      }

      interview.status = "live";
      interview.startTime = now;

      await interview.save();
    }


    if (transcript.isProcessing) {
      throw new ErrorResponse(
        "Question generation already in progress",
        409
      );
    }

    try {
      transcript.isProcessing = true;
      await transcript.save();

      const {
        techStack,
        jobTitle,
        experienceLevel,
        optionalPrompt,
      } = interview;

      const geminiService = new AiService();

      const {
        success,
        question,
        error,
      } = await geminiService.generateQuestions({
        techStack,
        jobTitle,
        experienceLevel,
        optionalPrompt,
        transcript: transcript.messages,
      });

      if (!success || !question) {
        interview.status = "failed";
        interview.errorReason =
          error || "Failed to generate interview question";

        await interview.save();

        throw new ErrorResponse(
          interview.errorReason,
          500
        );
      }

      transcript.messages.push({
        role: "ai",
        text: question,
        createdAt: new Date(),
      });

      await transcript.save();

      return res.status(200).json({
        success: true,
        question,
        resumed: false,
      });
    } finally {
      transcript.isProcessing = false;
      await transcript.save();
    }
  }
);

export const submitAnswer = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new ErrorResponse("Unauthorized", 401);
    }

    const { id } = req.params;
    const { answer } = req.body;

    if (!id || Array.isArray(id)) {
      throw new ErrorResponse("Invalid interview id", 400);
    }

    if (!answer || typeof answer !== "string") {
      throw new ErrorResponse("Invalid answer", 400);
    }


    const interview = await Interview.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!interview) {
      throw new ErrorResponse("Interview not found", 404);
    }

    if (interview.status !== "live") {
      throw new ErrorResponse("Interview is not live", 400);
    }


    const transcript = await Transcript.findOne({
      interviewId: id,
    });

    if (!transcript) {
      throw new ErrorResponse(
        "Transcript not found for interview",
        404
      );
    }


    transcript.messages.push({
      role: "user",
      text: answer,
      createdAt: new Date(),
    });

    await transcript.save();


    const elapsedTime =
      Date.now() - interview.startTime!.getTime();

    const durationExceeded =
      elapsedTime >=
      interview.plannedDuration * 60 * 1000;

    if (durationExceeded) {
      const closingMessage =
        "Thank you for your time. This concludes the interview.";

      transcript.messages.push({
        role: "ai",
        text: closingMessage,
        createdAt: new Date(),
      });

      await transcript.save();

      interview.status = "completed";
      interview.endTime = new Date();

      await interview.save();

      return res.status(200).json({
        success: true,
        shouldEnd: true,
        question: closingMessage,
      });
    }


    if (transcript.isProcessing) {
      throw new ErrorResponse(
        "Question generation already in progress",
        409
      );
    }

    try {
      transcript.isProcessing = true;
      await transcript.save();

      const {
        techStack,
        jobTitle,
        experienceLevel,
        optionalPrompt,
      } = interview;

      const geminiService = new AiService();

      const {
        success,
        question,
        error,
      } = await geminiService.generateQuestions({
        techStack,
        jobTitle,
        experienceLevel,
        optionalPrompt,
        transcript: transcript.messages,
      });

      if (!success || !question) {
        throw new ErrorResponse(
          error || "Failed to generate question",
          500
        );
      }

      transcript.messages.push({
        role: "ai",
        text: question,
        createdAt: new Date(),
      });

      await transcript.save();

      return res.status(200).json({
        success: true,
        shouldEnd: false,
        question,
      });
    } finally {
      transcript.isProcessing = false;
      await transcript.save();
    }
  }
);

export const getInterviewState = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ErrorResponse("Unauthorized", 401);
  }

  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new ErrorResponse("Invalid interview id", 400);
  }


  const interview = await Interview.findOne({
    _id: id,
    userId: req.user.id,
  });

  if (!interview) {
    throw new ErrorResponse("Interview not found", 404);
  }
  const transcript = await Transcript.findOne({ interviewId: interview._id })
  if (!transcript) {
    throw new ErrorResponse("Transcript not found", 404);
  }
  const lastAIMessage = [...transcript.messages].reverse().find((msg) => msg.role === "ai");

  return res.status(200).json({
    success: true,
    state: {
      id: interview._id,
      status: interview.status,
  
      plannedDuration: interview.plannedDuration,
      startTime: interview.startTime,
      endTime: interview.endTime,
  
      currentQuestion: lastAIMessage?.text ?? "",
  
      isProcessing: transcript.isProcessing,
  
    }
  })

})