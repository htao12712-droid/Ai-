import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import userController from './controllers/userController';
import customerController from './controllers/customerController';
import scriptController from './controllers/scriptController';
import taskController from './controllers/taskController';
import outboundController from './controllers/outboundController';
import dataController from './controllers/dataController';
import strategyController from './controllers/strategyController';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.post('/api/auth/login', (req: any, res: any, next: any) => {
  userController.login(req, res, next);
});
app.post('/api/auth/register', (req: any, res: any, next: any) => {
  userController.register(req, res, next);
});
app.get('/api/me', (req: any, res: any, next: any) => {
  userController.getMe(req, res, next);
});

// Mock data routes
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: [
      {
        id: '1',
        name: '春季促销活动',
        status: 'running',
        createdAt: new Date(),
        script: { name: '产品介绍话术' },
        strategy: { name: '默认策略' },
        createdById: { username: 'admin' }
      },
      {
        id: '2',
        name: 'VIP客户回访',
        status: 'pending',
        createdAt: new Date(),
        script: { name: '产品介绍话术' },
        strategy: { name: '默认策略' },
        createdById: { username: 'admin' }
      }
    ],
    total: 2,
    page: 1,
    size: 10,
    totalPages: 1
  });
});

app.get('/api/customers', (req, res) => {
  res.json([
    {
      id: '1',
      name: '张先生',
      phoneNumber: '138****1234',
      email: 'zhang@example.com',
      status: 'active',
      calls: []
    },
    {
      id: '2',
      name: '李女士',
      phoneNumber: '139****5678',
      email: 'li@example.com',
      status: 'active',
      calls: []
    }
  ]);
});

app.get('/api/scripts', (req, res) => {
  res.json([
    {
      id: '1',
      name: '产品介绍话术',
      description: '介绍产品的核心功能',
      scenario: '产品推广',
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      name: '常见问题话术',
      description: '回答客户常见问题',
      scenario: '客服支持',
      isActive: true,
      createdAt: new Date()
    }
  ]);
});

app.get('/api/data/statistics/overview', (req, res) => {
  res.json({
    totalCalls: 156,
    connectedCalls: 106,
    connectedRate: 0.68,
    avgDuration: 192,
    intentDistribution: {
      high: 42,
      medium: 38,
      low: 26,
      none: 0
    },
    topScripts: [
      { scriptId: '1', name: '产品介绍话术', count: 120 }
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
