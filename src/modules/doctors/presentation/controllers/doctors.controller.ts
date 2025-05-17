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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { CreateDoctorDto } from '../dtos/create-doctor.dto';
import { UpdateDoctorDto } from '../dtos/update-doctor.dto';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { Doctor } from '../../infrastructure/entities/doctor.entity';
import {
  CommonSwaggerAPIDecorator,
  CommonSwaggerControllerDecorator,
  FindAllQuery,
} from 'src/shared/decorators/common-swagger.decorator';
import { DoctorUseCase } from '../../application/use-cases/doctor.use-case';
import { FilterPipe } from 'src/shared/pipes/filter.pipe';
import { IFilter } from 'src/shared/interfaces/filter.interface';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
@CommonSwaggerControllerDecorator('doctors')
export class DoctorsController {
  constructor(private readonly doctorUseCase: DoctorUseCase) {}

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
    return this.doctorUseCase.create(createDoctorDto);
  }

  @Get()
  @CommonSwaggerAPIDecorator({
    operation: 'Get all doctors',
    response: [CreateDoctorDto],
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED],
    query: FindAllQuery,
  })
  async findAll(@Query(FilterPipe) filter: IFilter) {
    return this.doctorUseCase.findAll(filter);
  }

  @Get(':id')
  @CommonSwaggerAPIDecorator({
    operation: 'Get a doctor by id',
    response: Doctor,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    params: 'id',
  })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.doctorUseCase.findOne(id);
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorUseCase.update(id, updateDoctorDto);
  }
}
