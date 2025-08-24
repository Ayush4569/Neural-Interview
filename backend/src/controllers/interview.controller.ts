import { Response, Request } from "express";
import { prisma } from "../database/db";

const createInterview = async (req: Request, res: Response): Promise<void> => {
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
        res.status(400).json({ error: "All fields are required" });
        return;
    }
    try {
        if (schedule === 'now') {
            // Logic to schedule the interview immediately
            console.log("Scheduling interview now");
        } else {

            if (!scheduledDate) {
                res.status(400).json({ error: "Scheduled date is required for later interviews" });
                return;
            }
            const createdInterview = await prisma.interview.create({
                data: {
                    jobTitle,
                    techStack,
                    expLevel: experienceLevel,
                    durationMinutes: callDuration,
                    startTime: scheduledDate,
                    additionalPrompt,
                    status: 'scheduled',
                    userId: ''
                }
            })
        }
        res.status(201).json({ message: "Interview created successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create interview" });
    }
}