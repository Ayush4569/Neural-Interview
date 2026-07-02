import { Router } from "express";
import { synthesizeSpeech } from "../controllers/voiceController.js";

const router = Router();

router.post("/synthesize",synthesizeSpeech) 

export default router;