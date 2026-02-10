import prisma from '../utils/database';
import { AppError } from '../middleware/error';

export class StrategyService {
  async createStrategy(data: {
    name: string;
    settings: Record<string, any>;
  }) {
    const strategy = await prisma.strategy.create({
      data: {
        name: data.name,
        settings: data.settings as any,
      },
    });

    return strategy;
  }

  async getStrategies() {
    const strategies = await prisma.strategy.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return strategies;
  }

  async getStrategyById(id: string) {
    const strategy = await prisma.strategy.findUnique({
      where: { id },
    });

    if (!strategy) {
      throw new AppError('Strategy not found', 404);
    }

    return strategy;
  }

  async updateStrategy(id: string, data: {
    name?: string;
    settings?: Record<string, any>;
  }) {
    const strategy = await prisma.strategy.update({
      where: { id },
      data: {
        name: data.name,
        settings: data.settings as any,
      },
    });

    return strategy;
  }

  async deleteStrategy(id: string) {
    await prisma.strategy.delete({ where: { id } });
  }
}

export default new StrategyService();
