// Developed by Softeq Development Corporation
// http://www.softeq.com

import { formatDate } from '@angular/common';
import { MlsDateTimeLocalization, Locale } from '@softeq/mls';
import { Hash, Maybe } from '@softeq/types';
import { isDateValid, isDateValidFormat, parseDate } from './date-parser';
import { ValidationErrors } from '@angular/forms';
import { isNil } from 'lodash-es';

export class RiDateTimeLocalization implements MlsDateTimeLocalization {
  constructor(private locale: Locale,
              private formats: Hash<string>) {
  }

  format(value: Date, format: string): string {
    if (isNil(format)) {
      throw new Error('Format is mandatory to format date');
    }

    return formatDate(value, this.formats[format] || format, this.locale.toLocaleId());
  }

  parse(str: string, inputFormat: string): Date {
    if (isNil(inputFormat)) {
      throw new Error('Input format is mandatory to parse date');
    }

    const date = parseDate(str, this.formats[inputFormat] || inputFormat);
    if (!isDateValid(date)) {
      throw new Error(`Value '${str}' cannot be converted to a date`);
    }
    return date;
  }

  validate(value: Date): Maybe<ValidationErrors> {
    return isDateValid(value) ? void 0 : { $dateInvalid: { value } };
  }

  validateFormat(value: string, inputFormat: string): Maybe<ValidationErrors> {
    if (isNil(inputFormat)) {
      throw new Error('Input format is mandatory to parse date');
    }

    return !isNil(value) && isDateValidFormat(value, this.formats[inputFormat] || inputFormat) ? void 0 : { $dateFormat: { value } };
  }
}
