// Developed by Softeq Development Corporation
// http://www.softeq.com

import { HttpHeaders, HttpResponse, } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { SlicedData, SlicedDataQuery, SlicedDataSource } from './data-source';
import { createHttpData, DataMapper, } from '@softeq/data-mappers';
import {
  createGenericRequest,
  isResponseHttpEvent,
  mergeSortByParameter,
  NativeHeadersData, parseResponseWithMapper,
  RequestMethod,
  wrapIntoHttpDataMapper
} from './http.utils';
import { RestSettings } from './rest-settings.service';
import { AbstractRestService, HttpRequestConfig } from './abstract-rest.service';

const CONTENT_RANGE_HEADER_RE = /^items\s+(((\d+)-(\d+))|(\*))\/(\d+)$/;

/**
 * Definition of HTTP request operation which returns paginable result set.
 */
export type HttpSlicedDataRequestConfig<Req, Resp> = HttpRequestConfig<Req, Resp[]>;

/**
 * Definition of HTTP request operation having given query which returns pageable result set.
 */
export interface HttpSlicedDataQueryRequestConfig<Req, Resp> extends HttpSlicedDataRequestConfig<Req, Resp> {
  query: SlicedDataQuery;
}

/**
 * Basic class for all REST services.
 * It provides basic support of operations over HTTP protocol and integration with mappers.
 */
export abstract class AbstractPaginationRestService extends AbstractRestService {
  constructor(settings: RestSettings) {
    super(settings);
  }

  /**
   * Performs HTTP paginable request operation based on given config and using provided mappers (from config).
   * Paginable request differs from typical request in the following way
   *
   * * paginable request always has query.
   *             Query tells how to sort data and what slice of data should be retrieved from backend.
   *             Slice is defined by interval (from ... to)
   * * paginable request adds additional query parameter (sortBy) which defines how to sort data
   * * paginable request adds range header (Range) which defines slice of data that should be retrieved
   * * paginable request always returns instance of {@link SlicedData}
   */
  protected createSlicedDataRequest<S, R>(config: HttpSlicedDataQueryRequestConfig<S, R>): Observable<SlicedData<R>> {
    const { method, url, query, body, requestMapper, responseMapper } = config;

    const httpRequestMapper = requestMapper ? wrapIntoHttpDataMapper(requestMapper) : void 0;
    const httpResponseMapper = responseMapper ? wrapIntoHttpDataMapper(responseMapper) : void 0;

    // create request object using provided mapper
    let request = createGenericRequest(method, this.url(url), body, httpRequestMapper, httpResponseMapper);

    // add sorting as query parameter
    if (query.sorting) {
      request = request.clone({
        url: mergeSortByParameter(request.url, query.sorting),
      });
    }

    request = request.clone({
      headers: request.headers.set('Range', `items=${query.from}-${Math.max(query.to - 1, 0)}`),
    });

    // run request
    return this.httpClient.request(request).pipe(
      filter<HttpResponse<any>>(isResponseHttpEvent),
      switchMap((response: HttpResponse<any>) => {
        const entities = parseResponseWithMapper(response, httpResponseMapper);

        // validate response
        if (!Array.isArray(entities)) {
          throw new Error(`Response of '${response.url}' is not an array`);
        }

        let total = -1;

        if (response.headers) {
          const match = CONTENT_RANGE_HEADER_RE.exec(response.headers.get('Content-Range') || '');

          if (!(match && match[6])) {
            throw new Error(`Invalid Content-Range header for request '${response.url}': ${response.headers.get('Content-Range')}`);
          }

          if (!match) {
            throw new Error(`Invalid Content-Range header for request '${response.url}': ${response.headers.get(
              'Content-Range')}`);
          }

          total = Number(match[6]); // tslint:disable-line:no-magic-numbers
        }

        // pack result into SlicedData object
        return of({
          from: query.from,
          to: query.to,
          total,
          data: entities,
        });
      }));
  }

  /**
   * Creates {@link SlicedDataSource} based on GET requests.
   * Each request use provided mapper to deserialize its response.
   *
   * @param path relative url for endpoint
   * @param responseMapper mapper for response entity
   */
  protected createSlicedDataSourceGet<Resp>(path: string,
                                            responseMapper: DataMapper<Resp[], any>): SlicedDataSource<Resp>;
  /**
   * Creates {@link SlicedDataSource} based on GET requests.
   *
   * This method allows to pass additional parameters common for each request.
   * Body is serialized using provided request mapper (optional).
   *
   * Each request use provided mapper to deserialize its response.
   *
   * @param path relative url for endpoint
   * @param body body is merged into url using querystring library.
   * @param requestMapper serializes body. Optional, if mapper is not provided body is used as is.
   * @param responseMapper mapper for response entity
   */
  protected createSlicedDataSourceGet<Req, Resp>(path: string,
                                                 body: Req,
                                                 requestMapper: DataMapper<Req, any> | undefined,
                                                 responseMapper: DataMapper<Resp[], any>): SlicedDataSource<Resp>;
  protected createSlicedDataSourceGet<Req, Resp>(path: string,
                                                 bodyOrResponseMapper: Req | DataMapper<Resp[], any>,
                                                 requestMapper?: DataMapper<Req, any>,
                                                 responseMapper?: DataMapper<Resp[], any>): SlicedDataSource<Resp> {

    return this.createSlicedDataSource({
      method: RequestMethod.Get,
      url: path,
      body: responseMapper ? bodyOrResponseMapper as Req : void 0,
      requestMapper,
      responseMapper: responseMapper || (bodyOrResponseMapper as DataMapper<Resp[], any>),
    });
  }

  /**
   * Creates {@link SlicedDataSource} based on POST requests.
   *
   * This method allows to pass additional parameters common for each request.
   * Body is serialized using provided request mapper.
   *
   * Each request use provided mapper to deserialize its response.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestMapper mapper for request entity
   * @param responseMapper mapper for response entity
   */
  protected createSlicedDataSourcePost<S, R>(path: string,
                                             body: S,
                                             requestMapper: DataMapper<S, any>,
                                             responseMapper: DataMapper<R[], any>): SlicedDataSource<R> {
    return this.createSlicedDataSource({
      method: RequestMethod.Post,
      url: path,
      body,
      requestMapper,
      responseMapper,
    });
  }

  /**
   * Creates {@link SlicedDataSource} based on PUT requests.
   *
   * This method allows to pass additional parameters common for each request.
   * Body is serialized using provided request mapper.
   *
   * Each request use provided mapper to deserialize its response.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestMapper mapper for request entity
   * @param responseMapper mapper for response entity
   */
  protected createSlicedDataSourcePut<S, R>(path: string,
                                            body: S,
                                            requestMapper: DataMapper<S, any>,
                                            responseMapper: DataMapper<R[], any>): SlicedDataSource<R> {
    return this.createSlicedDataSource({
      method: RequestMethod.Put,
      url: path,
      body,
      requestMapper,
      responseMapper,
    });
  }

  /**
   * Creates {@link SlicedDataSource} based on the provided config.
   * One instance of {@link SlicedDataSource} can be used to request data
   * for different queries ({@link SlicedDataQuery}).
   * Each performed query use configuration provided in the config parameter.
   * See {@link #createSlicedDataRequest} for details.
   */
  protected createSlicedDataSource<S, R>(config: HttpSlicedDataRequestConfig<S, R>): SlicedDataSource<R> {
    const select = (query: SlicedDataQuery) => this.createSlicedDataRequest({
      ...config,
      query,
    });

    return { select };
  }
}
