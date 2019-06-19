// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DataType } from '@softeq/data-types';
import { Hash } from '@softeq/types';
import { getDataTypeService, setupTestTypeModule } from './0-masked-data-type-test-data.spec';
import { maskedTextType } from '../types/masked-text-type';

describe('MaskedTextType', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    Types = {
      TestMask: maskedTextType({
        mask: [/d/, /d/],
      }),
      TestPipe: maskedTextType({
        pipe: () => void 0,
      }),
      TestEmpty: maskedTextType({}),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    });

    // init SofteqDataTypeModule
    getDataTypeService();
  });

  it('should be instantiated with mask', () => {
    expect(Types.TestMask.properties.mask).not.toBeUndefined();
  });

  it('should be instantiated with pipe', () => {
    expect(Types.TestPipe.properties.pipe).not.toBeUndefined();
  });

  it('cannot be instantiated without pipe and mask', () => {
    expect(() => Types.TestEmpty.properties.mask).toThrowError();
  });
});
