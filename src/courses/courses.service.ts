import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CoursesService {
  create(createCourseDto: Prisma.CourseCreateInput) {
    return 'This action adds a new course';
  }

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: Prisma.CourseUpdateInput) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
