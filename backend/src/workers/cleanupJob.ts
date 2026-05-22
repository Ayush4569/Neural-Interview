import cron from 'node-cron';
import Interview from '../models/Interview.js';

export const initCleanupJob = () => {
  cron.schedule('*/10 * * * *', async () => {
    console.log('Running cleanup job for expired interviews...');
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const result = await Interview.updateMany(
        {
          status: 'pending',
          scheduledAt: { $lt: thirtyMinutesAgo },
        },
        { $set: { status: 'expired' } }
      );
      
      console.log(`Cleanup complete. Expired ${result.modifiedCount} interviews.`);
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  });
};
