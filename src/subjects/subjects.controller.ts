import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('courseId') courseId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sortBy') sortBy?: any,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.subjectsService.findAll({
      search,
      courseId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy,
      sortOrder,
    });
  }

  @Post()
  create(@Body() data: Prisma.SubjectCreateInput) {
    return this.subjectsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.SubjectUpdateInput) {
    return this.subjectsService.update(id, data);
  }


  @Delete("bulk")
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        message: 'No IDs provided for deletion.',
      };
    }

    const deletedCount = await this.subjectsService.bulkDelete(ids);

    return {
      success: true,
      message: `${deletedCount} subject(s) deleted successfully.`,
      deletedCount,
    };
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subjectsService.delete(id);
  }
}
