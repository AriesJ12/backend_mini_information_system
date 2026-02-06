import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaService;

  const mockPrisma = {
    course: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a new course', async () => {
      const input: Prisma.CourseCreateInput = { code: 'CS101', name: 'Computer Science' };
      const mockResult = { id: '1', ...input };
      mockPrisma.course.create.mockResolvedValue(mockResult);

      const result = await service.create(input);

      expect(prisma.course.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated courses with default params', async () => {
      const mockCourses = [{ id: '1', code: 'CS101', name: 'Computer Science' }];
      mockPrisma.course.findMany.mockResolvedValue(mockCourses);
      mockPrisma.course.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        data: mockCourses,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should apply search, pagination, and sorting', async () => {
      mockPrisma.course.findMany.mockResolvedValue([]);
      mockPrisma.course.count.mockResolvedValue(5);

      await service.findAll({ search: 'CS', page: '2', limit: '2', sortBy: 'name', order: 'asc' });

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ code: { contains: 'CS', mode: 'insensitive' } }, { name: { contains: 'CS', mode: 'insensitive' } }] },
          skip: 2,
          take: 2,
          orderBy: { name: 'asc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      const mockCourse = { id: '1', code: 'CS101', name: 'Computer Science' };
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findOne('1');
      expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const data: Prisma.CourseUpdateInput = { name: 'CS Advanced' };
      const mockCourse = { id: '1', code: 'CS101', name: 'CS Advanced' };
      mockPrisma.course.update.mockResolvedValue(mockCourse);

      const result = await service.update('1', data);

      expect(prisma.course.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('remove', () => {
    it('should delete a course', async () => {
      const mockCourse = { id: '1', code: 'CS101', name: 'Computer Science' };
      mockPrisma.course.delete.mockResolvedValue(mockCourse);

      const result = await service.remove('1');

      expect(prisma.course.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockCourse);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple courses', async () => {
      mockPrisma.course.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.bulkDelete(['1', '2', '3']);

      expect(prisma.course.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['1', '2', '3'] } } });
      expect(result).toBe(3);
    });
  });
});