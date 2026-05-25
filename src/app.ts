import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import stationRoutes from './routes/station.routes.js';
import readingRoutes from './routes/reading.routes.js';
import { setupSwagger } from './swagger.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Setup Swagger Docs
setupSwagger(app);

// Healthcheck Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AtmosMetrics API is running! 🚀', status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/readings', readingRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
