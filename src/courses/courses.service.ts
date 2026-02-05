import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCourseDto: Prisma.CourseCreateInput) {
    return this.prisma.course.create({ data: createCourseDto });
  }
  //TODO seperate the search for code and name
  async findAll(params: {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const { search, page, limit, sortBy, order } = params;
    const take = limit ? parseInt(limit) : 10;
    const skip = page ? (parseInt(page) - 1) * take : 0;

    const where: Prisma.CourseWhereInput = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    if (sortBy) orderBy[sortBy] = order || 'asc';
    else orderBy['createdAt'] = 'desc';

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({ where, skip, take, orderBy }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page: page ? parseInt(page) : 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  // Get single course
  async findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }

  // Update course
  async update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({ where: { id }, data });
  }

  // Delete course
  async remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // Bulk delete
  async bulkDelete(ids: string[]) {
    const result = await this.prisma.course.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }
}
