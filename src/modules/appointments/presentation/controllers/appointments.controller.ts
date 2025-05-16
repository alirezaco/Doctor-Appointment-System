import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseDatePipe,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { AppointmentUseCase } from '../../application/use-cases/appointment.use-cae';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { IUserToken } from 'src/shared/interfaces/user-token.interface';
import {
  CommonSwaggerAPIDecorator,
  CommonSwaggerControllerDecorator,
} from 'src/shared/decorators/common-swagger.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
@CommonSwaggerControllerDecorator('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentUseCase: AppointmentUseCase) {}

  @Post()
  @CommonSwaggerAPIDecorator({
    operation: 'Create a new appointment',
    response: CreateAppointmentDto,
    status: [
      HttpStatus.CREATED,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.FORBIDDEN,
      HttpStatus.NOT_FOUND,
    ],
    body: CreateAppointmentDto,
  })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser() user: IUserToken,
  ) {
    return this.appointmentUseCase.create(createAppointmentDto, user.id);
  }

  @Get('doctor/:doctorId')
  @CommonSwaggerAPIDecorator({
    operation: 'Get doctor appointments',
    response: CreateAppointmentDto,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    params: 'doctorId',
    query: 'date',
  })
  async getDoctorAppointments(
    @Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return this.appointmentUseCase.getDoctorAppointments(doctorId, date);
  }

  @Delete(':id')
  @CommonSwaggerAPIDecorator({
    operation: 'Cancel an appointment',
    response: CreateAppointmentDto,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    params: 'id',
  })
  async cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @GetUser() user: IUserToken,
  ) {
    return this.appointmentUseCase.cancel(id, user.id);
  }
}
