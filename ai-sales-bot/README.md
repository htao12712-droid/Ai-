# AI 电销语音机器人系统

基于语音识别、自然语言处理和数据分析技术的智能电话销售系统。

## 功能特性

- 智能外呼管理
- 语音识别处理
- 自然语言理解
- 智能对话生成
- 通话数据记录
- 客户意向分析
- 产品反馈收集
- 外呼任务管理
- 话术管理
- 数据报表生成
- 通话质量监控

## 技术栈

### 后端
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- JWT 认证
- Winston 日志

### 前端
- React + TypeScript
- Vite
- Tailwind CSS (可选)

### AI 服务
- Google Cloud Speech-to-Text (ASR)
- Amazon Polly (TTS)
- 自研 NLP 引擎

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 安装

1. 克隆项目

```bash
git clone <repository-url>
cd ai-sales-bot
```

2. 安装后端依赖

```bash
cd backend
npm install
```

3. 安装前端依赖

```bash
cd ../frontend
npm install
```

4. 配置环境变量

```bash
cd ../backend
cp .env.example .env
# 编辑 .env 文件,配置数据库和 Redis 连接
```

5. 初始化数据库

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 运行

1. 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 http://localhost:3000 启动

2. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 创建初始管理员账号

使用 Postman 或 curl 创建第一个管理员账号:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "permissions": ["all"]
  }'
```

## 项目结构

```
ai-sales-bot/
├── backend/
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── utils/          # 工具函数
│   │   └── types/          # TypeScript 类型定义
│   ├── prisma/             # Prisma schema 和迁移
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/     # React 组件
    │   ├── pages/          # 页面组件
    │   ├── services/       # API 服务
    │   └── types/          # TypeScript 类型定义
    └── package.json
```

## API 文档

### 认证接口

- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册

### 客户管理

- GET /api/customers - 获取客户列表
- POST /api/customers - 创建客户
- POST /api/customers/batch - 批量导入客户
- GET /api/customers/:id - 获取客户详情
- PUT /api/customers/:id - 更新客户
- DELETE /api/customers/:id - 删除客户(软删除)

### 话术管理

- GET /api/scripts - 获取话术列表
- POST /api/scripts - 创建话术
- GET /api/scripts/:id - 获取话术详情
- PUT /api/scripts/:id - 更新话术
- DELETE /api/scripts/:id - 删除话术
- POST /api/scripts/preview - 预览话术
- GET /api/scripts/:id/versions - 获取话术版本

### 任务管理

- GET /api/tasks - 获取任务列表
- POST /api/tasks - 创建任务
- GET /api/tasks/:id - 获取任务详情
- PUT /api/tasks/:id - 更新任务
- DELETE /api/tasks/:id - 删除任务
- POST /api/tasks/:id/start - 启动任务
- POST /api/tasks/:id/pause - 暂停任务
- GET /api/tasks/:id/statistics - 获取任务统计

### 外呼管理

- POST /api/outbound/calls - 创建通话
- GET /api/outbound/calls/:id - 获取通话详情
- GET /api/outbound/calls - 获取通话列表
- PUT /api/outbound/calls/:id/status - 更新通话状态
- POST /api/outbound/calls/:id/transcript - 添加转录文本

### NLP 服务

- POST /api/outbound/nlp/intent - 意图识别
- POST /api/outbound/nlp/response - 生成回复
- POST /api/outbound/calls/:id/analyze-intent - 客户意向分析
- POST /api/outbound/nlp/extract-feedback - 提取反馈

### 数据分析

- GET /api/data/calls - 获取通话数据
- GET /api/data/statistics/overview - 获取统计概览
- POST /api/data/quality-rating - 添加质检评分
- GET /api/data/quality-ratings - 获取质检记录
- POST /api/data/export - 导出报表

## 配置说明

### 环境变量

后端 `.env` 文件配置:

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/ai_sales_bot"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"

# Twilio (语音服务)
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Google Cloud (语音识别)
GOOGLE_APPLICATION_CREDENTIALS="./path/to/credentials.json"

# 服务器
PORT=3000
NODE_ENV=development
```

## 开发指南

### 添加新的 API 端点

1. 在 `src/services/` 中创建服务类
2. 在 `src/controllers/` 中创建控制器
3. 在 `src/routes/` 中定义路由
4. 在 `src/index.ts` 中注册路由

### 添加新的前端页面

1. 在 `frontend/src/pages/` 中创建页面组件
2. 在 `frontend/src/services/api.ts` 中添加 API 调用函数
3. 在 `App.tsx` 中添加路由和导航

## 部署

### 使用 Docker Compose

```bash
docker-compose up -d
```

### 手动部署

1. 构建后端

```bash
cd backend
npm run build
npm start
```

2. 构建前端

```bash
cd frontend
npm run build
```

3. 使用 Nginx 或其他 Web 服务器托管前端静态文件

## 测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

## 许可证

MIT License
