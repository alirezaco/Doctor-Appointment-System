import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseDatePipe,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { CreateAvailabilityDto } from '../dtos/create-availability.dto';
import { AvailabilityUseCase } from '../../application/use-cases/availability.use-case';
import {
  CommonSwaggerAPIDecorator,
  CommonSwaggerControllerDecorator,
} from 'src/shared/decorators/common-swagger.decorator';
import { Availability } from '../../infrastructure/entities/availability.entity';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@CommonSwaggerControllerDecorator('availability')
export class AvailabilityController {
  constructor(private readonly availabilityUseCase: AvailabilityUseCase) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Create availability',
    response: Availability,
    status: [
      HttpStatus.CREATED,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
    ],
    body: CreateAvailabilityDto,
  })
  async create(@Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilityUseCase.create(
      createAvailabilityDto.doctorId,
      createAvailabilityDto,
    );
  }

  @Get('doctor/:doctorId')
  @CommonSwaggerAPIDecorator({
    operation: 'Get doctor availability',
    response: [Availability],
    status: [
      HttpStatus.OK,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
    ],
    query: {
      date: {
        type: 'string',
        format: 'date',
        example: '2025-01-01',
      },
    },
    params: 'doctorId',
  })
  async getDoctorAvailability(
    @Param('doctorId', new ParseUUIDPipe()) doctorId: string,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return this.availabilityUseCase.getDoctorAvailability(doctorId, date);
  }
}
