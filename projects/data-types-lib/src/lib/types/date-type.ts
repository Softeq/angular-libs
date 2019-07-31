// Developed by Softeq Development Corporation
// http://www.softeq.com

import isDate from 'lodash/isDate';
import isNil from 'lodash/isNil';

import {
  DATA_TYPE_DATE_KIND,
  dataTypeParseError,
  DataTypeParseResult,
  dataTypeParseSuccess, DataTypeValidationErrors,
  DateTimeType,
  DateTimeTypeDefinition
} from '../type.interfaces';
import { AbstractBaseType, DataTypeContext } from './abstract-type';
import { Maybe } from '@softeq/types';
import { MlsDateTimeLocalization, Locale } from '@softeq/mls';
import { getDebugTypeName } from '../type.utils';
import { dateTypeValidators } from '../validators/date-validators';

const DATE_TYPE_ERROR_MAPPINGS = {
  $dateFormat: 'format',
  $dateInvalid: 'invalid',
};

function createNoValueError(): Error {
  return new Error('There is no value for DateType');
}

function createWrongTypeError(value: any): Error {
  return new Error(`Wrong type of value for DateType: '${getDebugTypeName(value)}'`);
}

export class DateTimeTypeImpl extends AbstractBaseType<Date> implements DateTimeType {
  kind = DATA_TYPE_DATE_KIND;
  localization: MlsDateTimeLocalization;

  constructor(public definition: DateTimeTypeDefinition) {
    super(definition, dateTypeValidators);
  }

  parse(str: string): DataTypeParseResult<Date> {
    if (isNil(str)) {
      throw createNoValueError();
    }
    const errors = this.validateFormat(str);
    if (errors) {
      return dataTypeParseError(errors, new Date(NaN));
    } else {
      return dataTypeParseSuccess(this.localization.parse(str, this.definition.format));
    }
  }

  format(value: Date): string {
    if (isNil(value)) {
      throw createNoValueError();
    } else if (!isDate(value)) {
      throw createWrongTypeError(value);
    }
    return this.localization.format(value, this.definition.format);
  }

  validate(value: Date): Maybe<DataTypeValidationErrors> {
    if (isNil(value)) {
      return void 0;
    } else if (!isDate(value)) {
      throw createWrongTypeError(value);
    }

    const errors = this.useErrorMessages(this.localization.validate(value), DATE_TYPE_ERROR_MAPPINGS);

    return errors ? errors : super.validate(value);
  }

  validateFormat(str: string): Maybe<DataTypeValidationErrors> {
    return this.useErrorMessages(this.localization.validateFormat(str, this.definition.format), DATE_TYPE_ERROR_MAPPINGS);
  }

  compare(first: Date, second: Date): number {
    return first.getTime() - second.getTime();
  }

  equals(first: Date, second: Date): boolean {
    return first.getTime() === second.getTime();
  }

  init(locale: Locale, context: DataTypeContext): void {
    this.localization = context.mlsProvider.getDateTimeLocalization();

    super.init(locale, context);
  }
}
