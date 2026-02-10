import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './utils/database';
import { connectRedis, disconnectRedis } from './utils/redis';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import userRoutes from './routes/userRoutes';
import customerRoutes from './routes/customerRoutes';
import scriptRoutes from './routes/scriptRoutes';
import taskRoutes from './routes/taskRoutes';
import outboundRoutes from './routes/outboundRoutes';
import dataRoutes from './routes/dataRoutes';
import strategyRoutes from './routes/strategyRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/outbound', outboundRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/strategies', strategyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function shutdown() {
  logger.info('Shutting down server...');
  await disconnectDB();
  await disconnectRedis();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

export default app;
