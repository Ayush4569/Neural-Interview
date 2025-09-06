import { Router } from "express";
import { createInterview ,getInterviews} from "../controllers/interview.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/",authMiddleware,getInterviews)
router.post("/",authMiddleware,createInterview)
export default router;