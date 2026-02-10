const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock login
app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-token-123456',
    user: {
      id: '1',
      username: req.body.username || 'admin',
      role: 'admin',
      permissions: ['all']
    }
  });
});

// Mock tasks
app.get('/api/tasks', (req, res) => {
  res.json({
    tasks: [
      {
        id: '1',
        name: '春季促销活动',
        status: 'running',
        createdAt: new Date(),
        script: { name: '产品介绍话术' },
        strategy: { name: '默认策略' }
      },
      {
        id: '2',
        name: 'VIP客户回访',
        status: 'pending',
        createdAt: new Date(),
        script: { name: '产品介绍话术' },
        strategy: { name: '默认策略' }
      }
    ],
    total: 2,
    page: 1,
    size: 10,
    totalPages: 1
  });
});

// Mock customers
app.get('/api/customers', (req, res) => {
  res.json([
    {
      id: '1',
      name: '张先生',
      phoneNumber: '138****1234',
      email: 'zhang@example.com',
      status: 'active'
    },
    {
      id: '2',
      name: '李女士',
      phoneNumber: '139****5678',
      email: 'li@example.com',
      status: 'active'
    }
  ]);
});

// Mock scripts
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

// Mock statistics
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

app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});
