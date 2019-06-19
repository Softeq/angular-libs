// Developed by Softeq Development Corporation
// http://www.softeq.com

// tslint:disable:variable-name

import { isNil, extend, invert, mapValues, values } from 'lodash-es';

/**
 * This interface defines operations supported by enumeration
 */
export interface EnumOp<T> {
  /**
   * Name of the enumeration. This may be necessary for dictionary support.
   */
  $Name: string;

  /**
   * Looks up enumeration entry by the given name.
   * Actually this method returns the same string which was passed as 1st argument,
   * but it throws an error when this enumeration does not have entry for the corresponding name.
   *
   * @param name logical name of the enum record
   */
  byName(name: string): keyof T;

  /**
   * Returns true if enumeration has entry for the given name, otherwise false.
   */
  exists(name: string): boolean;

  /**
   * Looks up enumeration entry by the given value.
   *
   * @param value physical name of the enum record
   */
  byValue(value: any): keyof T;

  /**
   * Converts name of the enumeration entry to the value.
   *
   * @param name logical name of the enum record
   */
  toValue(name: keyof T): any;

  /**
   * Returns set of names available for this enumeration
   */
  names(): (keyof T)[];

  /**
   * Returns set of values available for this enumeration
   */
  values(): any[];
}

/**
 * Defines abstract enum type as identity map
 */
export type Enum<T> = { [P in keyof T]: P };

/**
 * Defines type for set of available names
 */
export type EnumSet<T> = keyof T;

/**
 * Creates enumeration having
 * - the given name
 * - set of entries based on passed definition object,
 *   where keys of definition object become enumeration names
 *   and values of definition object become enumeration values
 *
 * @param enumName enum name
 * @param def map of logical-to-physical names
 * @returns enum map
 */
export function createEnum<T extends object>(enumName: string, def: T): Enum<T> {
  const identityMap = mapValues(def, (value, key) => key); // identity map
  const valueToName = invert(def);

  // implementation of EnumOp interface
  const opProto = {
    $Name: enumName,
    byName: (name: string) => {
      if (isNil(def[name])) {
        console.error(`Name '${name}' does not exist in enum`);
      }

      return name;
    },
    exists: (name: string) => !isNil(def[name]),
    byValue: (value: string) => valueToName[value],
    toValue: (name: string) => def[name],
    names: () => Object.keys(def),
    values: () => values(def),
  };

  return extend(Object.create(opProto), identityMap);
}

/**
 * Helper object to work with enumerations
 */
export const Enum = {
  /**
   * Returns name of the given enumeration. This may be necessary for dictionary support.
   */
  name: getEnumName,
  /**
   * Returns name of the given enumeration. This may be necessary for dictionary support.
   */
  exists: isNameExist,
  /**
   * Looks up enumeration entry by the given name.
   * Actually this method returns the same string which was passed as 1st argument,
   * but it throws an error when this enumeration does not have entry for the corresponding name.
   *
   * @param name logical name of enum record
   */
  byName: getNameByName,

  /**
   * Looks up enumeration entry by the given value.
   *
   * @param value physical name of enum record
   */
  byValue: getNameByValue,

  /**
   * Converts name of the enumeration entry to the value.
   *
   * @param name logical name of enum record
   */
  toValue: convertNameToValue,

  /**
   * Returns set of names available for this enumeration
   */
  names: getAllNames,

  /**
   * Returns set of values available for this enumeration
   */
  values: getAllValues,
};

function getEnumOp<T extends Enum<S>, S>(type: T): EnumOp<T> {
  return type as any;
}

function getEnumName<T extends Enum<S>, S>(type: T): string {
  return getEnumOp(type).$Name;
}

function getNameByName<T extends Enum<S>, S>(type: T, name: string): EnumSet<T> {
  return getEnumOp(type).byName(name);
}

function isNameExist<T extends Enum<S>, S>(type: T, name: string): boolean {
  return getEnumOp(type).exists(name);
}

function getNameByValue<T extends Enum<S>, S>(type: T, value: any): EnumSet<T> {
  return getEnumOp(type).byValue(value);
}

function convertNameToValue<T extends Enum<S>, S>(type: T, name: EnumSet<T>): any {
  return getEnumOp<T, S>(type).toValue(name);
}

function getAllNames<T extends Enum<S>, S>(type: T): string[] {
  return getEnumOp(type).names() as string[];
}

function getAllValues<T extends Enum<S>, S>(type: T): any[] {
  return getEnumOp(type).values();
}
