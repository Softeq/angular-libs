// Developed by Softeq Development Corporation
// http://www.softeq.com

import { getDataType, getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { Hash } from '@softeq/types';
import { DataType, dataTypeParseSuccess, dateTimeType, numberType } from '@softeq/data-types';

describe('type specialization', () => {
  let Types: Hash<DataType<any>>;

  const MIN_DATE = new Date(2019, 3, 25);
  const MIN_DATE_MINUS_ONE = new Date(2019, 3, 24);

  const MIN_DATE_2 = new Date(2019, 7, 25);
  const MIN_DATE_MINUS_ONE_2 = new Date(2019, 7, 24);

  beforeEach(() => {
    const BaseNumberType = numberType({
      constraints: {
        min: 10,
      },
      messages: {
        min: 'msg_number_min',
      },
      format: {
        minimumFractionDigits: 2,
      },
    });

    const BaseDateTimeType = dateTimeType({
      format: 'M/d/yyyy',
      constraints: {
        min: MIN_DATE,
      },
      messages: {
        min: 'msg_date_min',
      },
    });

    const BaseExtendedNumberType = numberType({
      abc: 1,
    } as any);

    Types = {
      NumberSpecialized: numberType(numberType()),
      NumberInherited: numberType(BaseNumberType),
      DateInherited: dateTimeType(BaseDateTimeType),
      NumberRedefinition: numberType(BaseNumberType, {
        constraints: {
          min: 20,
        },
        messages: {
          min: 'msg_number_min_redeclared',
        },
        format: {
          minimumFractionDigits: 3,
        },
      }),
      DateRedefinition: dateTimeType(BaseDateTimeType, {
        format: 'd/M/yyyy',
        constraints: {
          min: MIN_DATE_2,
        },
        messages: {
          min: 'msg_date_min_redeclared',
        },
      }),
      NumberMergedDefinition: numberType(BaseNumberType, {
        constraints: {
          max: 20,
        },
        messages: {
          max: 'msg_number_max',
        },
        format: {
          maximumFractionDigits: 2,
        },
      }),
      ExtendedDefinition: numberType(BaseExtendedNumberType, {
        constraints: {
          min: 10,
        },
      }),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    });

    // init SofteqDataTypeModule
    getDataTypeService();
  });

  it('type can be specialized', () => {
    expect(getDataType('NumberSpecialized')).toBeTruthy();

    expect(Types.NumberSpecialized.format(1)).toBe('1');
    expect(Types.NumberSpecialized.parse('1')).toEqual(dataTypeParseSuccess(1));
  });

  it('specialized NumberType should inherit type definition', () => {
    expect(Types.NumberInherited.definition.constraints.min).toBe(10);
    expect(Types.NumberInherited.definition.messages.min).toBe('msg_number_min');
    expect(Types.NumberInherited.definition.format.minimumFractionDigits).toBe(2);

    expect(Types.NumberInherited.format(1)).toBe('1.00');
    expect(Types.NumberInherited.validate(10)).toBeUndefined();
    expect(Types.NumberInherited.validate(9)).toEqual({
      min: {
        min: 10,
        actual: 9,
        includeMin: true,
        $message: { key: 'msg_number_min', params: { min: 10, actual: 9, includeMin: true } },
      },
    });
  });

  it('specialized DateTimeType should inherit type definition', () => {
    expect(Types.DateInherited.definition.constraints.min).toBe(MIN_DATE);
    expect(Types.DateInherited.definition.messages.min).toBe('msg_date_min');
    expect(Types.DateInherited.definition.format).toBe('M/d/yyyy');

    expect(Types.DateInherited.format(MIN_DATE)).toBe('4/25/2019');
    expect(Types.DateInherited.validate(MIN_DATE)).toBeUndefined();
    expect(Types.DateInherited.validate(MIN_DATE_MINUS_ONE)).toEqual({
      min: {
        min: MIN_DATE,
        actual: MIN_DATE_MINUS_ONE,
        includeMin: true,
        $message: { key: 'msg_date_min', params: { min: MIN_DATE, actual: MIN_DATE_MINUS_ONE, includeMin: true } },
      },
    });
  });

  it('NumberType definition can be redeclared', () => {
    expect(Types.NumberRedefinition.definition.constraints.min).toBe(20);
    expect(Types.NumberRedefinition.definition.messages.min).toBe('msg_number_min_redeclared');
    expect(Types.NumberRedefinition.definition.format.minimumFractionDigits).toBe(3);

    expect(Types.NumberRedefinition.format(1)).toBe('1.000');
    expect(Types.NumberRedefinition.validate(20)).toBeUndefined();
    expect(Types.NumberRedefinition.validate(19)).toEqual({
      min: {
        min: 20,
        actual: 19,
        includeMin: true,
        $message: { key: 'msg_number_min_redeclared', params: { min: 20, actual: 19, includeMin: true } },
      },
    });
  });

  it('DateTimeType definition can be redeclared', () => {
    expect(Types.DateRedefinition.definition.constraints.min).toBe(MIN_DATE_2);
    expect(Types.DateRedefinition.definition.messages.min).toBe('msg_date_min_redeclared');
    expect(Types.DateRedefinition.definition.format).toBe('d/M/yyyy');

    expect(Types.DateRedefinition.format(MIN_DATE_2)).toBe('25/8/2019');
    expect(Types.DateRedefinition.validate(MIN_DATE_2)).toBeUndefined();
    expect(Types.DateRedefinition.validate(MIN_DATE_MINUS_ONE_2)).toEqual({
      min: {
        min: MIN_DATE_2,
        actual: MIN_DATE_MINUS_ONE_2,
        includeMin: true,
        $message: { key: 'msg_date_min_redeclared', params: { min: MIN_DATE_2, actual: MIN_DATE_MINUS_ONE_2, includeMin: true } },
      },
    });
  });

  it('type definitions should be merged while specialization', () => {
    expect(Types.NumberMergedDefinition.definition.constraints.min).toBe(10);
    expect(Types.NumberMergedDefinition.definition.constraints.max).toBe(20);
    expect(Types.NumberMergedDefinition.definition.messages.min).toBe('msg_number_min');
    expect(Types.NumberMergedDefinition.definition.messages.max).toBe('msg_number_max');
    expect(Types.NumberMergedDefinition.definition.format.minimumFractionDigits).toBe(2);
    expect(Types.NumberMergedDefinition.definition.format.maximumFractionDigits).toBe(2);

    expect(Types.NumberMergedDefinition.format(1)).toBe('1.00');
    expect(Types.NumberMergedDefinition.format(1.222)).toBe('1.22');
    expect(Types.NumberMergedDefinition.validate(10)).toBeUndefined();
    expect(Types.NumberMergedDefinition.validate(20)).toBeUndefined();
    expect(Types.NumberMergedDefinition.validate(9)).toEqual({
      min: {
        min: 10,
        actual: 9,
        includeMin: true,
        $message: { key: 'msg_number_min', params: { min: 10, actual: 9, includeMin: true } },
      },
    });
    expect(Types.NumberMergedDefinition.validate(21)).toEqual({
      max: {
        max: 20,
        actual: 21,
        includeMax: true,
        $message: { key: 'msg_number_max', params: { max: 20, actual: 21, includeMax: true } },
      },
    });
  });

  it('additional fields on TypeDefinition should also be inherited', () => {
    // tslint:disable-next-line:no-string-literal
    expect(Types.ExtendedDefinition.definition['abc']).toBe(1);
    expect(Types.ExtendedDefinition.definition.constraints.min).toBe(10);
  });
});
