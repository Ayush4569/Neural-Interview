import { Router } from "express";
import { createInterview } from "../controllers/interview.controller";
import { verifyNextAuthToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/",verifyNextAuthToken,createInterview)

export default router;