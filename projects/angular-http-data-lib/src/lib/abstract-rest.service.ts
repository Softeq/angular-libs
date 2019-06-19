// Developed by Softeq Development Corporation
// http://www.softeq.com

import { HttpClient, HttpHeaders, HttpResponse, } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { createHttpData, DataMapper, HttpDataMapper, httpMapperOf, isHttpMapper, } from '@softeq/data-mappers';
import {
  createGenericRequest,
  HTTP_STATUS_NO_CONTENT,
  isResponseHttpEvent,
  mergeUrl,
  NativeHeadersData, parseResponseWithMapper,
  RequestMethod, wrapIntoHttpDataMapper
} from './http.utils';
import { RestSettings } from './rest-settings.service';
import { Injectable } from '@angular/core';

/**
 * Definition of HTTP request operation.
 */
export interface HttpRequestConfig<Req, Resp> {
  method: RequestMethod;
  url: string;
  body?: Req;
  requestMapper?: DataMapper<Req, any>;
  responseMapper: DataMapper<Resp, any>;
}

/**
 * Basic class for all REST services.
 * It provides basic support of operations over HTTP protocol and integration with mappers.
 */
@Injectable()
export abstract class AbstractRestService {
  protected httpClient: HttpClient;
  private baseUrl: string;

  constructor(settings: RestSettings) {
    this.httpClient = settings.httpClient;
    this.baseUrl = settings.baseUrl;
  }

  /**
   * Rewrites provided url/path in order to add base URL for API endpoints.
   */
  protected url(path: string): string {
    if (path.includes('://')) {
      return path;
    } else {
      return mergeUrl(this.baseUrl, path);
    }
  }

  /**
   * Performs HTTP request operation based on given config and using provided mappers (from config).
   */
  protected httpRequest<S, R>(requestConfig: HttpRequestConfig<S, R>): Observable<R> {
    const {method, url, body, requestMapper, responseMapper} = requestConfig;

    const httpRequestMapper = requestMapper ? wrapIntoHttpDataMapper(requestMapper) : void 0;
    const httpResponseMapper = responseMapper ? wrapIntoHttpDataMapper(responseMapper) : void 0;

    // create request object using provided mapper
    const request = createGenericRequest(method, this.url(url), body, httpRequestMapper, httpResponseMapper);

    // run request
    return this.httpClient.request(request).pipe(
      filter<HttpResponse<any>>(isResponseHttpEvent),
      switchMap((response: HttpResponse<any>) => {
        if (response.status === HTTP_STATUS_NO_CONTENT) {
          return of(void 0);
        }

        // deserialize response using provided mapper, if any
        return of(parseResponseWithMapper(response, httpResponseMapper));
      }));
  }

  /**
   * Performs GET request and deserialize response using provided mapper
   *
   * @param path relative url for endpoint
   * @param responseMapper mapper for response
   */
  protected httpGet<Resp>(path: string, responseMapper: DataMapper<Resp, any>): Observable<Resp>;
  /**
   * Performs GET request with parameters (via body parameter) and deserialize response using provided mapper.
   * Body is serialized using provided request mapper.
   *
   * @param path relative url for endpoint
   * @param body body is merged into url using querystring library.
   * @param requestMapper serializes body. Optional, if mapper is not provided body is used as is.
   * @param responseMapper mapper for response
   */
  protected httpGet<Req, Resp>(path: string,
                               body: Req,
                               requestMapper: DataMapper<Req, any> | undefined,
                               responseMapper: DataMapper<Resp, any>): Observable<Resp>;
  protected httpGet<Req, Resp>(path: string,
                               bodyOrResponseMapper: Req | DataMapper<Resp, any>,
                               requestMapper?: DataMapper<Req, any>,
                               responseMapper?: DataMapper<Resp, any>): Observable<Resp> {
    return this.httpRequest({
      method: RequestMethod.Get,
      url: path,
      body: responseMapper ? bodyOrResponseMapper as Req : void 0,
      requestMapper,
      responseMapper: responseMapper || (bodyOrResponseMapper as DataMapper<Resp, any>),
    });
  }

  /**
   * Performs PUT request.
   * Request and response use the same mapper for serialization of body and deserialization of response correspondingly.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestOrResponseMapper mapper for request and response entity
   */
  protected httpPut<T>(path: string, body: T | undefined, requestOrResponseMapper: DataMapper<T, any>): Observable<T>;
  /**
   * Performs PUT request. This method uses separate mappers to serialize request body and deserialize response.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestMapper mapper for request entity
   * @param responseMapper mapper for response entity
   */
  protected httpPut<S, R>(path: string,
                          body: S | undefined,
                          requestMapper: DataMapper<S, any>,
                          responseMapper: DataMapper<R, any>): Observable<R>;
  protected httpPut(path: string,
                    body: any,
                    requestMapper: DataMapper<any, any>,
                    responseMapper?: DataMapper<any, any>): Observable<any> {
    return this.httpRequest({
      method: RequestMethod.Put,
      url: path,
      body,
      requestMapper,
      responseMapper: responseMapper || requestMapper,
    });
  }

  /**
   * Performs DELETE request.
   * Request and response use the same mapper for serialization of body and deserialization of response correspondingly.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestOrResponseMapper mapper for request or response entity
   */
  protected httpDelete<T>(path: string, body: T | undefined, requestOrResponseMapper: DataMapper<T, any>): Observable<T>;
  /**
   * Performs DELETE request. This method uses separate mappers to serialize request body and deserialize response.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestMapper mapper for request entity
   * @param responseMapper mapper for response entity
   */
  protected httpDelete<S, R>(path: string,
                             body: S | undefined,
                             requestMapper: DataMapper<S, any>,
                             responseMapper: DataMapper<R, any>): Observable<R>;
  protected httpDelete(path: string,
                       body: any,
                       requestMapper: DataMapper<any, any>,
                       responseMapper?: DataMapper<any, any>): Observable<any> {
    return this.httpRequest({
      method: RequestMethod.Delete,
      url: path,
      body,
      requestMapper,
      responseMapper: responseMapper || requestMapper,
    });
  }

  /**
   * Performs POST request.
   * Request and response use the same mapper for serialization of body and deserialization of response correspondingly.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestOrResponseMapper mapper for request or response entity
   */
  protected httpPost<T>(path: string, body: T, requestOrResponseMapper: DataMapper<T, any>): Observable<T>;
  /**
   * Performs POST request. This method uses separate mappers to serialize request body and deserialize response.
   *
   * @param path relative url for endpoint
   * @param body entity to be serialized and send
   * @param requestMapper mapper for request entity
   * @param responseMapper mapper for response entity
   */
  protected httpPost<S, R>(path: string,
                           body: S,
                           requestMapper: DataMapper<S, any>,
                           responseMapper: DataMapper<R, any>): Observable<R>;
  protected httpPost(path: string,
                     body: any,
                     requestMapper: DataMapper<any, any>,
                     responseMapper?: DataMapper<any, any>): Observable<any> {
    return this.httpRequest({
      method: RequestMethod.Post,
      url: path,
      body,
      requestMapper,
      responseMapper: responseMapper || requestMapper,
    });
  }
}
