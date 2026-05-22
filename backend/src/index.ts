import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { initCleanupJob } from './workers/cleanupJob.js';
import {errorHandler} from './middleware/errorMiddleware.js';

import cookieParser from 'cookie-parser';

dotenv.config({path:'./.env'});

connectDB();

initCleanupJob();

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/api/v1/user', authRoutes);
app.use('/api/v1/interviews', interviewRoutes);


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AI Interviewer is running...' });
});

app.use(errorHandler);
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
