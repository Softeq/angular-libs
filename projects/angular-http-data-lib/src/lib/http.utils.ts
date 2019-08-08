// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNil from 'lodash/isNil';
import isArray from 'lodash/isArray';
import omitBy from 'lodash/omitBy';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParameterCodec,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {
  createHttpData,
  DataMapper,
  DEFAULT_HTTP_DESERIALIZATION_TYPE,
  DEFAULT_HTTP_SERIALIZATION_TYPE,
  HeadersData,
  HttpDataMapper,
  httpMapperOf,
  isHttpMapper
} from '@softeq/data-mappers';
import { DataQuerySort, SortDirection } from './data-source';

export const HTTP_STATUS_NO_CONTENT = 204;
export const HTTP_STATUS_ERROR_START = 400;
export const HTTP_STATUS_ERROR_END = 600;
export const HTTP_STATUS_CLIENT_ERROR_START = 400;
export const HTTP_STATUS_CLIENT_ERROR_END = 500;
export const HTTP_STATUS_SERVER_ERROR_START = 500;
export const HTTP_STATUS_SERVER_ERROR_END = 600;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_NOT_AUTHORIZED = 401;
export const HTTP_STATUS_NOT_FOUND_ERROR = 404;
export const HTTP_STATUS_PRECONDITION_FAILED_ERROR = 422;
export const HTTP_STATUS_SERVER_UNAVAILABLE_ERROR = 503;

export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Options = 'OPTIONS',
  Head = 'HEAD',
}

export function isResponseHttpEvent<T>(event: HttpEvent<T> | HttpResponse<T> | HttpErrorResponse): event is HttpResponse<T> {
  return event.type === HttpEventType.Response;
}

export function isErrorStatus(status: number): boolean {
  return status >= HTTP_STATUS_ERROR_START && status < HTTP_STATUS_ERROR_END;
}

export function isClientErrorStatus(status: number): boolean {
  return status >= HTTP_STATUS_CLIENT_ERROR_START && status < HTTP_STATUS_CLIENT_ERROR_END;
}

export function isServerErrorStatus(status: number): boolean {
  return status === 0 || status >= HTTP_STATUS_SERVER_ERROR_START && status < HTTP_STATUS_SERVER_ERROR_END;
}

/**
 * Custom parameter encoder is necessary because Angular's default strategy is to allow '+'
 * and some other characters as parameter value. But '+' is treat as ' ' (space) character.
 *
 * Related issues:
 * https://github.com/angular/angular/issues/11058
 * https://github.com/mean-expert-official/loopback-sdk-builder/issues/573
 * https://github.com/angular/angular/issues/18261
 */
export class NativeHttpParameterCodec implements HttpParameterCodec {
  encodeKey(k: string): string {
    return encodeURIComponent(k);
  }

  encodeValue(v: string): string {
    return encodeURIComponent(v);
  }

  decodeKey(k: string): string {
    return decodeURIComponent(k);
  }

  decodeValue(v: string): string {
    return decodeURIComponent(v);
  }
}

const NATIVE_HTTP_PARAMETER_CODEC = new NativeHttpParameterCodec();

export class NativeHeadersData implements HeadersData {
  constructor(public headers: HttpHeaders) {

  }

  get(name: string): string | null {
    return this.headers.get(name);
  }

  set(name: string, value: string | string[]): void {
    this.headers.set(name, value);
  }

  keys(): string[] {
    return this.headers.keys();
  }
}

function createDefaultHeaders(type?: string): HttpHeaders {
  return new HttpHeaders({
    'Content-Type': type || DEFAULT_HTTP_SERIALIZATION_TYPE,
  });
}

/**
 * Writes provided header data into angular {@link HttpHeaders} object.
 *
 * @param originalHeaders headers of Angular request
 * @param headersData headers to be written into Angular Headers
 */
function applyHttpHeaders(originalHeaders: HttpHeaders, headersData: HeadersData): HttpHeaders {
  return headersData.keys().reduce(
    (headers, key) => {
      const value = headersData.get(key);

      return isNil(value) ? headers : headers.set(key, value);
    },
    originalHeaders);
}

