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

  describe('PUT /doctors/:id', () => {
    let createdDoctorId: string;

    beforeAll(async () => {
      // Create a doctor to update
      const response = await request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockDoctor);
      createdDoctorId = response.body.id;
    });

    afterAll(async () => {
      if (createdDoctorId) {
        await doctorRepository.delete(createdDoctorId);
      }
    });

    it('should update a doctor when valid data is provided by admin', () => {
      const updateData = {
        name: 'Updated Name',
        specialty: 'UpdatedSpecialty',
        bio: 'Updated bio information',
      };

      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(updateData)
        .expect(200)
        .expect(async (res) => {
          expect(res.body.id).toBe(createdDoctorId);
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.specialty).toBe(updateData.specialty);
          expect(res.body.bio).toBe(updateData.bio);

          const doctor = await doctorRepository.findOne({
            where: { id: createdDoctorId },
          });
          expect(doctor).toBeDefined();
          expect(doctor?.name).toBe(updateData.name);
          expect(doctor?.specialty).toBe(updateData.specialty);
          expect(doctor?.bio).toBe(updateData.bio);
        });
    });

    it('should return 404 when doctor does not exist', () => {
      const nonExistentId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .put(`/doctors/${nonExistentId}`)
        .set(getTestHeaders(adminToken))
        .send(mockDoctor)
        .expect(404);
    });

    it('should return 403 when non-admin user tries to update doctor', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(userToken))
        .send(mockDoctor)
        .expect(403);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .send(mockDoctor)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders('invalid-token'))
        .send(mockDoctor)
        .expect(401);
    });

    it('should return 400 when name is empty', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.emptyName)
        .expect(400);
    });

    it('should return 400 when specialty is empty', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.emptySpecialty)
        .expect(400);
    });

    it('should return 400 when name is too long', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longName)
        .expect(400);
    });

    it('should return 400 when specialty is too long', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longSpecialty)
        .expect(400);
    });

    it('should return 400 when bio is too long', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.longBio)
        .expect(400);
    });

    it('should return 400 when name contains invalid characters', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.invalidName)
        .expect(400);
    });

    it('should return 400 when specialty contains invalid characters', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.invalidSpecialty)
        .expect(400);
    });

    it('should update doctor without bio when bio is not provided', () => {
      const { bio, ...dataWithoutBio } = mockDoctor;
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(dataWithoutBio)
        .expect(200);
    });

    it('should return 400 when request body contains extra fields', () => {
      return request(app.getHttpServer())
        .put(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .send(mockInvalidDoctorData.extraFields)
        .expect(400);
    });
  });

  describe('GET /doctors', () => {
    let createdDoctorIds: string[] = [];

    beforeAll(async () => {
      // Create multiple doctors for testing
      const doctors = [
        mockDoctor,
        { ...mockDoctor, name: 'Dr. Jane Smith', specialty: 'Neurology' },
        { ...mockDoctor, name: 'Dr. Mike Johnson', specialty: 'Pediatrics' },
      ];

      for (const doctor of doctors) {
        const response = await request(app.getHttpServer())
          .post('/doctors')
          .set(getTestHeaders(adminToken))
          .send(doctor);
        createdDoctorIds.push(response.body.id);
      }
    });

    afterAll(async () => {
      // Clean up created doctors
      for (const id of createdDoctorIds) {
        await doctorRepository.delete(id);
      }
    });

    it('should return all doctors when requested by admin', () => {
      return request(app.getHttpServer())
        .get('/doctors')
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(3);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('specialty');
          expect(res.body[0]).toHaveProperty('bio');
        });
    });

    it('should return all doctors when requested by regular user', () => {
      return request(app.getHttpServer())
        .get('/doctors')
        .set(getTestHeaders(userToken))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/doctors').expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .get('/doctors')
        .set(getTestHeaders('invalid-token'))
        .expect(401);
    });

    it('should return doctors with correct pagination', () => {
      return request(app.getHttpServer())
        .get('/doctors?page=1&limit=2')
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(2);
        });
    });

    it('should return 400 when pagination parameters are invalid', () => {
      return request(app.getHttpServer())
        .get('/doctors?page=0&limit=0')
        .set(getTestHeaders(adminToken))
        .expect(400);
    });
  });

  describe('GET /doctors/:id', () => {
    let createdDoctorId: string;

    beforeAll(async () => {
      // Create a doctor to fetch
      const response = await request(app.getHttpServer())
        .post('/doctors')
        .set(getTestHeaders(adminToken))
        .send(mockDoctor);
      createdDoctorId = response.body.id;
    });

    afterAll(async () => {
      if (createdDoctorId) {
        await doctorRepository.delete(createdDoctorId);
      }
    });

    it('should return a doctor when requested by admin', () => {
      return request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(adminToken))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdDoctorId);
          expect(res.body).toHaveProperty('name', mockDoctor.name);
          expect(res.body).toHaveProperty('specialty', mockDoctor.specialty);
          expect(res.body).toHaveProperty('bio', mockDoctor.bio);
        });
    });

    it('should return a doctor when requested by regular user', () => {
      return request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders(userToken))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdDoctorId);
          expect(res.body).toHaveProperty('name', mockDoctor.name);
          expect(res.body).toHaveProperty('specialty', mockDoctor.specialty);
          expect(res.body).toHaveProperty('bio', mockDoctor.bio);
        });
    });

    it('should return 404 when doctor does not exist', () => {
      const nonExistentId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .get(`/doctors/${nonExistentId}`)
        .set(getTestHeaders(adminToken))
        .expect(404);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .get(`/doctors/${createdDoctorId}`)
        .set(getTestHeaders('invalid-token'))
        .expect(401);
    });

    it('should return 400 when id is not a valid UUID', () => {
      return request(app.getHttpServer())
        .get('/doctors/invalid-id')
        .set(getTestHeaders(adminToken))
        .expect(400);
    });
  });
});
