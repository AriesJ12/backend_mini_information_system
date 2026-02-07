import { Body, Controller, Get, Patch, Post, Param, Query } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { GradesService } from './grades.service';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  findAll(
    @Query('courseId') courseId: string,
    @Query('subjectId') subjectId: string,
    @Query('studentId') studentId: string,
  ) {
    return this.gradesService.findAll({
      courseId,
      subjectId,
      studentId,
    });
  }

  @Post()
  upsert(@Body() data: Prisma.GradeUncheckedCreateInput) {
    return this.gradesService.upsert(data);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.GradeUpdateInput,
  ) {
    return this.gradesService.update(id, data);
  }
}