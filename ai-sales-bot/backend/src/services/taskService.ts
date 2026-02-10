import prisma from '../utils/database';
import { AppError } from '../middleware/error';
import cron from 'node-cron';

export class TaskService {
  private scheduledTasks = new Map<string, cron.ScheduledTask>();

  async createTask(data: {
    name: string;
    description?: string;
    scriptId: string;
    strategyId: string;
    customerIds: string[];
    scheduledTime?: Date;
    createdBy: string;
  }) {
    const task = await prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        scriptId: data.scriptId,
        strategyId: data.strategyId,
        status: 'pending',
        scheduledTime: data.scheduledTime,
        createdBy: data.createdBy,
      },
    });

    if (data.scheduledTime) {
      this.scheduleTask(task.id, data.scheduledTime);
    }

    return task;
  }

  async getTasks(status?: string, page = 1, size = 10) {
    const skip = (page - 1) * size;
    const where = status ? { status } : undefined;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          script: { select: { name: true } },
          strategy: { select: { name: true } },
          createdById: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total, page, size, totalPages: Math.ceil(total / size) };
  }

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        script: true,
        strategy: true,
        calls: {
          include: {
            customer: true,
            intentAnalysis: true,
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async updateTask(id: string, data: {
    name?: string;
    description?: string;
    scriptId?: string;
    strategyId?: string;
    scheduledTime?: Date;
  }) {
    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return task;
  }

  async deleteTask(id: string) {
    this.unscheduleTask(id);
    await prisma.task.delete({ where: { id } });
  }

  async startTask(id: string) {
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'running' },
    });

    return task;
  }

  async pauseTask(id: string) {
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'paused' },
    });

    return task;
  }

  async completeTask(id: string) {
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'completed' },
    });

    return task;
  }

  async getTaskStatistics(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        calls: {
          include: {
            intentAnalysis: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const total = task.calls.length;
    const completed = task.calls.filter((c) => c.status === 'ended').length;
    const connected = task.calls.filter((c) => c.status === 'connected').length;
    const highIntent = task.calls.filter(
      (c) => c.intentAnalysis && c.intentAnalysis.score >= 70
    ).length;

    const durations = task.calls
      .filter((c) => c.duration)
      .map((c) => c.duration!);
    const averageDuration =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    return {
      total,
      completed,
      connected,
      highIntent,
      averageDuration,
    };
  }

  private scheduleTask(taskId: string, scheduledTime: Date) {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      this.executeTask(taskId);
      return;
    }

    const timeout = setTimeout(() => {
      this.executeTask(taskId);
    }, delay);

    this.scheduledTasks.set(taskId, {
      stop: () => clearTimeout(timeout),
    } as any);
  }

  private unscheduleTask(taskId: string) {
    const scheduledTask = this.scheduledTasks.get(taskId);
    if (scheduledTask) {
      scheduledTask.stop();
      this.scheduledTasks.delete(taskId);
    }
  }

  private async executeTask(taskId: string) {
    await this.startTask(taskId);

    // Task execution logic will be handled by OutboundService
    console.log(`Task ${taskId} started execution`);
  }
}

export default new TaskService();
