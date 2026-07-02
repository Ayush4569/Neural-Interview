import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import authRoute from './routes/authRoutes.js';
import interviewRoute from './routes/interviewRoutes.js';
import speechRoute from './routes/speechSynthesis.js';
import evalRoute from './routes/evaluationRoutes.js';
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

app.use('/api/v1/user', authRoute);
app.use('/api/v1/interviews', interviewRoute);
app.use('/api/v1/voice', speechRoute);
app.use('/api/v1/evaluations', evalRoute);


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AI Interviewer is running...' });
});

app.use(errorHandler);
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
