// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash } from '@softeq/types';
import { getDataType, getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { complex, ComplexType, ComplexTypeFormat } from './7-complex-type.spec';
import { createDataType, DataType } from '@softeq/data-types';

describe('custom type', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    Types = {
      TestAlgebraic: createDataType('complex', ComplexType, { format: ComplexTypeFormat.Algebraic }),
      TestPlane: createDataType('complex', ComplexType, { format: ComplexTypeFormat.Plane }),
      TestPlaneWithBar: createDataType('complex', ComplexType, { format: ComplexTypeFormat.Plane, coordinateSeparator: '|' }),
      TestValidation: createDataType('complex', ComplexType, {
        format: ComplexTypeFormat.Algebraic,
        constraints: {
          minLength: 100,
        },
      }),
      TestValidationWithMessage: createDataType('complex', ComplexType, {
        format: ComplexTypeFormat.Algebraic,
        constraints: {
          minLength: 100,
        },
        messages: {
          minLength: 'msg_complex_min_length',
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

  it('#get should retrieve custom type', () => {
    expect(getDataType(Types.TestAlgebraic)).toBeTruthy();
  });

  it('#get should instantiate corresponding custom type', () => {
    expect(getDataType(Types.TestAlgebraic).format(complex(3, 5))).toBe('3 + 5i');
    expect(getDataType(Types.TestPlane).format(complex(3, 5))).toBe('(3, 5)');
    expect(getDataType(Types.TestPlaneWithBar).format(complex(3, 5))).toBe('(3|5)');
    expect(getDataType(Types.TestValidation).validate(complex(100, 0))).toBeUndefined();
    expect(getDataType(Types.TestValidation).validate(complex(100, 1))).toEqual({
      minLength: { minLength: 100, actualLength: Math.hypot(100, 1) },
    });
    expect(getDataType(Types.TestValidationWithMessage).validate(complex(100, 1))).toEqual({
      minLength: {
        minLength: 100,
        actualLength: Math.hypot(100, 1),
        $message: { key: 'msg_complex_min_length', params: { minLength: 100, actualLength: Math.hypot(100, 1) } },
      },
    });
  });
});
