import { Router } from "express";
import { createInterview ,getInterviews, startInterview,getInterviewById} from "../controllers/interview.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/",authMiddleware,getInterviews)
router.get("/:interviewId",authMiddleware,getInterviewById)

router.post("/",authMiddleware,createInterview)
router.get("/start/:interviewId",authMiddleware,startInterview)
export default router;