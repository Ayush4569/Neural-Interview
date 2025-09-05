import { ZodTypeAny, infer as ZodInfer } from "zod";
import { Request, Response, NextFunction } from "express";


export const validateBody = <T extends ZodTypeAny>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(({ path, message }) => ({
                field: path.join(""), 
                message
            }))
            res.status(400).json({
                success: false,
                message: "Invalid input data! Please check your input.",
                errors
            });
            return
        }
        req.body = result.data as ZodInfer<T>
        next();
    }
}