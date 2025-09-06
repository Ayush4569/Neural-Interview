import { config } from "../env";
import jwt from "jsonwebtoken";
import { User } from "../types/user";

export function generateAccessToken(user: Pick<User, 'id' | 'email' | 'username' | 'avatarUrl'>) {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.username,
        avatarUrl: user.avatarUrl,
    },
        config.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: '1h',
        })
    return token;
}
export function generateRefreshToken(user: Pick<User, 'id' | 'email' | 'username' | 'avatarUrl'>) {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.username,
        avatarUrl: user.avatarUrl,
    },
        config.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: '7d',
        })
    return token;
}

export const decodeRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
        return decoded as {
            id: string;
            email: string;
            username: string;
            avatarUrl: string | null;
        }
    } catch (error) {
        return null;
    }
}