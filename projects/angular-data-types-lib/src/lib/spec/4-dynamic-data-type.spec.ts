// Developed by Softeq Development Corporation
// http://www.softeq.com

import { getDataType, getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, dataTypeParseSuccess, numberType } from '@softeq/data-types';

describe('dynamic types', () => {
  let newTypeProto: DataType<any>;
  let newType: DataType<any>;
  let newTypeWithDef: DataType<any>;

  beforeEach(() => {
    setupTestTypeModule({
      useStatic: true,
    });

    newTypeProto = numberType();
    newType = getDataTypeService().create(newTypeProto);
    newTypeWithDef = getDataTypeService().create(numberType({
      constraints: {
        min: 10,
      },
    }));
  });

  it('#create should create new DataType', () => {
    expect(newType).toBeTruthy();
    expect(newType.format(1)).toBe('1');
    expect(newType.parse('1')).toEqual(dataTypeParseSuccess(1));
  });

  it('created type can be returned using its prototype', () => {
    const type = getDataType(newTypeProto);
    expect(newType).toBe(type);
  });

  it('#create should create new DataType with definitions', () => {
    expect(newTypeWithDef.validate(10)).toBeUndefined();
    expect(newTypeWithDef.validate(9)).toEqual({
      min: {
        min: 10,
        actual: 9,
        includeMin: true,
      },
    });
  });
});
