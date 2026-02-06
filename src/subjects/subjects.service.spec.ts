import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from './subjects.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let prisma: PrismaService;

  const mockPrisma = {
    subject: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated subjects with default params', async () => {
      const mockData = [{ id: '1', code: 'MATH101', title: 'Math' }];
      mockPrisma.subject.findMany.mockResolvedValue(mockData);
      mockPrisma.subject.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.subject.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { course: true },
      });
      expect(prisma.subject.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
      });
    });

    it('should apply search filter', async () => {
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.subject.count.mockResolvedValue(0);

      await service.findAll({ search: 'math' });

      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { code: { contains: 'math', mode: 'insensitive' } },
              { title: { contains: 'math', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should apply courseId filter', async () => {
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.subject.count.mockResolvedValue(0);

      await service.findAll({ courseId: 'course123' });

      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'course123' },
        }),
      );
    });

    it('should apply pagination and sorting', async () => {
      mockPrisma.subject.findMany.mockResolvedValue([]);
      mockPrisma.subject.count.mockResolvedValue(30);

      await service.findAll({
        page: 2,
        pageSize: 5,
        sortBy: 'title',
        sortOrder: 'asc',
      });

      expect(prisma.subject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          orderBy: { title: 'asc' },
        }),
      );
    });
  });

  describe('create', () => {
    it('should create a new subject', async () => {
      const input: Prisma.SubjectCreateInput = {
        code: 'ENG101',
        title: 'English',
        units: 3, // required field
        course: { connect: { id: 'course123' } }, // required relation field
      };

      const mockResult = { id: '1', ...input };
      mockPrisma.subject.create.mockResolvedValue(mockResult);

      const result = await service.create(input);

      expect(prisma.subject.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update a subject by id', async () => {
      const id = '1';
      const data = { title: 'Updated Title' };
      const mockResult = { id, ...data };
      mockPrisma.subject.update.mockResolvedValue(mockResult);

      const result = await service.update(id, data);

      expect(prisma.subject.update).toHaveBeenCalledWith({
        where: { id },
        data,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete a subject by id', async () => {
      const id = '1';
      const mockResult = { id };
      mockPrisma.subject.delete.mockResolvedValue(mockResult);

      const result = await service.delete(id);

      expect(prisma.subject.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockResult);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple subjects', async () => {
      const ids = ['1', '2', '3'];
      const mockResult = { count: 3 };
      mockPrisma.subject.deleteMany.mockResolvedValue(mockResult);

      const result = await service.bulkDelete(ids);

      expect(prisma.subject.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
