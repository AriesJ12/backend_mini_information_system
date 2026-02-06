import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationStatus } from '../../generated/prisma/enums';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockService = {
    listReservations: jest.fn(),
    reserveSubject: jest.fn(),
    cancelReservation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('listReservations', () => {
    it('should call service.listReservations with studentId', async () => {
      const mockData = [{ id: 'res1', studentId: 'stu1', subject: { id: 'sub1' } }];
      mockService.listReservations.mockResolvedValue(mockData);

      const result = await controller.listReservations('stu1');

      expect(service.listReservations).toHaveBeenCalledWith('stu1');
      expect(result).toEqual(mockData);
    });
  });

  describe('reserveSubject', () => {
    it('should call service.reserveSubject with studentId and subjectId', async () => {
      const mockResult = { id: 'res1', studentId: 'stu1', subjectId: 'sub1', status: ReservationStatus.reserved };
      mockService.reserveSubject.mockResolvedValue(mockResult);

      const result = await controller.reserveSubject('stu1', 'sub1');

      expect(service.reserveSubject).toHaveBeenCalledWith('stu1', 'sub1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelReservation', () => {
    it('should call service.cancelReservation with studentId and reservationId', async () => {
      const mockResult = { id: 'res1' };
      mockService.cancelReservation.mockResolvedValue(mockResult);

      const result = await controller.cancelReservation('stu1', 'res1');

      expect(service.cancelReservation).toHaveBeenCalledWith('stu1', 'res1');
      expect(result).toEqual(mockResult);
    });
  });
});