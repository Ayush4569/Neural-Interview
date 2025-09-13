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

