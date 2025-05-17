import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { IFilter, Operator } from '../interfaces/filter.interface';

const handleSearch: Record<Operator, string> = {
  '=': ' = :value',
  '!=': ' != :value',
  '>': ' > :value',
  '<': ' < :value',
  '>=': ' >= :value',
  '<=': ' <= :value',
  LIKE: ' LIKE :value',
  ILIKE: ' ILIKE :value',
  IN: ' IN (:...value)',
  'NOT IN': ' NOT IN (:...value)',
  'IS NULL': ' IS NULL',
  'IS NOT NULL': ' IS NOT NULL',
  BETWEEN: ' BETWEEN :start AND :end',
  'NOT BETWEEN': ' NOT BETWEEN :start AND :end',
  'IS TRUE': ' IS TRUE',
  'IS FALSE': ' IS FALSE',
  'IS NOT TRUE': ' IS NOT TRUE',
  'IS NOT FALSE': ' IS NOT FALSE',
  'IS UNKNOWN': ' IS UNKNOWN',
  'IS NOT UNKNOWN': ' IS NOT UNKNOWN',
};

export class BaseRepository<T extends ObjectLiteral> {
  constructor(
    private readonly baseRepository: Repository<T>,
    private readonly alias: string,
    private readonly relations: string[] = [],
  ) {}

  async create(entity: T): Promise<T> {
    return this.baseRepository.save(entity);
  }

  async findById(id: string): Promise<T> {
    const entity = await this.baseRepository.findOne({
      where: { id: id as any },
      relations: this.relations,
    });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }

  async findAll(filter?: IFilter): Promise<T[]> {
    let query = this.baseRepository.createQueryBuilder(this.alias);
    if (filter) {
      query = this.buildQuery(query, filter);
    }
    query = this.buildJoins(query, filter);
    return query.getMany();
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    await this.baseRepository.update(id, entity);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.baseRepository.delete(id);
  }

  private buildQuery(
    query: SelectQueryBuilder<T>,
    filter: IFilter,
  ): SelectQueryBuilder<T> {
    if (filter?.limit) {
      query.limit(filter.limit);
    }
    if (filter?.page) {
      query.offset((filter.page - 1) * filter.limit);
    }
    if (filter?.sort) {
      const [field, order] = filter.sort;
      query.orderBy(`${this.alias}.${field}`, order);
    }
    if (filter?.search) {
      query = this.buildSearch(query, filter);
    }

    return query;
  }

  private buildSearch(
    query: SelectQueryBuilder<T>,
    filter: IFilter,
  ): SelectQueryBuilder<T> {
    for (const search of filter.search) {
      query.andWhere(
        `${this.alias}.${search.field} ${handleSearch[search.operator]}`,
        {
          value: search.value,
          start: search?.value?.[0],
          end: search?.value?.[1],
        },
      );
    }

    return query;
  }

  private buildJoins(
    query: SelectQueryBuilder<T>,
    filter?: IFilter,
  ): SelectQueryBuilder<T> {
    const joinHandler: Record<string, any> = {
      left: query.leftJoin,
      inner: query.innerJoin,
    };

    if (filter?.joins) {
      for (const join of filter.joins) {
        joinHandler[join.type](
          `${join.table} as ${join.alias}`,
          `${join.alias}.id = ${this.alias}.id`,
        );
      }
    }
    return query;
  }
}
