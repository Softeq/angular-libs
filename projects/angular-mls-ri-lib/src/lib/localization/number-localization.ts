// Developed by Softeq Development Corporation
// http://www.softeq.com

import { formatNumber } from '@angular/common';
import { Locale, MlsNumberFormatQuery, MlsNumberLocalization } from '@softeq/mls';
import { Hash, Maybe } from '@softeq/types';
import { ValidationErrors } from '@angular/forms';
import { isNil } from 'lodash-es';

const SIGN_PART_INDEX = 1;
const INTEGRAL_PART_INDEX = 4;
const FRACTIONAL_PART_INDEX = 6;
const ONLY_FRACTIONAL_PART_INDEX = 8;

export interface NumberLocalizationOptions {
  grouping: boolean;
  groupSeparator: string;
  decimalSeparator: string;
}

/**
 * This class provides very poor implementation of localizable number parser.
 * It was implemented to avoid usage of fat parsing libraries.
 *
 * If capabilities of this class will be not enough we can integrate good and robust library.
 *
 * TODO: refactor this class because it provides very poor implementation of number parsing
 */
export class RiNumberLocalization implements MlsNumberLocalization {
  readonly decimalSeparator: string = this.formatOptions.decimalSeparator;
  readonly groupSeparator: string = this.formatOptions.groupSeparator;
  readonly grouping: boolean = this.formatOptions.grouping;

  private numberRe: RegExp;
  private numberGroupRe: RegExp;

  constructor(private locale: Locale,
              private formatOptions: NumberLocalizationOptions) {
    this.numberRe = compilePattern(formatOptions);

    if (formatOptions.grouping && formatOptions.groupSeparator) {
      this.numberGroupRe = new RegExp(`\\${formatOptions.groupSeparator}`, 'g');
    }
  }

  format(value: number, query: MlsNumberFormatQuery): string {
    const { minimumFractionDigits, maximumFractionDigits } = query;
    return formatNumber(
      value,
      this.locale.toLocaleId(),
      `1.${minimumFractionDigits || 0}-${isNil(maximumFractionDigits) ? 3 : maximumFractionDigits}`);
  }

  parse(str: string): number {
    const match = this.numberRe.exec(str);

    if (!match) {
      throw new Error(`Value '${str}' cannot be converted to a number`);
    }

    let integralPart = match[INTEGRAL_PART_INDEX] || '';

    if (this.numberGroupRe) {
      integralPart = integralPart.replace(this.numberGroupRe, '');
    }

    // tslint:disable:max-line-length
    return Number(`${match[SIGN_PART_INDEX] || ''}${integralPart}.${match[FRACTIONAL_PART_INDEX] || match[ONLY_FRACTIONAL_PART_INDEX] || '0'}`);
  }

  validate(value: number): Maybe<ValidationErrors> {
    return void 0;
  }

  validateFormat(value: string): Maybe<ValidationErrors> {
    return this.numberRe.test(value) ? void 0 : { $numberFormat: { value } };
  }
}

function compileSignPart(localization: NumberLocalizationOptions): string {
  return '(\\+|-)';
}

function compileIntegralPart(localization: NumberLocalizationOptions): string {
  const pattern = [];
  if (localization.groupSeparator) {
    pattern.push('([0-9\\', localization.groupSeparator);
    if (localization.grouping) {
      pattern.push(' ');
    }
    pattern.push(']+)');
  } else {
    pattern.push('([0-9');
    if (localization.grouping) {
      pattern.push(' ');
    }
    pattern.push(']+)');
  }
  return pattern.join('');
}

function compileFractionalpart(localization: NumberLocalizationOptions): string {
  return `(\\${localization.decimalSeparator}([0-9]+)?)`;
}

function compilePattern(localization: NumberLocalizationOptions): RegExp {
  const pattern = [];
  const space = '\\s*';
  const sign = compileSignPart(localization);
  const integral = compileIntegralPart(localization);
  const fractional = compileFractionalpart(localization);

  pattern.push('^');
  pattern.push(space);
  pattern.push(sign, '?');
  pattern.push(space);

  pattern.push('(');
  if (localization.decimalSeparator) {
    pattern.push('(', integral, fractional, '?', ')');
    pattern.push('|');
    pattern.push(fractional);
  } else {
    pattern.push(integral);
  }
  pattern.push(')');

  pattern.push(space);
  pattern.push('$');

  return new RegExp(pattern.join(''));
}
