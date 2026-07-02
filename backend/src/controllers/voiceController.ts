import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import { DeepgramService } from '../services/deepgram.service.js';

export const synthesizeSpeech = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { text } = req.body;
    if (!text.trim()) {
        return next(new ErrorResponse("Text is required", 400));
    }

    const deepgramService = new DeepgramService();
    const { buffer, error, message } = await deepgramService.getAudio(text);
    if (error) {
        throw new ErrorResponse(message, 500);
    }

    const audioBuffer = buffer as Buffer;
    res.setHeader("Content-Type", "audio/wav");
    return res.send(audioBuffer);

})

