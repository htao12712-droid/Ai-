import { Prisma } from '@prisma/client';
import prisma from '../utils/database';
import { AppError } from '../middleware/error';

export class CustomerService {
  async createCustomer(data: {
    phoneNumber: string;
    name?: string;
    email?: string;
    attributes?: Record<string, any>;
  }) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { phoneNumber: data.phoneNumber },
    });

    if (existingCustomer) {
      throw new AppError('Customer with this phone number already exists', 400);
    }

    const customer = await prisma.customer.create({
      data: {
        phoneNumber: data.phoneNumber,
        name: data.name,
        email: data.email,
        attributes: data.attributes as Prisma.InputJsonValue,
      },
    });

    return customer;
  }

  async batchImport(customers: Array<{
    phoneNumber: string;
    name?: string;
    email?: string;
    attributes?: Record<string, any>;
  }>) {
    const results = await Promise.allSettled(
      customers.map((customer) => this.createCustomer(customer))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { successful, failed, total: customers.length };
  }

  async getCustomers(filters?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    status?: string;
  }) {
    const where: Prisma.CustomerWhereInput = {};

    if (filters?.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters?.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters?.phoneNumber) {
      where.phoneNumber = { contains: filters.phoneNumber };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        calls: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return customers;
  }

  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        calls: {
          include: {
            intentAnalysis: true,
          },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  async updateCustomer(id: string, data: {
    name?: string;
    email?: string;
    status?: string;
    attributes?: Record<string, any>;
  }) {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        status: data.status,
        attributes: data.attributes as Prisma.InputJsonValue,
      },
    });

    return customer;
  }

  async softDeleteCustomer(id: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: 'deleted' },
    });

    return customer;
  }
}

export default new CustomerService();
