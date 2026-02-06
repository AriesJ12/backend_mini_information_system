import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD env variables');
}

describe('CoursesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let courseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Clear courses table before tests
    await prisma.student.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.course.deleteMany();

    // Login and get JWT token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login') // adjust if your route is different
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.student.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.course.deleteMany();
    await app.close();
  });

  it('should create a course', async () => {
    const createDto = { code: 'CS101', name: 'Intro to CS', description: 'Basics of CS' };

    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send(createDto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.code).toBe(createDto.code);
    courseId = res.body.id;
  });

  it('should get all courses', async () => {
    const res = await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('should get a single course', async () => {
    const res = await request(app.getHttpServer())
      .get(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(courseId);
  });

  it('should update a course', async () => {
    const updateDto = { name: 'CS Intro Updated' };
    const res = await request(app.getHttpServer())
      .patch(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.name).toBe(updateDto.name);
  });

  it('should delete a course', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/courses/${courseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(courseId);
  });

  it('should bulk delete courses', async () => {
    // Create extra courses to test bulk deletion
    const c1 = await prisma.course.create({ data: { code: 'CS102', name: 'Course 2' } });
    const c2 = await prisma.course.create({ data: { code: 'CS103', name: 'Course 3' } });

    const res = await request(app.getHttpServer())
      .delete('/courses/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [c1.id, c2.id] })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(2);
  });

});