import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Prisma } from 'generated/prisma/client';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    bulkDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockService }],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call service.create', async () => {
      const input: Prisma.StudentCreateInput = {
        firstName: 'John',
        lastName: 'Doe',
        studentNo: 'S123',
        email: 'john@example.com',
        birthDate: "12/12/12",
        course: { connect: { id: 'course123' } },
      };
      const mockResult = { id: '1', ...input };
      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const response = await controller.findAll('john', 'course123', '2', '5', 'firstName', 'asc');

      expect(service.findAll).toHaveBeenCalledWith({
        search: 'john',
        courseId: 'course123',
        page: 2,
        pageSize: 5,
        sortBy: 'firstName',
        sortOrder: 'asc',
      });
      expect(response).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const mockResult = { id: '1', firstName: 'John' };
      mockService.findOne.mockResolvedValue(mockResult);

      const response = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(response).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const data: Prisma.StudentUpdateInput = { firstName: 'Jane' };
      const mockResult = { id: '1', firstName: 'Jane' };
      mockService.update.mockResolvedValue(mockResult);

      const response = await controller.update('1', data);

      expect(service.update).toHaveBeenCalledWith('1', data);
      expect(response).toEqual(mockResult);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const response = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(response).toBeUndefined();
    });
  });

  describe('bulkDelete', () => {
    it('should call service.bulkDelete and return success', async () => {
      mockService.bulkDelete.mockResolvedValue(3);

      const response = await controller.bulkDelete(['1', '2', '3']);

      expect(service.bulkDelete).toHaveBeenCalledWith(['1', '2', '3']);
      expect(response).toEqual({
        success: true,
        message: '3 student(s) deleted successfully.',
        deletedCount: 3,
      });
    });

    it('should return error if no IDs provided', async () => {
      const response = await controller.bulkDelete([]);
      expect(response).toEqual({
        success: false,
        message: 'No IDs provided for deletion.',
      });
    });
  });
});