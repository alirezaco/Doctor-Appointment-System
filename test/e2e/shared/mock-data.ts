import { UserRole } from 'src/shared/enums/user-role.enum';

export const mockDoctor = {
  name: 'John Smith',
  specialty: 'Cardiology',
  bio: 'Experienced cardiologist with 15 years of practice',
};

export const mockInvalidDoctorData = {
  emptyName: {
    ...mockDoctor,
    name: '',
  },
  emptySpecialty: {
    ...mockDoctor,
    specialty: '',
  },
  longName: {
    ...mockDoctor,
    name: 'a'.repeat(256),
  },
  longSpecialty: {
    ...mockDoctor,
    specialty: 'a'.repeat(256),
  },
  longBio: {
    ...mockDoctor,
    bio: 'a'.repeat(1001),
  },
  invalidName: {
    ...mockDoctor,
    name: 'Dr. John Smith!@#',
  },
  invalidSpecialty: {
    ...mockDoctor,
    specialty: 'Cardiology!@#',
  },
  extraFields: {
    ...mockDoctor,
    extraField: 'should not be here',
  },
};

export const mockAppointment = {
  notes: 'Regular checkup appointment',
};

export const mockInvalidAppointmentData = {
  longNotes: {
    ...mockAppointment,
    notes: 'a'.repeat(1001),
  },
  extraFields: {
    ...mockAppointment,
    extraField: 'should not be here',
  },
};

export const mockUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.PATIENT,
};

export const mockInvalidLoginData = {
  invalidEmail: {
    email: 'invalid-email',
    password: 'password123',
  },
  emptyEmail: {
    email: '',
    password: 'password123',
  },
  emptyPassword: {
    email: 'test@example.com',
    password: '',
  },
  wrongPassword: {
    email: 'test@example.com',
    password: 'wrongpassword',
  },
  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'password123',
  },
};

export const mockAvailability = {
  date: '2025-03-20',
  startTime: '09:00',
  endTime: '10:00',
};
