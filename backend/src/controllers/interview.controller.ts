import { Response, Request } from "express";
import { prisma } from "../database/db";
import { calculateFinalInterviewScore } from "../utils/helpers";
import { summary } from "../types/interview";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/apiError";

export const getInterviews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        throw new CustomError(401, "Unauthorized")
    }
    const now = new Date()
    const interviews = await prisma.interview.findMany({
        where: {
            userId: req.user.id as string
        },
        orderBy: { createdAt: 'desc' },
        include: {
            summary: {
                select: {
                    overallSummary: true,
                    strengths: true,
                    improvements: true,
                    technicalScore: true,
                    communicationScore: true
                }
            }
        },
        omit: {
            additionalPrompt: true,
            techStack: true
        }
    });

    if (interviews.length === 0) {
        res.status(200).json({ message: "No interviews found", success: true });
        return;
    }
    const interviewsWithAdditionalData = await Promise.all(
        interviews.map(async (i) => {
            const type: 'past' | 'upcoming' = i.startTime! > now ? 'upcoming' : 'past'

            let score: number | null = null
            if (i.status === 'completed' && i.summary) {
                score = await calculateFinalInterviewScore(i.summary as summary)
            }
            return {
                ...i,
                type,
                score
            }
        })
    )
    res
        .status(200)
        .json(
            {
                interviews: interviewsWithAdditionalData,
                success: true,
                message: "Interviews fetched"
            }
        );
})

export const createInterview = asyncHandler(async(req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        throw new CustomError(401, "Unauthorized")
    }
    const { jobTitle, techStack, experienceLevel, callDuration, additionalPrompt, schedule, scheduledDate } = req.body as {
        jobTitle: string;
        techStack: string;
        experienceLevel: 'fresher' | 'mid' | 'lead' | 'senior';
        callDuration: number;
        additionalPrompt?: string;
        schedule: 'now' | 'future';
        scheduledDate?: Date;
    }
    if ([jobTitle, techStack, experienceLevel, callDuration, schedule].some(field => !field)) {
        throw new CustomError(400, "All fields are required")
    }
    if (schedule === 'now') {
        // Logic to schedule the interview immediately
        console.log("Scheduling interview now");
    } else {

        if (!scheduledDate) {
            throw new CustomError(400, "Scheduled date is required for later interviews")
        }
        const interviewStartTime = new Date(scheduledDate)
        const interviewEndTime = new Date(interviewStartTime.getTime() + 7 * 60 * 1000)
        await prisma.interview.create({
            data: {
                jobTitle,
                techStack,
                expLevel: experienceLevel,
                durationMinutes: callDuration,
                startTime: scheduledDate,
                endTime: interviewEndTime,
                additionalPrompt,
                status: 'scheduled',
                userId: req.user.id as string
            }
        })
        res.status(201).json({ message: "Interview scheduled successfully", success: true });
        return;
    }
})