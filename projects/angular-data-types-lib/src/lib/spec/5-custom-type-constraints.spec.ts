// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash } from '@softeq/types';
import { getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, numberType } from '@softeq/data-types';

const constraintValidatorFactory = (constraint) => (value) => value % constraint === 0 ? void 0 : { multiple: constraint, actual: value };

describe('custom type constraints', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    const BaseType = numberType({
      validators: {
        multiple: constraintValidatorFactory,
      },
    });

    Types = {
      TestUndefinedConstraint: numberType({
        constraints: {
          custom: 22,
        },
      }),
      TestWithCustomConstraint: numberType({
        constraints: {
          multiple: 22,
        },
        validators: {
          multiple: constraintValidatorFactory,
        },
      }),
      TestWithCustomConstraintAndMessage: numberType({
        constraints: {
          multiple: 22,
        },
        validators: {
          multiple: constraintValidatorFactory,
        },
        messages: {
          multiple: 'msg_number_multiple',
        },
      }),
      TestWithCustomConstraintOff: numberType({
        validators: {
          multiple: constraintValidatorFactory,
        },
      }),
      TestSpecializedWithConstraint: numberType(BaseType, {
        constraints: {
          multiple: 22,
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

  it('undefined constraint should throw an error', () => {
    expect(() => Types.TestUndefinedConstraint.validate(1)).toThrowError();
  });

  it('#validators should define custom constraint', () => {
    expect(Types.TestWithCustomConstraint.validate(22)).toBeUndefined();
    expect(Types.TestWithCustomConstraint.validate(23)).toEqual({
      multiple: { multiple: 22, actual: 23 },
    });
  });

  it('#messages should define message for custom constraint', () => {
    expect(Types.TestWithCustomConstraintAndMessage.validate(23)).toEqual({
      multiple: { multiple: 22, actual: 23, $message: { key: 'msg_number_multiple', params: { multiple: 22, actual: 23 } } },
    });
  });

  it('function in $validators validate value only when $constraints has corresponding field', () => {
    expect(Types.TestWithCustomConstraintOff.validate(23)).toBeUndefined();
  });

  it('#validators should be inherited by specialized types', () => {
    expect(Types.TestSpecializedWithConstraint.validate(23)).toEqual({
      multiple: { multiple: 22, actual: 23 },
    });
  });
});
