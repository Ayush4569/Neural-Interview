import { Response, Request, NextFunction } from 'express';

export async function verifyNextAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
       
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Token verification failed', success: false });
        return;
    }
}
