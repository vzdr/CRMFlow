import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT
    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

export const authService = new AuthService();
