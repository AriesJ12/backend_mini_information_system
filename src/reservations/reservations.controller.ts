import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('students/:id/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  listReservations(@Param('id') studentId: string) {
    return this.reservationsService.listReservations(studentId);
  }


  @Post()
  reserveSubject(
    @Param('id') studentId: string,
    @Body('subjectId') subjectId: string,
  ) {
    return this.reservationsService.reserveSubject(studentId, subjectId);
  }

  
  @Delete(':reservationId')
  cancelReservation(
    @Param('id') studentId: string,
    @Param('reservationId') reservationId?: string,
  ) {
    return this.reservationsService.cancelReservation(
      studentId,
      reservationId,
    );
  }
  
}
