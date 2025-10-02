import cron from "node-cron"
import { prisma } from "../database/db"

const updateInterviewStatus = async () => {
    try {
        const now = Date.now();
        const fiveMinLater = new Date(now + 5 * 60000)
        const thirtyMinBefore = new Date(now - 30 * 60000)

        const readyToJoin = await prisma.interview.updateMany({
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
        })

        const { count } = await prisma.interview.updateMany({
            where: {
                status: "scheduled",
                startTime: {
                    lt: thirtyMinBefore
                }
            },
            data: {
                status: "expired"
            }
        })

        if (readyToJoin.count || count) {
            console.log(`[cron] ready:${count} expired:${count}`);
        }
    } catch (error) {
        console.log('error updating interview', error);
    }
}


cron.schedule('* * * * *', updateInterviewStatus, { timezone: "Asia/Kolkata" })