import { Test, TestingModule } from '@nestjs/testing';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { Prisma } from '../../generated/prisma/client';

describe('GradesController', () => {
  let controller: GradesController;
  let service: GradesService;

  const mockService = {
    findAll: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradesController],
      providers: [{ provide: GradesService, useValue: mockService }],
    }).compile();

    controller = module.get<GradesController>(GradesController);
    service = module.get<GradesService>(GradesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should call service.findAll with query params', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const response = await controller.findAll('c1', 's1', 'stu1', '2', '5');

      expect(service.findAll).toHaveBeenCalledWith({
        courseId: 'c1',
        subjectId: 's1',
        studentId: 'stu1',
        page: 2,
        pageSize: 5,
      });

      expect(response).toEqual(mockResult);
    });
  });

  describe('upsert', () => {
    it('should call service.upsert with correct data', async () => {
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
      mockService.upsert.mockResolvedValue(mockResult);

      const response = await controller.upsert(input);

      expect(service.upsert).toHaveBeenCalledWith(input);
      expect(response).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call service.update with id and data', async () => {
      const data: Prisma.GradeUpdateInput = { finalGrade: 95, remarks: 'Excellent' };
      const mockResult = { id: 'g1', finalGrade: 95, remarks: 'Excellent' };
      mockService.update.mockResolvedValue(mockResult);

      const response = await controller.update('g1', data);

      expect(service.update).toHaveBeenCalledWith('g1', data);
      expect(response).toEqual(mockResult);
    });
  });
});