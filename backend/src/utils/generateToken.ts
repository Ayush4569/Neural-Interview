import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type { CookieOptions } from "express";

export const generateAccessToken = (id: Types.ObjectId, isGhost: boolean) => {
  return jwt.sign({ id, isGhost }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (id: Types.ObjectId, isGhost: boolean) => {
  return jwt.sign({ id, isGhost }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
  });
};


export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
};