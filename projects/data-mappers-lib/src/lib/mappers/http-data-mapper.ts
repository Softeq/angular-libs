// Developed by Softeq Development Corporation
// http://www.softeq.com

import { isNil } from 'lodash-es';
import { DataMapper } from './mapper.interfaces';

export interface HeadersData {
  get(name: string): string | null;

  set(name: string, value: string | string[]): void;

  keys(): string[];
}

export class EmulatedHeadersData implements HeadersData {
  private headerKeys: string[] = [];
  private headerValues: { [name: string]: string[] } = {};

  get(name: string): string {
    return this.headerValues[name][0];
  }

  getAll(name: string): string[] | null {
    return this.headerValues[name];
  }

  set(name: string, value: string | string[]): void {
    if (!this.headerValues.hasOwnProperty(name)) {
      this.headerKeys.push(name);
    }

    this.headerValues[name] = Array.isArray(value) ? value : [value];
  }

  keys(): string[] {
    return this.headerKeys;
  }
}

export interface HttpData {
  headers: HeadersData;
  body: any;
}

export function createHttpData(headers: HeadersData, body: any): HttpData {
  return { headers, body };
}

export function createEmulatedHttpData(headers: { [name: string]: string | string[] }, body: any): HttpData {
  const headersData = createEmulatedHttpHeadersData();
  Object.keys(headers).forEach((key) => headersData.set(key, headers[key]));
  return createHttpData(headersData, body);
}

export function createEmulatedHttpHeadersData(): HeadersData {
  return new EmulatedHeadersData();
}

export function isHttpMapper(mapper: DataMapper<any, any>): mapper is HttpDataMapper<any> {
  return mapper instanceof HttpDataMapper;
}

function toHttpData(data: any): HttpData {
  return data as HttpData;
}

export const DEFAULT_HTTP_SERIALIZATION_TYPE = 'application/json';
export const DEFAULT_HTTP_DESERIALIZATION_TYPE = 'json';

export type DeserializationType = 'arraybuffer' | 'blob' | 'json' | 'text';

export class HttpDataMapper<ObjectView> implements DataMapper<ObjectView, HttpData> {
  /**
   * Mime type used for serialization. If not specified 'application/json' is supposed
   */
  readonly serializationType: string;

  /**
   * Type of response.
   * List of deserialization types is compatible with {@link HttpRequest#responseType}
   * If not specified 'json' is supposed
   */
  readonly deserializationType: DeserializationType;

  constructor(private mapper: DataMapper<ObjectView, any>,
              serializationType?: string,
              deserializationType?: DeserializationType) {
    this.serializationType = serializationType
      || (isHttpMapper(this.mapper) ? this.mapper.serializationType : DEFAULT_HTTP_SERIALIZATION_TYPE);
    this.deserializationType = deserializationType
      || (isHttpMapper(this.mapper) ? this.mapper.deserializationType : DEFAULT_HTTP_DESERIALIZATION_TYPE);
  }

  serialize(obj?: ObjectView): HttpData {
    const serialized = this.mapper.serialize(obj);

    let headers: HeadersData;
    let json: any;

    if (isHttpMapper(this.mapper)) {
      headers = toHttpData(serialized).headers;
      json = toHttpData(serialized).body;
    } else {
      headers = new EmulatedHeadersData();
      json = serialized;
    }

    json = this.serializeHeaders(headers, obj, json);

    return { headers, body: json };
  }

  deserialize(data?: HttpData): ObjectView {
    if (isNil(data)) {
      throw new Error('HttpDataMapper cannot deserialize nil data');
    }

    const object = isHttpMapper(this.mapper) ? this.mapper.deserialize(data) : this.mapper.deserialize(data.body);

    return this.deserializeHeaders(data.headers, object);
  }

  serializeHeaders(headers: HeadersData, obj: ObjectView, json: any): any {
    return json;
  }

  deserializeHeaders(headers: HeadersData, obj: ObjectView): ObjectView {
    return obj;
  }
}
