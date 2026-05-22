import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

export const getDeepgramToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
        throw new ErrorResponse("Deepgram API key not configured", 500);
    }
    

    const projectsRes = await fetch("https://api.deepgram.com/v1/projects", {
        headers: { "Authorization": `Token ${deepgramApiKey}` }
    });
    
    
    if (!projectsRes.ok) {
        throw new ErrorResponse("Failed to find Deepgram project", 500);
    }

    const projectsData = await projectsRes.json();
    
    if (!projectsData?.projects?.length) {
        throw new ErrorResponse("No Deepgram projects found", 500);
    }

    const projectId = projectsData.projects[0].project_id;
    
    const keyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
        method: "POST",
        headers: { 
            "Authorization": `Token ${deepgramApiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            comment: 'Temporary STT Token',
            scopes: ['usage:write'],
            time_to_live_in_seconds: 3600
        })
    });
    
    if (!keyRes.ok) {
        throw new ErrorResponse("Failed to generate Deepgram token", 500);
    }

    const keyData = await keyRes.json();

    return res.status(200).json({
        success: true,
        token: keyData.key,
    });
});


