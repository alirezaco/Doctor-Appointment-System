import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDoctorDto } from '../../presentation/dtos/create-doctor.dto';
import { CreateDoctorCommand } from '../commands/impl/create-doctor.command';
import { GetAllDoctorsQuery } from '../queries/impl/get-all-doctors.query';
import { Doctor } from '../../infrastructure/entities/doctor.entity';
import { GetDoctorQuery } from '../queries/impl/get-doctor.query';
import { UpdateDoctorDto } from '../../presentation/dtos/update-doctor.dto';
import { UpdateDoctorCommand } from '../commands/impl/update-doctor.command';
@Injectable()
export class DoctorUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    return this.commandBus.execute<CreateDoctorCommand, Doctor>(
      new CreateDoctorCommand(createDoctorDto),
    );
  }

  async findAll(): Promise<Doctor[]> {
    return this.queryBus.execute<GetAllDoctorsQuery, Doctor[]>(
      new GetAllDoctorsQuery(),
    );
  }

  async findOne(id: string): Promise<Doctor> {
    return this.queryBus.execute<GetDoctorQuery, Doctor>(
      new GetDoctorQuery(id),
    );
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    return this.commandBus.execute<UpdateDoctorCommand, Doctor>(
      new UpdateDoctorCommand(id, updateDoctorDto),
    );
  }
}
