import express from 'express';
import { ghostLogin, login, register, logout, getProfile, refreshToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/guest', ghostLogin);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/logout', logout);
router.get('/profile', protect, getProfile);
router.post('/auth/refresh-token', refreshToken);

export default router;
