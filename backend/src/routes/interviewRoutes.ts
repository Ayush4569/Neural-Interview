import express from 'express';
import {
  createInterview,
  startInterview,
  respondToInterview,
  completeInterview,
  getUserInterviews,
  getEvaluation
} from '../controllers/interviewController.js';
import { protect, checkInterviewLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, checkInterviewLimit, createInterview);
router.get('/history', protect, getUserInterviews);
router.get('/session/:id/report', protect, getEvaluation);
router.post('/session/:id/begin', protect, startInterview);
router.post('/session/:id/interact', protect, respondToInterview);
router.post('/session/:id/terminate', protect, completeInterview);

export default router;
