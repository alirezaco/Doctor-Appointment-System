import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorCommand } from '../impl/create-doctor.command';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY,
} from '../../../domain/repositories/doctor.repository.interface';
import { Doctor } from '../../../infrastructure/entities/doctor.entity';
import { DoctorCreatedEvent } from '../../../domain/events/doctor-created.event';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/users/domain/repositories/user.repository.interface';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { UserRole } from 'src/shared/enums/user-role.enum';

@CommandHandler(CreateDoctorCommand)
export class CreateDoctorHandler
  implements ICommandHandler<CreateDoctorCommand>
{
  private readonly logger = new Logger(CreateDoctorHandler.name);

  constructor(
    @Inject(DOCTOR_REPOSITORY)
    private readonly doctorRepository: IDoctorRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateDoctorCommand): Promise<Doctor> {
    const { createDoctorDto } = command;
    this.logger.debug(`Creating new doctor with name: ${createDoctorDto.name}`);

    // Check if user exists
    const user: User = await this.findUserById(createDoctorDto.userId);

    // Check if user is already a doctor
    this.checkIfUserIsDoctor(user);
    await this.checkExistDoctor(user.id);

    // update user role to doctor
    await this.updateUserRole(user);

    const doctor = new Doctor();
    Object.assign(doctor, createDoctorDto);
    doctor.id = user.id; // Assuming the doctor ID is the same as the user ID

    const createdDoctor = await this.doctorRepository.create(doctor);
    this.logger.log(`Doctor created successfully with ID: ${createdDoctor.id}`);

    this.eventBus.publish(new DoctorCreatedEvent(createdDoctor));
    this.logger.debug('DoctorCreatedEvent published');

    return createdDoctor;
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    this.logger.debug(`User with ID ${userId} found`);

    return user;
  }

  private async updateUserRole(user: User): Promise<void> {
    user.role = UserRole.DOCTOR; // Assuming the role is a string
    await this.userRepository.update(user.id, {
      role: user.role,
    });
    this.logger.debug(`User role updated to doctor for user ID: ${user.id}`);
  }

  private checkIfUserIsDoctor(user: User): void {
    if (user.role === UserRole.DOCTOR) {
      this.logger.error(`User with ID ${user.id} is already a doctor`);
      throw new BadRequestException(
        `User with ID ${user.id} is already a doctor`,
      );
    }
    this.logger.debug(`User with ID ${user.id} is not a doctor`);
  }

  private async checkExistDoctor(userId: string): Promise<void> {
    const doctor: Doctor = await this.doctorRepository.findById(userId);

    if (doctor) {
      this.logger.error(`User with ID ${doctor.id} is already a doctor`);
      throw new BadRequestException(
        `User with ID ${doctor.id} is already a doctor`,
      );
    }
    this.logger.debug(`User with ID ${userId} is not a doctor`);
  }
}
