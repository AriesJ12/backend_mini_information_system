import { Test, TestingModule } from '@nestjs/testing';
import { GradesService } from './grades.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

describe('GradesService', () => {
  let service: GradesService;
  let prisma: PrismaService;

  const mockPrisma = {
    grade: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GradesService>(GradesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated grades with default params', async () => {
      const mockData = [{ id: '1', studentId: 'stu1', prelim: 85 }] as any;
      mockPrisma.grade.findMany.mockResolvedValue(mockData);
      mockPrisma.grade.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.grade.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { student: true, subject: true, course: true },
      });
      expect(prisma.grade.count).toHaveBeenCalledWith({ where: {} });

      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
      });
    });

    it('should apply filters and pagination', async () => {
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.grade.count.mockResolvedValue(5);

      await service.findAll({ courseId: 'c1', subjectId: 's1', studentId: 'stu1', page: 2, pageSize: 2 });

      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'c1', subjectId: 's1', studentId: 'stu1' },
          skip: 2,
          take: 2,
        }),
      );
    });
  });

  describe('upsert', () => {
    it('should upsert a grade', async () => {
      const input: Prisma.GradeUncheckedCreateInput = {
        studentId: 'stu1',
        subjectId: 'sub1',
        courseId: 'c1',
        prelim: 90,
        midterm: 88,
        finals: 92,
        finalGrade: 90,
        remarks: 'Good',
        encodedByUserId: 'user1',
      };

      const mockResult = { id: 'g1', ...input };
      mockPrisma.grade.upsert.mockResolvedValue(mockResult);

      const result = await service.upsert(input);

      expect(prisma.grade.upsert).toHaveBeenCalledWith({
        where: { studentId_subjectId_courseId: { studentId: 'stu1', subjectId: 'sub1', courseId: 'c1' } },
        create: { ...input },
        update: { prelim: 90, midterm: 88, finals: 92, finalGrade: 90, remarks: 'Good', encodedByUserId: 'user1' },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should update a grade', async () => {
      const data: Prisma.GradeUpdateInput = { finalGrade: 95, remarks: 'Excellent' };
      const mockResult = { id: 'g1', finalGrade: 95, remarks: 'Excellent' };
      mockPrisma.grade.update.mockResolvedValue(mockResult);

      const result = await service.update('g1', data);

      expect(prisma.grade.update).toHaveBeenCalledWith({
        where: { id: 'g1' },
        data,
      });

      expect(result).toEqual(mockResult);
    });
  });
});