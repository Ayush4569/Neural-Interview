import { z } from "zod"
export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6, { message: "Password must be 6 characters" })
})

export const signupSchema = z.object({
    username: z.string()
        .min(2, { message: "Username must be at least 2 characters" })
        .max(20, { message: "Username must be less than 15 characters" })
        .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters')
    ,
    email: z.email(),
    password: z.string().min(6, { message: "Password must be 6 characters" }),
    avatarUrl: z.instanceof(File).optional()
})

export const createInterviewSchema = z.object({
    jobTitle: z.string().min(2, { message: "Title must be at least 2 characters" }).max(50, { message: "Title must be less than 50 characters" }),
    techStack: z.string().max(100, { message: "Tech stack must be less than 100 characters" }),
    experienceLevel : z.enum(["fresher", "junior", "mid", "senior", "lead"]),
    callDuration:z.int().min(1,{message:"Duration must be at least 1 minute"}).max(60,{message:"Duration must be less than 60 minutes"}),
    additionalPrompt: z.string().max(100, { message: "Prompt must be less than 100 characters" }).optional(),
    scheduledDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format"
    }),
})

