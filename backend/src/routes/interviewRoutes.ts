import express from 'express';
import {createInterview, getInterview,getHistory} from '../controllers/interviewController.js';
import { protect, checkInterviewLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInterview);
router.get('/history', protect,getHistory);
router.get('/:id', protect,getInterview);

export default router;
