// Developed by Softeq Development Corporation
// http://www.softeq.com

/*
 * Public API Surface of angular-http-data-lib
 */

export { AbstractRestService, HttpRequestConfig } from './lib/abstract-rest.service';
export { AbstractPaginationRestService, HttpSlicedDataRequestConfig } from './lib/abstract-pagination-rest.service';
export {
  createEmptyDataSource,
  getSlicedData,
  mapDataSourceQuery,
  mapDataSourceResult,
  mapDataSourceResultItem,
  sliceDataByQuery,
  SlicedData,
  SlicedDataQuery,
  SlicedDataQuerySorting,
  SlicedDataSource,
  SortDirection
} from './lib/data-source';
export { RestSettings, HTTP_DATA_BASE_URL } from './lib/rest-settings.service';
export { wrapIntoHttpDataMapper, isClientErrorStatus, isErrorStatus, isServerErrorStatus, RequestMethod } from './lib/http.utils';
export { SofteqHttpDataModule, SofteqHttpDataModuleConfig } from './lib/softeq-http-data.module';
