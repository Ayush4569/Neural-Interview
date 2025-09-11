import { prisma } from "../database/db";
import { Response, Request } from "express";
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookies";
import { decodeRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import { hashPassword } from "../utils/helpers";
import bcrypt from "bcrypt"
import { uploadToCloudinary } from "../service/cloudinary.service";
import { registerSchema } from "../schemas";
import z from "zod";

export const getUser = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    };
    try {
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
            res.status(404).json({ message: "User not found" });
            return;
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
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return
    }
}

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password,avatarUrl } = req.body
    try {
        const isExistingUser = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true
            }
        });
        if (isExistingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists"
            });
            return
        }
        let avatarUrlFinal: string | undefined = undefined;
        if (avatarUrl.trim() !== '') {
            try {
              avatarUrlFinal = await uploadToCloudinary(avatarUrl);
            } catch (error) {
              return res.status(400).json({
                success: false,
                message: (error as Error).message || "Error uploading image",
              });
            }
          }
        const hashedPassword = await hashPassword(password)
        const userObject: z.infer<typeof registerSchema> = {
            email,
            username,
            password: hashedPassword,
            ...(avatarUrlFinal ? {avatarUrl:avatarUrlFinal} : {})
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
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({
            success: false,
            message: "Error registering user"
        });
        return
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                email
            },
        })
        if (!user) {
            res.status(401).json({ success: false, message: "User not exist!" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );
        if (!isPasswordCorrect) {
            res.status(401).json({ success: false, message: "Invalid password" });
            return;
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
    } catch (error) {
        console.log('Error login', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }

}

export const refreshAccessToken = async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        res.status(401).json({
            success: false,
            message: "Unauthorized pls login to generate refreshToken"
        })
        return;
    }
    const decodedUser = decodeRefreshToken(incomingRefreshToken);
    if (!decodedUser) {
        res.status(401).clearCookie("refreshToken", incomingRefreshToken).json({
            success: false,
            message: "Invalid refresh token",
        })
        return;
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
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
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
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}