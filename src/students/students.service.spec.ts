import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Student } from '../../generated/prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    student: {
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
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a student', async () => {
      const input: Prisma.StudentCreateInput = {
        firstName: 'John',
        lastName: 'Doe',
        studentNo: 'S123',
        email: 'john@example.com',
        birthDate: "12/12/12",
        course: { connect: { id: 'course123' } },
      };

      const mockResult = { id: '1', ...input };
      mockPrisma.student.create.mockResolvedValue(mockResult);

      const result = await service.create(input);
      expect(prisma.student.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return paginated students with default params', async () => {
      const mockData = [{ id: '1', firstName: 'John' } as Student];
      mockPrisma.student.findMany.mockResolvedValue(mockData);
      mockPrisma.student.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { course: true },
      });

      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
      });
    });

    it('should apply search and courseId filters', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);
      mockPrisma.student.count.mockResolvedValue(0);

      await service.findAll({ search: 'john', courseId: 'course123' });

      expect(prisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            courseId: 'course123',
            OR: expect.any(Array),
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return student if found', async () => {
      const student = { id: '1', firstName: 'John' } as Student;
      mockPrisma.student.findUnique.mockResolvedValue(student);

      const result = await service.findOne('1');
      expect(prisma.student.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(student);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update student if exists', async () => {
      const data: Prisma.StudentUpdateInput = { firstName: 'Jane' };
      const mockResult = { id: '1', firstName: 'Jane' } as Student;
      mockPrisma.student.update.mockResolvedValue(mockResult);

      const result = await service.update('1', data);
      expect(prisma.student.update).toHaveBeenCalledWith({ where: { id: '1' }, data });
      expect(result).toEqual(mockResult);
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.update.mockRejectedValue(new Error());
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete student', async () => {
      mockPrisma.student.delete.mockResolvedValue({ id: '1' } as Student);
      const result = await service.remove('1');
      expect(prisma.student.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if student not found', async () => {
      mockPrisma.student.delete.mockRejectedValue(new Error());
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple students', async () => {
      mockPrisma.student.deleteMany.mockResolvedValue({ count: 3 });
      const result = await service.bulkDelete(['1', '2', '3']);
      expect(prisma.student.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['1', '2', '3'] } },
      });
      expect(result).toBe(3);
    });
  });
});