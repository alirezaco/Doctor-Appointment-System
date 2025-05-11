import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Availability } from './infrastructure/entities/availability.entity';
import { AvailabilityRepository } from './infrastructure/repositories/availability.repository';
import { AvailabilityController } from './presentation/controllers/availability.controller';
import { CreateAvailabilityHandler } from './application/commands/handlers/create-availability.handler';
import { GetDoctorAvailabilityHandler } from './application/queries/handlers/get-doctor-availability.handler';
import { DoctorsModule } from '../doctors/doctors.module';
import { AVAILABILITY_REPOSITORY } from './domain/repositories/availability.repository.interface';

const CommandHandlers = [CreateAvailabilityHandler];
const QueryHandlers = [GetDoctorAvailabilityHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Availability]),
    CqrsModule,
    DoctorsModule,
  ],
  controllers: [AvailabilityController],
  providers: [
    {
      provide: AVAILABILITY_REPOSITORY,
      useClass: AvailabilityRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AVAILABILITY_REPOSITORY],
})
export class AvailabilityModule {}
