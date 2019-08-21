// Developed by Softeq Development Corporation
// http://www.softeq.com

import cloneDeep from 'lodash/cloneDeep';
import identity from 'lodash/identity';
import noop from 'lodash/noop';

import { Enum } from '../enum';
import { ArrayDataMapper } from './array-data-mapper';
import { ConstantBodyHttpDataMapper } from './constant-body-http-data-mapper';
import { DataMapper, ETagSupport } from './mapper.interfaces';
import { DateFormat, getDateMapper } from './date-mapper';
import { ObjectMapper } from './object-mapper';
import { EnumMapper } from './enum-mapper';
import { FileHttpDataMapper } from './file-http-data-mapper';
import { HttpDataMapper } from './http-data-mapper';
import { ETagHttpDataMapper } from './e-tag-http-data-mapper';
import { ValueMapper } from './value-mapper';
import { JsonMapper } from './json-mapper';


const IDENTITY_MAPPER = createMapper({
  serialize: identity,
  deserialize: identity,
});

const CLONE_MAPPER = createMapper({
  serialize: cloneDeep,
  deserialize: cloneDeep,
});

const NONE_MAPPER = createMapper({
  serialize: noop,
  deserialize: noop,
});

const JSON_MAPPER = new JsonMapper();

const BOOLEAN_MAPPER = createMapper({
  serialize: (b: boolean) => b.toString(),
  deserialize: (str) => str === 'true',
});

const NUMBER_MAPPER = createMapper({
  serialize: (n: number) => n.toString(),
  deserialize: (str) => Number(str),
});

/**
 * Creates mapper for the given entity, having a set of fields returned by `mappings` function (the second parameter).
 * There is no sense to declare all fields in the `mappings` function.
 * Developer MUST define only fields with the special mapping.
 * All other fields will be mapped as is.
 *
 * @param mappings
 */
export function objectMapper<T>(mappings: { [P in keyof T]?: DataMapper<T[P], any> }): DataMapper<T, any> {
  return new ObjectMapper(mappings);
}

/**
 * Creates a mapper for a list of entities. Each entity is mapped using provided mapper.
 *
 * @param mapper
 */
export function arrayMapperOf<T>(mapper: DataMapper<T, any>): DataMapper<T[], any> {
  return new ArrayDataMapper(mapper);
}

/**
 * Creates a mapper with optimistic locking support.
 * This mapper cares about correct handling of ETag and If-Match headers.
 * This mapper returns {@link HttpDataMapper}.
 * This mapper MUST be added as a final stage of mapping, but can be combined with other {@link HttpDataMapper}s.
 *
 * Target entity MUST implement {@link ETagSupport}.
 *
 * @param mapper
 */
export function httpEtagMapperOf<T extends ETagSupport>(mapper: DataMapper<T, any>): HttpDataMapper<T> {
  return new ETagHttpDataMapper(mapper);
}

/**
 * Creates a mapper which always generates empty body and creates empty entity.
 *
 * @param mapper
 * @param constantValue value used as constant value
 */
export function httpConstantBodyMapperOf<T>(mapper: DataMapper<T, any>, constantValue?: any): HttpDataMapper<T> {
  return new ConstantBodyHttpDataMapper(mapper, constantValue);
}

export function httpMapperOf<T>(mapper: DataMapper<T, any>): HttpDataMapper<T> {
  return new HttpDataMapper(mapper);
}

/**
 * Creates a mapper for given enumeration.
 *
 * @param type
 */
export function enumerationMapper<E extends Enum<S>, S>(type: E): EnumMapper<E, S> {
  return new EnumMapper(type);
}

/**
 * Creates a mapper for {@link Date} value.
 *
 * @param format
 */
export function dateMapper(format: DateFormat): DataMapper<Date, string> {
  return getDateMapper(format);
}

/**
 * Creates identity mapper which returns original data for serialize and deserialize operations.
 */
export function identityMapper<T>(): DataMapper<T, any> {
  return IDENTITY_MAPPER as any;
}

/**
 * Creates identity mapper which returns original data for serialize and deserialize operations.
 */
export function cloneMapper<T>(): DataMapper<T, any> {
  return CLONE_MAPPER as any;
}

/**
 * Returns mapper that always returns undefined for serialization and deserialization operations
 */
export function noneMapper(): DataMapper<any, void> {
  return NONE_MAPPER;
}

/**
 * Creates mapper which serializes/deserializes values according to the provided map.
 * Fields of map define serialization rules,
 * where key represents serialized value and value represents deserialized value.
 *
 * @param serializedToValue
 */
export function valueMapper<T>(serializedToValue: { [name: string]: T }): DataMapper<T, any> {
  return new ValueMapper(serializedToValue);
}

/**
 * Returns mapper that transform any object into JSON string and vice versa
 */
export function jsonMapper<T>(): DataMapper<T, string> {
  return JSON_MAPPER as any;
}

/**
 * Returns mapper that transform object into JSON string using provided mapper and vice versa
 */
export function jsonMapperOf<T>(baseMapper?: DataMapper<T, any>): DataMapper<T, string> {
  return baseMapper ? new JsonMapper(baseMapper) : jsonMapper();
}

/**
 * Returns mapper to transform boolean to string and vice versa
 */
export function booleanMapper(): DataMapper<boolean, string> {
  return BOOLEAN_MAPPER;
}

/**
 * Returns mapper to transform number to string and vice versa
 */
export function numberMapper(): DataMapper<number, string> {
  return NUMBER_MAPPER;
}

/**
 * Allows to create custom mapper. Actually this method does nothing,
 * but I believe allows to write more ideologically correct code.
 *
 * @param mapper
 */
export function createMapper<T>(mapper: DataMapper<T, any>): DataMapper<T, any> {
  return mapper;
}

export function fileMapper(mimeType: string = 'application/octet-stream'): DataMapper<File, any> {
  return new FileHttpDataMapper(IDENTITY_MAPPER, mimeType);
}

export function serializeData<T, S = T>(data: T, mapper?: DataMapper<T, S>): S {
  if (data) {
    return mapper ? mapper.serialize(data) : data as any;
  }
}

export function deserializeData<S>(data: S): S;
export function deserializeData<T, S>(data: S, mapper: DataMapper<T, S>): T;
export function deserializeData<T, S>(data: S, mapper?: DataMapper<T, S>): T {
  if (data) {
    return mapper ? mapper.deserialize(data) : data as any;
  }
}
