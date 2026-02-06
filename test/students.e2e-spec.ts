import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

describe('StudentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let courseId: string;
  let studentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Login first
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = loginRes.body.access_token;

    // Create a course to link students to
    const course = await prisma.course.create({
      data: { code: 'CS101', name: 'Intro to CS' },
    });
    courseId = course.id;

    await prisma.student.createMany({
      data: [
        {
          studentNo: 'S90001',
          firstName: 'Anna',
          lastName: 'Taylor',
          birthDate: new Date('2000-01-01'),
          courseId,
        },
        {
          studentNo: 'S90002',
          firstName: 'Annabelle',
          lastName: 'Smith',
          birthDate: new Date('2000-01-01'),
          courseId,
        },
        {
          studentNo: 'S90003',
          firstName: 'Brian',
          lastName: 'Johnson',
          birthDate: new Date('2000-01-01'),
          courseId,
        },
      ],
    });
  });

  afterAll(async () => {
    // Clean up: delete students first, then course
    await prisma.student.deleteMany();
    await prisma.course.deleteMany();
    await app.close();
  });

  it('should create a student', async () => {
    const createDto = {
      studentNo: 'S12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      birthDate: new Date('2000-01-01'),
      courseId,
    };

    const res = await request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${token}`)
      .send(createDto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.studentNo).toBe(createDto.studentNo);
    studentId = res.body.id;
  });

  it('should get all students', async () => {
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('should search students by first name', async () => {
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .query({ search: 'Anna' })
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const names = res.body.data.map((s) => s.firstName);
    expect(names).toEqual(expect.arrayContaining(['Anna', 'Annabelle']));
  });

  it('should return empty data for unmatched search', async () => {
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .query({ search: 'NonExistentName' })
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('should paginate students (page 1)', async () => {
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .query({ page: 1, pageSize: 2 })
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(2);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
  });

  it('should paginate searched results', async () => {
    const res = await request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .query({
        search: 'Ann',
        page: 1,
        pageSize: 1,
      })
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('should get a single student', async () => {
    const res = await request(app.getHttpServer())
      .get(`/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(studentId);
    expect(res.body.course.id).toBe(courseId); // course relation included
  });

  it('should update a student', async () => {
    const updateDto = { firstName: 'Jane' };
    const res = await request(app.getHttpServer())
      .patch(`/students/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateDto)
      .expect(200);

    expect(res.body.firstName).toBe('Jane');
  });

  it('should bulk delete students', async () => {
    // Create extra students
    const s1 = await prisma.student.create({
      data: {
        studentNo: 'S12346',
        firstName: 'Alice',
        lastName: 'Smith',
        birthDate: new Date('2001-02-01'),
        courseId,
      },
    });
    const s2 = await prisma.student.create({
      data: {
        studentNo: 'S12347',
        firstName: 'Bob',
        lastName: 'Brown',
        birthDate: new Date('2002-03-01'),
        courseId,
      },
    });

    const res = await request(app.getHttpServer())
      .delete('/students/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [studentId, s1.id, s2.id] })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(3);
  });

  it('should delete a student', async () => {
    // Create a student to delete
    const student = await prisma.student.create({
      data: {
        studentNo: 'S12348',
        firstName: 'Charlie',
        lastName: 'Davis',
        birthDate: new Date('2003-04-01'),
        courseId,
      },
    });

    await request(app.getHttpServer())
      .delete(`/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const exists = await prisma.student.findUnique({
      where: { id: student.id },
    });
    expect(exists).toBeNull();
  });
});
