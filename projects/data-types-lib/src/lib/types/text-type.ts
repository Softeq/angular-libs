// Developed by Softeq Development Corporation
// http://www.softeq.com

import {
  DATA_TYPE_TEXT_KIND,
  DataTypeParseResult,
  dataTypeParseSuccess,
  DataTypeValidationErrors,
  TextType,
  TextTypeDefinition
} from '../type.interfaces';
import { AbstractBaseType } from './abstract-type';
import { Maybe } from '@softeq/types';
import { getDebugTypeName } from '../type.utils';
import { isNil, isString } from 'lodash-es';
import { textTypeValidators } from '../validators/text-validators';

function createNoValueError(): Error {
  return new Error('There is no value for TextType');
}

function createWrongTypeError(value: any): Error {
  return new Error(`Wrong type of value for TextType: '${getDebugTypeName(value)}'`);
}

function normalizeTextTypeDefinition(source: TextTypeDefinition): TextTypeDefinition {
  if (source.constraints && source.constraints.maxLength) {
    return { ...source, properties: { ...source.properties, maxLength: source.constraints.maxLength } };
  } else {
    return source;
  }
}

export class TextTypeImpl extends AbstractBaseType<string> implements TextType {
  kind = DATA_TYPE_TEXT_KIND;

  constructor(definition: TextTypeDefinition) {
    super(normalizeTextTypeDefinition(definition), textTypeValidators);
  }

  parse(str: string): DataTypeParseResult<string> {
    if (isNil(str)) {
      throw createNoValueError();
    }

    return dataTypeParseSuccess(str);
  }

  format(value: string): string {
    if (isNil(value)) {
      throw createNoValueError();
    } else if (!isString(value)) {
      throw createWrongTypeError(value);
    }

    return value;
  }

  validateFormat(str: string): Maybe<DataTypeValidationErrors> {
    return void 0;
  }

  compare(first: string, second: string): number {
    if (first < second) {
      return -1;
    } else if (first > second) {
      return 1;
    } else {
      return 0;
    }
  }

  equals(first: string, second: string): boolean {
    return first === second;
  }
}
