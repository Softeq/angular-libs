// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Maybe } from '@softeq/types';
import { Locale } from './locale';

export interface MlsValidationErrors {
  [key: string]: any;
}

export interface MlsNumberLocalization {
  readonly groupSeparator: string;
  readonly decimalSeparator: string;
  readonly grouping: boolean;

  parse(str: string): number;

  validateFormat(str: string): Maybe<MlsValidationErrors>;

  format(value: number, query: MlsNumberFormatQuery): string;

  validate(value: number): Maybe<MlsValidationErrors>;
}

export interface MlsNumberFormatQuery {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface MlsDateTimeLocalization {
  parse(str: string, inputFormat: string): Date;

  validateFormat(str: string, inputFormat: string): Maybe<MlsValidationErrors>;

  format(value: Date, format: string): string;

  validate(value: Date): Maybe<MlsValidationErrors>;
}

const toLocaleLowerCase = String.prototype.toLocaleLowerCase;
const toLocaleUpperCase = String.prototype.toLocaleUpperCase;

export class MlsTextLocalization {
  private code: string;

  constructor(locale: Locale) {
    this.code = locale.code;
  }

  toUpperCase(str: string): string {
    return toLocaleUpperCase.call(str, this.code);
  }

  toLowerCase(str: string): string {
    return toLocaleLowerCase.call(str, this.code);
  }

  includesIgnoreCase(str: string, substring: string): boolean {
    return this.toUpperCase(str).includes(this.toUpperCase(substring));
  }
}

export interface MlsTranslator {
  /**
   * Creates record with the given parameters
   *
   * @param record
   * @param params
   */
  create(record: MlsRecord, params?: any): MlsRecord;

  /**
   * Returns text for the given record
   * @param record
   */
  translate(record: MlsRecord): string;
}

export abstract class MlsProvider {
  abstract getCurrentLocale(): Locale;

  abstract getTranslator(): MlsTranslator;

  abstract getNumberLocalization(): MlsNumberLocalization;

  abstract getDateTimeLocalization(): MlsDateTimeLocalization;

  abstract getTextLocalization(): MlsTextLocalization;
}

export type MlsRecord = any;
