import { IFilter } from 'src/shared/interfaces/filter.interface';

export class GetUsersQuery {
  constructor(public readonly filter?: IFilter) {}
}
