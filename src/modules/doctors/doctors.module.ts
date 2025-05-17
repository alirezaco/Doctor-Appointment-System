import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './presentation/controllers/doctors.controller';
import { CreateDoctorHandler } from './application/commands/handlers/create-doctor.handler';
import { UpdateDoctorHandler } from './application/commands/handlers/update-doctor.handler';
import { GetDoctorHandler } from './application/queries/handlers/get-doctor.handler';
import { Doctor } from './infrastructure/entities/doctor.entity';
import { DoctorRepository } from './infrastructure/repositories/doctor.repository';
import { DOCTOR_REPOSITORY } from './domain/repositories/doctor.repository.interface';
import { GetAllDoctorsHandler } from './application/queries/handlers/get-all-doctors.handler';
import { DoctorUseCase } from './application/use-cases/doctor.use-case';

const CommandHandlers = [CreateDoctorHandler, UpdateDoctorHandler];
const QueryHandlers = [GetDoctorHandler, GetAllDoctorsHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Doctor])],
  controllers: [DoctorsController],
  providers: [
    {
      provide: DOCTOR_REPOSITORY,
      useClass: DoctorRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    DoctorUseCase,
  ],
  exports: [DOCTOR_REPOSITORY],
})
export class DoctorsModule {}
