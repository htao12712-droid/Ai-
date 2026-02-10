import { Request, Response, NextFunction } from 'express';
import strategyService from '../services/strategyService';

export class StrategyController {
  async createStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const strategy = await strategyService.createStrategy(req.body);
      res.status(201).json(strategy);
    } catch (error) {
      next(error);
    }
  }

  async getStrategies(req: Request, res: Response, next: NextFunction) {
    try {
      const strategies = await strategyService.getStrategies();
      res.json(strategies);
    } catch (error) {
      next(error);
    }
  }

  async getStrategyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const strategy = await strategyService.getStrategyById(id);
      res.json(strategy);
    } catch (error) {
      next(error);
    }
  }

  async updateStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const strategy = await strategyService.updateStrategy(id, req.body);
      res.json(strategy);
    } catch (error) {
      next(error);
    }
  }

  async deleteStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await strategyService.deleteStrategy(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new StrategyController();
