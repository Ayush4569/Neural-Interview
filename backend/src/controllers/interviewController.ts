import mongoose from 'mongoose';
import { type Request, type Response, type NextFunction } from 'express';
import Interview from '../models/Interview.js';
import Evaluation from '../models/Evaluation.js';
import User from '../models/User.js';
import { generateInterviewQuestion, evaluateInterview } from '../services/aiService.js';
import ErrorResponse from '../utils/errorResponse.js';

export const createInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobTitle, techStack, experienceLevel, duration, scheduledAt } = req.body;
    const user = (req as any).user;

    const interview = await Interview.create({
      userId: user._id,
      jobTitle,
      techStack,
      experienceLevel,
      duration,
      ...(scheduledAt && { scheduledAt: new Date(scheduledAt) })
    });

    // Update user interview count
    await User.findByIdAndUpdate(user._id, { $inc: { interviewCount: 1 } });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

export const startInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      return next(new ErrorResponse('Interview not found', 404));
    }

    if (interview.transcript.length > 0) {
      const lastMessage = interview.transcript[interview.transcript.length - 1];
      return res.status(200).json({ success: true, aiMessage: lastMessage?.content, duration: interview.duration, status: interview.status });
    }

    const aiMessage = await generateInterviewQuestion(
      interview.jobTitle,
      interview.techStack,
      interview.experienceLevel,
      []
    );

    interview.transcript.push({ role: 'ai', content: aiMessage, timestamp: new Date() });
    interview.status = 'in-progress';
    await interview.save();

    res.status(200).json({ success: true, aiMessage, duration: interview.duration, status: interview.status });
  } catch (error) {
    next(error);
  }
};

export const respondToInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const interview = await Interview.findById(id);

    if (!interview) {
      return next(new ErrorResponse('Interview not found', 404));
    }

    interview.transcript.push({ role: 'user', content: answer, timestamp: new Date() });

    const aiMessage = await generateInterviewQuestion(
      interview.jobTitle,
      interview.techStack,
      interview.experienceLevel,
      interview.transcript,
      req.body.isEnding === true
    );

    interview.transcript.push({ role: 'ai', content: aiMessage, timestamp: new Date() });
    await interview.save();

    res.status(200).json({ success: true, aiMessage });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id).populate('userId');

    if (!interview) {
      return next(new ErrorResponse('Interview not found', 404));
    }

    interview.status = 'completed';
    await interview.save();

    const user = interview.userId as any;

    // Trigger background evaluation
    setImmediate(async () => {
      try {
        const result = await evaluateInterview(interview.transcript);
        await Evaluation.create({
          interviewId: interview._id,
          ...result
        });
        console.log(`Evaluation completed for interview ${interview._id}`);
      } catch (e) {
        console.error('Background Evaluation Failed:', e);
      }
    });

    res.status(200).json({ success: true, message: 'Interview completed' });
  } catch (error) {
    next(error);
  }
};

export const getUserInterviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, interviews });
    } catch (error) {
        next(error);
    }
};

export const getEvaluation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const evaluation = await Evaluation.findOne({ interviewId: new mongoose.Types.ObjectId(id as string) });
        if (!evaluation) {
            return next(new ErrorResponse('Evaluation not found or still processing', 404));
        }
        res.status(200).json({ success: true, evaluation });
    } catch (error) {
        next(error);
    }
}
