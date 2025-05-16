import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { CreateDoctorDto } from '../dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../dtos/update-doctor.dto';
import { CreateDoctorCommand } from '../../application/commands/impl/create-doctor.command';
import { UpdateDoctorCommand } from '../../application/commands/impl/update-doctor.command';
import { GetDoctorQuery } from '../../application/queries/impl/get-doctor.query';
import { GetAllDoctorsQuery } from '../../application/queries/impl/get-all-doctors.query';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Doctor } from '../../infrastructure/entities/doctor.entity';
import { CommonSwaggerAPIDecorator } from 'src/shared/decorators/common-swagger.decorator';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Create a new doctor',
    response: Doctor,
    status: [
      HttpStatus.CREATED,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
    ],
    body: CreateDoctorDto,
  })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.commandBus.execute(new CreateDoctorCommand(createDoctorDto));
  }

  @Get()
  @CommonSwaggerAPIDecorator({
    operation: 'Get all doctors',
    response: [CreateDoctorDto],
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED],
  })
  async findAll() {
    return this.queryBus.execute(new GetAllDoctorsQuery());
  }

  @Get(':id')
  @CommonSwaggerAPIDecorator({
    operation: 'Get a doctor by id',
    response: Doctor,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    params: 'id',
  })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.queryBus.execute(new GetDoctorQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Update a doctor',
    response: Doctor,
    status: [
      HttpStatus.OK,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.NOT_FOUND,
      HttpStatus.BAD_REQUEST,
      HttpStatus.FORBIDDEN,
    ],
    params: 'id',
    body: UpdateDoctorDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.commandBus.execute(
      new UpdateDoctorCommand(id, updateDoctorDto),
    );
  }
}
