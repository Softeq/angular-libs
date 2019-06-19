// Developed by Softeq Development Corporation
// http://www.softeq.com

import { isNil } from 'lodash-es';

const localeCache = {};

const LOCALE_RE = /^([a-zA-Z]+)(-([a-zA-Z]+))?$/;
const LOCALE_STANDARD_RE = /^([a-zA-Z]+)(_([a-zA-Z]+))?$/;

export function localeFormatError(str: string): Error {
  return new Error(`Invalid locale format '${str}'`);
}

export function localeStandardFormatError(str: string): Error {
  return new Error(`Invalid locale standard format '${str}'`);
}

export function getLocale(fullOrLanguage: string, optionalCountry?: string): Locale {
  const match = LOCALE_RE.exec(fullOrLanguage);
  if (isNil(match)) {
    throw localeFormatError(fullOrLanguage);
  }

  const language = match[1].toLowerCase();
  const country = match[3] || optionalCountry;

  const code = `${language}${country ? '-' + country.toUpperCase() : ''}`;

  let locale = localeCache[code];

  if (!locale) {
    locale = localeCache[code] = new Locale(language, country);
  }

  return locale;
}

export function getLocaleFromStandard(str: string): Locale {
  const match = LOCALE_STANDARD_RE.exec(str);
  if (isNil(match)) {
    throw localeStandardFormatError(str);
  }

  return getLocale(str.replace(/_/g, '-'));
}

export class Locale {

  constructor(
    readonly language: string,
    readonly country: string,
  ) {
    this.code = this.language.toLowerCase() + (this.country ? '-' + this.country.toUpperCase() : '');
    this.standard = this.language.toLowerCase() + (this.country ? '_' + this.country.toUpperCase() : '');
  }

  readonly code: string;
  private standard: string;

  toString(): string {
    return this.code;
  }

  toStandardString(): string {
    return this.standard;
  }

  toLocaleId(): string {
    return this.code;
  }
}
