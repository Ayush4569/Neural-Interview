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

export const interviewFormSchema = z.object({
    jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
    techStack: z.string().min(2, "Tech stack is required"),
    experienceLevel: z.string().min(1, "Experience level is required"),
    callDuration: z.number().min(5).max(60),
    additionalPrompt: z.string().optional(),
    schedule: z.enum(["now", "future"]),
    scheduledDate: z.date().optional(),
});
