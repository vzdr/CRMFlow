import { prisma } from '../config/prisma';
import { encrypt, decrypt } from '../utils/crypto.util';

export class ApiKeyService {
  /**
   * Save or update API key
   */
  async saveKey(userId: string, service: string, key: string) {
    const encryptedKey = encrypt(key);

    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_service: {
          userId,
          service
        }
      },
      update: {
        encryptedKey
      },
      create: {
        userId,
        service,
        encryptedKey
      }
    });

    return {
      service: apiKey.service,
      saved: true
    };
  }

  /**
   * Get all services for which user has keys
   */
  async getKeys(userId: string) {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        service: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return keys;
  }

  /**
   * Delete API key
   */
  async deleteKey(userId: string, service: string) {
    await prisma.apiKey.delete({
      where: {
        userId_service: {
          userId,
          service
        }
      }
    });

    return { success: true };
  }
}

export const apiKeyService = new ApiKeyService();
