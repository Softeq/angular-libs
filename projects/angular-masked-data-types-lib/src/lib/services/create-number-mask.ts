// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNumber from 'lodash/isNumber';

const DOLLAR_SIGN = '$';
const EMPTY_STRING = '';
const COMMA = ',';
const PERIOD = '.';
const MINUS = '-';
const MINUS_RE = /-/;
const NON_DIGITS_RE = /\D+/g;
const DIGIT_RE = /\d/;
const CARET_TRAP = '[]';
const START_ZERO_RE = /^0+([0-9])/;

export interface NumberMaskOptions {
  prefix?: string;
  suffix?: string;
  includeThousandsSeparator?: boolean;
  thousandsSeparatorSymbol?: string;
  allowDecimal?: boolean;
  decimalSymbol?: string;
  decimalLimit?: number;
  requireDecimal?: boolean;
  allowNegative?: boolean;
  integerLimit?: number;
}

export function createNumberMask({
                                   prefix = DOLLAR_SIGN,
                                   suffix = EMPTY_STRING,
                                   includeThousandsSeparator = true,
                                   thousandsSeparatorSymbol = COMMA,
                                   allowDecimal = false,
                                   decimalSymbol = PERIOD,
                                   decimalLimit = 2, // tslint:disable-line:no-magic-numbers
                                   requireDecimal = false,
                                   allowNegative = false,
                                   integerLimit = void 0,
                                 }: NumberMaskOptions = {}): any {
  const decimalRe = new RegExp(`\\${decimalSymbol}`);
  const prefixLength = prefix && prefix.length || 0;
  const thousandsSeparatorSymbolLength = thousandsSeparatorSymbol && thousandsSeparatorSymbol.length || 0;

  function numberMask(rawValue: string = EMPTY_STRING): any {
    const rawValueLength = rawValue.length;

    if (
      rawValue === EMPTY_STRING ||
      (rawValue[0] === prefix[0] && rawValueLength === 1)
    ) {
      return (prefix.split(EMPTY_STRING) as any[]).concat([DIGIT_RE]).concat(suffix.split(EMPTY_STRING));
    }

    const indexOfLastDecimal = rawValue.lastIndexOf(decimalSymbol);
    const hasDecimal = indexOfLastDecimal !== -1;
    const isNegative = (rawValue[0] === MINUS) && allowNegative;

    let integer;
    let fraction;
    let mask;

    if (hasDecimal && (allowDecimal || requireDecimal)) {
      integer = rawValue.slice(rawValue.slice(0, prefixLength) === prefix ? prefixLength : 0, indexOfLastDecimal);

      fraction = rawValue.slice(indexOfLastDecimal + 1, rawValueLength);
      fraction = convertToMask(fraction.replace(NON_DIGITS_RE, EMPTY_STRING));
    } else {
      if (rawValue.slice(0, prefixLength) === prefix) {
        integer = rawValue.slice(prefixLength);
      } else {
        integer = rawValue;
      }
    }

    if (isNumber(integerLimit)) {
      const numberOfThousandSeparators = (integer.match(new RegExp(`${thousandsSeparatorSymbol}`, 'g')) || []).length;

      integer = integer.slice(0, integerLimit + (numberOfThousandSeparators * thousandsSeparatorSymbolLength));
    }

    integer = integer.replace(NON_DIGITS_RE, EMPTY_STRING)/*.replace(START_ZERO_RE, '$1')*/;

    integer = (includeThousandsSeparator) ? addThousandsSeparator(integer, thousandsSeparatorSymbol) : integer;

    const needsLeadingZero = integer === EMPTY_STRING && (!isNegative || hasDecimal);
    mask = needsLeadingZero ? ['0'] : convertToMask(integer);

    if ((hasDecimal && allowDecimal) || requireDecimal === true) {
      if (rawValue[indexOfLastDecimal - 1] !== decimalSymbol) {
        mask.push(CARET_TRAP);
      }

      mask.push(decimalRe, CARET_TRAP);

      if (fraction) {
        if (isNumber(decimalLimit)) {
          fraction = fraction.slice(0, decimalLimit);
        }

        mask = mask.concat(fraction);
      }

      if (requireDecimal === true && rawValue[indexOfLastDecimal - 1] === decimalSymbol) {
        mask.push(DIGIT_RE);
      }
    }

    if (prefixLength > 0) {
      mask = prefix.split(EMPTY_STRING).concat(mask);
    }

    if (isNegative) {
      // If user is entering a negative number, add a mask placeholder spot to attract the caret to it.
      if (mask.length === prefixLength && needsLeadingZero) {
        mask.push(DIGIT_RE);
      }

      mask = [MINUS_RE].concat(mask);
    }

    if (suffix.length > 0) {
      mask = mask.concat(suffix.split(EMPTY_STRING));
    }

    return mask;
  }

  numberMask.instanceOf = 'createNumberMask';

  return numberMask;
}

function convertToMask(strNumber: string): any[] {
  return strNumber
    .split(EMPTY_STRING)
    .map((char) => DIGIT_RE.test(char) ? DIGIT_RE : char);
}

// http://stackoverflow.com/a/10899795/604296
function addThousandsSeparator(n: string, thousandsSeparatorSymbol: string): string {
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparatorSymbol);
}
