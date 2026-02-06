import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Prisma } from 'generated/prisma/client';
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: Prisma.StudentCreateInput) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('courseId') courseId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.studentsService.findAll({
      search,
      courseId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy,
      sortOrder,
    });
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: Prisma.StudentUpdateInput,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Delete('bulk')
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        message: 'No IDs provided for deletion.',
      };
    }

    const deletedCount = await this.studentsService.bulkDelete(ids);

    return {
      success: true,
      message: `${deletedCount} student(s) deleted successfully.`,
      deletedCount,
    };
  }
}
