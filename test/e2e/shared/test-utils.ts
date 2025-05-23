import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../../src/shared/enums/user-role.enum';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { Doctor } from 'src/modules/doctors/infrastructure/entities/doctor.entity';

export const createAuthToken = (
  jwtService: JwtService,
  role: UserRole = UserRole.ADMIN,
  id: string = '1',
  expiresIn: string = '1d',
): string => {
  return jwtService.sign(
    {
      sub: id,
      email: `${role.toLowerCase()}@example.com`,
      role,
    },
    {
      expiresIn: expiresIn,
    },
  );
};

export const getTestHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const findOrCreateUser = async (
  userRepository: Repository<User>,
  email: string,
  role: UserRole,
) => {
  let user: User | null = await userRepository.findOne({ where: { email } });
  if (!user) {
    user = new User();
    user.email = email;
    user.role = role;
    user.password = 'password';
    user.firstName = email.split('@')[0];
    user.lastName = email.split('@')[0];
    user = await userRepository.save(user);
  }

  return user;
};

export const createNewDoctor = async (
  userRepository: Repository<User>,
  doctorRepository: Repository<Doctor>,
): Promise<Doctor> => {
  const user = new User();
  user.email = `test${Math.round(Math.random() * 100000000)}@example.com`;
  user.role = UserRole.DOCTOR;
  user.password = 'password';
  user.firstName = 'Test';
  user.lastName = 'Doctor';

  const savedUser = await userRepository.save(user);

  const doctor = new Doctor();
  doctor.name = 'Test Doctor';
  doctor.specialty = 'Cardiology';
  doctor.bio = 'Test bio';
  doctor.id = savedUser.id;

  const savedDoctor = await doctorRepository.save(doctor);

  return savedDoctor;
};

export const createNewUser = async (
  userRepository: Repository<User>,
): Promise<User> => {
  const user = new User();
  user.email = `test${Math.round(Math.random() * 100000000)}@example.com`;
  user.role = UserRole.PATIENT;
  user.password = 'password';
  user.firstName = 'Test';
  user.lastName = 'User';

  const savedUser = await userRepository.save(user);

  return savedUser;
};
