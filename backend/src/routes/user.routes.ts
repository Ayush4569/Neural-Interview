import { getUser, loginUser, registerUser, refreshAccessToken, logoutUser } from "../controllers/user.controller";
import { Router } from "express";
import { validateBody } from "../middleware/zod.middleware";
import { loginSchema, signupSchema } from "../schemas/index";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../service/multer.service";

const router = Router();

router.get("/", authMiddleware, getUser)
router.post("/signup", upload.single("avatarUrl"), registerUser);
router.post("/login", validateBody(loginSchema), loginUser);
router.post("/logout", authMiddleware, logoutUser)
router.post("/refresh-token", refreshAccessToken)

export default router;