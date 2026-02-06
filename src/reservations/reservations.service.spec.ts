import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationStatus } from '../../generated/prisma/enums';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    subjectReservation: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('listReservations', () => {
    it('should return reservations for a studentId', async () => {
      const mockData = [{ id: 'res1', studentId: 'stu1', subject: { id: 'sub1' } }];
      mockPrisma.subjectReservation.findMany.mockResolvedValue(mockData);

      const result = await service.listReservations('stu1');

      expect(prisma.subjectReservation.findMany).toHaveBeenCalledWith({
        where: { studentId: 'stu1' },
        include: { subject: true },
        orderBy: { reservedAt: 'desc' },
      });
      expect(result).toEqual(mockData);
    });

    it('should return all reservations if no studentId provided', async () => {
      const mockData = [{ id: 'res1', studentId: 'stu1', subject: { id: 'sub1' } }];
      mockPrisma.subjectReservation.findMany.mockResolvedValue(mockData);

      const result = await service.listReservations();

      expect(prisma.subjectReservation.findMany).toHaveBeenCalledWith({
        where: {},
        include: { subject: true },
        orderBy: { reservedAt: 'desc' },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('reserveSubject', () => {
    it('should upsert a reservation', async () => {
      const mockResult = { id: 'res1', studentId: 'stu1', subjectId: 'sub1', status: ReservationStatus.reserved };
      mockPrisma.subjectReservation.upsert.mockResolvedValue(mockResult);

      const result = await service.reserveSubject('stu1', 'sub1');

      expect(prisma.subjectReservation.upsert).toHaveBeenCalledWith({
        where: { studentId_subjectId: { studentId: 'stu1', subjectId: 'sub1' } },
        create: { studentId: 'stu1', subjectId: 'sub1', status: ReservationStatus.reserved },
        update: { status: ReservationStatus.reserved },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancelReservation', () => {
    it('should delete a reservation if reservationId is provided', async () => {
      const mockResult = { id: 'res1' };
      mockPrisma.subjectReservation.delete.mockResolvedValue(mockResult);

      const result = await service.cancelReservation('stu1', 'res1');

      expect(prisma.subjectReservation.delete).toHaveBeenCalledWith({
        where: { id: 'res1' },
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if reservationId is not provided', async () => {
      await expect(service.cancelReservation('stu1')).rejects.toThrow('ReservationId must be provided');
    });
  });
});