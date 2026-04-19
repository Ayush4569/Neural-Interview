import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

interface JwtPayload {
  id: string;
  isGhost: boolean;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export const checkInterviewLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user.isGhost && user.interviewCount >= 2) {
      return res.status(403).json({ success: false, message: 'Ghost user limit reached. Please register to continue.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};
