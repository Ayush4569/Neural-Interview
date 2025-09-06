import { loginUser, registerUser } from "../controllers/user.controller";
import { Router } from "express";
import { validateBody } from "../middleware/zod.middleware";
import { loginSchema, registerSchema } from "../schemas/index";

const router = Router();

router.post("/signup", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);

export default router;