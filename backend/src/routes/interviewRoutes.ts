import express from 'express';
import {createInterview} from '../controllers/interviewController.js';
import { protect, checkInterviewLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createInterview);


export default router;
