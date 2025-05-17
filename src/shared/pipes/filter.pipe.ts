import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Scope,
  Inject,
} from '@nestjs/common';
import { IFilter, Operator, Search } from '../interfaces/filter.interface';
import {
  isAlpha,
  isBooleanString,
  isDateString,
  isInt,
  isNumberString,
  isString,
  minLength,
} from 'class-validator';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

type FilterInput = {
  limit?: string;
  page?: string;
  sort?: string;
  order?: string;
  search?: string;
};

const validateType = (value: string, validator: (value: string) => boolean) => {
  if (validator(value)) {
    return value;
  }
  throw new BadRequestException('Invalid Type');
};

const TypeHandler: Record<string, (value: string) => any> = {
  S: (value: string) => {
    validateType(value, isString);
    return value;
  },
  N: (value: string) => {
    validateType(value, isNumberString);
    return +value;
  },
  B: (value: string) => {
    validateType(value, isBooleanString);
    return value === 'true';
  },
  D: (value: string) => {
    validateType(value, isDateString);
    return new Date(value);
  },
};

const OperatorHandler: Record<
  string,
  { operator: Operator; convertor?: (value: string, type?: string) => any }
> = {
  eq: {
    operator: '=',
  },
  ne: {
    operator: '!=',
  },
  gt: {
    operator: '>',
  },
  gte: {
    operator: '>=',
  },
  lt: {
    operator: '<',
  },
  lte: {
    operator: '<=',
  },
  in: {
    operator: 'IN',
    convertor: (value: string, type: string) =>
      value.split(',').map(TypeHandler[type]),
  },
  nin: {
    operator: 'NOT IN',
    convertor: (value: string, type: string) =>
      value.split(',').map(TypeHandler[type]),
  },
  like: {
    operator: 'LIKE',
    convertor: (value: string) => `%${value}%`,
  },
  ilike: {
    operator: 'ILIKE',
    convertor: (value: string) => `%${value}%`,
  },
  isnull: {
    operator: 'IS NULL',
  },
  isnotnull: {
    operator: 'IS NOT NULL',
  },
  istrue: {
    operator: 'IS TRUE',
  },
  isfalse: {
    operator: 'IS FALSE',
  },
  isnottrue: {
    operator: 'IS NOT TRUE',
  },
  isnotfalse: {
    operator: 'IS NOT FALSE',
  },
  isunknown: {
    operator: 'IS UNKNOWN',
  },
  isnotunknown: {
    operator: 'IS NOT UNKNOWN',
  },
  between: {
    operator: 'BETWEEN',
    convertor: (value: string, type: string) =>
      value.split(',').map(TypeHandler[type]),
  },
  notbetween: {
    operator: 'NOT BETWEEN',
    convertor: (value: string, type: string) =>
      value.split(',').map(TypeHandler[type]),
  },
};

@Injectable({ scope: Scope.REQUEST })
export class FilterPipe implements PipeTransform {
  constructor(@Inject(REQUEST) protected readonly request: Request) {}

  transform(value: any, _: ArgumentMetadata): IFilter {
    const filter: FilterInput = this.request.query;

    return {
      limit: this.validateLimit(filter?.limit),
      page: this.validatePage(filter?.page),
      sort: this.validateSort(filter?.sort, filter?.order),
      search: this.buildSearch(filter?.search),
    };
  }

  private validateLimit(limit: string | undefined): number {
    if (limit) {
      if (!isInt(+limit) || +limit < 1 || +limit > 100) {
        throw new BadRequestException(
          'Limit must be a number between 1 and 100',
        );
      }

      return +limit;
    }

    return 10;
  }

  private validatePage(page: string | undefined): number {
    if (page) {
      if (!isInt(+page) || +page < 1) {
        throw new BadRequestException('Page must be a number greater than 0');
      }

      return +page;
    }

    return 1;
  }

  private validateSort(
    sort: string | undefined,
    order: string | undefined,
  ): [string, 'ASC' | 'DESC'] {
    if (sort) {
      if (order !== 'ASC' && order !== 'DESC') {
        throw new BadRequestException('Order must be ASC or DESC');
      }
      if (!isAlpha(sort)) {
        throw new BadRequestException('Sort must be a string');
      }
      return [sort, order as 'ASC' | 'DESC'];
    }
    return ['createdAt', 'DESC'];
  }

  private buildSearch(search: string | undefined): Search[] {
    if (search) {
      this.validateSearch(search);

      const searchArray = search.split('|');
      const searchResult: Search[] = [];

      for (const element of searchArray) {
        const [field, value] = element.split('=');

        this.checkEmptyValue(field);
        this.checkEmptyValue(value);

        const { field: fieldValue, operator, type } = this.getField(field);

        searchResult.push({
          field: fieldValue,
          operator: this.getOperator(operator),
          value: this.getValue(value, type, operator),
        });
      }

      return searchResult;
    }
    return [];
  }

  private validateSearch(search: string): string {
    if (isString(search) && minLength(search, 3)) {
      return search;
    }
    throw new BadRequestException('Search must be a string');
  }

  private getField(element: string): {
    field: string;
    operator: string;
    type: string;
  } {
    try {
      const operatorType = element.split('_').pop() as string;

      const type = operatorType[operatorType.length - 1];
      const operator = operatorType?.slice(0, -1) as string;
      const field = element.replace(`_${operatorType}`, '');

      return {
        field,
        operator,
        type,
      };
    } catch (error) {
      throw new BadRequestException('Search Invalid Format');
    }
  }

  private checkEmptyValue(value: string) {
    if (!value) {
      throw new BadRequestException('Search Invalid Format');
    }
  }

  private getOperator(operator: string): Operator {
    const op = OperatorHandler[operator].operator;
    if (!op) {
      throw new BadRequestException('Invalid Operator');
    }
    return op;
  }

  private getValue(value: string, type: string, operator: string) {
    const convertor = OperatorHandler[operator].convertor;
    if (convertor) {
      return convertor(value, type);
    }

    const typeHandler = TypeHandler[type];
    if (!typeHandler) {
      throw new BadRequestException('Invalid Type');
    }

    return typeHandler(value);
  }
}
