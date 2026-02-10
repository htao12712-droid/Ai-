import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/database';
import { AppError } from '../middleware/error';

export class UserService {
  async register(username: string, password: string, role: string, permissions: string[]) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        permissions,
      },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  async getUsers(role?: string) {
    const where = role ? { role } : undefined;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUserPermissions(userId: string, permissions: string[]) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
      },
    });

    return user;
  }
}

export default new UserService();
