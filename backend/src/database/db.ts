import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient()
export const connectDB = () =>{
    return new Promise((resolve, reject) => {
        prisma.$connect()
            .then(() => {
                resolve(true);
            })
            .catch((error: Error ) => {
                reject(error);
            });
    })
}
