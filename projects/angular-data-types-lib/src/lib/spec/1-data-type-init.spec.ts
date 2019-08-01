// Developed by Softeq Development Corporation
// http://www.softeq.com

// custom data type

import { Hash } from '@softeq/types';

import { switchLocale } from '@softeq/test-data';
import { SofteqDataTypesModule } from '../softeq-data-types.module';
import { getLocale } from '@softeq/mls';
import { getDataType, getDataTypeService, setupTestTypeModule } from './0-data-type-test-data.spec';
import { DataType, numberType } from '@softeq/data-types';

describe('SofteqDataTypeModule', () => {
  describe('SofteqDataTypeModule initialization', () => {
    let Types: Hash<DataType<any>>;

    beforeEach(() => {
      Types = {
        Test1: numberType(),
        Test2: numberType(),
      };

      setupTestTypeModule({
        useStatic: false,
        typeSet: () => Types,
      });
    });

    it('DataTypeService#get should return type registered while module initialization', () => {
      const test1 = getDataType('Test1');
      const test2 = getDataType('Test2');

      expect(test1).toBeTruthy();
      expect(test2).toBeTruthy();
    });

    it('DataTypeService#get should return type by PrototypeType', () => {
      const test1 = getDataType(Types.Test1);
      const test2 = getDataType(Types.Test2);

      expect(test1).toBeTruthy();
      expect(test2).toBeTruthy();
    });

    it('DataTypeService#get should throw error when non-PrototypeType is used to retrieve type-implementation', () => {
      const test = getDataType(Types.Test1);
      expect(() => getDataType(test)).toThrowError();
    });

    it('DataTypeService#get should return type registered while module initialization for different locales', () => {
      switchLocale('en-US');
      const test1 = getDataType('Test1');
      switchLocale('en-AU');
      const test2 = getDataType('Test2');

      expect(test1).toBeTruthy();
      expect(test2).toBeTruthy();
    });

    it('DataTypeService#get should return the same DataType for the same locale', () => {
      switchLocale('en-US');
      const test1 = getDataType('Test1');
      const test2 = getDataType('Test1');

      expect(test1 === test2).toBe(true);
    });

    it('DataTypeService#get should return the different DataTypes for different locales', () => {
      switchLocale('en-US');
      const test1 = getDataType('Test1');
      switchLocale('en-AU');
      const test2 = getDataType('Test1');

      expect(test1 === test2).toBe(false);
    });

    it('Type retrieved by DataTypeService#get should have the same locale which was used to retrieve type', () => {
      switchLocale('en-US');
      const usTest = getDataType('Test1');
      switchLocale('en-AU');
      const auTest = getDataType('Test1');
      expect(usTest.locale).toBe(getLocale('en-US'));
      expect(auTest.locale).toBe(getLocale('en-AU'));
    });

    it('any usage of PrototypeType should throw an error if useStatic = false', () => {
      // init SofteqDataTypeModule
      getDataTypeService();

      expect(() => Types.Test1.format(1)).toThrowError();
      expect(() => Types.Test1.parse('1')).toThrowError();
      expect(() => Types.Test1.validate(1)).toThrowError();
      expect(() => Types.Test1.validateFormat('1')).toThrowError();
    });
  });

  describe('SofteqDataTypeModule duplicated initialization', () => {
    it('Type name should be unique', () => {
      const Types = [
        { Test1: numberType() },
        { Test1: numberType() },
      ];

      setupTestTypeModule({
        useStatic: true,
        typeSet: () => Types,
      });

      // init SofteqDataTypeModule
      expect(getDataTypeService).toThrowError();
    });

    it('PrototypeType should allow several names', () => {
      const SomeType = numberType();
      const Types = [
        { Test1: SomeType },
        { Test2: SomeType },
      ];

      setupTestTypeModule({
        useStatic: true,
        typeSet: () => Types,
      });

      // init SofteqDataTypeModule
      expect(getDataTypeService).not.toThrowError();
    });

    it('PrototypeType having several names should return the same types', () => {
      const SomeType = numberType();
      const Types = [
        { Test1: SomeType },
        { Test2: SomeType },
      ];

      setupTestTypeModule({
        useStatic: true,
        typeSet: () => Types,
      });

      // init SofteqDataTypeModule
      expect(getDataType('Test1')).toBe(getDataType('Test2'));
    });
  });

  describe('SofteqDataTypeModule static initialization', () => {
    let Types: Hash<DataType<any>>;

    beforeEach(() => {
      Types = {
        Test1: numberType(),
        Test2: numberType(),
      };

      setupTestTypeModule({
        useStatic: true,
        typeSet: () => Types,
      });

      // init SofteqDataTypeModule
      getDataTypeService();
    });

    it('PrototypeType can be used in static mode', () => {
      expect(() => Types.Test1.format(1)).not.toThrowError();
      expect(() => Types.Test1.parse('1')).not.toThrowError();
      expect(() => Types.Test1.validate(1)).not.toThrowError();
      expect(() => Types.Test1.validateFormat('1')).not.toThrowError();
    });
  });
});
