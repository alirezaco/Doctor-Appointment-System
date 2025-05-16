import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('doctors')
@ApiBearerAuth()
@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiBody({ type: CreateDoctorDto })
  @ApiResponse({
    status: 201,
    description: 'Doctor successfully created.',
    type: CreateDoctorDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can create doctors.',
  })
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.commandBus.execute(new CreateDoctorCommand(createDoctorDto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors' })
  @ApiResponse({
    status: 200,
    description: 'Return all doctors.',
    type: [CreateDoctorDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll() {
    return this.queryBus.execute(new GetAllDoctorsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a doctor by id' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the doctor.',
    type: CreateDoctorDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.queryBus.execute(new GetDoctorQuery(id));
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a doctor' })
  @ApiParam({ name: 'id', description: 'Doctor ID' })
  @ApiBody({ type: UpdateDoctorDto })
  @ApiResponse({
    status: 200,
    description: 'Doctor successfully updated.',
    type: UpdateDoctorDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can update doctors.',
  })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.commandBus.execute(
      new UpdateDoctorCommand(id, updateDoctorDto),
    );
  }
}
