import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Interview from '../models/Interview.js';
import Transcript from '../models/Transcript.js';
import Evaluation from '../models/Evaluation.js';
import { evaluateInterview } from '../services/aiService.js';

export const getEvaluation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
        throw new ErrorResponse('Unauthorized', 401);
    }

    const { id } = req.params;

    // Verify ownership
    const interview = await Interview.findOne({ _id: id as string, userId: req.user.id as string });
    if (!interview) {
        throw new ErrorResponse('Interview not found', 404);
    }

    if (interview.status !== 'completed') {
        throw new ErrorResponse('Interview is not yet completed', 400);
    }

    // Check if evaluation already exists and is completed
    const existingEvaluation = await Evaluation.findOne({ interviewId: interview._id });
    if (existingEvaluation && existingEvaluation.status === 'completed') {
        return res.status(200).json({
            success: true,
            evaluation: existingEvaluation,
            interview: {
                jobTitle: interview.jobTitle,
                scheduledAt: interview.scheduledAt,
                plannedDuration: interview.plannedDuration,
                actualDuration: interview.actualDuration,
            },
        });
    }

    const transcript = await Transcript.findOne({ interviewId: interview._id });
    if (!transcript || transcript.messages.length === 0) {
        throw new ErrorResponse('No transcript found for this interview', 404);
    }

    // Set to processing
    await Evaluation.findOneAndUpdate(
        { interviewId: interview._id },
        { $set: { status: 'processing' } },
        { upsert: true }
    );

    try {
        // Run AI evaluation
        const aiEvaluation = await evaluateInterview(transcript.messages);

        const savedEvaluation = await Evaluation.findOneAndUpdate(
            { interviewId: interview._id },
            { 
                $set: { 
                    status: 'completed',
                    score: aiEvaluation.score,
                    feedback: aiEvaluation.feedback,
                    strengths: aiEvaluation.strengths,
                    weaknesses: aiEvaluation.weaknesses,
                    improvements: aiEvaluation.improvements
                } 
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            evaluation: savedEvaluation,
            interview: {
                jobTitle: interview.jobTitle,
                scheduledAt: interview.scheduledAt,
                plannedDuration: interview.plannedDuration,
                actualDuration: interview.actualDuration,
            },
        });
    } catch (error: any) {
        await Evaluation.findOneAndUpdate(
            { interviewId: interview._id },
            { $set: { status: 'failed', errorReason: error.message } }
        );
        throw error;
    }
});
