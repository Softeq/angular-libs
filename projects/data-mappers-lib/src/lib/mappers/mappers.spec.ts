// Developed by Softeq Development Corporation
// http://www.softeq.com

import { omit } from 'lodash-es';
import {
  arrayMapperOf,
  cloneMapper,
  dateMapper, enumerationMapper,
  httpConstantBodyMapperOf,
  httpEtagMapperOf,
  httpMapperOf,
  identityMapper,
  noneMapper,
  objectMapper,
  valueMapper
} from './mapper-dsl';
import { DateFormat } from './date-mapper';
import { createEmulatedHttpData, HeadersData, HttpDataMapper } from './http-data-mapper';
import { DataMapper } from './mapper.interfaces';
import { createEnum, EnumSet } from '../enum';

describe('Mappers', () => {
  describe('identityMapper', () => {
    const mapper = identityMapper();

    it('#serialize should map undefined value to undefined value', () => {
      expect(mapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(mapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should return the same value', () => {
      const obj = {};

      expect(mapper.serialize(obj)).toBe(obj);
    });

    it('#deserialize should return the same value', () => {
      const obj = {};

      expect(mapper.deserialize(obj)).toBe(obj);
    });
  });

  describe('cloneMapper', () => {
    const mapper = cloneMapper();
    const obj = {a: 1, b: 2};

    it('#serialize should map undefined value to undefined value', () => {
      expect(mapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(mapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should not return the same value', () => {
      expect(mapper.serialize(obj)).not.toBe(obj);
    });

    it('#deserialize should not return the same value', () => {
      expect(mapper.deserialize(obj)).not.toBe(obj);
    });

    it('#serialize should return cloned value', () => {
      expect(mapper.serialize(obj)).toEqual(obj);
    });

    it('#deserialize should return cloned value', () => {
      expect(mapper.deserialize(obj)).toEqual(obj);
    });
  });

  describe('noneMapper', () => {
    const mapper = noneMapper();
    const obj = {a: 1, b: 2};

    it('#serialize should map undefined value to undefined value', () => {
      expect(mapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(mapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should always return undefined', () => {
      expect(mapper.serialize(obj)).toBe(undefined);
    });

    it('#deserialize should always return undefined', () => {
      expect(mapper.deserialize(obj as any)).toBe(undefined);
    });
  });

  describe('dateMapper', () => {
    const date = new Date(1933, 2, 26);
    const time1 = new Date(0, 0, 0, 17, 15, 13);
    const time2 = new Date(0, 0, 0, 7, 5, 3);
    const datetime = new Date(1933, 2, 26, 7, 15, 33);
    const datetimeWithMs = new Date(1933, 2, 26, 7, 15, 33, 456);
    const isoDate = '1933-03-26';
    const isoTime1 = '17:15:13';
    const isoTime2 = '07:05:03';
    const isoDatetime = '1933-03-26T07:15:33';
    const isoDatetimeWithMs = '1933-03-26T07:15:33.456';

    describe('Date', () => {
      const mapper = dateMapper(DateFormat.Date);

      it('#serialize should map undefined value to undefined value', () => {
        expect(mapper.serialize()).toEqual(undefined);
      });

      it('#deserialize should map undefined value to undefined value', () => {
        expect(mapper.deserialize()).toEqual(undefined);
      });

      it('#serialize should throw error if provided value is not a Date', () => {
        expect(() => mapper.serialize({} as any)).toThrowError();
      });

      it('#deserialize should throw error if provided string cannot be deserialized', () => {
        expect(() => mapper.deserialize('abra-kadabra')).toThrowError();
      });

      it('#serialize should convert date to ISO Date', () => {
        expect(mapper.serialize(date)).toBe(isoDate);
      });

      it('#deserialize should convert ISO date to date object', () => {
        expect(mapper.deserialize(isoDate)).toEqual(date);
      });
    });

    describe('Time', () => {
      const mapper = dateMapper(DateFormat.Time);

      it('#serialize should convert date to ISO time', () => {
        expect(mapper.serialize(time1)).toBe(isoTime1);
      });

      it('#deserialize should convert ISO time to date object', () => {
        expect(mapper.deserialize(isoTime1)).toEqual(time1);
      });

      it('#serialize should convert date to ISO time (with 0 on start, if any)', () => {
        expect(mapper.serialize(time2)).toBe(isoTime2);
      });

      it('#deserialize should convert ISO time (with 0 on start, if any) to date object', () => {
        expect(mapper.deserialize(isoTime2)).toEqual(time2);
      });
    });

    describe('DateTime', () => {
      const mapper = dateMapper(DateFormat.DateTime);

      it('#serialize should convert date to ISO date time', () => {
        expect(mapper.serialize(datetime)).toBe(isoDatetime);
      });

      it('#deserialize should convert ISO date time to date object', () => {
        expect(mapper.deserialize(isoDatetime)).toEqual(datetime);
      });

      it('#serialize should convert date with ms to ISO date time with ms', () => {
        expect(mapper.serialize(datetimeWithMs)).toBe(isoDatetimeWithMs);
      });

      it('#deserialize should convert ISO date time with ms to date object with ms', () => {
        expect(mapper.deserialize(isoDatetimeWithMs)).toEqual(datetimeWithMs);
      });
    });
  });

  describe('objectMapper', () => {
    const emptyMapper = objectMapper({});
    const mapperWithFields = objectMapper({
      date: dateMapper(DateFormat.Date),
    });
    const mapperWithNestedMapper = objectMapper({
      nested: mapperWithFields,
    });
    const plainObject = {a: 1, b: 2};
    const objectWithDate = {a: 1, b: 2, date: new Date(1933, 2, 26)};
    const objectWithNestedObject = {c: 3, nested: objectWithDate};
    const serializedPlainObject = {a: 1, b: 2};
    const serializedObjectWithDate = {a: 1, b: 2, date: '1933-03-26'};
    const serializedObjectWithNestedObject = {c: 3, nested: serializedObjectWithDate};

    it('#serialize should map undefined value to undefined value', () => {
      expect(emptyMapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(emptyMapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should throw error if provided value is not an object', () => {
      expect(() => emptyMapper.serialize(1)).toThrowError();
    });

    it('#deserialize should throw error if provided value cannot be deserialized to object', () => {
      expect(() => emptyMapper.deserialize(1)).toThrowError();
    });

    it('#serialize should map all fields as is for empty mapper', () => {
      expect(emptyMapper.serialize(plainObject)).toEqual(serializedPlainObject);
    });

    it('#deserialize should map all fields as is for empty mapper', () => {
      expect(emptyMapper.deserialize(serializedPlainObject)).toEqual(plainObject);
    });

    it('#serialize should map fields using provided field mapper', () => {
      expect(mapperWithFields.serialize(objectWithDate)).toEqual(serializedObjectWithDate);
    });

    it('#deserialize should map fields using provided field mapper', () => {
      expect(mapperWithFields.deserialize(serializedObjectWithDate)).toEqual(objectWithDate);
    });

    it('#serialize should map fields using nested object mapper', () => {
      expect(mapperWithNestedMapper.serialize(objectWithNestedObject)).toEqual(serializedObjectWithNestedObject);
    });

    it('#deserialize should map fields using nested object mapper', () => {
      expect(mapperWithNestedMapper.deserialize(serializedObjectWithNestedObject)).toEqual(objectWithNestedObject);
    });
  });

  describe('arrayMapperOf', () => {
    const identityArrayMapper = arrayMapperOf(identityMapper());
    const dateArrayMapper = arrayMapperOf(dateMapper(DateFormat.Date));
    const objectArrayMapper = arrayMapperOf(objectMapper({
      date: dateMapper(DateFormat.Date),
    }));

    const plainArray = [{a: 1}, {b: 2}];
    const dateArray = [new Date(1933, 2, 26), new Date(1978, 10, 3)];
    const objectArray = [
      {
        a: 1,
        date: new Date(1933, 2, 26),
      },
      {
        b: 2,
        date: new Date(1978, 10, 3),
      }];
    const serializedPlainArray = [{a: 1}, {b: 2}];
    const serializedDateArray = ['1933-03-26', '1978-11-03'];
    const serializedObjectArray = [
      {a: 1, date: '1933-03-26'},
      {b: 2, date: '1978-11-03'}
    ];

    it('#serialize should map undefined value to undefined value', () => {
      expect(identityArrayMapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(identityArrayMapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should throw error if provided value is not an array', () => {
      expect(() => identityArrayMapper.serialize(1 as any)).toThrowError();
    });

    it('#deserialize should throw error if provided value cannot be deserialized to array', () => {
      expect(() => identityArrayMapper.deserialize(1)).toThrowError();
    });

    it('#serialize should map array to array', () => {
      expect(identityArrayMapper.serialize(plainArray)).toEqual(serializedPlainArray);
    });

    it('#deserialize should map array to array', () => {
      expect(identityArrayMapper.deserialize(serializedPlainArray)).toEqual(plainArray);
    });

    it('#serialize should map array of dates', () => {
      expect(dateArrayMapper.serialize(dateArray)).toEqual(serializedDateArray);
    });

    it('#deserialize should map array of dates ', () => {
      expect(dateArrayMapper.deserialize(serializedDateArray)).toEqual(dateArray);
    });

    it('#serialize should map array of objects', () => {
      expect(objectArrayMapper.serialize(objectArray)).toEqual(serializedObjectArray);
    });

    it('#deserialize should map array of objects ', () => {
      expect(objectArrayMapper.deserialize(serializedObjectArray)).toEqual(objectArray);
    });
  });

  describe('valueMapper', () => {
    const mapper = valueMapper({
      a: 'A',
      b: 'B',
    });

    it('#serialize should map undefined value to undefined value', () => {
      expect(mapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(mapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should map logical value to serialized one', () => {
      expect(mapper.serialize('A')).toBe('a');
    });

    it('#deserialize should map serialized value to logical one', () => {
      expect(mapper.deserialize('b')).toBe('B');
    });

    it('#serialize should throw error if value cannot be serialized', () => {
      expect(() => mapper.serialize('C')).toThrowError();
    });

    it('#deserialize should throw error if value cannot be deserialized', () => {
      expect(() => mapper.deserialize('c')).toThrowError();
    });
  });

  describe('enumMapper', () => {
    const TestEnum = createEnum('TEST', {
      A: 'a',
      B: 'b',
    });

    const mapper = enumerationMapper(TestEnum);

    it('#serialize should map undefined value to undefined value', () => {
      expect(mapper.serialize()).toEqual(undefined);
    });

    it('#deserialize should map undefined value to undefined value', () => {
      expect(mapper.deserialize()).toEqual(undefined);
    });

    it('#serialize should map logical value to serialized one', () => {
      expect(mapper.serialize(TestEnum.A)).toBe('a');
    });

    it('#deserialize should map serialized value to logical one', () => {
      expect(mapper.deserialize('a')).toBe(TestEnum.A);
    });

    it('#serialize should throw error if value cannot be serialized', () => {
      expect(() => mapper.serialize('C' as any)).toThrowError();
    });

    it('#deserialize should throw error if value cannot be deserialized', () => {
      expect(() => mapper.deserialize('c')).toThrowError();
    });
  });

  describe('HttpDataMapper', () => {
    describe('basic', () => {
      const httpEmptyMapper = httpMapperOf(identityMapper());
      const httpObjectMapper = httpMapperOf(objectMapper({date: dateMapper(DateFormat.Date)}));
      const emptyHttpData = createEmulatedHttpData({}, void 0);
      const object = {a: 1, date: new Date(1933, 2, 26)};
      const httpSerializedObject = createEmulatedHttpData({}, {a: 1, date: '1933-03-26'});

      it('#serialize should map undefined value to empty HttpData', () => {
        expect(httpEmptyMapper.serialize()).toEqual(emptyHttpData);
      });

      it('#deserialize should throw error for undefined value', () => {
        expect(() => httpEmptyMapper.deserialize()).toThrowError();
      });

      it('#deserialize should map empty body to undefined value', () => {
        expect(httpEmptyMapper.deserialize(emptyHttpData)).toBe(void 0);
      });

      it('#serialize should call underlying mapper', () => {
        expect(httpObjectMapper.serialize(object)).toEqual(httpSerializedObject);
      });

      it('#deserialize should call underlying mapper', () => {
        expect(httpObjectMapper.deserialize(httpSerializedObject)).toEqual(object);
      });
    });

    describe('chain', () => {
      const httpObjectMapper = httpMapperOf(objectMapper({date: dateMapper(DateFormat.Date)}));

      class TestHttpDataMapper extends HttpDataMapper<any> {
        constructor(private headerName: string, private fieldName: string, dataMapper: DataMapper<any, any>) {
          super(dataMapper);
        }

        serializeHeaders(headers: HeadersData, obj: any, json: any): any {
          headers.set(this.headerName, obj[this.fieldName]);
          return omit(json, this.fieldName);
        }

        deserializeHeaders(headers: HeadersData, obj: any): any {
          return {
            ...obj,
            [this.fieldName]: headers.get(this.headerName),
          };
        }
      }

      const httpTestMapper = new TestHttpDataMapper('X-Test2', 'test2', new TestHttpDataMapper('X-Test1', 'test1', httpObjectMapper));
      const object = {a: 1, date: new Date(1933, 2, 26), test1: 'abc', test2: 'def'};
      const httpSerializedObject = createEmulatedHttpData({'X-Test1': 'abc', 'X-Test2': 'def'}, {a: 1, date: '1933-03-26'});

      it('#serialize should pass object via all http mappers', () => {
        expect(httpTestMapper.serialize(object)).toEqual(httpSerializedObject);
      });

      it('#deserialize should pass object via all http mappers', () => {
        expect(httpTestMapper.deserialize(httpSerializedObject)).toEqual(object);
      });
    });

    describe('httpEtagMapperOf', () => {
      const httpMapper = httpEtagMapperOf(identityMapper());
      const object = {a: 1, etag: '12345'};
      const httpSerializedRequestObject = createEmulatedHttpData({'If-Match': '12345'}, {a: 1});
      const httpSerializedResponseObject = createEmulatedHttpData({ETag: '12345'}, {a: 1});

      it('#serialize should pass etag field to If-Match header', () => {
        expect(httpMapper.serialize(object)).toEqual(httpSerializedRequestObject);
      });

      it('#deserialize should pass ETag header to etag field', () => {
        expect(httpMapper.deserialize(httpSerializedResponseObject)).toEqual(object);
      });
    });

    describe('httpConstantBodyMapperOf', () => {
      const httpEmptyMapper = httpConstantBodyMapperOf(identityMapper());
      const httpConstant = {a: 1};
      const httpConstantMapper = httpConstantBodyMapperOf(identityMapper(), httpConstant);
      const object = {b: 1};
      const httpSerializedEmptyBody = createEmulatedHttpData({}, void 0);
      const httpSerializedConstantBody = createEmulatedHttpData({}, httpConstant);
      const httpSomeBody = createEmulatedHttpData({}, {someField: true});

      it('#serialize should return empty body when constant = undefined', () => {
        expect(httpEmptyMapper.serialize(object)).toEqual(httpSerializedEmptyBody);
      });

      it('#deserialize should return undefined when constant = undefined', () => {
        expect(httpEmptyMapper.deserialize(httpSomeBody)).toEqual(void 0);
      });

      it('#serialize should return constant body when constant is provided', () => {
        expect(httpConstantMapper.serialize(object)).toEqual(httpSerializedConstantBody);
      });

      it('#deserialize should return constant when constant is provided', () => {
        expect(httpConstantMapper.deserialize(httpSomeBody)).toEqual(httpConstant);
      });
    });
  });
});
