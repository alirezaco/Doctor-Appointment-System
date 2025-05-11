import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseDatePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { CreateAppointmentCommand } from '../../application/commands/impl/create-appointment.command';
import { CancelAppointmentCommand } from '../../application/commands/impl/cancel-appointment.command';
import { GetDoctorAppointmentsQuery } from '../../application/queries/impl/get-doctor-appointments.query';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.commandBus.execute(
      new CreateAppointmentCommand(createAppointmentDto, req.user.id),
    );
  }

  @Get('doctor/:doctorId')
  async getDoctorAppointments(
    @Param('doctorId') doctorId: string,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return this.queryBus.execute(
      new GetDoctorAppointmentsQuery(doctorId, date),
    );
  }

  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.commandBus.execute(new CancelAppointmentCommand(id));
  }
}
