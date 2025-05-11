import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseDatePipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { CreateAvailabilityDto } from '../dtos/create-availability.dto';
import { CreateAvailabilityCommand } from '../../application/commands/impl/create-availability.command';
import { GetDoctorAvailabilityQuery } from '../../application/queries/impl/get-doctor-availability.query';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('doctor/:doctorId')
  @Roles(UserRole.ADMIN)
  async create(
    @Param('doctorId') doctorId: string,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.commandBus.execute(
      new CreateAvailabilityCommand(doctorId, createAvailabilityDto),
    );
  }

  @Get('doctor/:doctorId')
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date', new ParseDatePipe()) date: Date,
  ) {
    return this.queryBus.execute(
      new GetDoctorAvailabilityQuery(doctorId, date),
    );
  }
}
