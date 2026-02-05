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
    page,
    limit,
  }: {
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const take = limit ? parseInt(limit) : 10;
    const skip = page ? (parseInt(page) - 1) * take : 0;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.student.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }, // optional: latest first
    });
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
