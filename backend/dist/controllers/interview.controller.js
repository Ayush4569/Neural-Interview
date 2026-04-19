"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vapiWebhook = exports.startInterview = exports.createInterview = exports.getInterviewById = exports.getInterviews = void 0;
const db_1 = require("../database/db");
const helpers_1 = require("../utils/helpers");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
const crypto_1 = __importDefault(require("crypto"));
const schemas_1 = require("../schemas");
exports.getInterviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    const now = new Date();
    const interviews = await db_1.prisma.interview.findMany({
        where: {
            userId: req.user.id
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
    const interviewsWithAdditionalData = await Promise.all(interviews.map(async (i) => {
        let type;
        if (i.endTime && i.endTime < now) {
            type = 'past';
        }
        else {
            type = 'upcoming';
        }
        let score = null;
        if (i.status === 'completed' && i.summary) {
            score = await (0, helpers_1.calculateFinalInterviewScore)(i.summary);
        }
        return {
            ...i,
            type,
            score
        };
    }));
    res
        .status(200)
        .json({
        interviews: interviewsWithAdditionalData,
        success: true,
        message: "Interviews fetched"
    });
});
exports.getInterviewById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    const { interviewId } = req.params;
    if (!interviewId) {
        throw new apiError_1.CustomError(400, "Interview ID is required");
    }
    const interview = await db_1.prisma.interview.findFirst({
        where: {
            id: interviewId,
            userId: req.user.id,
        }
    });
    if (!interview) {
        throw new apiError_1.CustomError(404, "No such interview found");
    }
    res.status(200).json({ interview, success: true, message: "Interview fetched successfully" });
    return;
});
exports.createInterview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    const { jobTitle, techStack, experienceLevel, callDuration, additionalPrompt, schedule, scheduledDate } = req.body;
    const parseResult = await schemas_1.createInterviewSchema.safeParseAsync(req.body);
    if (!parseResult.success) {
        const formatted = parseResult.error.format();
        const message = Object.values(formatted).map((err) => err?._errors).flat().filter(Boolean).join(", ");
        throw new apiError_1.CustomError(400, message || "Invalid input");
    }
    if (schedule === 'now') {
        // Logic to schedule the interview immediately
        console.log("Scheduling interview now");
    }
    else {
        const interviewStartTime = new Date(scheduledDate);
        const interviewEndTime = new Date(interviewStartTime.getTime() + callDuration * 60 * 1000 + 7 * 60 * 1000);
        await db_1.prisma.interview.create({
            data: {
                jobTitle,
                techStack: (0, helpers_1.normalizeTechStack)(techStack),
                expLevel: experienceLevel,
                durationMinutes: callDuration,
                startTime: interviewStartTime,
                endTime: interviewEndTime,
                additionalPrompt,
                status: 'scheduled',
                userId: req.user.id
            }
        });
        res.status(201).json({ message: "Interview scheduled successfully", success: true });
        return;
    }
});
exports.startInterview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    const { interviewId } = req.params;
    const interview = await db_1.prisma.interview.findFirst({
        where: { id: interviewId, userId: req.user.id }
    });
    if (!interview) {
        throw new apiError_1.CustomError(404, "Interview not found");
    }
    if (!interview.startTime) {
        throw new apiError_1.CustomError(400, "Interview is not scheduled yet");
    }
    const now = new Date();
    const scheduled = new Date(interview.startTime);
    const allowedJoinTime = new Date(scheduled.getTime() - 5 * 60 * 1000);
    const expireTime = new Date(scheduled.getTime() + 30 * 60 * 1000);
    if (now < allowedJoinTime) {
        const mins = Math.ceil((allowedJoinTime.getTime() - now.getTime()) / (1000 * 60));
        throw new apiError_1.CustomError(400, `Interview will be available to join in ${mins} minute(s)`);
    }
    if (now > expireTime) {
        await db_1.prisma.interview.update({
            where: { id: interview.id },
            data: { status: "expired" },
        });
        throw new apiError_1.CustomError(400, "Interview has expired");
    }
    const active = await db_1.prisma.callSession.findFirst({
        where: { interviewId: interview.id, status: 'active' },
    });
    if (active)
        throw new apiError_1.CustomError(409, 'ALREADY IN PROGRESS');
    const config = (0, helpers_1.generateInterviewConfig)(interview, req.user.id);
    const canonical = (0, helpers_1.canonicalizeAssistant)(config.assistant);
    const assistantLock = (0, helpers_1.assistantLockHash)(canonical);
    config.variableValues['assistantLock'] = assistantLock;
    const jti = crypto_1.default.randomUUID();
    const token = (0, helpers_1.mintVapiWebToken)(interviewId, req.user.id, 600, assistantLock, jti);
    await db_1.prisma.joinToken.create({
        data: {
            id: jti,
            interviewId: interview.id,
            userId: req.user.id,
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 10 * 1000),
            assistantLock,
            serverNonce: config.variableValues.serverNonce,
        }
    });
    return res.status(200).json({
        success: true,
        message: "Session started",
        config,
        token,
    });
});
const vapiWebhook = async (req, res) => {
    const rawBody = req.body;
    const signature = req.headers['x-vapi-signature'];
    const expectedSignature = crypto_1.default.createHmac('sha256', process.env.VAPI_KEY).update(rawBody).digest('hex');
    if (expectedSignature !== signature) {
        throw new apiError_1.CustomError(400, "Invalid signature");
    }
    try {
        const event = JSON.parse(rawBody.toString());
        const { type, status, call } = event;
        console.log('event', event);
        const vars = call?.variables || call?.variableValues || {};
        console.log("vars", vars);
        const interviewId = vars.interviewId;
        const userId = vars.userId;
        const serverNonce = vars.serverNonce;
        const assistantLockFromClient = vars.assistantLock;
        const vapiCallId = call?.id;
        if (!interviewId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
            // end the call on frontend by emitting a ws event in future like eg socket.emit('end-call',{reason:"invalid-token"})
        }
        const token = await db_1.prisma.joinToken.findFirst({
            where: {
                interviewId,
                userId,
                serverNonce,
                assistantLock: assistantLockFromClient,
                revoked: false
            }
        });
        if (type === "status-update" && status === 'in-progress' && vapiCallId) {
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "No issued token"
                });
            }
            const now = new Date();
            if (token.expiresAt < now) {
                return res.status(400).json({
                    success: false,
                    message: "Token expired, kindly recreate interview"
                });
            }
            else if (token.consumedCount >= token.maxUses) {
                return res.status(400).json({
                    success: false,
                    message: "Token already used"
                });
            }
            else if (token.assistantLock !== assistantLockFromClient) {
                return res.status(400).json({
                    success: false,
                    message: "Malicious token !"
                });
            }
            await db_1.prisma.joinToken.update({
                where: {
                    id: token.id
                },
                data: {
                    consumedCount: { increment: 1 },
                    firstConsumedCallId: token.firstConsumedCallId ?? vapiCallId
                }
            });
            const existing = await db_1.prisma.callSession.findUnique({ where: { interviewId } });
            if (!existing) {
                await db_1.prisma.callSession.create({
                    data: {
                        interviewId,
                        vapiCallId,
                        status: 'active',
                        startedAt: now,
                        lastSeenAt: now,
                    }
                });
            }
            else {
                await db_1.prisma.callSession.update({
                    where: { interviewId },
                    data: {
                        vapiCallId: existing.vapiCallId ?? vapiCallId,
                        status: 'active',
                        lastSeenAt: now,
                    },
                });
            }
        }
        if (type === 'status-update' && status === 'in-progress') {
            const cs = await db_1.prisma.callSession.findUnique({ where: { interviewId } });
            if (cs?.lastSeenAt) {
                const now = new Date();
                const deltaSec = Math.max(0, Math.floor((now.getTime() - cs.lastSeenAt.getTime()) / 1000));
                await db_1.prisma.callSession.update({
                    where: { interviewId },
                    data: {
                        totalSecondsElapsed: (cs.totalSecondsElapsed ?? 0) + deltaSec,
                        lastSeenAt: now,
                    },
                });
            }
        }
        if (type === 'status-update' && status === 'ended') {
            const cs = await db_1.prisma.callSession.findUnique({ where: { interviewId } });
            if (cs) {
                const now = new Date();
                const deltaSec = cs.lastSeenAt ? Math.max(0, Math.floor((now.getTime() - cs.lastSeenAt.getTime()) / 1000)) : 0;
                await db_1.prisma.callSession.update({
                    where: { interviewId },
                    data: {
                        totalSecondsElapsed: (cs.totalSecondsElapsed ?? 0) + deltaSec,
                        lastSeenAt: now,
                        endedAt: now,
                        status: 'completed',
                    },
                });
            }
        }
        return res.status(200).json({ success: true, message: "ok" });
    }
    catch (error) {
        console.error("Webhook failed", error);
        throw new apiError_1.CustomError(500, 'Internal server error');
    }
};
exports.vapiWebhook = vapiWebhook;
