import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Interview from '../models/Interview.js';
import Transcript from '../models/Transcript.js';
import Evaluation from '../models/Evaluation.js';
import { AiService } from "../services/ai.service.js";

export const getEvaluation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
        throw new ErrorResponse('Unauthorized', 401);
    }

    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id as string, userId: req.user.id as string });
    if (!interview) {
        throw new ErrorResponse('Interview not found', 404);
    }

    if (interview.status !== 'completed') {
        throw new ErrorResponse('Interview is not yet completed', 400);
    }

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

    await Evaluation.findOneAndUpdate(
        { interviewId: interview._id },
        { $set: { status: 'processing' } },
        { upsert: true } // Create a new evaluation document if it doesn't exist
    );

    try {
        const geminiService = new AiService();
        const { error, result, success } = await geminiService.evaluateInterview(transcript.messages);
        if (!success) {
            throw new Error(error || 'Failed to evaluate interview');
        }

        const savedEvaluation = await Evaluation.findOneAndUpdate(
            { interviewId: interview._id },
            {
                $set: {
                    status: 'completed',
                    score: result?.data?.score,
                    feedback: result?.data?.feedback,
                    strengths: result?.data?.strengths,
                    weaknesses: result?.data?.weaknesses,
                    improvements: result?.data?.improvements
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

export const getAllEvaluations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
        throw new ErrorResponse('Unauthorized', 401);
    }

    const evaluations = await Evaluation.find({ userId: req.user.id as string }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        evaluations,
    });
});

export const deleteEvaluation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
        throw new ErrorResponse('Unauthorized', 401);
    }

    const { id } = req.params;

    const evaluation = await Evaluation.findOne({ _id: id as string, userId: req.user.id as string });
    if (!evaluation) {
        throw new ErrorResponse('Evaluation not found', 404);
    }

    await Evaluation.deleteOne({ _id: id as string });

    return res.status(200).json({
        success: true,
        message: 'Evaluation deleted successfully',
    });
})