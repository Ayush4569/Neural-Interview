import { Router } from "express";
import { createInterview ,getInterviews} from "../controllers/interview.controller";
import { verifyNextAuthToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/",verifyNextAuthToken,createInterview)
router.get("/",verifyNextAuthToken,getInterviews)
export default router;