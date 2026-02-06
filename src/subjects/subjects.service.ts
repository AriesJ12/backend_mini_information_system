import { Injectable } from '@nestjs/common';
import { Prisma, Subject } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    courseId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: keyof Subject;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      search,
      courseId,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * pageSize;

    const where: Prisma.SubjectWhereInput = {
      ...(courseId && {
        courseId: courseId, // ✅ filters by FK (course_id column)
      }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          course: true,
        },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(data: Prisma.SubjectCreateInput) {
    return this.prisma.subject.create({ data });
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.subject.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
