// Developed by Softeq Development Corporation
// http://www.softeq.com

import {
  DATA_TYPE_NUMBER_KIND,
  dataTypeParseError,
  DataTypeParseResult,
  dataTypeParseSuccess, DataTypeValidationErrors,
  NumberType,
  NumberTypeDefinition
} from '../type.interfaces';
import { AbstractBaseType, DataTypeContext } from './abstract-type';
import { Maybe } from '@softeq/types';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import { Locale, MlsNumberFormatQuery, MlsNumberLocalization } from '@softeq/mls';
import { getDebugTypeName } from '../type.utils';
import { numberTypeValidators } from '../validators/number-validators';

const NUMBER_TYPE_ERROR_MAPPINGS = { $numberFormat: 'format' };

function createNoValueError(): Error {
  return new Error('There is no value for NumberType');
}

function createWrongTypeError(value: any): Error {
  return new Error(`Wrong type of value for NumberType: '${getDebugTypeName(value)}'`);
}

export class NumberTypeImpl extends AbstractBaseType<number> implements NumberType {
  kind = DATA_TYPE_NUMBER_KIND;
  localization: MlsNumberLocalization;

  private formatQuery = {
    minimumFractionDigits: this.definition.format && this.definition.format.minimumFractionDigits,
    maximumFractionDigits: this.definition.format && this.definition.format.maximumFractionDigits,
  };

  constructor(definition: NumberTypeDefinition) {
    super(definition, numberTypeValidators);
  }

  parse(str: string): DataTypeParseResult<number> {
    if (isNil(str)) {
      throw createNoValueError();
    }

    const errors = this.validateFormat(str);
    if (errors) {
      return dataTypeParseError(errors);
    } else {
      return dataTypeParseSuccess(this.localization.parse(str));
    }
  }

  format(value: number, query?: MlsNumberFormatQuery): string {
    if (isNil(value)) {
      throw createNoValueError();
    } else if (!isNumber(value)) {
      throw createWrongTypeError(value);
    }

    return this.localization.format(value, Object.assign({}, this.formatQuery, query));
  }

  validate(value?: number): Maybe<DataTypeValidationErrors> {
    if (isNil(value)) {
      return;
    } else if (!isNumber(value)) {
      throw createWrongTypeError(value);
    }

    const errors = this.useErrorMessages(this.localization.validate(value), NUMBER_TYPE_ERROR_MAPPINGS);

    return errors ? errors : super.validate(value);
  }

  validateFormat(str?: string): Maybe<DataTypeValidationErrors> {
    return this.useErrorMessages(this.localization.validateFormat(str), NUMBER_TYPE_ERROR_MAPPINGS);
  }

  compare(first: number, second: number): number {
    return first - second;
  }

  equals(first: number, second: number): boolean {
    return first === second;
  }

  init(locale: Locale, context: DataTypeContext): void {
    this.localization = context.mlsProvider.getNumberLocalization();

    super.init(locale, context);

  }

}
