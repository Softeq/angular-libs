// Developed by Softeq Development Corporation
// http://www.softeq.com

import range from 'lodash/range';
import { DataSource, dataSourceFrom, mapQuery, mapResultSetItem, SortDirection } from './data-source';

describe('DataSource', () => {
  let numberDataSource: DataSource<number>;
  let entityDataSource: DataSource<{ value: number }>;

  beforeEach(() => {
    numberDataSource = dataSourceFrom(range(100));
    entityDataSource = dataSourceFrom(range(100).map((value) => ({ value })));
  });

  it('should return queried range', () => {
    numberDataSource.select({ from: 20, to: 50 }).subscribe((resultSet) => {
      expect(resultSet).toEqual({
        from: 20,
        to: 50,
        total: 100,
        data: range(30).map((n) => n + 20),
      });
    });
  });

  it('should sort items by requested field', () => {
    entityDataSource.select({
      from: 5,
      to: 10,
      sort: [{ field: 'value', direction: SortDirection.Descending}],
    }).subscribe(({ data }) => {
      expect(data).toEqual([94, 93, 92, 91, 90].map((value) => ({ value })));
    });
  });

  it('should map items using mapResultSetItem', () => {
    numberDataSource
      .pipe(mapResultSetItem((n) => n * n))
      .select({ from: 10, to: 13, })
      .subscribe(({ data }) => {
        expect(data).toEqual([100, 121, 144]);
      });
  });

  it('should map query using mapQuery', () => {
    numberDataSource
      .pipe(mapQuery((query) => ({ ...query, from: 20, to: 30 })))
      .select({ from: 0, to: 10, })
      .subscribe(({ from, to }) => {
        expect(from).toBe(20);
        expect(to).toBe(30);
      });
  });
});
