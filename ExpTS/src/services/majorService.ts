import { PrismaClient } from '@prisma/client';
import type { IMajorInput } from '../interfaces/types.js';

const prisma = new PrismaClient();

export class MajorService {
  static async getAll() {
    return await prisma.major.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async getById(id: string) {
    return await prisma.major.findUnique({ where: { id } });
  }

  static async create(data: IMajorInput) {
    return await prisma.major.create({ data });
  }

  static async delete(id: string) {
    return await prisma.major.delete({ where: { id } });
  }
}