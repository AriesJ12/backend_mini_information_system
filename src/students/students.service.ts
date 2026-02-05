import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: Prisma.StudentCreateInput) {
    return this.prisma.student.create({
      data: createStudentDto,
    });
  }

  async findAll({
    search,
    courseId,
    page,
    limit,
    sortBy,
    order,
  }: {
    search?: string;
    courseId?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const take = limit ? parseInt(limit) : 10;
    const skip = page ? (parseInt(page) - 1) * take : 0;

    const where: Prisma.StudentWhereInput = {};

    // Search by firstName or lastName
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by courseId
    if (courseId) {
      where.courseId = courseId;
    }

    // Sorting
    const orderBy: Prisma.StudentOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = order || 'asc';
    } else {
      orderBy['createdAt'] = 'desc';
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total, // number of data targetted by the search
        page: page ? parseInt(page) : 1,
        limit: take, // total present in the data
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
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
}
