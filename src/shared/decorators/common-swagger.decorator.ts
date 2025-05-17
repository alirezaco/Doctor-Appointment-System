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
  query?: Record<string, any>;
};

const swaggerStatusHandler = {
  [HttpStatus.CREATED]: (options: optionsApiDecorator) => ({
    status: HttpStatus.CREATED,
    description: 'Entity successfully created.',
    type: { data: options.response },
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
    type: {
      data: Array.isArray(options.response)
        ? options.response[0]
        : options.response,
    },
    isArray: Array.isArray(options.response),
  }),
};

export const FindAllQuery = {
  limit: {
    type: 'number',
    required: false,
    description: 'Limit the number of items to return.',
    example: 10,
  },
  page: {
    type: 'number',
    required: false,
    description: 'Page number to return.',
    example: 1,
  },
  search: {
    type: 'text',
    required: false,
    description: 'Search for a specific item.',
    example: 'John',
  },
  sort: {
    type: 'string',
    required: false,
    description: 'Sort the items by a specific field.',
    example: 'name',
  },
  order: {
    type: 'string',
    required: false,
    description: 'Order the items by a specific field. ASC or DESC.',
    example: 'ASC',
  },
};

export const CommonSwaggerAPIDecorator = (options: optionsApiDecorator) => {
  const decorators = [ApiOperation({ summary: options.operation })];

  setBodyIfExists(decorators, options.body);
  setParamsIfExists(decorators, options.params);
  setQueryIfExists(decorators, options.query);

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

const setBodyIfExists = (decorators: MethodDecorator[], body: any) => {
  if (body) {
    decorators.push(ApiBody({ type: body }));
  }
};

const setParamsIfExists = (decorators: MethodDecorator[], params: any) => {
  if (params) {
    decorators.push(ApiParam({ name: params }));
  }
};

const setQueryIfExists = (decorators: MethodDecorator[], query: any) => {
  if (query) {
    for (const key of Object.keys(query)) {
      const value = query[key] as Record<string, any>;

      decorators.push(
        ApiQuery({
          name: key,
          format: value?.type,
          required: value?.required,
          description: value?.description,
          example: value?.example,
        }),
      );
    }
  }
};
