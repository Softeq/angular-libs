// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash, Maybe } from '@softeq/types';
import { MlsDateTimeLocalization, Locale, MlsNumberLocalization, MlsRecord, MlsValidationErrors } from '@softeq/mls';
import isNil from 'lodash/isNil';

export const DATA_TYPE_TEXT_KIND: 'text' = 'text';
export const DATA_TYPE_NUMBER_KIND: 'number' = 'number';
export const DATA_TYPE_DATE_KIND: 'date' = 'date';

export interface DataTypeParseSuccessResult<T> {
  value: T;
  errors?: undefined;
}

export interface DataTypeParseErrorResult<T> {
  value?: T;
  errors: DataTypeValidationErrors;
}

export type DataTypeParseResult<T> = DataTypeParseSuccessResult<T> | DataTypeParseErrorResult<T>;

export type DataTypeValidationErrors = MlsValidationErrors;

export function dataTypeParseSuccess<T>(value: T): DataTypeParseSuccessResult<T> {
  return { value };
}

export function dataTypeParseError<T>(errors: DataTypeValidationErrors, invalidValue?: T): DataTypeParseErrorResult<T> {
  return { errors, value: invalidValue };
}

export function isDataTypeParseSuccess<T>(result: DataTypeParseResult<T>): result is DataTypeParseSuccessResult<T> {
  return isNil(result.errors);
}

export function isDataTypeParseError<T>(result: DataTypeParseResult<T>): result is DataTypeParseErrorResult<T> {
  return !isNil(result.errors);
}

/**
 * Type defines following type-related capabilities:
 * - parsing
 * - formatting
 * - validators against set of constraints
 */
export interface DataType<T> {
  kind: string;

  /**
   * Definition this type is based on
   */
  readonly definition: DataTypeDefinition;

  /**
   * Locale of this type
   */
  readonly locale: Locale;

  /**
   * Some properties added to type during initialization
   */
  properties: Hash<any>;

  /**
   * Parses given string into typed value
   * @param str
   */
  parse(str: string): DataTypeParseResult<T>;

  /**
   * Formats typed value into string
   * @param value
   * @param options
   */
  format(value: T, options?: any): string;

  /**
   * Validates typed value and returns set of failed constraints.
   * If all constraints are satisfied returns undefined.
   *
   * @param value
   */
  validate(value?: T): Maybe<DataTypeValidationErrors>;

  /**
   * Validates format of value. If format is wrong method returns set of errors, otherwise undefined
   * @param str
   */
  validateFormat(str?: string): Maybe<DataTypeValidationErrors>;

  /**
   * Checks whether two values are equal or do not
   * @param first
   * @param second
   */
  equals(first: T, second: T): boolean;

  /**
   * Checks order of two values relative to each other.
   *
   * @param first
   * @param second
   */
  compare(first: T, second: T): number;
}
/**
 * Type encapsulates all text type related capabilities
 */
export interface TextType extends DataType<string> {
  kind: 'text';
  definition: TextTypeDefinition;
}

/**
 * Type encapsulates all number type related capabilities
 */
export interface NumberType extends DataType<number> {
  kind: 'number';
  definition: NumberTypeDefinition;
  localization: MlsNumberLocalization;
}

/**
 * Type encapsulates all date type related capabilities
 */
export interface DateTimeType extends DataType<Date> {
  kind: 'date';
  definition: DateTimeTypeDefinition;
  localization: MlsDateTimeLocalization;
}

export type DataTypeValidator = (value: any) => Maybe<{ [name: string]: any }>;
export type DataTypeValidatorFactory = (constraint: any) => DataTypeValidator;

/**
 * Abstract definition for all types
 */
export interface DataTypeDefinition {
  format?: any;
  constraints?: any;
  messages?: any;
  validators?: Hash<DataTypeValidatorFactory>;
  properties?: Hash<any>;
}

export type TextRangeLengthConstraint = [number, number] | {
  min: number;
  max: number;
};

/**
 * Text type definition
 */
export interface TextTypeDefinition extends DataTypeDefinition {
  constraints?: Partial<{
    maxLength: number;
    minLength: number;
    rangeLength: TextRangeLengthConstraint;
    pattern: RegExp;
    [name: string]: any;
  }>;
  messages?: Partial<{
    maxLength: MlsRecord;
    minLength: MlsRecord;
    rangeLength: MlsRecord;
    pattern: MlsRecord;
    [name: string]: MlsRecord;
  }>;
}

export type NumberValueConstraint = number | {
  value: number;
  include?: boolean;
};

export type NumberRangeConstraint = [number, number] | {
  min: number;
  max: number;
  includeMin?: boolean;
  includeMax?: boolean;
};

/**
 * Number type definition
 */
export interface NumberTypeDefinition extends DataTypeDefinition {
  format?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
  constraints?: Partial<{
    integral: boolean;
    range: NumberRangeConstraint;
    min: NumberValueConstraint;
    max: NumberValueConstraint;
    [name: string]: any;
  }>;
  messages?: Partial<{
    format: MlsRecord
    integral: MlsRecord;
    range: MlsRecord;
    min: MlsRecord;
    max: MlsRecord;
    [name: string]: Maybe<MlsRecord>;
  }>;
}

/**
 * Date type definition
 */
export interface DateTimeTypeDefinition extends DataTypeDefinition {
  format?: string;
  constraints?: Partial<{
    min: DateValueConstraint;
    max: DateValueConstraint;
    range: DateRangeConstraint;
  }>;
  messages?: Partial<{
    invalid: MlsRecord;
    format: MlsRecord;
    min: MlsRecord;
    max: MlsRecord;
    range: MlsRecord;
    [name: string]: MlsRecord;
  }>;
  validators?: any;
  properties?: Hash<any>;
}

export type DateValueConstraint = Date | {
  value: Date;
  include?: boolean;
};

export type DateRangeConstraint = [Date, Date] | {
  min: Date;
  max: Date;
  includeMin?: boolean;
  includeMax?: boolean;
};
