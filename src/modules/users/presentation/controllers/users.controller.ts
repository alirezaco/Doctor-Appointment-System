import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from 'src/modules/users/infrastructure/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { UserUseCase } from '../../application/use-cases/user.use-case';
import {
  CommonSwaggerAPIDecorator,
  CommonSwaggerControllerDecorator,
} from 'src/shared/decorators/common-swagger.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@CommonSwaggerControllerDecorator('users')
export class UsersController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('me')
  @CommonSwaggerAPIDecorator({
    operation: 'Get the current user',
    response: User,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
  })
  getCurrentUser(@GetUser() user: User): Promise<User> {
    return this.userUseCase.findOne(user.id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Create a new user',
    response: User,
    status: [
      HttpStatus.CREATED,
      HttpStatus.BAD_REQUEST,
      HttpStatus.FORBIDDEN,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.CONFLICT,
    ],
    body: CreateUserDto,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userUseCase.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Get all users',
    response: [User],
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN],
  })
  findAll(): Promise<User[]> {
    return this.userUseCase.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Get a user by id',
    response: User,
    status: [HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND],
    params: 'id',
  })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<User> {
    return this.userUseCase.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @CommonSwaggerAPIDecorator({
    operation: 'Update a user',
    response: User,
    status: [
      HttpStatus.OK,
      HttpStatus.UNAUTHORIZED,
      HttpStatus.NOT_FOUND,
      HttpStatus.FORBIDDEN,
      HttpStatus.CONFLICT,
    ],
    params: 'id',
    body: UpdateUserDto,
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userUseCase.update(id, updateUserDto);
  }
}
