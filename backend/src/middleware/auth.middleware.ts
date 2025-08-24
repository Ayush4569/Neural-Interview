import { Response, Request, NextFunction } from 'express';
import { decode } from 'next-auth/jwt';

export async function verifyNextAuthToken(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
             res.status(401).json({ error: 'Missing or invalid authorization header',success: false });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = await decode({
            token: token,
            secret: process.env.JWT_SECRET as string,
        });

        if (!decoded) {
            res.status(401).json({ error: 'Invalid or expired token',success: false });
            return;
        }

        req.user = decoded as {
            id: string;
            name: string;
            email: string;
            image: string;
        }

        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Token verification failed',success: false });
        return;
    }
}
