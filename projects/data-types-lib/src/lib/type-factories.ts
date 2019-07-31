// Developed by Softeq Development Corporation
// http://www.softeq.com

import create from 'lodash/create';
import isObject from 'lodash/isObject';
import negate from 'lodash/negate';
import { Constructor, Maybe, SupplierFn } from '@softeq/types';
import {
  DATA_TYPE_DATE_KIND,
  DATA_TYPE_NUMBER_KIND,
  DATA_TYPE_TEXT_KIND,
  DataType,
  DataTypeDefinition,
  DateTimeType,
  DateTimeTypeDefinition,
  NumberType,
  NumberTypeDefinition,
  TextType,
  TextTypeDefinition,
} from './type.interfaces';
import { NumberTypeImpl } from './types/number-type';
import { TextTypeImpl } from './types/text-type';
import { DateTimeTypeImpl } from './types/date-type';
import { PrototypeType } from './types/abstract-type';

const isPrimitive = negate(isObject);

/**
 * Constructor for number type.
 *
 * @param def definition of the type defines all type-related capabilities
 */
export function numberType(def?: NumberTypeDefinition): NumberType;
/**
 * Constructor for number type that inherits all settings from the base type
 *
 * @param baseType base type
 * @param def definition of the type defines all type-related capabilities
 */
export function numberType(baseType: SupplierFn<NumberType> | NumberType,
                           def?: NumberTypeDefinition): NumberType;
export function numberType(baseTypeOrDefinition?: SupplierFn<NumberType> | NumberType | NumberTypeDefinition,
                           def?: NumberTypeDefinition): NumberType {
  return createDataType(DATA_TYPE_NUMBER_KIND, NumberTypeImpl, baseTypeOrDefinition as any, def);
}

/**
 * Constructor for text type.
 *
 * @param def definition of the type defines all type-related capabilities
 */
export function textType(def?: TextTypeDefinition): TextType;
/**
 * Constructor for text type that inherits all settings from the base type
 *
 * @param baseType base type
 * @param def definition of the type defines all type-related capabilities
 */
export function textType(baseType: SupplierFn<TextType> | TextType, def?: TextTypeDefinition): TextType;
export function textType(baseTypeOrDefinition?: SupplierFn<TextType> | TextType | TextTypeDefinition,
                         def?: TextTypeDefinition): TextType {
  return createDataType(DATA_TYPE_TEXT_KIND, TextTypeImpl, baseTypeOrDefinition as any, def);
}

/**
 * Constructor for date type.
 *
 * @param def definition of the type defines all type-related capabilities
 */
export function dateTimeType(def: DateTimeTypeDefinition): DateTimeType;
/**
 * Constructor for date type that inherits all settings from the base type
 *
 * @param baseType base type
 * @param def definition of the type defines all type-related capabilities
 */
export function dateTimeType(baseType: SupplierFn<DateTimeType> | DateTimeType,
                             def?: DateTimeTypeDefinition): DateTimeType;
export function dateTimeType(baseTypeOrDefinition: SupplierFn<DateTimeType> | DateTimeType | DateTimeTypeDefinition,
                             def?: DateTimeTypeDefinition): DateTimeType {
  return createDataType(DATA_TYPE_DATE_KIND, DateTimeTypeImpl, baseTypeOrDefinition as any, def);
}

/**
 * Declares root type.
 *
 * @param kind
 * @param typeConstructor constructor for the type
 * @param definition definition of the type
 *
 * @returns {T}
 */
export function createDataType<T extends PrototypeType<DataType<V>, V>, D extends DataTypeDefinition, V>(kind: string,
                                                                                                         // tslint:disable-next-line:max-line-length
                                                                                                         typeConstructor: Constructor<DataType<V>>,
                                                                                                         definition?: D): T;
/**
 * Specialize (extend from) existing type.
 *
 * @param kind
 * @param typeConstructor constructor for the type
 * @param baseType base type
 * @param definition definition of the type
 *
 * @returns {T}
 */
export function createDataType<T extends PrototypeType<DataType<V>, V>, D extends DataTypeDefinition, V>(kind: string,
                                                                                                         // tslint:disable-next-line:max-line-length
                                                                                                         typeConstructor: Constructor<DataType<V>>,
                                                                                                         baseType: SupplierFn<T> | T,
                                                                                                         definition?: D): T;
export function createDataType<T extends PrototypeType<DataType<V>, V>, D extends DataTypeDefinition, V>(kind: string,
                                                                                                         // tslint:disable-next-line:max-line-length
                                                                                                         typeConstructor: Constructor<DataType<V>>,
                                                                                                         // tslint:disable-next-line:max-line-length
                                                                                                         baseTypeOrDefinition?: SupplierFn<T> | T | D,
                                                                                                         def?: D): T {
  let baseType: Maybe<T>;

  if (typeof baseTypeOrDefinition === 'function') {
    baseType = baseTypeOrDefinition();
  } else if (baseTypeOrDefinition instanceof PrototypeType) {
    baseType = baseTypeOrDefinition;
  } else {
    def = def || baseTypeOrDefinition || {} as D;
  }

  let type: T;

  type = baseType ? createDerivedType(kind, typeConstructor, baseType, def) : createRootType(kind, typeConstructor, def);

  return type;
}

/**
 * Defines root type
 */
function createRootType<T extends PrototypeType<DataType<V>, V>, D extends DataTypeDefinition, V>(kind: string,
                                                                                                  typeConstructor: Constructor<DataType<V>>,
                                                                                                  def?: D): T {
  return new PrototypeType(kind, typeConstructor, def || {}) as any;
}

/**
 * Specializes (extend from) existing type
 */
function createDerivedType<T extends PrototypeType<DataType<V>, V>, D extends DataTypeDefinition, V>(kind: string,
                                                                                                     // tslint:disable-next-line:max-line-length
                                                                                                     typeConstructor: Constructor<DataType<V>>,
                                                                                                     baseType: T,
                                                                                                     def?: D): T {
  return new PrototypeType(kind, typeConstructor, inheritDef(def || {}, baseType.definition)) as any;
}

/**
 * Helper method to inherit type definitions
 */
function inheritDef(def: DataTypeDefinition, base: DataTypeDefinition): DataTypeDefinition {
  const inherited = inherit(base, def);
  inherited.constraints = inherit(base.constraints, def.constraints);
  inherited.validators = inherit(base.validators, def.validators);
  inherited.messages = inherit(base.messages, def.messages);
  inherited.format = (isPrimitive(base.format) || isPrimitive(def.format)) ? (def.format || base.format) : inherit(base.format, def.format);
  inherited.properties = def.properties || {};

  return inherited;
}

/**
 * Provides simple inheritance using prototype approach
 */
function inherit<T extends object>(base: T, sub: T): T {
  if (base && sub) {
    return create(base, sub);
  } else {
    return base || sub;
  }
}
