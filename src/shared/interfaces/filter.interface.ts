export interface IFilter {
  page: number;
  limit: number;
  search: Search[];
  sort: [string, 'ASC' | 'DESC'];
}

export type Operator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL'
  | 'BETWEEN'
  | 'NOT BETWEEN'
  | 'IS TRUE'
  | 'IS FALSE'
  | 'IS NOT TRUE'
  | 'IS NOT FALSE'
  | 'IS UNKNOWN'
  | 'IS NOT UNKNOWN'
  | 'IS NULL'
  | 'IS NOT NULL';

export type Search = {
  field: string;
  value: string;
  operator: Operator;
};
