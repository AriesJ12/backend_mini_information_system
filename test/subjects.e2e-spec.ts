import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

describe('SubjectsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let courseId: string;
  let token: string;

  const auth = (req: request.Test) =>
    req.set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(201);

    token = loginRes.body.access_token;

    await prisma.subject.deleteMany();
    await prisma.course.deleteMany();

    const course = await prisma.course.create({
      data: { code: 'CS', name: 'Computer Science' },
    });

    courseId = course.id;

    await prisma.subject.createMany({
      data: [
        { courseId, code: 'CS101', title: 'Intro Programming', units: 3 },
        { courseId, code: 'CS102', title: 'Data Structures', units: 3 },
        { courseId, code: 'MATH101', title: 'Discrete Math', units: 3 },
        { courseId, code: 'CS201', title: 'Advanced Programming', units: 4 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.subject.deleteMany();
    await prisma.course.deleteMany();
    await app.close();
  });

  // =========================
  // GET
  // =========================
  describe('GET /subjects', () => {
    it('returns paginated subjects', async () => {
      const res = await auth(
        request(app.getHttpServer()).get('/subjects'),
      ).expect(200);

      expect(res.body.data.length).toBe(4);
      expect(res.body.meta.total).toBe(4);
    });

    it('supports search', async () => {
      const res = await auth(
        request(app.getHttpServer()).get('/subjects').query({ search: 'CS' }),
      ).expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // =========================
  // POST
  // =========================
  describe('POST /subjects', () => {
    it('creates subject', async () => {
      const code = `CS-321`;

      const res = await auth(
        request(app.getHttpServer()).post('/subjects'),
      )
        .send({
          course: { connect: { id: courseId } },
          code,
          title: 'Operating Systems',
          units: 4,
        })
        .expect(201);

      expect(res.body.code).toBe(code);
    });

    it('fails on duplicate code', async () => {
      await auth(request(app.getHttpServer()).post('/subjects'))
        .send({
          course: { connect: { id: courseId } },
          code: 'CS101',
          title: 'Duplicate',
          units: 3,
        })
        .expect(500);
    });
  });

  // =========================
  // PATCH
  // =========================
  describe('PATCH /subjects/:id', () => {
    let subjectId: string;

    beforeEach(async () => {
      const subject = await prisma.subject.create({
        data: {
          courseId,
          code: `CS-${Date.now()}`,
          title: 'Networks',
          units: 3,
        },
      });
      subjectId = subject.id;
    });

    it('updates subject', async () => {
      const res = await auth(
        request(app.getHttpServer()).patch(`/subjects/${subjectId}`),
      )
        .send({ title: 'Advanced Networks' })
        .expect(200);

      expect(res.body.title).toBe('Advanced Networks');
    });

    it('fails if subject not found', async () => {
      await auth(
        request(app.getHttpServer()).patch('/subjects/bad-id'),
      )
        .send({ title: 'Nope' })
        .expect(500);
    });
  });

  // =========================
  // DELETE single
  // =========================
  describe('DELETE /subjects/:id', () => {
    let subjectId: string;

    beforeEach(async () => {
      const subject = await prisma.subject.create({
        data: {
          courseId,
          code: `CS-${Date.now()}`,
          title: 'Distributed Systems',
          units: 3,
        },
      });
      subjectId = subject.id;
    });

    it('deletes subject', async () => {
      await auth(
        request(app.getHttpServer()).delete(`/subjects/${subjectId}`),
      ).expect(200);

      const found = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      expect(found).toBeNull();
    });
  });

  // =========================
  // DELETE bulk
  // =========================
  describe('DELETE /subjects/bulk', () => {
    let ids: string[];

    beforeEach(async () => {
      const suffix = Date.now();

      await prisma.subject.createMany({
        data: [
          {
            courseId,
            code: `CS601-${suffix}`,
            title: 'ML',
            units: 4,
          },
          {
            courseId,
            code: `CS602-${suffix}`,
            title: 'AI',
            units: 4,
          },
        ],
      });

      const created = await prisma.subject.findMany({
        where: { code: { contains: `${suffix}` } },
      });

      ids = created.map((s) => s.id);
    });

    it('bulk deletes', async () => {
      const res = await auth(
        request(app.getHttpServer()).delete('/subjects/bulk'),
      )
        .send({ ids })
        .expect(200);

      expect(res.body.deletedCount).toBe(2);
    });

    it('handles empty ids', async () => {
      const res = await auth(
        request(app.getHttpServer()).delete('/subjects/bulk'),
      )
        .send({ ids: [] })
        .expect(200);

      expect(res.body.deletedCount).toBe(undefined);
    });
  });
});