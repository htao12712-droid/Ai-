import { Request, Response, NextFunction } from 'express';
import dataService from '../services/dataService';

export class DataController {
  async getCalls(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        taskId: req.query.taskId as string,
        customerId: req.query.customerId as string,
        status: req.query.status as string,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        size: req.query.size ? parseInt(req.query.size as string) : 10,
      };
      const result = await dataService.getCalls(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query;
      const dateFrom = new Date(from as string);
      const dateTo = new Date(to as string);
      const result = await dataService.getOverview(dateFrom, dateTo);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addQualityRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, rating, comment } = req.body;
      const result = await dataService.addQualityRating(id, userId, rating, comment);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getQualityRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, page = '1', size = '10' } = req.query;
      const result = await dataService.getQualityRatings(
        userId as string,
        parseInt(page as string),
        parseInt(size as string)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType } = req.body;
      const filters = req.query;
      const data = await dataService.exportReport(reportType, filters);
      res.json({ data, downloadUrl: `/api/data/download/${reportType}` });
    } catch (error) {
      next(error);
    }
  }
}

export default new DataController();
