import { type Request, type Response, type NextFunction } from "express";
import { type IUser,User } from "../models/User.js";
import ErrorResponse from "../utils/errorResponse.js";
import {
  accessTokenOptions,
  refreshTokenOptions,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../middleware/authMiddleware.js";

const sendTokenResponse = async (
  user: IUser,
  statusCode: number,
  res: Response,
  device: string,
) => {
  const accessToken = generateAccessToken(user._id, user.isGhost);
  const refreshToken = generateRefreshToken(user._id, user.isGhost);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  user.refreshTokens.push({
    token: hashedRefreshToken,
    createdAt: new Date(),
    device: device ?? "unknown",
  });
  await user.save();

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json({
      success: true,
      message: "User logged in successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isGhost: user.isGhost,
        interviewCount: user.interviewCount,
      },
    });
};

export const ghostLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create({
      isGhost: true,
      interviewCount: 0,
    });
    await sendTokenResponse(user, 201, res,req.headers["user-agent"] || "unknown");
  },
);

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password,device } = req.body;
    if([email, password,device].some(field => !field)) {
      throw new ErrorResponse("Please provide an email and password", 400);
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ErrorResponse("Email already in use", 400);
    }

    const user = await User.create({
      email,
      password,
      isGhost: false,
    });

    await sendTokenResponse(user, 201, res,device);
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password ,device} = req.body;

    if ([email, password,device].some(field => !field)) {
      throw new ErrorResponse("Please provide an email and password", 400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ErrorResponse("User not found", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse("Invalid password", 401);
    }

    await sendTokenResponse(user, 200, res,device);
  },
);

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (incomingRefreshToken) {
      try {
        const decoded = jwt.verify(
          incomingRefreshToken,
          process.env.JWT_REFRESH_SECRET!,
          { ignoreExpiration: true },
        ) as JwtPayload;
        const user = await User.findById(decoded.id);

        if (user) {
          const activeTokens = [];
          for (const refreshToken of user.refreshTokens) {
            const isMatch = await bcrypt.compare(incomingRefreshToken, refreshToken.token);
            if (!isMatch) activeTokens.push(refreshToken);
          }
          user.refreshTokens = activeTokens;
          await user.save();
        }
      } catch (error) {
        res.clearCookie("accessToken", accessTokenOptions);
        res.clearCookie("refreshToken", refreshTokenOptions);
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }
    }

    res.clearCookie("accessToken", accessTokenOptions);
    res.clearCookie("refreshToken", refreshTokenOptions);

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  },
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) {
      throw new ErrorResponse("No user found with this id", 404);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse("No user found with this id", 404);
    }
    res.status(200).json({
      success: true,
      user : {
        _id: user._id,
        username: user.username,
        email: user.email,
        isGhost: user.isGhost,
        interviewCount: user.interviewCount,
      },
    });
  },
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken)
      throw new ErrorResponse("Unauthorized request", 401);

    try {
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as JwtPayload;
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new ErrorResponse("Invalid refresh token", 401);
      }

      let tokenIndex = -1;
      for (let i = 0; i < user.refreshTokens.length; i++) {
        const isMatch = await bcrypt.compare(
          incomingRefreshToken,
          user.refreshTokens[i]!.token,
        );
        if (isMatch) {
          tokenIndex = i;
          break;
        }
      }

      if (tokenIndex === -1) {
        user.refreshTokens = [];
        await user.save();

        throw new ErrorResponse("Possible token reuse detected", 401);
      }

      user.refreshTokens.splice(tokenIndex, 1);

      const newAccessToken = generateAccessToken(user._id, user.isGhost);
      const newRefreshToken = generateRefreshToken(user._id, user.isGhost);

      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      user.refreshTokens.push({
        token: hashedRefreshToken,
        createdAt: new Date(),
        device: req.headers["user-agent"] || "unknown",
      });

      await user.save();

      res
        .status(200)
        .cookie("accessToken", newAccessToken, accessTokenOptions)
        .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
        .json({
          success: true,
        });
    } catch (error) {
      if (error instanceof ErrorResponse) {
        throw error;
      }
      throw new ErrorResponse("Invalid refresh token", 401);
    }
  },
);
