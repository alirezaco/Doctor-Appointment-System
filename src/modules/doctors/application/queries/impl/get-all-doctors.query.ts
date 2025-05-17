import { IFilter } from 'src/shared/interfaces/filter.interface';

export class GetAllDoctorsQuery {
  constructor(public readonly filter: IFilter) {}
}
