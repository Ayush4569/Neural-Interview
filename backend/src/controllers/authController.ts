import { type Request, type Response, type NextFunction } from 'express';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import generateToken from '../utils/generateToken.js';

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id, user.isGhost);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
  };

  res.status(statusCode).cookie('jwt', token, options).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      isGhost: user.isGhost,
      interviewCount: user.interviewCount,
    },
  });
};

export const ghostLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.create({
      isGhost: true,
      interviewCount: 0,
    });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }

    const user = await User.create({
      email,
      password,
      isGhost: false,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field)) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