/**
 * Creates {@link Request} object for the given set of parameters.
 * Body is serialized using provided request mapper:
 *
 * * for GET request body is merged into url using querystring library
 * * for request methods body is always passed via body of HTTP request.
 *
 * @param method target HTTP method
 * @param path relative endpoint URL
 * @param body request entity
 * @param requestMapper mapper for mapping request entity into body
 * @param responseMapper mapper for mapping response entity into body
 * @returns request object
 */
export function createGenericRequest<S, R>(method: RequestMethod,
                                           url: string,
                                           body?: S,
                                           requestMapper?: HttpDataMapper<S>,
                                           responseMapper?: HttpDataMapper<R>): HttpRequest<any> {
  return mergeRequestWithMapper(new HttpRequest(method, url, body), requestMapper, responseMapper);
}

export function mergeRequestWithMapper<S, R>(request: HttpRequest<S>,
                                             requestMapper?: HttpDataMapper<S>,
                                             responseMapper?: HttpDataMapper<R>): HttpRequest<any> {
  let httpHeaders = createDefaultHeaders(requestMapper && requestMapper.serializationType);
  let serializedBody: any;

  const { method, body } = request;

  if (body && requestMapper) {
    const httpData = requestMapper.serialize(body);
    httpHeaders = applyHttpHeaders(httpHeaders, httpData.headers);
    serializedBody = httpData.body;
  } else {
    serializedBody = body;
  }

  const httpParams = method === 'GET' && serializedBody ? new HttpParams({
    fromObject: omitBy(serializedBody, isNil),
    encoder: NATIVE_HTTP_PARAMETER_CODEC,
  }) : void 0;
  const httpBody = method === 'GET' ? void 0 : serializedBody;
  const responseType = responseMapper && responseMapper.deserializationType || DEFAULT_HTTP_DESERIALIZATION_TYPE;

  return request.clone({
    params: httpParams,
    headers: httpHeaders,
    body: httpBody,
    responseType,
  });
}

export function parseResponseWithMapper<T>(response: HttpResponse<T>, responseMapper?: HttpDataMapper<T>): T {
  if (responseMapper) {
    return responseMapper.deserialize(createHttpData(
      new NativeHeadersData(response.headers || new HttpHeaders()),
      response.body,
    ));
  } else {
    return response.body;
  }
}

export function mergeUrl(...segments: string[]): string {
  return segments.slice(1).reduce(
    (path, segment) => path.replace(/(\/)$/, '') + segment.replace(/^([^/])/, '/$1'),
    segments[0],
  );
}

export function serializeSortBy(sort: DataQuerySort | DataQuerySort[]): string {
  const sortArray = isArray(sort) ? sort : [sort];
  return sortArray.map(({ field, direction }) => `${direction === SortDirection.Descending ? '-' : '+'}${field}`).join(',');
}

export function mergeSortByParameter(url: string, sort?: DataQuerySort | DataQuerySort[]): string {
  return sort ? parametrizeUrl(url, { sortBy: serializeSortBy(sort) }) : url;
}

/**
 * The same method as {@link #wrapIntoHttpDataMapper}, but for response mapper
 * @param mapper
 */
export function wrapIntoHttpDataMapper<T>(mapper: DataMapper<T, any>): HttpDataMapper<T> {
  return (isHttpMapper(mapper) ? mapper : httpMapperOf(mapper)) as HttpDataMapper<T>;
}

function parametrizeUrl(url: string, queryParams: { [name: string]: string }): string {
  const questionIndex = url.indexOf('?');

  if (questionIndex >= 0) {
    return `${url}&${stringifyQueryParams(queryParams)}`;
  } else {
    return `${url}?${stringifyQueryParams(queryParams)}`;
  }
}

function stringifyQueryParams(queryParams: { [name: string]: string }): string {
  return Object.keys(queryParams).map((name) => `${encodeURIComponent(name)}=${encodeURIComponent(queryParams[name])}`).join('&');
}
