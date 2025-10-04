import { Response, Request } from "express";
import { prisma } from "../database/db";
import { assistantLockHash, calculateFinalInterviewScore, canonicalizeAssistant, generateInterviewConfig, mintVapiWebToken } from "../utils/helpers";
import { summary } from "../types/interview";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/apiError";
import crypto from 'crypto'
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
            additionalPrompt: true
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

export const getInterviewById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        throw new CustomError(401, "Unauthorized")
    }
    const { interviewId } = req.params;
    if (!interviewId) {
        throw new CustomError(400, "Interview ID is required")
    }
    const interview = await prisma.interview.findFirst({
        where: {
            id: interviewId,
            userId: req.user.id as string,
        }
    });
    if (!interview) {
        throw new CustomError(404, "No such interview found")
    }
    res.status(200).json({ interview, success: true, message: "Interview fetched successfully" })
    return;
});

export const createInterview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        throw new CustomError(401, "Unauthorized")
    }
    const { jobTitle, techStack, experienceLevel, callDuration, additionalPrompt, schedule, scheduledDate } = req.body;
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
        const interviewEndTime = new Date(interviewStartTime.getTime() + 7 * 60 * 1000) // 
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

export const startInterview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        throw new CustomError(401, "Unauthorized")
    }

    const { interviewId } = req.params;


    const interview = await prisma.interview.findFirst({
        where: { id: interviewId, userId: req.user.id, status: 'scheduled' }
    });

    if (!interview) {
        throw new CustomError(404, "No such interview");
    }

    if (!interview.startTime) {
        throw new CustomError(400, "Interview is not scheduled yet");
    }

    const now = new Date();
    const scheduled = new Date(interview.startTime);
    const allowedJoinTime = new Date(scheduled.getTime() - 5 * 60 * 1000);
    const expireTime = new Date(scheduled.getTime() + 30 * 60 * 1000);

    if (now < allowedJoinTime) {
        const mins = Math.ceil((allowedJoinTime.getTime() - now.getTime()) / (1000 * 60));
        throw new CustomError(400, `Interview will be available to join in ${mins} minute(s)`);
    }

    if (now > expireTime) {
        await prisma.interview.update({
            where: { id: interview.id },
            data: { status: "expired" },
        });
        throw new CustomError(400, "Interview has expired");
    }

    const config = generateInterviewConfig(interview, req.user.id)
    const canonical = canonicalizeAssistant(config.assistant)
    const assistantLock = assistantLockHash(canonical)
    config.variableValues['assistantLock'] = assistantLock
    const jti = crypto.randomUUID()
    const token = mintVapiWebToken(
        interviewId,
        req.user.id,
        600,
        assistantLock,
        jti
    );

    await prisma.joinToken.create({
        data: {
            id: jti,
            interviewId: interview.id,
            userId: req.user.id,
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 10 * 1000),
            assistantLock,
            serverNonce: config.variableValues.serverNonce,
        }
    })

    return res.status(200).json({
        success: true,
        message: "Session started",
        config,
        token,
    });
});

export const vapiWebhook = async (req: Request, res: Response) => {
    const rawBody = req.body
    const signature = req.headers['x-vapi-signature'] as string
    const expectedSignature = crypto.createHmac('sha256', process.env.VAPI_KEY!).update(rawBody).digest('hex')

    if (expectedSignature !== signature) {
        throw new CustomError(400, "Invalid signature")
    }

    try {
        const event = JSON.parse(rawBody.toString());
        const { type, status, call } = event
        console.log('event',event);
        const vars = call?.variables || call?.variableValues || {};
        console.log("vars",vars);
        const interviewId = vars.interviewId as string | undefined;
        const userId = vars.userId as string | undefined;
        const serverNonce = vars.serverNonce as string | undefined;
        const assistantLockFromClient = vars.assistantLock as string | undefined;
        const vapiCallId = call?.id as string | undefined;


    } catch (error) {
        console.error("Webhook  failed", error);
        throw new CustomError(500, 'Internal server error')
    }
}
