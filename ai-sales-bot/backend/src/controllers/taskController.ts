import { Request, Response, NextFunction } from 'express';
import taskService from '../services/taskService';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = (req as AuthRequest).userId!;
      const task = await taskService.createTask({ ...req.body, createdBy });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = '1', size = '10' } = req.query;
      const tasks = await taskService.getTasks(
        status as string,
        parseInt(page as string),
        parseInt(size as string)
      );
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.updateTask(id, req.body);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async startTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.startTask(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async pauseTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.pauseTask(id);
      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async getTaskStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await taskService.getTaskStatistics(id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
