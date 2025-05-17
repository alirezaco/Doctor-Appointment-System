import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/shared/enums/user-role.enum';
import { createTestingApp } from './shared/test-setup';
import { createAuthToken, getTestHeaders } from './shared/test-utils';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { mockUser } from './shared/mock-data';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let createdAdminId: string;
  let createdPatientId: string;
  let adminToken: string;
  let patientToken: string;

  beforeAll(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await createTestingApp();
    app = testApp;
    dataSource = testDataSource;
    jwtService = app.get(JwtService);
    userRepository = dataSource.getRepository(User);

    // Create admin user and get token
    const adminUser = await userRepository.save({
      ...mockUser,
      email: 'admin-user@test.com',
      role: UserRole.ADMIN,
    });
    createdAdminId = adminUser.id;
    adminToken = createAuthToken(jwtService, UserRole.ADMIN, createdAdminId);

    // Create patient user and get token
    const patientUser = await userRepository.save({
      ...mockUser,
      email: 'patient-user@test.com',
      role: UserRole.PATIENT,
    });
    patientToken = createAuthToken(
      jwtService,
      UserRole.PATIENT,
      patientUser.id,
    );
    createdPatientId = patientUser.id;
  });

  afterAll(async () => {
    if (createdAdminId) {
      await userRepository.delete(createdAdminId);
    }
    if (createdPatientId) {
      await userRepository.delete(createdPatientId);
    }
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return current user when authenticated', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('admin-user@test.com');
          expect(res.body.role).toBe(UserRole.ADMIN);
        });
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set(getTestHeaders('invalid-token'))
        .expect(401);
    });
  });

  describe('POST /users', () => {
    it('should create user when valid data is provided by admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockUser,
          email: 'newuser@test.com',
        })
        .expect(201)
        .expect(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('newuser@test.com');
          expect(res.body.firstName).toBe(mockUser.firstName);
          expect(res.body.lastName).toBe(mockUser.lastName);
          expect(res.body.role).toBe(UserRole.PATIENT);

          const user = await userRepository.findOne({
            where: { id: res.body.id },
          });
          expect(user).toBeDefined();
          expect(user?.email).toBe('newuser@test.com');

          await userRepository.delete(res.body.id);
        });
    });

    it('should return 403 when non-admin user tries to create user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set(getTestHeaders(patientToken))
        .send({
          ...mockUser,
          email: 'newuser@test.com',
        })
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...mockUser,
          email: 'newuser@test.com',
        })
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      const { firstName, ...invalidData } = mockUser;
      return request(app.getHttpServer())
        .post('/users')
        .set(getTestHeaders(adminToken))
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 when email is invalid', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 when password is too short', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockUser,
          password: '12345',
        })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return all users when requested by admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('role');
        });
    });

    it('should return 403 when non-admin user tries to get all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set(getTestHeaders(patientToken))
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user when requested by admin', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdAdminId}`)
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdAdminId);
          expect(res.body.email).toBe('admin-user@test.com');
        });
    });

    it('should return 403 when non-admin user tries to get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdAdminId}`)
        .set(getTestHeaders(patientToken))
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdAdminId}`)
        .expect(401);
    });

    it('should return 404 when user does not exist', () => {
      const nonExistentUserId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .get(`/users/${nonExistentUserId}`)
        .set(getTestHeaders(adminToken))
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user when valid data is provided by admin', () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdAdminId}`)
        .set(getTestHeaders(adminToken))
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdAdminId);
          expect(res.body.firstName).toBe(updateData.firstName);
          expect(res.body.lastName).toBe(updateData.lastName);
        });
    });

    it('should return 403 when non-admin user tries to update user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdAdminId}`)
        .set(getTestHeaders(patientToken))
        .send({ firstName: 'Updated' })
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdAdminId}`)
        .send({ firstName: 'Updated' })
        .expect(401);
    });

    it('should return 404 when user does not exist', () => {
      const nonExistentUserId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .patch(`/users/${nonExistentUserId}`)
        .set(getTestHeaders(adminToken))
        .send({ firstName: 'Updated' })
        .expect(404);
    });

    it('should return 400 when invalid data is provided', () => {
      return request(app.getHttpServer())
        .patch(`/users/${createdAdminId}`)
        .set(getTestHeaders(adminToken))
        .send({ firstName: '' })
        .expect(400);
    });
  });
});
