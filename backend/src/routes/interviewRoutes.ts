import express from 'express';
import { createInterview, getInterview, submitAnswer,getInterviewState  } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInterview);
router.post("/submit-answer",protect, submitAnswer);
router.get('/:id/state',protect,getInterviewState)
router.get('/:id', protect, getInterview);

export default router;
