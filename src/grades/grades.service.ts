import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    courseId?: string;
    subjectId?: string;
    studentId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      courseId,
      subjectId,
      studentId,
      page = 1,
      pageSize = 10,
    } = params;

    const skip = (page - 1) * pageSize;

    const where: Prisma.GradeWhereInput = {
      ...(courseId && { courseId }),
      ...(subjectId && { subjectId }),
      ...(studentId && { studentId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.grade.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          student: true,
          subject: true,
          course: true,
        },
      }),
      this.prisma.grade.count({ where }),
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


  async upsert(data: Prisma.GradeUncheckedCreateInput) {
    const { studentId, subjectId, courseId, ...rest } = data;

    return this.prisma.grade.upsert({
      where: {
        studentId_subjectId_courseId: {
          studentId,
          subjectId,
          courseId,
        },
      },
      create: {
        studentId,
        subjectId,
        courseId,
        ...rest,
      },
      update: {
        ...rest,
      },
    });
  }

  async update(id: string, data: Prisma.GradeUpdateInput) {
    return this.prisma.grade.update({
      where: { id },
      data,
    });
  }
}