import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface JwtPayload {
  id: string;
  isGhost: boolean;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ErrorResponse('Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET !) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ErrorResponse('No user found with this id', 404);
    }

   req.user = decoded;
    next();
  } catch (error) {
    throw new ErrorResponse('Not authorized to access this route', 401);
  }
});

export const checkInterviewLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decodedUser = req.user!
    const user = await User.findById(decodedUser.id);
    if (!user) {
      throw new ErrorResponse('No user found with this id', 404);
    }
    if (user.isGhost && user.interviewCount >= 2) {
      return res.status(403).json({ success: false, message: 'Ghost user limit reached. Please register to continue.' });
    }
    next();
  } catch (error) {
    next(error);
  }
};
