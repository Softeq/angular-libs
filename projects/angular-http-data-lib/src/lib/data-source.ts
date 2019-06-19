// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export enum SortDirection { Ascending, Descending }

export interface SlicedDataQuerySorting {
  field: string;
  direction: SortDirection;
}

export interface SlicedDataQuery {
  from: number;
  to: number;
  sorting?: SlicedDataQuerySorting;
}

export interface SlicedData<T> {
  from: number;
  to: number;
  data: T[];
  total: number;
}

export interface SlicedDataSource<T> {
  select(query: SlicedDataQuery): Observable<SlicedData<T>>;
}

export const EMPTY_SLICED_DATA: SlicedData<any> = { from: 0, to: 0, data: [], total: 0 };

export function getSlicedData<T>(data: SlicedData<T>): T[] {
  return data.data;
}

export function createEmptyDataSource<T>(): SlicedDataSource<T> {
  return { select: () => of(EMPTY_SLICED_DATA) };
}

export function mapDataSourceQuery<T>(dataSource: SlicedDataSource<T>,
                                      transform: (query: SlicedDataQuery) => SlicedDataQuery): SlicedDataSource<T> {
  return { select: (query) => dataSource.select(transform(query)) };
}

export function mapDataSourceResult<T, U>(original: SlicedDataSource<T>,
                                          transform: (data: SlicedData<T>) => SlicedData<U>): SlicedDataSource<U> {
  return { select: (query) => original.select(query).pipe(map(transform)) };
}

export function mapDataSourceResultItem<T, U>(original: SlicedDataSource<T>,
                                              transform: (value: T, index: number, array: T[]) => U): SlicedDataSource<U> {
  return mapDataSourceResult(original, (slicedData) => ({ ...slicedData, data: slicedData.data.map(transform) }));
}

export function sliceDataByQuery<T>(list: T[], query: SlicedDataQuery): T[] {
  return list.slice(query.from, query.to);
}
