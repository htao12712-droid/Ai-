import { Request, Response, NextFunction } from 'express';
import customerService from '../services/customerService';

export class CustomerController {
  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async batchImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { customers } = req.body;
      const result = await customerService.batchImport(customers);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        name: req.query.name as string,
        email: req.query.email as string,
        phoneNumber: req.query.phoneNumber as string,
        status: req.query.status as string,
      };
      const customers = await customerService.getCustomers(filters);
      res.json(customers);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(id, req.body);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async softDeleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await customerService.softDeleteCustomer(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
