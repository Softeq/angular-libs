// Developed by Softeq Development Corporation
// http://www.softeq.com

import identity from 'lodash/identity';
import toArray from 'lodash/toArray';
import isArray from 'lodash/isArray';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource } from '../public-api';
import { ComparatorFn, IdentityFn, TransformFn } from '@softeq/types';

export enum SortDirection { Ascending, Descending }

export interface DataQuerySort {
  field: string;
  direction: SortDirection;
}

export interface DataQuery {
  from: number;
  to: number;
  sort?: DataQuerySort[];
}

export interface ResultSet<T> {
  from: number;
  to: number;
  data: T[];
  total: number;
}

export type ResultSetSelector<T> = TransformFn<DataQuery, Observable<ResultSet<T>>>;
export type DataSourceOperator<T, U> = TransformFn<ResultSetSelector<T>, ResultSetSelector<U>>;

export type ComparatorFactory<T> = TransformFn<DataQuerySort[], ComparatorFn<T>>;

const DEFAULT_COMPARATOR_FACTORY = (sort?: DataQuerySort[]): ComparatorFn<any> => {
  if (!sort || sort.length === 0) {
    return identity;
  } else {
    const length = sort.length;

    return (a, b) => {
      for (let i = 0; i < length; i++) {
        const { field, direction } = sort[i];

        const aValue = a[field];
        const bValue = b[field];

        if (aValue < bValue) {
          return direction === SortDirection.Ascending ? -1 : 1;
        } else if (aValue > bValue) {
          return direction === SortDirection.Ascending ? 1 : -1;
        }
      }
      return 0;
    };
  }
};

export interface DataSource<T> {
  select(query: DataQuery): Observable<ResultSet<T>>;

  pipe<U>(operator: DataSourceOperator<T, U>): DataSource<U>;

  pipe<U1, U2>(operator1: DataSourceOperator<T, U1>, operator2: DataSourceOperator<U1, U2>): DataSource<U2>;

  pipe<U1, U2, U3>(operator1: DataSourceOperator<T, U1>,
                   operator2: DataSourceOperator<U1, U2>,
                   operator3: DataSourceOperator<U2, U3>): DataSource<U3>;

  pipe<U1, U2, U3, U4>(operator1: DataSourceOperator<T, U1>,
                       operator2: DataSourceOperator<U1, U2>,
                       operator3: DataSourceOperator<U2, U3>,
                       operator4: DataSourceOperator<U3, U4>): DataSource<U4>;
}

export function createDataSource<T>(selector: ResultSetSelector<T>): DataSource<T> {
  return {
    select: selector,
    pipe<U>(): DataSource<U> {
      return createDataSource(toArray(arguments).reduce((lastSelector, operator) => operator(lastSelector), selector));
    },
  };
}

export const EMPTY_RESULT_SET: ResultSet<any> = { from: 0, to: 0, data: [], total: 0 };

export function getResultSetData<T>(resultSet: ResultSet<T>): T[] {
  return resultSet.data;
}

export function emptyDataSource<T>(): DataSource<T> {
  return createDataSource(() => of(EMPTY_RESULT_SET));
}

export function dataSourceFrom<T>(arrayOrStream: T[] | Observable<T[]>,
                                  comparatorFactory: ComparatorFactory<T> = DEFAULT_COMPARATOR_FACTORY): DataSource<T> {
  if (isArray(arrayOrStream)) {
    return createDataSource((query) => of(resultSetByQuery(arrayOrStream, query, comparatorFactory)));
  } else {
    return createDataSource((query) => arrayOrStream.pipe(map((items) => resultSetByQuery(items, query, comparatorFactory))));
  }
}

export function mapQuery<T>(transform: IdentityFn<DataQuery>): DataSourceOperator<T, T> {
  return (selector) => (query) => selector(transform(query));
}

export function mapResultSet<T, U>(transform: TransformFn<ResultSet<T>, ResultSet<U>>): DataSourceOperator<T, U> {
  return (selector) => (query) => selector(query).pipe(map(transform));
}

export function mapResultSetItem<T, U>(transform: TransformFn<T, U>): DataSourceOperator<T, U> {
  return mapResultSet((resultSet) => ({ ...resultSet, data: resultSet.data.map(transform) }));
}

export function selectByQuery<T>(list: T[], query: DataQuery, comparatorFactory: ComparatorFactory<T> = DEFAULT_COMPARATOR_FACTORY): T[] {
  return sortByComparator(list, comparatorFactory(query.sort)).slice(query.from, query.to);
}

export function resultSetByQuery<T>(list: T[],
                                    query: DataQuery,
                                    comparatorFactory: ComparatorFactory<T> = DEFAULT_COMPARATOR_FACTORY): ResultSet<T> {
  const data = selectByQuery(list, query, comparatorFactory);
  return {
    from: Math.min(query.from, list.length),
    to: Math.min(query.to, list.length),
    data,
    total: list.length,
  };
}

function sortByComparator<T>(array: T[], comparator: ComparatorFn<T>): T[] {
  const copied = array.concat();
  copied.sort(comparator);
  return copied;
}
