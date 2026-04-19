"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../database/db");
const updateInterviewStatus = async () => {
    try {
        const now = Date.now();
        const fiveMinLater = new Date(now + 5 * 60000);
        const thirtyMinBefore = new Date(now - 30 * 60000);
        const readyToJoin = await db_1.prisma.interview.updateMany({
            where: {
                status: "scheduled",
                startTime: {
                    lt: fiveMinLater,
                    gt: new Date(now)
                }
            },
            data: {
                status: 'active'
            }
        });
        const { count } = await db_1.prisma.interview.updateMany({
            where: {
                status: "scheduled",
                startTime: {
                    lt: thirtyMinBefore
                }
            },
            data: {
                status: "expired"
            }
        });
        if (readyToJoin.count || count) {
            console.log(`[cron] ready:${count} expired:${count}`);
        }
    }
    catch (error) {
        console.log('error updating interview', error);
    }
};
node_cron_1.default.schedule('* * * * *', updateInterviewStatus, { timezone: "Asia/Kolkata" });
