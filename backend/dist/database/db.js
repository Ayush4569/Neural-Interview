"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const connectDB = () => {
    return new Promise((resolve, reject) => {
        exports.prisma.$connect()
            .then(() => {
            resolve(true);
        })
            .catch((error) => {
            process.exit(1);
            reject(error);
        });
    });
};
exports.connectDB = connectDB;
