// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash } from '@softeq/types';

import { getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, dataTypeParseSuccess, dateTimeType } from '@softeq/data-types';

const MIN_DATE_VALUE = new Date(2012, 2, 17);
const MAX_DATE_VALUE = new Date(2019, 7, 12);
const MIN_DATE_VALUE_PLUS_ONE = new Date(2012, 2, 18);
const MAX_DATE_VALUE_MINUS_ONE = new Date(2019, 7, 11);
const MIN_DATE_VALUE_MINUS_ONE = new Date(2012, 2, 16);
const MAX_DATE_VALUE_PLUS_ONE = new Date(2019, 7, 13);
const DATE_VALUE = new Date(2018, 2, 22);
const DATE_VALUE_STR = '3/22/2018';
const DATE_VALUE_INVALID_STR = '1/1.2';

describe('dateTimeType', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    Types = {
      TestWithoutFormat: dateTimeType({}),
      Test: dateTimeType({
        format: 'shortDate',
      }),
      TestWithFormatMessage1: dateTimeType({
        format: 'shortDate',
        messages: {
          format: 'msg_date_custom_format'
        },
      }),
      TestWithFormatMessage2: dateTimeType({
        format: 'shortDate',
        messages: {
          format: { key: 'msg_date_custom_format', params: { predefined: true } },
        },
      }),
      TestWithMinIncluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          min: { value: MIN_DATE_VALUE, include: true },
        },
      }),
      TestWithMinExcluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          min: { value: MIN_DATE_VALUE, include: false },
        },
      }),
      TestWithMaxIncluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          max: { value: MAX_DATE_VALUE, include: true },
        },
      }),
      TestWithMaxExcluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          max: { value: MAX_DATE_VALUE, include: false },
        },
      }),
      TestWithRangeIncluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          range: { min: MIN_DATE_VALUE, includeMin: true, max: MAX_DATE_VALUE, includeMax: true },
        },
      }),
      TestWithRangeExcluded: dateTimeType({
        format: 'shortDate',
        constraints: {
          range: { min: MIN_DATE_VALUE, includeMin: false, max: MAX_DATE_VALUE, includeMax: false },
        },
      }),
      TestWithMessage: dateTimeType({
        format: 'shortDate',
        constraints: {
          min: { value: MIN_DATE_VALUE, include: true },
        },
        messages: {
          min: 'msg_date_min',
        }
      }),
      TestWithUnexistingConstraint: dateTimeType({
        format: 'shortDate',
        constraints: {
          aaa: 2,
        },
      } as any),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    });

    // init SofteqDataTypeModule
    getDataTypeService();
  });

  it('instantiation without format causes an error', () => {
    expect(() => Types.TestWithoutFormat.format(DATE_VALUE)).toThrowError();
  });

  it('#format should throw error if value is nil', () => {
    expect(() => Types.Test.format(null)).toThrowError();
    expect(() => Types.Test.format(void 0)).toThrowError();
  });

  it('#format should throw error if value is not a date', () => {
    expect(() => Types.Test.format('aaa')).toThrowError();
  });

  it('#format should format dates', () => {
    expect(Types.Test.format(DATE_VALUE)).toBe(DATE_VALUE_STR);
  });

  it('#parse should throw error if value is nil', () => {
    expect(() => Types.Test.parse(null)).toThrowError();
    expect(() => Types.Test.parse(void 0)).toThrowError();
  });

  it('#parse should return parsed date', () => {
    expect(Types.Test.parse(DATE_VALUE_STR)).toEqual(dataTypeParseSuccess(DATE_VALUE));
  });

  it('#parse should return errors and invalid value if string cannot be parsed', () => {
    const result = Types.Test.parse(DATE_VALUE_INVALID_STR);
    expect(result.value.getTime()).toBeNaN();
    expect(result.errors).toEqual({ $dateFormat: { value: DATE_VALUE_INVALID_STR } });
  });

  it('#validateFormat should return error if value is nil', () => {
    expect(Types.Test.validateFormat(null)).toEqual({ $dateFormat: { value: null } });
    expect(Types.Test.validateFormat(void 0)).toEqual({ $dateFormat: { value: void 0 } });
  });

  it('#validateFormat should return error if date format is invalid', () => {
    expect(Types.Test.validateFormat(DATE_VALUE_INVALID_STR)).toEqual({ $dateFormat: { value: DATE_VALUE_INVALID_STR } });
  });

  it('#validateFormat should return undefined if date format is valid', () => {
    expect(Types.Test.validateFormat(DATE_VALUE_STR)).toBeUndefined();
  });

  it('#validateFormat should merge error message if it was provided', () => {
    expect(Types.TestWithFormatMessage1.validateFormat(DATE_VALUE_INVALID_STR))
      .toEqual({
        $dateFormat: {
          $message: { key: 'msg_date_custom_format', params: { value: DATE_VALUE_INVALID_STR } },
          value: DATE_VALUE_INVALID_STR,
        },
      });
    expect(Types.TestWithFormatMessage2.validateFormat(DATE_VALUE_INVALID_STR))
      .toEqual({
        $dateFormat: {
          $message: { key: 'msg_date_custom_format', params: { predefined: true, value: DATE_VALUE_INVALID_STR } },
          value: DATE_VALUE_INVALID_STR,
        },
      });
  });

  it('#validate should return undefined if value is nil', () => {
    expect(Types.Test.validate(null)).toBeUndefined();
    expect(Types.Test.validate(void 0)).toBeUndefined();
  });

  it('#validate should return undefined if type does not have any constraints', () => {
    expect(Types.Test.validate(DATE_VALUE)).toBeUndefined();
  });

  it('#validate should return undefined if value satisfies constraints', () => {
    expect(Types.TestWithMinIncluded.validate(MIN_DATE_VALUE)).toBeUndefined();
    expect(Types.TestWithMaxIncluded.validate(MAX_DATE_VALUE)).toBeUndefined();
    expect(Types.TestWithRangeIncluded.validate(MIN_DATE_VALUE)).toBeUndefined();
    expect(Types.TestWithRangeIncluded.validate(MAX_DATE_VALUE)).toBeUndefined();

    expect(Types.TestWithMinExcluded.validate(MIN_DATE_VALUE_PLUS_ONE)).toBeUndefined();
    expect(Types.TestWithMaxExcluded.validate(MAX_DATE_VALUE_MINUS_ONE)).toBeUndefined();
    expect(Types.TestWithRangeExcluded.validate(MIN_DATE_VALUE_PLUS_ONE)).toBeUndefined();
    expect(Types.TestWithRangeExcluded.validate(MAX_DATE_VALUE_MINUS_ONE)).toBeUndefined();
  });

  it('#validate should return error if value does not satisfy constraints', () => {
    expect(Types.TestWithMinIncluded.validate(MIN_DATE_VALUE_MINUS_ONE)).toEqual({
      min: { min: MIN_DATE_VALUE, includeMin: true, actual: MIN_DATE_VALUE_MINUS_ONE },
    });
    expect(Types.TestWithMaxIncluded.validate(MAX_DATE_VALUE_PLUS_ONE)).toEqual({
      max: { max: MAX_DATE_VALUE, includeMax: true, actual: MAX_DATE_VALUE_PLUS_ONE },
    });
    expect(Types.TestWithRangeIncluded.validate(MIN_DATE_VALUE_MINUS_ONE)).toEqual({
      range: { actual: MIN_DATE_VALUE_MINUS_ONE, min: MIN_DATE_VALUE, includeMin: true, max: MAX_DATE_VALUE, includeMax: true },
    });
    expect(Types.TestWithRangeIncluded.validate(MAX_DATE_VALUE_PLUS_ONE)).toEqual({
      range: { actual: MAX_DATE_VALUE_PLUS_ONE, min: MIN_DATE_VALUE, includeMin: true, max: MAX_DATE_VALUE, includeMax: true },
    });

    expect(Types.TestWithMinExcluded.validate(MIN_DATE_VALUE)).toEqual({
      min: { min: MIN_DATE_VALUE, includeMin: false, actual: MIN_DATE_VALUE },
    });
    expect(Types.TestWithMaxExcluded.validate(MAX_DATE_VALUE)).toEqual({
      max: { max: MAX_DATE_VALUE, includeMax: false, actual: MAX_DATE_VALUE },
    });
    expect(Types.TestWithRangeExcluded.validate(MIN_DATE_VALUE)).toEqual({
      range: { actual: MIN_DATE_VALUE, min: MIN_DATE_VALUE, includeMin: false, max: MAX_DATE_VALUE, includeMax: false },
    });
    expect(Types.TestWithRangeExcluded.validate(MAX_DATE_VALUE)).toEqual({
      range: { actual: MAX_DATE_VALUE, min: MIN_DATE_VALUE, includeMin: false, max: MAX_DATE_VALUE, includeMax: false },
    });
  });

  it('#validate should return error with $message if message was provided', () => {
    expect(Types.TestWithMessage.validate(MIN_DATE_VALUE_MINUS_ONE)).toEqual({
      min: {
        min: MIN_DATE_VALUE,
        includeMin: true,
        actual: MIN_DATE_VALUE_MINUS_ONE,
        $message: { key: 'msg_date_min', params: { min: MIN_DATE_VALUE, includeMin: true, actual: MIN_DATE_VALUE_MINUS_ONE } },
      },
    });
  });

  it('DataType system should throw an error if try to instantiate type having non-existing constraint', () => {
    expect(() => Types.TestWithUnexistingConstraint.format(DATE_VALUE)).toThrowError();
  });

  it('#equals returns true iff values are equal', () => {
    expect(Types.Test.equals(new Date(2019, 3, 28), new Date(2019, 3, 28))).toBe(true);
    expect(Types.Test.equals(new Date(2019, 3, 28), new Date(2019, 3, 27))).toBe(false);
  });

  it('#compare returns diff between milliseconds', () => {
    expect(Types.Test.compare(new Date(2019, 3, 28), new Date(2019, 3, 28))).toBe(0);
    expect(Types.Test.compare(new Date(2019, 3, 28), new Date(2019, 3, 27))).toBeGreaterThan(0);
    expect(Types.Test.compare(new Date(2019, 3, 27), new Date(2019, 3, 28))).toBeLessThan(0);
  });
});
