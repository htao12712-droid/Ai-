import prisma from '../utils/database';
import { AppError } from '../middleware/error';

export class DataService {
  async getCalls(filters: {
    taskId?: string;
    customerId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    size?: number;
  }) {
    const skip = ((filters.page || 1) - 1) * (filters.size || 10);
    const size = filters.size || 10;

    const where: any = {};

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) {
        where.startTime.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.startTime.lte = filters.dateTo;
      }
    }

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        include: {
          customer: true,
          task: {
            include: {
              script: true,
            },
          },
          intentAnalysis: true,
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: size,
      }),
      prisma.call.count({ where }),
    ]);

    return {
      calls,
      total,
      page: filters.page || 1,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async getStatistics(dateRange?: { from: Date; to: Date }) {
    const where: any = {};

    if (dateRange) {
      where.startTime = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    const [totalCalls, connectedCalls, callsWithIntent] = await Promise.all([
      prisma.call.count({ where }),
      prisma.call.count({
        where: { ...where, status: 'connected' },
      }),
      prisma.call.findMany({
        where: {
          ...where,
          intentAnalysis: { isNot: null },
        },
        include: {
          intentAnalysis: true,
          task: { select: { scriptId: true } },
        },
      }),
    ]);

    const connectedRate = totalCalls > 0 ? (connectedCalls / totalCalls) * 100 : 0;

    const intentDistribution = {
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
    };

    const scriptUsage = new Map<string, number>();

    for (const call of callsWithIntent) {
      if (call.intentAnalysis) {
        intentDistribution[call.intentAnalysis.level as keyof typeof intentDistribution]++;

        const scriptId = call.task.scriptId;
        scriptUsage.set(scriptId, (scriptUsage.get(scriptId) || 0) + 1);
      }
    }

    const avgDurationResult = await prisma.call.aggregate({
      where: { ...where, duration: { not: null } },
      _avg: { duration: true },
    });
    const avgDuration = Math.round(avgDurationResult._avg.duration || 0);

    const topScripts = Array.from(scriptUsage.entries())
      .map(([scriptId, count]) => ({ scriptId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const scriptsWithNames = await Promise.all(
      topScripts.map(async (s) => ({
        scriptId: s.scriptId,
        name: (await prisma.script.findUnique({ where: { id: s.scriptId } }))?.name || 'Unknown',
        count: s.count,
      }))
    );

    return {
      totalCalls,
      connectedCalls,
      connectedRate: Math.round(connectedRate * 100) / 100,
      avgDuration,
      intentDistribution,
      topScripts: scriptsWithNames,
    };
  }

  async getOverview(dateFrom: Date, dateTo: Date) {
    return this.getStatistics({ from: dateFrom, to: dateTo });
  }

  async addQualityRating(callId: string, userId: string, rating: number, comment?: string) {
    const existing = await prisma.qualityRating.findUnique({
      where: { callId },
    });

    if (existing) {
      const updated = await prisma.qualityRating.update({
        where: { callId },
        data: { rating, comment },
      });
      return updated;
    }

    const qualityRating = await prisma.qualityRating.create({
      data: {
        callId,
        userId,
        rating,
        comment,
      },
    });

    return qualityRating;
  }

  async getQualityRatings(userId?: string, page = 1, size = 10) {
    const skip = (page - 1) * size;
    const where = userId ? { userId } : undefined;

    const [ratings, total] = await Promise.all([
      prisma.qualityRating.findMany({
        where,
        include: {
          user: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      prisma.qualityRating.count({ where }),
    ]);

    return {
      ratings,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async exportReport(reportType: 'calls' | 'intents' | 'feedbacks', filters: Record<string, any>) {
    let data: any[] = [];

    switch (reportType) {
      case 'calls': {
        const where: any = {};
        if (filters.taskId) where.taskId = filters.taskId;
        if (filters.dateFrom || filters.dateTo) {
          where.startTime = {};
          if (filters.dateFrom) where.startTime.gte = filters.dateFrom;
          if (filters.dateTo) where.startTime.lte = filters.dateTo;
        }

        data = await prisma.call.findMany({
          where,
          include: {
            customer: true,
            task: { select: { name: true } },
            intentAnalysis: true,
          },
          orderBy: { startTime: 'desc' },
        });
        break;
      }

      case 'intents': {
        data = await prisma.intentAnalysis.findMany({
          include: {
            call: {
              include: {
                customer: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;
      }

      case 'feedbacks': {
        data = await prisma.feedback.findMany({
          include: {
            call: {
              include: {
                customer: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;
      }
    }

    return data;
  }
}

export default new DataService();
