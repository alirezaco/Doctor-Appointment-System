import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/shared/enums/user-role.enum';
import { createTestingApp, cleanupDatabase } from './shared/test-setup';
import { createAuthToken, getTestHeaders } from './shared/test-utils';
import { mockDoctor, mockInvalidDoctorData } from './shared/mock-data';
import { DataSource, Repository } from 'typeorm';
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { Availability } from 'src/modules/availability/infrastructure/entities/availability.entity';
import { Appointment } from 'src/modules/appointments/infrastructure/entities/appointment.entity';

describe('DoctorsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let doctorRepository: Repository<Doctor>;

  beforeAll(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await createTestingApp();
    app = testApp;
    dataSource = testDataSource;
    jwtService = app.get(JwtService);

    adminToken = createAuthToken(jwtService, UserRole.ADMIN);
    userToken = createAuthToken(jwtService, UserRole.PATIENT);
    doctorRepository = dataSource.getRepository(Doctor);
  });

  afterEach(async () => {
    // await cleanupDatabase(dataSource, Appointment.name);
    // await cleanupDatabase(dataSource, Availability.name);
    // await cleanupDatabase(dataSource, Doctor.name);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /doctors', () => {
    it('should create a new doctor when valid data is provided by admin', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockDoctor)
        .expect(201)
        .expect(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(mockDoctor.name);
          expect(res.body.specialty).toBe(mockDoctor.specialty);
          expect(res.body.bio).toBe(mockDoctor.bio);

          const doctor = await doctorRepository.findOne({
            where: { id: res.body.id },
          });
          expect(doctor).toBeDefined();
          expect(doctor?.name).toBe(mockDoctor.name);
          expect(doctor?.specialty).toBe(mockDoctor.specialty);
          expect(doctor?.bio).toBe(mockDoctor.bio);

          await doctorRepository.delete(res.body.id);
        });
    });

    it('should return 403 when non-admin user tries to create doctor', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(userToken))
        .send(mockDoctor)
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .send(mockDoctor)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders('invalid-token'))
        .send(mockDoctor)
        .expect(401);
    });

    it('should return 400 when required fields are missing', () => {
      const { name, ...invalidData } = mockDoctor;
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 when name is empty', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.emptyName)
        .expect(400);
    });

    it('should return 400 when specialty is empty', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.emptySpecialty)
        .expect(400);
    });

    it('should return 400 when name is too long', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longName)
        .expect(400);
    });

    it('should return 400 when specialty is too long', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longSpecialty)
        .expect(400);
    });

    it('should return 400 when bio is too long', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longBio)
        .expect(400);
    });

    it('should return 400 when name contains invalid characters', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.invalidName)
        .expect(400);
    });

    it('should return 400 when specialty contains invalid characters', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.invalidSpecialty)
        .expect(400);
    });

    it('should create doctor without bio when bio is not provided', () => {
      const { bio, ...dataWithoutBio } = mockDoctor;
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(dataWithoutBio)
        .expect(201)
        .expect(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(dataWithoutBio.name);
          expect(res.body.specialty).toBe(dataWithoutBio.specialty);
          expect(res.body?.bio).toBeNull();

          await doctorRepository.delete(res.body.id);
        });
    });

    it('should return 400 when request body is empty', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send({})
        .expect(400);
    });

    it('should return 400 when request body is not JSON', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .set('Content-Type', 'text/plain')
        .send('not json')
        .expect(400);
    });

    it('should return 400 when request body contains extra fields', () => {
      return request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.extraFields)
        .expect(400);
    });
  });
});
