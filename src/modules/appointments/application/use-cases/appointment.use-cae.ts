import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAppointmentDto } from '../../presentation/dtos/create-appointment.dto';
import { CreateAppointmentCommand } from '../commands/impl/create-appointment.command';
import { GetDoctorAppointmentsQuery } from '../queries/impl/get-doctor-appointments.query';
import { CancelAppointmentCommand } from '../commands/impl/cancel-appointment.command';
import { Appointment } from '../../infrastructure/entities/appointment.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { DOCTOR_AVAILABILITY_CACHE_KEY } from 'src/shared/constants/cache-key.constant';

@Injectable()
export class AppointmentUseCase {
  private readonly logger = new Logger(AppointmentUseCase.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const res = await this.commandBus.execute<
      CreateAppointmentCommand,
      Appointment
    >(new CreateAppointmentCommand(createAppointmentDto, userId));

    // Delete the cache key for the doctor's availability
    const cacheKey = this.createCacheKey(
      createAppointmentDto.doctorId,
      res.availability.date,
    );
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Deleted cache key: ${cacheKey}`);

    return res;
  }

  async getDoctorAppointments(
    doctorId: string,
    date: Date,
  ): Promise<Appointment[]> {
    return this.queryBus.execute<GetDoctorAppointmentsQuery, Appointment[]>(
      new GetDoctorAppointmentsQuery(doctorId, date),
    );
  }

  async cancel(id: string, userId: string): Promise<void> {
    return this.commandBus.execute<CancelAppointmentCommand, void>(
      new CancelAppointmentCommand(id, userId),
    );
  }

  private createCacheKey(doctorId: string, date: string): string {
    return `${DOCTOR_AVAILABILITY_CACHE_KEY}:${doctorId}:${date}`;
  }
}
