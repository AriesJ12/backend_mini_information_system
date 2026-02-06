import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationStatus } from 'generated/prisma/enums';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listReservations(studentId: string) {
    return this.prisma.subjectReservation.findMany({
      where: { studentId },
      include: { subject: true },
      orderBy: { reservedAt: 'desc' },
    });
  }
  async reserveSubject(
    studentId: string,
    subjectId: string,
  ) {
    return this.prisma.subjectReservation.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId,
        },
      },
      create: {
        studentId,
        subjectId,
        status: ReservationStatus.reserved, // or your default ReservationStatus
      },
      update: {
        status: ReservationStatus.reserved, // reset status if already exists
      },
    });
  }

  async cancelReservation(
    studentId: string,
    reservationId?: string,
  ) {
    if (reservationId) {
      return this.prisma.subjectReservation.delete({
        where: { id: reservationId },
      });
    } else {
      throw new Error('ReservationId must be provided');
    }
  }

  
}
