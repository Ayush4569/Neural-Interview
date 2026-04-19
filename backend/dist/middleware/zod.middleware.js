"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.issues.map(({ path, message }) => ({
                field: path.join(""),
                message
            }));
            res.status(400).json({
                success: false,
                message: "Invalid input data! Please check your input.",
                errors
            });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
