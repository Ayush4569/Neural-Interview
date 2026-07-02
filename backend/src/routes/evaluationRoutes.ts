import {Router} from 'express';
import { deleteEvaluation, getAllEvaluations, getEvaluation } from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id', protect,getEvaluation);
router.delete('/:id', protect,deleteEvaluation)
router.get("/getAll", protect, getAllEvaluations);

export default router;