import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

describe('GradesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let token: string;
  let adminId: string;

  // Sample data
  let studentId: string;
  let subjectId: string;
  let courseId: string;
  let gradeId: string;

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
      data: { code: 'CS101', name: 'Computer Science', description: 'Test course' },
    });
    courseId = course.id;

    const student = await prisma.student.create({
      data: { studentNo: 'S1001', firstName: 'John', lastName: 'Doe', courseId, birthDate: new Date('2000-01-01') },
    });
    studentId = student.id;

    const subject = await prisma.subject.create({
      data: { code: 'CSCI101', title: 'Intro to CS', units: 3, courseId },
    });
    subjectId = subject.id;

    const loginRes = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
        token = loginRes.body.access_token;
    const getAdmin = await request(app.getHttpServer())
          .get('/auth/me')
          .set('Authorization', `Bearer ${token}`)
        adminId = getAdmin.body.sub
  });

  afterAll(async () => {
    await prisma.grade.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.course.deleteMany({});
    await app.close();
  });

  describe('POST /grades', () => {
    it('should create a grade', async () => {
      const res = await request(app.getHttpServer())
        .post('/grades')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId,
          subjectId,
          courseId,
          prelim: 90.2,
          midterm: 85,
          finals: 88,
          finalGrade: 88,
          remarks: 'Good',
          encodedByUserId: adminId, // id of admin
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      gradeId = res.body.id;
      expect(res.body.prelim).toBe('90.2');
    });
  });

  describe('GET /grades', () => {
    it('should return all grades', async () => {
      const res = await request(app.getHttpServer())
        .get('/grades')
        .set('Authorization', `Bearer ${token}`)
        .query({ studentId })
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('id', gradeId);
    });
  });

  describe('PATCH /grades/:id', () => {
    it('should update a grade', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/grades/${gradeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ prelim: 95.5 })
        .expect(200);

      expect(res.body.prelim).toBe('95.5');
    });
  });
});