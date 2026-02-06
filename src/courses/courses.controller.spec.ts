import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Prisma } from '../../generated/prisma/client';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

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
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: mockService }],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call service.create', async () => {
      const input: Prisma.CourseCreateInput = { code: 'CS101', name: 'Computer Science' };
      const mockResult = { id: '1', ...input };
      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const response = await controller.findAll('CS', '2', '5', 'name', 'asc');

      expect(service.findAll).toHaveBeenCalledWith({
        search: 'CS',
        page: '2',
        limit: '5',
        sortBy: 'name',
        order: 'asc',
      });

      expect(response).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const mockCourse = { id: '1', code: 'CS101', name: 'Computer Science' };
      mockService.findOne.mockResolvedValue(mockCourse);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const data: Prisma.CourseUpdateInput = { name: 'CS Advanced' };
      const mockCourse = { id: '1', code: 'CS101', name: 'CS Advanced' };
      mockService.update.mockResolvedValue(mockCourse);

      const result = await controller.update('1', data);

      expect(service.update).toHaveBeenCalledWith('1', data);
      expect(result).toEqual(mockCourse);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const mockCourse = { id: '1', code: 'CS101', name: 'Computer Science' };
      mockService.remove.mockResolvedValue(mockCourse);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('bulkDelete', () => {
    it('should call service.bulkDelete and return success', async () => {
      mockService.bulkDelete.mockResolvedValue(3);

      const response = await controller.bulkDelete(['1', '2', '3']);

      expect(service.bulkDelete).toHaveBeenCalledWith(['1', '2', '3']);
      expect(response).toEqual({
        success: true,
        message: '3 course(s) deleted successfully',
        deletedCount: 3,
      });
    });

    it('should return error if no IDs provided', async () => {
      const response = await controller.bulkDelete([]);
      expect(response).toEqual({ success: false, message: 'No IDs provided.' });
    });
  });
});