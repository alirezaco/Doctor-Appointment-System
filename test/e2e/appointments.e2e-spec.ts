import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/shared/enums/user-role.enum';
import { createTestingApp, cleanupDatabase } from './shared/test-setup';
import {
  createAuthToken,
  createNewDoctor,
  findOrCreateUser,
  getTestHeaders,
} from './shared/test-utils';
import {
  mockDoctor,
  mockAppointment,
  mockInvalidAppointmentData,
} from './shared/mock-data';
import { DataSource, Repository } from 'typeorm';
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';
import { Appointment } from 'src/modules/appointments/infrastructure/entities/appointment.entity';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { AppointmentStatus } from 'src/modules/appointments/infrastructure/enums/appointment-status.enum';

describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let userToken: string;
  let doctorRepository: Repository<Doctor>;
  let appointmentRepository: Repository<Appointment>;
  let userRepository: Repository<User>;
  let createdDoctorId: string;
  let createdUserId: string;
  let adminToken: string;
  let availabilityId: string;

  beforeAll(async () => {
    const { app: testApp, dataSource: testDataSource } =
      await createTestingApp();
    app = testApp;
    dataSource = testDataSource;
    jwtService = app.get(JwtService);

    adminToken = createAuthToken(jwtService, UserRole.ADMIN);

    doctorRepository = dataSource.getRepository(Doctor);
    appointmentRepository = dataSource.getRepository(Appointment);
    userRepository = dataSource.getRepository(User);

    // Create a doctor for testing
    const doctorResponse = await createNewDoctor(
      userRepository,
      doctorRepository,
    );
    createdDoctorId = doctorResponse.id;

    // Create a user for testing
    const userResponse = await findOrCreateUser(
      userRepository,
      'patientAvailability@test.com',
      UserRole.PATIENT,
    );
    createdUserId = userResponse.id;
    userToken = createAuthToken(jwtService, UserRole.PATIENT, createdUserId);

    // Create availability for the doctor
    const availability = await request(app.getHttpServer())
      .post('/availability')
      .set(getTestHeaders(adminToken))
      .send({
        doctorId: createdDoctorId,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
        startTime: '22:00',
        endTime: '22:30',
      });

    availabilityId = availability.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /appointments', () => {
    it('should create a new appointment when valid data is provided', () => {
      const appointmentData = {
        ...mockAppointment,
        doctorId: createdDoctorId,
        availabilityId,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .set(getTestHeaders(userToken))
        .send(appointmentData)
        .expect(201)
        .expect(async (res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.doctor.id).toBe(createdDoctorId);
          expect(res.body.patient.id).toBe(createdUserId);
          expect(res.body.notes).toBe(appointmentData.notes);
          expect(res.body.status).toBe(AppointmentStatus.SCHEDULED);

          const appointment = await appointmentRepository.findOne({
            where: { id: res.body.id },
            relations: ['doctor', 'patient'],
          });
          expect(appointment).toBeDefined();
          expect(appointment?.doctor.id).toBe(createdDoctorId);
          expect(appointment?.patient.id).toBe(createdUserId);
          expect(appointment?.notes).toBe(appointmentData.notes);
          expect(appointment?.status).toBe(AppointmentStatus.SCHEDULED);

          await appointmentRepository.delete(res.body.id);
        });
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .post('/appointments')
        .send(mockAppointment)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .post('/appointments')
        .set(getTestHeaders('invalid-token'))
        .send(mockAppointment)
        .expect(401);
    });

    it('should return 400 when doctor does not exist', () => {
      const nonExistentDoctorId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .post('/appointments')
        .set(getTestHeaders(userToken))
        .send({
          ...mockAppointment,
          doctorId: nonExistentDoctorId,
        })
        .expect(400);
    });

    it('should return 400 when notes are too long', () => {
      return request(app.getHttpServer())
        .post('/appointments')
        .set(getTestHeaders(userToken))
        .send({
          ...mockInvalidAppointmentData.longNotes,
          doctorId: createdDoctorId,
        })
        .expect(400);
    });
  });

  // describe('GET /appointments/:id', () => {
  //   let createdAppointmentId: string;

  //   beforeAll(async () => {
  //     // Create an appointment for testing
  //     const appointmentData = {
  //       ...mockAppointment,
  //       doctorId: createdDoctorId,
  //       patientId: createdUserId,
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/appointments')
  //       .set(getTestHeaders(userToken))
  //       .send(appointmentData);
  //     createdAppointmentId = response.body.id;
  //   });

  //   afterAll(async () => {
  //     if (createdAppointmentId) {
  //       await appointmentRepository.delete(createdAppointmentId);
  //     }
  //   });

  //   it('should return an appointment when requested by the patient', () => {
  //     return request(app.getHttpServer())
  //       .get(`/appointments/${createdAppointmentId}`)
  //       .set(getTestHeaders(userToken))
  //       .expect(200)
  //       .expect((res) => {
  //         expect(res.body).toHaveProperty('id', createdAppointmentId);
  //         expect(res.body.doctor).toHaveProperty('id', createdDoctorId);
  //         expect(res.body.patient).toHaveProperty('id', createdUserId);
  //         expect(res.body).toHaveProperty('startTime');
  //         expect(res.body).toHaveProperty('endTime');
  //         expect(res.body).toHaveProperty('status');
  //         expect(res.body).toHaveProperty('notes');
  //       });
  //   });

  //   it('should return an appointment when requested by the doctor', () => {
  //     return request(app.getHttpServer())
  //       .get(`/appointments/${createdAppointmentId}`)
  //       .set(getTestHeaders(doctorToken))
  //       .expect(200)
  //       .expect((res) => {
  //         expect(res.body).toHaveProperty('id', createdAppointmentId);
  //         expect(res.body.doctor).toHaveProperty('id', createdDoctorId);
  //         expect(res.body.patient).toHaveProperty('id', createdUserId);
  //       });
  //   });

  //   it('should return 404 when appointment does not exist', () => {
  //     const nonExistentId = '98791902-d8a1-4849-9349-2828d22204ba';
  //     return request(app.getHttpServer())
  //       .get(`/appointments/${nonExistentId}`)
  //       .set(getTestHeaders(userToken))
  //       .expect(404);
  //   });

  //   it('should return 401 when no token is provided', () => {
  //     return request(app.getHttpServer())
  //       .get(`/appointments/${createdAppointmentId}`)
  //       .expect(401);
  //   });

  //   it('should return 401 when invalid token is provided', () => {
  //     return request(app.getHttpServer())
  //       .get(`/appointments/${createdAppointmentId}`)
  //       .set(getTestHeaders('invalid-token'))
  //       .expect(401);
  //   });

  //   it('should return 400 when id is not a valid UUID', () => {
  //     return request(app.getHttpServer())
  //       .get('/appointments/invalid-id')
  //       .set(getTestHeaders(userToken))
  //       .expect(400);
  //   });
  // });

  describe('DELETE /appointments/:id', () => {
    let createdAppointmentId: string;

    beforeAll(async () => {
      const availability = await request(app.getHttpServer())
        .post('/availability')
        .set(getTestHeaders(adminToken))
        .send({
          doctorId: createdDoctorId,
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
          startTime: '23:00',
          endTime: '23:30',
        });

      // Create an appointment for testing
      const appointmentData = {
        notes: 'Cancel me',
        doctorId: createdDoctorId,
        availabilityId: availability.body.id,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set(getTestHeaders(userToken))
        .send(appointmentData);

      createdAppointmentId = response.body.id;
    });

    afterAll(async () => {
      if (createdAppointmentId) {
        await appointmentRepository.delete(createdAppointmentId);
      }
    });

    it('should cancel an appointment when requested by the patient', () => {
      return request(app.getHttpServer())
        .delete(`/appointments/${createdAppointmentId}`)
        .set(getTestHeaders(userToken))
        .expect(200)
        .expect(async (_) => {
          const appointment = await appointmentRepository.findOne({
            where: { id: createdAppointmentId },
          });
          expect(appointment).toBeDefined();
          expect(appointment?.status).toBe(AppointmentStatus.CANCELLED);
        });
    });

    // it('should cancel an appointment when requested by the doctor', () => {
    //   return request(app.getHttpServer())
    //     .delete(`/appointments/${createdAppointmentId}`)
    //     .set(getTestHeaders(doctorToken))
    //     .expect(200)
    //     .expect(async (res) => {
    //       expect(res.body).toHaveProperty('id', createdAppointmentId);
    //       expect(res.body.status).toBe(AppointmentStatus.CANCELLED);

    //       const appointment = await appointmentRepository.findOne({
    //         where: { id: createdAppointmentId },
    //       });
    //       expect(appointment).toBeDefined();
    //       expect(appointment?.status).toBe(AppointmentStatus.CANCELLED);
    //     });
    // });

    it('should return 404 when appointment does not exist', () => {
      const nonExistentId = '98791902-d8a1-4849-9349-2828d22204ba';
      return request(app.getHttpServer())
        .delete(`/appointments/${nonExistentId}`)
        .set(getTestHeaders(userToken))
        .expect(404);
    });

    it('should return 401 when no token is provided', () => {
      return request(app.getHttpServer())
        .delete(`/appointments/${createdAppointmentId}`)
        .expect(401);
    });

    it('should return 401 when invalid token is provided', () => {
      return request(app.getHttpServer())
        .delete(`/appointments/${createdAppointmentId}`)
        .set(getTestHeaders('invalid-token'))
        .expect(401);
    });

    it('should return 400 when id is not a valid UUID', () => {
      return request(app.getHttpServer())
        .delete('/appointments/invalid-id')
        .set(getTestHeaders(userToken))
        .expect(400);
    });

    it('should return 400 when trying to cancel an already cancelled appointment', async () => {
      // First cancel the appointment
      await request(app.getHttpServer())
        .delete(`/appointments/${createdAppointmentId}`)
        .set(getTestHeaders(userToken));

      // Try to cancel it again
      return request(app.getHttpServer())
        .delete(`/appointments/${createdAppointmentId}`)
        .set(getTestHeaders(userToken))
        .expect(400);
    });
  });
});
