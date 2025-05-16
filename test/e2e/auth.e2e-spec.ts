import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/shared/enums/user-role.enum';
import { createTestingApp } from './shared/test-setup';
import { createAuthToken, getTestHeaders } from './shared/test-utils';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { mockInvalidLoginData, mockUser } from './shared/mock-data';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let createdUserId: string;

  beforeAll(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await createTestingApp();
    app = testApp;
    dataSource = testDataSource;
    jwtService = app.get(JwtService);
    userRepository = dataSource.getRepository(User);

    // Create a test user
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .set(getTestHeaders(createAuthToken(jwtService, UserRole.ADMIN)))
      .send(mockUser);
    createdUserId = userResponse.body.id;
  });

  afterAll(async () => {
    if (createdUserId) {
      await userRepository.delete(createdUserId);
    }
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return JWT token when valid credentials are provided', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.access_token.length).toBeGreaterThan(0);
        });
    });

    it('should return 400 when invalid email format is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mockInvalidLoginData.invalidEmail)
        .expect(400);
    });

    it('should return 400 when empty email is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mockInvalidLoginData.emptyEmail)
        .expect(400);
    });

    it('should return 400 when empty password is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mockInvalidLoginData.emptyPassword)
        .expect(400);
    });

    it('should return 401 when wrong password is provided', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mockInvalidLoginData.wrongPassword)
        .expect(401);
    });

    it('should return 401 when non-existent user tries to login', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(mockInvalidLoginData.nonExistentUser)
        .expect(401);
    });

    it('should return 400 when request body is empty', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 400 when request body is not JSON', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400);
    });

    it('should return 400 when request body contains extra fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...mockUser,
          extraField: 'should not be here',
        })
        .expect(400);
    });

    it('should return 400 when email is too long', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'a'.repeat(256) + '@example.com',
          password: mockUser.password,
        })
        .expect(400);
    });

    it('should return 400 when password is too long', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: 'a'.repeat(256),
        })
        .expect(400);
    });
  });

  describe('JWT Token Validation', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token for testing
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });
      validToken = response.body.access_token;
    });

    it('should allow access to protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set(getTestHeaders(validToken))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(mockUser.email);
        });
    });

    it('should deny access to protected route with invalid token', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set(getTestHeaders('invalid-token'))
        .expect(401);
    });

    it('should deny access to protected route without token', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should deny access to protected route with expired token', async () => {
      // Create an expired token
      const expiredToken = createAuthToken(
        jwtService,
        UserRole.PATIENT,
        createdUserId,
        '0s',
      );

      return request(app.getHttpServer())
        .get('/users/me')
        .set(getTestHeaders(expiredToken))
        .expect(401);
    });

    it('should deny access to admin route with non-admin token', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set(getTestHeaders(validToken))
        .expect(403);
    });
  });
});
