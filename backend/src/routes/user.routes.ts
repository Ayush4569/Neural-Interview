import { getUser, loginUser, registerUser,refreshAccessToken,logoutUser } from "../controllers/user.controller";
import { Router } from "express";
import { validateBody } from "../middleware/zod.middleware";
import { loginSchema, registerSchema } from "../schemas/index";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/",authMiddleware,getUser)
router.post("/signup", validateBody(registerSchema), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.post("/logout", authMiddleware, logoutUser)
router.post("/refresh-token", refreshAccessToken)

export default router;