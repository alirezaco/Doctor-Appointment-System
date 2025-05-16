import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const CommonSwaggerControllerDecorator = (
  tag: string,
  isBearerAuth = true,
) => {
  const decorators = [ApiTags(tag)];

  if (isBearerAuth) {
    decorators.push(ApiBearerAuth());
  }

  return applyDecorators(...decorators);
};

type optionsApiDecorator = {
  operation: string;
  response: any;
  status: HttpStatus[];
  body?: any;
  params?: any;
  query?: any;
};

const swaggerStatusHandler = {
  [HttpStatus.CREATED]: (options: optionsApiDecorator) => ({
    status: HttpStatus.CREATED,
    description: 'Entity successfully created.',
    type: options.response,
  }),
  [HttpStatus.BAD_REQUEST]: (_: optionsApiDecorator) => ({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request.',
  }),
  [HttpStatus.UNAUTHORIZED]: (_: optionsApiDecorator) => ({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  }),
  [HttpStatus.FORBIDDEN]: (_: optionsApiDecorator) => ({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden.',
  }),
  [HttpStatus.NOT_FOUND]: (_: optionsApiDecorator) => ({
    status: HttpStatus.NOT_FOUND,
    description: 'Not found.',
  }),
  [HttpStatus.INTERNAL_SERVER_ERROR]: (_: optionsApiDecorator) => ({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error.',
  }),
  [HttpStatus.CONFLICT]: (_: optionsApiDecorator) => ({
    status: HttpStatus.CONFLICT,
    description: 'Conflict.',
  }),
  [HttpStatus.OK]: (options: optionsApiDecorator) => ({
    status: HttpStatus.OK,
    description: 'Entity successfully retrieved.',
    type: Array.isArray(options.response)
      ? options.response[0]
      : options.response,
    isArray: Array.isArray(options.response),
  }),
};

export const CommonSwaggerAPIDecorator = (options: optionsApiDecorator) => {
  const decorators = [ApiOperation({ summary: options.operation })];

  if (options.body) {
    decorators.push(ApiBody({ type: options.body }));
  }

  if (options.params) {
    decorators.push(ApiParam({ name: options.params }));
  }

  if (options.query) {
    decorators.push(ApiQuery({ type: options.query }));
  }

  for (const status of options.status) {
    decorators.push(ApiResponse(swaggerStatusHandler[status](options)));
  }

  decorators.push(
    ApiResponse(
      swaggerStatusHandler[HttpStatus.INTERNAL_SERVER_ERROR as HttpStatus](
        options,
      ),
    ),
  );

  return applyDecorators(...decorators);
};
