"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterviewSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6, { message: "Password must be 6 characters" })
});
exports.signupSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(2, { message: "Username must be at least 2 characters" })
        .max(20, { message: "Username must be less than 15 characters" })
        .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters'),
    email: zod_1.z.email(),
    password: zod_1.z.string().min(6, { message: "Password must be 6 characters" }),
    avatarUrl: zod_1.z.instanceof(File).optional()
});
exports.createInterviewSchema = zod_1.z.object({
    jobTitle: zod_1.z.string().min(2, { message: "Title must be at least 2 characters" }).max(50, { message: "Title must be less than 50 characters" }),
    techStack: zod_1.z.string().max(100, { message: "Tech stack must be less than 100 characters" }),
    experienceLevel: zod_1.z.enum(["fresher", "junior", "mid", "senior", "lead"]),
    callDuration: zod_1.z.int().min(1, { message: "Duration must be at least 1 minute" }).max(60, { message: "Duration must be less than 60 minutes" }),
    additionalPrompt: zod_1.z.string().max(100, { message: "Prompt must be less than 100 characters" }).optional(),
    scheduledDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format"
    }),
});
