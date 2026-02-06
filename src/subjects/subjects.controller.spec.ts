import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { Prisma } from '../../generated/prisma/client';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let service: SubjectsService;

  const mockService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [{ provide: SubjectsService, useValue: mockService }],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    service = module.get<SubjectsService>(SubjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call subjectsService.findAll with query params', async () => {
      const result = { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(result);

      const response = await controller.findAll('searchTerm', 'course123', '2', '5', 'title', 'asc');

      expect(service.findAll).toHaveBeenCalledWith({
        search: 'searchTerm',
        courseId: 'course123',
        page: 2,
        pageSize: 5,
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(response).toEqual(result);
    });
  });

  describe('create', () => {
    it('should call subjectsService.create with correct data', async () => {
      const input: Prisma.SubjectCreateInput = {
        code: 'ENG101',
        title: 'English',
        units: 3,
        course: { connect: { id: 'course123' } },
      };
      const mockResult = { id: '1', ...input };
      mockService.create.mockResolvedValue(mockResult);

      const response = await controller.create(input);

      expect(service.create).toHaveBeenCalledWith(input);
      expect(response).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call subjectsService.update with id and data', async () => {
      const id = '1';
      const data: Prisma.SubjectUpdateInput = { title: 'Updated Title' };
      const mockResult = { id, title: 'Updated Title' };
      mockService.update.mockResolvedValue(mockResult);

      const response = await controller.update(id, data);

      expect(service.update).toHaveBeenCalledWith(id, data);
      expect(response).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should call subjectsService.delete with id', async () => {
      const id = '1';
      const mockResult = { id };
      mockService.delete.mockResolvedValue(mockResult);

      const response = await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(response).toEqual(mockResult);
    });
  });

  describe('bulkDelete', () => {
    it('should call subjectsService.bulkDelete with ids', async () => {
      const ids = ['1', '2', '3'];
      const mockResult = { count: 3 };
      mockService.bulkDelete.mockResolvedValue(mockResult);

      const response = await controller.bulkDelete(ids);

      expect(service.bulkDelete).toHaveBeenCalledWith(ids);
      expect(response).toEqual(mockResult);
    });
  });
});