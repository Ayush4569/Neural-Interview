import express from 'express';
import { createInterview, getInterview, getHistory, startInterview, submitAnswer,endInterview } from '../controllers/interviewController.js';
import { getDeepgramToken } from '../controllers/voiceController.js';
import { getEvaluation } from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInterview);
router.get('/history', protect, getHistory);
router.post('/deepgram-token', protect, getDeepgramToken);
router.get('/session/:id/report', protect, getEvaluation);
router.get('/:id', protect, getInterview);
router.post('/:id/start', protect, startInterview);
router.post('/:id/submit', protect, submitAnswer);
router.post('/:id/end', protect, endInterview);

export default router;
