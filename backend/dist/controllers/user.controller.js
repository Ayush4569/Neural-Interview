"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = exports.getUser = void 0;
const db_1 = require("../database/db");
const cookies_1 = require("../utils/cookies");
const generateTokens_1 = require("../utils/generateTokens");
const helpers_1 = require("../utils/helpers");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_service_1 = require("../service/cloudinary.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiError_1 = require("../utils/apiError");
exports.getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    ;
    const user = await db_1.prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
        }
    });
    if (!user) {
        throw new apiError_1.CustomError(404, "User not found");
    }
    res
        .status(200)
        .json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl ?? "",
        },
        message: "User fetched successfully",
    });
    return;
});
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username, email, password } = req.body;
    const isExistingUser = await db_1.prisma.user.findUnique({
        where: {
            email
        },
        select: {
            id: true
        }
    });
    if (isExistingUser) {
        throw new apiError_1.CustomError(400, "User already exist");
    }
    let avatarUrlFinal = undefined;
    if (req.file) {
        try {
            avatarUrlFinal = await (0, cloudinary_service_1.uploadToCloudinary)(req.file?.path);
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Error uploading image",
            });
        }
    }
    const hashedPassword = await (0, helpers_1.hashPassword)(password);
    const userObject = {
        email,
        username,
        password: hashedPassword,
        ...(avatarUrlFinal ? { avatarUrl: avatarUrlFinal } : {})
    };
    const newUser = await db_1.prisma.user.create({
        data: {
            ...userObject
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
        }
    });
    const accessToken = (0, generateTokens_1.generateAccessToken)(newUser);
    res.
        status(201)
        .cookie("accessToken", accessToken, cookies_1.accessTokenOptions)
        .json({
        success: true,
        message: "User registered successfully",
        user: newUser
    });
    return;
});
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await db_1.prisma.user.findFirst({
        where: {
            email
        },
    });
    if (!user) {
        throw new apiError_1.CustomError(401, "User not exist!");
    }
    const isPasswordCorrect = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new apiError_1.CustomError(401, "Invalid password");
    }
    const accessToken = (0, generateTokens_1.generateAccessToken)(user);
    const refreshToken = (0, generateTokens_1.generateRefreshToken)(user);
    await db_1.prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken
        }
    });
    res
        .status(200)
        .cookie("accessToken", accessToken, cookies_1.accessTokenOptions)
        .cookie("refreshToken", refreshToken, cookies_1.refreshTokenOptions)
        .json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl ?? ""
        },
        message: "Login successful",
    });
    return;
});
const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError_1.CustomError(401, "Unauthorized pls login to generate refreshToken");
    }
    const decodedUser = (0, generateTokens_1.decodeRefreshToken)(incomingRefreshToken);
    if (!decodedUser) {
        throw new apiError_1.CustomError(401, "Invalid refresh token");
    }
    const user = await db_1.prisma.user.findUnique({
        where: {
            id: decodedUser.id
        }
    });
    if (!user) {
        res.status(401).clearCookie("refreshToken", incomingRefreshToken).json({
            success: false,
            message: "User not found",
        });
        return;
    }
    if (incomingRefreshToken !== user.refreshToken) {
        res.
            status(401).
            clearCookie("refreshToken", incomingRefreshToken).
            json({
            success: false,
            message: "Token mismatch, please login again",
        });
        return;
    }
    const accessToken = (0, generateTokens_1.generateAccessToken)(user);
    res
        .status(200)
        .cookie("accessToken", accessToken, cookies_1.accessTokenOptions)
        .json({
        success: true,
        message: "Access token refreshed successfully",
    });
    return;
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    await db_1.prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: null,
        }
    });
    res
        .status(200)
        .clearCookie("accessToken", cookies_1.accessTokenOptions)
        .clearCookie("refreshToken", cookies_1.refreshTokenOptions)
        .json({
        success: true,
        message: "Logout successful",
    });
    return;
};
exports.logoutUser = logoutUser;
