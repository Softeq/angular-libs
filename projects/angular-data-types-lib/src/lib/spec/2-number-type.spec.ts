// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash } from '@softeq/types';

import { getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, dataTypeParseError, dataTypeParseSuccess, numberType } from '@softeq/data-types';

describe('NumberType', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    Types = {
      Test: numberType(),
      TestWithFormatMessage1: numberType({
        messages: {
          format: 'msg_number_custom_format'
        },
      }),
      TestWithFormatMessage2: numberType({
        messages: {
          format: { key: 'msg_number_custom_format', params: { predefined: true } },
        },
      }),
      TestWithFormatting: numberType({
        format: {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        },
      }),
      TestWithMinIncluded: numberType({
        constraints: {
          min: { value: 0, include: true },
        },
      }),
      TestWithMinExcluded: numberType({
        constraints: {
          min: { value: 0, include: false },
        },
      }),
      TestWithMaxIncluded: numberType({
        constraints: {
          max: { value: 100, include: true },
        },
      }),
      TestWithMaxExcluded: numberType({
        constraints: {
          max: { value: 100, include: false },
        },
      }),
      TestWithRangeIncluded: numberType({
        constraints: {
          range: { min: 0, includeMin: true, max: 100, includeMax: true },
        },
      }),
      TestWithRangeExcluded: numberType({
        constraints: {
          range: { min: 0, includeMin: false, max: 100, includeMax: false },
        },
      }),
      TestWithIntegral: numberType({
        constraints: {
          integral: true,
        },
      }),
      TestWithNotIntegral: numberType({
        constraints: {
          integral: false,
        },
      }),
      TestWithMessage: numberType({
        constraints: {
          min: { value: 0, include: true },
        },
        messages: {
          min: 'msg_number_min',
        }
      }),
      TestWithUnexistingConstraint: numberType({
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

  it('#format should throw error if value is nil', () => {
    expect(() => Types.Test.format(null)).toThrowError();
    expect(() => Types.Test.format(void 0)).toThrowError();
  });

  it('#format should throw error if value is not a number', () => {
    expect(() => Types.Test.format('aaa')).toThrowError();
  });

  it('#format should format numbers', () => {
    expect(Types.Test.format(123456.789)).toBe('123,456.789');
    expect(Types.Test.format(123456.7899)).toBe('123,456.79');
    expect(Types.Test.format(123456.7899, { minimumFractionDigits: 1 })).toBe('123,456.79');
    expect(Types.Test.format(123456.7899, { minimumFractionDigits: 3 })).toBe('123,456.790');
    expect(Types.Test.format(123456.7899, { maximumFractionDigits: 1 })).toBe('123,456.8');
    expect(Types.Test.format(123456.7899, { maximumFractionDigits: 0 })).toBe('123,457');
    expect(Types.Test.format(123456.7899, { maximumFractionDigits: 4 })).toBe('123,456.7899');
    expect(Types.Test.format(123456.7899, { minimumFractionDigits: 1, maximumFractionDigits: 3 })).toBe('123,456.79');
    expect(Types.Test.format(123456.7899, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('123,456.8');
    expect(Types.Test.format(123456.7899, { minimumFractionDigits: 3, maximumFractionDigits: 3 })).toBe('123,456.790');
  });

  it('#parse should throw error if value is nil', () => {
    expect(() => Types.Test.parse(null)).toThrowError();
    expect(() => Types.Test.parse(void 0)).toThrowError();
  });

  it('#parse should parse numbers', () => {
    expect(Types.Test.parse('123,456.789')).toEqual(dataTypeParseSuccess(123456.789));
  });

  it('#parse should return errors if string cannot be parsed', () => {
    const value = '123.456,789';
    expect(Types.Test.parse(value)).toEqual(dataTypeParseError({ $numberFormat: { value } }));
  });

  it('#validateFormat should return error if value is nil', () => {
    expect(Types.Test.validateFormat(null)).toEqual({ $numberFormat: { value: null } });
    expect(Types.Test.validateFormat(void 0)).toEqual({ $numberFormat: { value: void 0 } });
  });

  it('#validateFormat should return error if number format is invalid', () => {
    const value = '123.456,789';
    expect(Types.Test.validateFormat(value)).toEqual({ $numberFormat: { value } });
  });

  it('#validateFormat should return undefined if number format is valid', () => {
    const value = '123,456.789';
    expect(Types.Test.validateFormat(value)).toBeUndefined();
  });

  it('#validateFormat should merge error message if it was provided', () => {
    const value = '123.456,789';
    expect(Types.TestWithFormatMessage1.validateFormat(value))
      .toEqual({
        $numberFormat: {
          $message: { key: 'msg_number_custom_format', params: { value } },
          value,
        },
      });
    expect(Types.TestWithFormatMessage2.validateFormat(value))
      .toEqual({
        $numberFormat: {
          $message: { key: 'msg_number_custom_format', params: { predefined: true, value } },
          value,
        },
      });
  });

  it('#format should take into account default type formatting', () => {
    expect(Types.TestWithFormatting.format(123456.7)).toBe('123,456.70');
    expect(Types.TestWithFormatting.format(123456.7899)).toBe('123,456.7899');
  });

  it('#format should allow to change default type formatting', () => {
    expect(Types.TestWithFormatting.format(123456.7, { minimumFractionDigits: 1 })).toBe('123,456.7');
    expect(Types.TestWithFormatting.format(123456.7899, { maximumFractionDigits: 3 })).toBe('123,456.79');
  });

  it('#validate should return undefined if value is nil', () => {
    expect(Types.Test.validate(null)).toBeUndefined();
    expect(Types.Test.validate(void 0)).toBeUndefined();
  });

  it('#validate should return undefined if type does not have any constraints', () => {
    expect(Types.Test.validate(1)).toBeUndefined();
  });

  it('#validate should return undefined if value satisfies constraints', () => {
    expect(Types.TestWithMinIncluded.validate(0)).toBeUndefined();
    expect(Types.TestWithMaxIncluded.validate(100)).toBeUndefined();
    expect(Types.TestWithRangeIncluded.validate(0)).toBeUndefined();
    expect(Types.TestWithRangeIncluded.validate(100)).toBeUndefined();

    expect(Types.TestWithMinExcluded.validate(1)).toBeUndefined();
    expect(Types.TestWithMaxExcluded.validate(99)).toBeUndefined();
    expect(Types.TestWithRangeExcluded.validate(1)).toBeUndefined();
    expect(Types.TestWithRangeExcluded.validate(99)).toBeUndefined();

    expect(Types.TestWithIntegral.validate(1000)).toBeUndefined();
    expect(Types.TestWithNotIntegral.validate(1000.2)).toBeUndefined();
    expect(Types.TestWithNotIntegral.validate(1000)).toBeUndefined();
  });

  it('#validate should return error if value does not satisfy constraints', () => {
    expect(Types.TestWithMinIncluded.validate(-1)).toEqual({ min: { min: 0, includeMin: true, actual: -1 } });
    expect(Types.TestWithMaxIncluded.validate(101)).toEqual({ max: { max: 100, includeMax: true, actual: 101 } });
    expect(Types.TestWithRangeIncluded.validate(-1))
      .toEqual({ range: { actual: -1, min: 0, includeMin: true, max: 100, includeMax: true } });
    expect(Types.TestWithRangeIncluded.validate(101))
      .toEqual({ range: { actual: 101, min: 0, includeMin: true, max: 100, includeMax: true } });

    expect(Types.TestWithMinExcluded.validate(0)).toEqual({ min: { min: 0, includeMin: false, actual: 0 } });
    expect(Types.TestWithMaxExcluded.validate(100)).toEqual({ max: { max: 100, includeMax: false, actual: 100 } });
    expect(Types.TestWithRangeExcluded.validate(0))
      .toEqual({ range: { actual: 0, min: 0, includeMin: false, max: 100, includeMax: false } });
    expect(Types.TestWithRangeExcluded.validate(100))
      .toEqual({ range: { actual: 100, min: 0, includeMin: false, max: 100, includeMax: false } });

    expect(Types.TestWithIntegral.validate(1000.2)).toEqual({ integral: { actual: 1000.2 } });
  });

  it('#validate should return error with $message if message was provided', () => {
    expect(Types.TestWithMessage.validate(-1)).toEqual({
      min: { min: 0, includeMin: true, actual: -1, $message: { key: 'msg_number_min', params: { min: 0, includeMin: true, actual: -1 } } },
    });
  });

  it('DataType system should throw an error if try to instantiate type having non-existing constraint', () => {
    expect(() => Types.TestWithUnexistingConstraint.format(2)).toThrowError();
  });

  it('#equals returns true iff values are equal', () => {
    expect(Types.Test.equals(1, 1)).toBe(true);
    expect(Types.Test.equals(1, 2)).toBe(false);
  });

  it('#compare returns diff between numbers', () => {
    expect(Types.Test.compare(1, 1)).toBe(0);
    expect(Types.Test.compare(2, 1)).toBeGreaterThan(0);
    expect(Types.Test.compare(1, 2)).toBeLessThan(0);
  });
});
