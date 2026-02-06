import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './test-credentials';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD env variables');
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login (public)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');

    accessToken = res.body.access_token;
  });

  it('GET /auth/me (protected)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('email', ADMIN_EMAIL);
  });

  it('GET /auth/me (401 without token)', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('POST /auth/logout (protected)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(res.body).toEqual({
      message: 'Logged out successfully',
    });
  });
});