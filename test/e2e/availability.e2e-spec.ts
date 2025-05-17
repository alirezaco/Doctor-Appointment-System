import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/shared/enums/user-role.enum';
import { createTestingApp } from './shared/test-setup';
import {
  createAuthToken,
  findOrCreateUser,
  getTestHeaders,
} from './shared/test-utils';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { Availability } from 'src/modules/availability/infrastructure/entities/availability.entity';
import { mockAvailability, mockUser } from './shared/mock-data';

describe('AvailabilityController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let doctorRepository: Repository<Doctor>;
  let availabilityRepository: Repository<Availability>;
  let createdUserId: string;
  let createdDoctorId: string;
  let adminToken: string;

  beforeAll(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await createTestingApp();
    app = testApp;
    dataSource = testDataSource;
    jwtService = app.get(JwtService);
    userRepository = dataSource.getRepository(User);
    doctorRepository = dataSource.getRepository(Doctor);
    availabilityRepository = dataSource.getRepository(Availability);

    // Create admin user and get token
    const adminUser = await findOrCreateUser(
      userRepository,
      'admin@test.com',
      UserRole.ADMIN,
    );
    createdUserId = adminUser.id;
    adminToken = createAuthToken(jwtService, UserRole.ADMIN, createdUserId);

    // Create a test doctor
    const doctor = await doctorRepository.save({
      name: 'Test Doctor',
      specialty: 'General Medicine',
      bio: 'Test doctor bio',
    });
    createdDoctorId = doctor.id;
  });

  afterAll(async () => {
    if (createdUserId) {
      await userRepository.delete(createdUserId);
    }
    if (createdDoctorId) {
      await doctorRepository.delete(createdDoctorId);
    }
    await app.close();
  });

  describe('POST /availability', () => {
    it('should create availability when valid data is provided by admin', () => {
      return request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          doctorId: createdDoctorId,
        })
        .expect(201)
        .expect(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.date).toBe(mockAvailability.date);
          expect(res.body.startTime).toBe(mockAvailability.startTime);
          expect(res.body.endTime).toBe(mockAvailability.endTime);
          expect(res.body.doctor.id).toBe(createdDoctorId);

          const availability = await availabilityRepository.findOne({
            where: { id: res.body.id },
          });
          expect(availability).not.toBeNull();

          await availabilityRepository.delete(res.body.id);
        });
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .post('/availability')
        .send({
          ...mockAvailability,
          doctorId: createdDoctorId,
        })
        .expect(401);
    });

    it('should return 403 when non-admin user tries to create availability', async () => {
      const patientToken = createAuthToken(jwtService, UserRole.PATIENT);
      return request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(patientToken))
        .send({
          ...mockAvailability,
          doctorId: createdDoctorId,
        })
        .expect(403);
    });

    it('should return 400 when invalid date format is provided', () => {
      return request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          date: 'invalid-date',
          doctorId: createdDoctorId,
        })
        .expect(400);
    });

    it('should return 400 when invalid time format is provided', () => {
      return request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          startTime: '25:00',
          doctorId: createdDoctorId,
        })
        .expect(400);
    });

    it('should return 400 when end time is before start time', () => {
      return request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          startTime: '10:00',
          endTime: '09:00',
          doctorId: createdDoctorId,
        })
        .expect(400);
    });
  });

  describe('GET /availability/doctor/:doctorId', () => {
    let availabilityId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          doctorId: createdDoctorId,
        });

      availabilityId = res.body.id;
    });

    afterAll(async () => {
      await availabilityRepository.delete(availabilityId);
    });

    it('should return doctor availability for a specific date', async () => {
      // First create an availability
      await request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          ...mockAvailability,
          doctorId: createdDoctorId,
        });

      return request(app.getHttpServer())
        .get(`/availability/doctor/${createdDoctorId}`)
        .query({ date: mockAvailability.date })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0].date).toBe(mockAvailability.date);
          expect(res.body[0].doctor.id).toBe(createdDoctorId);
        });
    });

    it('should return 400 when invalid date format is provided', () => {
      return request(app.getHttpServer())
        .get(`/availability/doctor/${createdDoctorId}`)
        .query({ date: 'invalid-date' })
        .expect(400);
    });

    it('should return 400 when date query parameter is missing', () => {
      return request(app.getHttpServer())
        .get(`/availability/doctor/${createdDoctorId}`)
        .expect(400);
    });

    it('should return 400 when invalid doctor ID format is provided', () => {
      return request(app.getHttpServer())
        .get('/availability/doctor/invalid-uuid')
        .query({ date: mockAvailability.date })
        .expect(400);
    });

    it('should return empty array when no availability exists for the date', () => {
      return request(app.getHttpServer())
        .get(`/availability/doctor/${createdDoctorId}`)
        .query({ date: '2024-12-31' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });
  });
});
