// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DataType, numberType } from '@softeq/data-types';
import { Hash } from '@softeq/types';
import { getDataTypeService, setupTestTypeModule } from './0-masked-data-type-test-data.spec';

describe('MaskedTextType', () => {
  let Types: Hash<DataType<any>>;

  beforeEach(() => {
    Types = {
      Test: numberType(),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    });

    // init SofteqDataTypeModule
    getDataTypeService();
  });

  it('should be instantiated with mask', () => {
    expect(Types.Test.properties.mask).not.toBeUndefined();
  });
});
