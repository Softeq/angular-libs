// Developed by Softeq Development Corporation
// http://www.softeq.com

import { getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataFormatPipe } from '../pipes/data-format.pipe';
import { numberType } from '@softeq/data-types';

describe('DataFormatPipe', () => {
  let Types: any;
  let pipe: DataFormatPipe;

  beforeEach(() => {
    Types = {
      Test: numberType(),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    });

    pipe = new DataFormatPipe(getDataTypeService());
  });

  it('should throw error if type is not provided', () => {
    expect(() => pipe['transform' as any](1)).toThrowError();
  });

  it('should throw error when type does not exist', () => {
    expect(() => pipe.transform(1, 'Test2')).toThrowError();
  });

  it('should return nil for nil value', () => {
    expect(pipe.transform(null, 'Test')).toBe(null);
    expect(pipe.transform(void 0, 'Test')).toBe(void 0);
  });

  it('should format value by type name', () => {
    expect(pipe.transform(12345.6789, 'Test')).toBe('12,345.679');
  });

  it('should format value by type', () => {
    expect(pipe.transform(12345.6789, Types.Test)).toBe('12,345.679');
  });
});
