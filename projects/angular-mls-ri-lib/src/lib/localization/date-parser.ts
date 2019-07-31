// Developed by Softeq Development Corporation
// http://www.softeq.com

import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import negate from 'lodash/negate';

// tslint:disable-next-line:max-line-length
const FORMAT_REGEXP = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|yyyyyy|yyyyy|yyyy|yy|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

const PM_TIME = 12;

type DateValue = string | number;

interface FormattedDate {
  month?: number;
  year?: number;
  day?: number;
  hours?: number;
  minutes?: number;
}

const DATE_TOKEN_RE = {
  M: /\d\d?/,
  MM: /\d\d?/,
  d: /\d\d?/,
  dd: /\d\d?/,
  y: /\d\d?/,
  yy: /\d\d?/,
  yyyy: /\d\d\d\d?/,
  HH: /\d\d?/,
  h: /\d\d?/,
  mm: /\d\d?/,
  a: /[ap]\.?m?\.?/i,
  A: /[ap]\.?m?\.?/i,
};

const isNotNil = negate(isNil);

function getEmptyDate(): FormattedDate {
  return {
    month: void 0,
    year: void 0,
    day: void 0,
    hours: void 0,
    minutes: void 0,
  };
}

function getParseRegexp(param: string): string {
  return DATE_TOKEN_RE[param] || new RegExp(param);
}

const DATE_TOKEN_OP = {
  M: (formattedDate: FormattedDate, value: number) => {
    formattedDate.month = +value - 1;
  },
  MM: (formattedDate: FormattedDate, value: number) => {
    formattedDate.month = +value - 1;
  },
  d: (formattedDate: FormattedDate, value: number) => {
    formattedDate.day = +value;
  },
  dd: (formattedDate: FormattedDate, value: number) => {
    formattedDate.day = +value;
  },
  y: (formattedDate: FormattedDate, value: number) => {
    formattedDate.year = +value;
  },
  yy: (formattedDate: FormattedDate, value: number) => {
    formattedDate.year = +value;
  },
  yyyy: (formattedDate: FormattedDate, value: number) => {
    formattedDate.year = +value;
  },
  h: (formattedDate: FormattedDate, value: number) => {
    formattedDate.hours = +value;
  },
  HH: (formattedDate: FormattedDate, value: number) => {
    formattedDate.hours = +value;
  },
  mm: (formattedDate: FormattedDate, value: number) => {
    formattedDate.minutes = +value;
  },
  A: (formattedDate: FormattedDate, value: string) => {
    if (value === 'PM') {
      formattedDate.hours! += PM_TIME; // tslint:disable-line:no-non-null-assertion
    }
  },
  a: (formattedDate: FormattedDate, value: string) => {
    if (value === 'PM') {
      formattedDate.hours! += PM_TIME; // tslint:disable-line:no-non-null-assertion
    }
  },
};

function addToDate(formattedDate: FormattedDate, template: string, value: number | string): void {
  if (DATE_TOKEN_OP[template]) {
    DATE_TOKEN_OP[template](formattedDate, value);
  }
}

function isInvalidFormattedDate(formattedDate: FormattedDate): boolean {
  const MIN_YEAR = 1900;
  const MAX_MONTH = 11;
  const MAX_DAYS = 31;
  const MAX_HOURS = 24;
  const MAX_MINUTES = 60;

  if (isEmpty(filter(formattedDate, isNotNil))) {
    return true;
  }

  return (
    isNotNil(formattedDate.year) && (formattedDate.year < MIN_YEAR) ||
    isNotNil(formattedDate.month) && ((formattedDate.month < 0) || (formattedDate.month > MAX_MONTH)) ||
    isNotNil(formattedDate.day) && ((formattedDate.day < 1) || (formattedDate.day > MAX_DAYS)) ||
    isNotNil(formattedDate.hours) && ((formattedDate.hours < 0) || (formattedDate.hours > MAX_HOURS)) ||
    isNotNil(formattedDate.minutes) && ((formattedDate.minutes < 0) || (formattedDate.minutes > MAX_MINUTES)));
}

function newDateFromFormatted(formatted: FormattedDate): Date {
  return new Date(
    formatted.year || 0, // tslint:disable-line:no-magic-numbers
    formatted.month || 0,
    formatted.day || 1,
    formatted.hours || 0,
    formatted.minutes || 0,
    0,
    0);
}

function createDate(formattedDate: FormattedDate): Date {
  // tslint:disable-next-line:no-non-null-assertion
  return isInvalidFormattedDate(formattedDate) ? createInvalidDate() : newDateFromFormatted(formattedDate);
}

function createInvalidDate(): Date {
  return new Date('Invalid Date');
}

export function parseDate(input: string, format: string): Date {
  const formatArray = format.match(FORMAT_REGEXP);
  const formattedDate = getEmptyDate();

  let currentInput = input;

  if (!formatArray) {
    return createInvalidDate();
  }

  for (const currentFormat of formatArray) {
    const regexp = currentInput.match(getParseRegexp(currentFormat));
    const value = regexp && regexp[0];

    if (value) {
      addToDate(formattedDate, currentFormat, value);
      currentInput = currentInput.slice(value.toString().length, currentInput.length);
    } else {
      return createInvalidDate();
    }
  }

  return currentInput.length > 0 ? createInvalidDate() : createDate(formattedDate);
}

export function isDateValidFormat(input: string, format: string): boolean {
  return isDateValid(parseDate(input, format));
}

export function isDateValid(date: Date): boolean {
  return !isNaN(date.getTime());
}
