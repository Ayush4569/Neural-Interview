import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './env.js'
import { connectDB } from './database/db.js';
const app = express();


connectDB()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error: Error) => {
    console.error("Database connection failed:");
    process.exit(1);
  });
// Middleware to parse JSON
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  return res.send('Neural Interview API is running!');
});

// Start the server
app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});