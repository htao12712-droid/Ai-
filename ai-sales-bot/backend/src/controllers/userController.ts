import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, role, permissions } = req.body;
      const user = await userService.register(username, password, role, permissions || []);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await userService.login(username, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.query;
      const users = await userService.getUsers(role as string);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const user = await userService.updateUserPermissions(id, permissions);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.userId!);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
