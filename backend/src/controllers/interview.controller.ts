import { Response, Request } from "express";
import { prisma } from "../database/db";
import { calculateFinalInterviewScore } from "../utils/helpers";
import { summary } from "../types/interview";

export const getInterviews = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).json({ error: "Unauthorized", success: false });
        return;
    }
    const now = new Date()
    try {
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
        console.log(`Found ${interviews} for user ${req.user.id}`);

        if (interviews.length === 0) {
            res.status(400).json({ message: "No interviews found", success: false });
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
                    message:"Interviews fetched"
                }
            );
        return;
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ error: "Failed to fetch interviews", success: false });
    }
}

export const createInterview = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).json({ error: "Unauthorized", success: false });
        return;
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
        res.status(400).json({ error: "All fields are required", success: false });
        return;
    }
    try {
        if (schedule === 'now') {
            // Logic to schedule the interview immediately
            console.log("Scheduling interview now");
        } else {

            if (!scheduledDate) {
                res.status(400).json({ error: "Scheduled date is required for later interviews", success: false });
                return;
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

    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ error: "Failed to create interview", success: false });
        return;
    }
}