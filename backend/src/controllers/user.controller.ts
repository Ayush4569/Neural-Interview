import { prisma } from "../database/db";
import { Response, Request } from "express";
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookies";
import { decodeRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import { hashPassword } from "../utils/helpers";
import bcrypt from "bcrypt"
import { uploadToCloudinary } from "../service/cloudinary.service";
import { signupSchema } from "../schemas";
import z from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { CustomError } from "../utils/apiError";


export const getUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new CustomError(401, "Unauthorized")
    };
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id as string
        },
        select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
        }
    });

    if (!user) {
        throw new CustomError(404, "User not found")
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
})

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, avatarUrl } = req.body
    
    const isExistingUser = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            id: true
        }
    });
    if (isExistingUser) {
        throw new CustomError(400, "User already exist")
    }
    let avatarUrlFinal: string | undefined = undefined;
    if (req.file) {
        try {
            avatarUrlFinal = await uploadToCloudinary(req.file?.path!);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: (error as Error).message || "Error uploading image",
            });
        }
    }
    const hashedPassword = await hashPassword(password)
    const userObject = {
        email,
        username,
        password: hashedPassword,
        ...(avatarUrlFinal ? { avatarUrl: avatarUrlFinal } : {})
    };
    const newUser = await prisma.user.create({
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
    const accessToken = generateAccessToken(newUser)
    res.
        status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });
    return
})

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
        where: {
            email
        },
    })
    if (!user) {
        throw new CustomError(401,"User not exist!")
    }
    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );
    if (!isPasswordCorrect) {
        throw new CustomError(401,"Invalid password")
    }
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken
        }
    })
    res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl ?? ""
            },
            message: "Login successful",
        })
    return;
})

export const refreshAccessToken = async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new CustomError(401,"Unauthorized pls login to generate refreshToken")
    }
    const decodedUser = decodeRefreshToken(incomingRefreshToken);
    if (!decodedUser) {
        throw new CustomError(401,"Invalid refresh token")
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decodedUser.id
        }
    });

    if (!user) {
        res.status(401).clearCookie("refreshToken", incomingRefreshToken).json({
            success: false,
            message: "User not found",
        })
        return;
    }
    if (incomingRefreshToken !== user.refreshToken) {
        res.
            status(401).
            clearCookie("refreshToken", incomingRefreshToken).
            json({
                success: false,
                message: "Token mismatch, please login again",
            })
        return;
    }

    const accessToken = generateAccessToken(user);
    res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .json(
            {
                success: true,
                message: "Access token refreshed successfully",
            }
        );
    return;
}

export const logoutUser = async (req: Request, res: Response) => {
        const user = req.user;
        if (!user) {
            throw new CustomError(401,"Unauthorized")
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: null,
            }
        });
        res
            .status(200)
            .clearCookie("accessToken", accessTokenOptions)
            .clearCookie("refreshToken", refreshTokenOptions)
            .json({
                success: true,
                message: "Logout successful",
            });
        return;
}