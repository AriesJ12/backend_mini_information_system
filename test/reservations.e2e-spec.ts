import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ReservationStatus } from '../generated/prisma/client';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

describe('ReservationsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let token: string; 

  let studentId: string;
  let subjectId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Seed test data
    const course = await prisma.course.create({
      data: { code: 'CS101', name: 'Computer Science' },
    });

    const student = await prisma.student.create({
      data: {
        studentNo: 'S1001',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date('2010-01-01'),
        courseId: course.id,
      },
    });
    studentId = student.id;

    const subject = await prisma.subject.create({
      data: {
        code: 'CSCI101',
        title: 'Intro to CS',
        units: 3,
        courseId: course.id,
      },
    });
    subjectId = subject.id;

    const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await prisma.subjectReservation.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.course.deleteMany({});
    await app.close();
  });

  describe('POST /students/:id/reservations', () => {
    it('should create a reservation', async () => {
      const res = await request(app.getHttpServer())
        .post(`/students/${studentId}/reservations`)
        .set('Authorization', `Bearer ${token}`)
        .send({ subjectId })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(ReservationStatus.reserved);
      reservationId = res.body.id;
    });

    it('should upsert the reservation if it already exists', async () => {
      const res = await request(app.getHttpServer())
        .post(`/students/${studentId}/reservations`)
        .set('Authorization', `Bearer ${token}`)
        .send({ subjectId })
        .expect(201);

      expect(res.body.id).toBe(reservationId); // same reservation ID
      expect(res.body.status).toBe(ReservationStatus.reserved);
    });
  });

  describe('GET /students/:id/reservations', () => {
    it('should list reservations for the student', async () => {
      const res = await request(app.getHttpServer())
        .get(`/students/${studentId}/reservations`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('subject');
      expect(res.body[0]).toHaveProperty('status', ReservationStatus.reserved);
    });
  });

  describe('PATCH /students/:id/reservations/:reservationId', () => {
    it('should cancel a reservation', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/students/${studentId}/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', reservationId);
      expect(res.body.status).toBe(ReservationStatus.cancelled);
    });

    it('should throw error if reservationId is not provided', async () => {
      await request(app.getHttpServer())
        .patch(`/students/${studentId}/reservations/`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404); // endpoint not matched
    });
  });
});