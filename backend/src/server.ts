import express, { Application, Request, Response } from "express";
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth';
import ticketsRouter from './routes/tickets';
import agentsRouter from './routes/agents';
import dashboardRouter from './routes/dashboard';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
const app: Application = express();

app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));
app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/dashboard', dashboardRouter);

export default app;
