import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Student } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: Prisma.StudentCreateInput) {
    return this.prisma.student.create({
      data: createStudentDto,
    });
  }

  async findAll(params: {
    search?: string;
    courseId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: keyof Student;
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

    const where: Prisma.StudentWhereInput = {
      ...(courseId && {
        courseId: courseId, // ✅ FK filter (course_id)
      }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentNo: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
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
      this.prisma.student.count({ where }),
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

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }

  async update(id: string, updateStudentDto: Prisma.StudentUpdateInput) {
    try {
      return await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
      });
    } catch {
      throw new NotFoundException(`Student #${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.student.delete({ where: { id } });
      return; // For 204 No Content, return nothing
    } catch {
      throw new NotFoundException(`Student #${id} not found`);
    }
  }

  async bulkDelete(ids: string[]): Promise<number> {
    // Prisma deleteMany with `in` filter
    const result = await this.prisma.student.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // result.count = number of deleted rows
    return result.count;
  }
}
