// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash } from '@softeq/types';

import { getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, dataTypeParseSuccess, textType } from '@softeq/data-types';

describe('TextType', () => {
  let Types: Hash<DataType<any>>;
  const TEXT_PATTERN_RE = /^[abc]+$/;

  beforeEach(() => {
    Types = {
      Test: textType(),
      TestWithMinLength: textType({
        constraints: {
          minLength: 2,
        },
      }),
      TestWithMinLengthAndMessage: textType({
        constraints: {
          minLength: 2,
        },
        messages: {
          min: 'msg_text_min_length',
        }
      }),
      TestWithMaxLength: textType({
        constraints: {
          maxLength: 10,
        },
      }),
      TestWithMaxLengthAndMessage: textType({
        constraints: {
          maxLength: 10,
        },
        messages: {
          max: 'msg_text_max_length',
        }
      }),
      TestWithRangeLength: textType({
        constraints: {
          rangeLength: [2, 10],
        },
      }),
      TestWithRangeLengthMessage: textType({
        constraints: {
          rangeLength: [2, 10],
        },
        messages: {
          rangeLength: 'msg_text_range_length',
        }
      }),
      TestWithPattern: textType({
        constraints: {
          pattern: TEXT_PATTERN_RE,
        },
      }),
      TestWithPatternMessage: textType({
        constraints: {
          pattern: TEXT_PATTERN_RE,
        },
        messages: {
          integral: 'msg_text_pattern',
        },
      }),
      TestWithUnexistingConstraint: textType({
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

  it('#format should throw error if value is not a string', () => {
    expect(() => Types.Test.format(1)).toThrowError();
  });

  it('#format should return passed string', () => {
    expect(Types.Test.format('aaa')).toBe('aaa');
  });

  it('#parse should throw error if value is nil', () => {
    expect(() => Types.Test.parse(null)).toThrowError();
    expect(() => Types.Test.parse(void 0)).toThrowError();
  });

  it('#parse should return passed string', () => {
    expect(Types.Test.parse('aaa')).toEqual(dataTypeParseSuccess('aaa'));
  });

  it('#validateFormat should return undefined if value is nil', () => {
    expect(Types.Test.validateFormat(void 0)).toBeUndefined();
  });

  it('#validateFormat should return undefined for any value', () => {
    expect(Types.Test.validateFormat('123,456.789')).toBeUndefined();
  });

  it('#validate should return undefined if value is nil', () => {
    expect(Types.Test.validate(null)).toBeUndefined();
    expect(Types.Test.validate(void 0)).toBeUndefined();
  });

  it('#validate should return undefined if type does not have any constraints', () => {
    expect(Types.Test.validate(1)).toBeUndefined();
  });

  it('#validate should return undefined if value satisfies constraints', () => {
    expect(Types.TestWithMinLength.validate('aaa')).toBeUndefined();
    expect(Types.TestWithMaxLength.validate('aaa')).toBeUndefined();
    expect(Types.TestWithRangeLength.validate('aaa')).toBeUndefined();
    expect(Types.TestWithPattern.validate('abc')).toBeUndefined();
  });

  it('#validate should return error if value does not satisfy constraints', () => {
    expect(Types.TestWithMinLength.validate('a')).toEqual({ minLength: { requiredLength: 2, actualLength: 1 } });
    expect(Types.TestWithMaxLength.validate('aaaaaaaaaaaa')).toEqual({ maxLength: { requiredLength: 10, actualLength: 12 } });
    expect(Types.TestWithRangeLength.validate('a'))
      .toEqual({ rangeLength: { actualLength: 1, minLength: 2, maxLength: 10 } });
    expect(Types.TestWithRangeLength.validate('aaaaaaaaaaaa'))
      .toEqual({ rangeLength: { actualLength: 12, minLength: 2, maxLength: 10 } });
    expect(Types.TestWithPattern.validate('xyz'))
      .toEqual({ pattern: { actualValue: 'xyz', requiredPattern: TEXT_PATTERN_RE } });
  });

  it('DataType should throw an error if try to instantiate type having non-existing constraint', () => {
    expect(() => Types.TestWithUnexistingConstraint.format('aaa')).toThrowError();
  });

  it('#equals returns true iff values are equal', () => {
    expect(Types.Test.equals('a', 'a')).toBe(true);
    expect(Types.Test.equals('a', 'b')).toBe(false);
  });

  it('#compare returns signed number which illustrate lexicographical order', () => {
    expect(Types.Test.compare('a', 'a')).toBe(0);
    expect(Types.Test.compare('aa', 'a')).toBeGreaterThan(0);
    expect(Types.Test.compare('a', 'aa')).toBeLessThan(0);
  });

  it('#properties should have maxLength property if maxLength constraint is set', () => {
    expect(Types.TestWithMaxLength.properties.maxLength).toBe(10);
  });
});
