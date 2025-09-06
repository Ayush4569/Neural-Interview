import { prisma } from "../database/db";
import { Response, Request } from "express";
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookies";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import { hashPassword } from "../utils/helpers";
import bcrypt from "bcrypt"
export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body
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
        const hashedPassword = await hashPassword(password)

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
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