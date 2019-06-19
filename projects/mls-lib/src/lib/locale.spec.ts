// Developed by Softeq Development Corporation
// http://www.softeq.com

import { getLocale, getLocaleFromStandard, Locale } from './locale';

describe('Locale', () => {
  it('#getLocale should return instance of Locale class', () => {
    const locale = getLocale('en', 'US');
    expect(locale instanceof Locale).toBe(true);
  });

  it('#getLocale can be called with one language parameter', () => {
    expect(getLocale('en')).toBeTruthy();
  });

  it('#getLocale can be called with two parameters (language and country)', () => {
    expect(getLocale('en', 'US')).toBeTruthy();
  });

  it('#getLocale can be called with one parameter (full code of locale)', () => {
    expect(getLocale('en-US')).toBeTruthy();
  });

  it('#getLocale should return the same locale for the same value', () => {
    const locale1 = getLocale('en', 'GB');
    const locale2 = getLocale('en', 'GB');

    expect(locale1).toBe(locale2);
  });

  it('#getLocale should return different locales for different values', () => {
    const locale1 = getLocale('en', 'GB');
    const locale2 = getLocale('en', 'US');

    expect(locale1).not.toBe(locale2);
  });

  it('#getLocale should return the same value if letter case of locale parts are different', () => {
    const locale1 = getLocale('en', 'GB');
    const locale2 = getLocale('en', 'gb');

    expect(locale1).toBe(locale2);
  });

  it('#getLocale should return the same value for full or split kind of locale code', () => {
    const locale1 = getLocale('en', 'GB');
    const locale2 = getLocale('en-GB');

    expect(locale1).toBe(locale2);
  });

  it('#getLocale should return the same value if full and split kind of locale codes are in different letter cases', () => {
    const locale1 = getLocale('en', 'GB');
    const locale2 = getLocale('en-gb');

    expect(locale1).toBe(locale2);
  });

  it('#getLocale should throw error if format is wrong', () => {
    expect(() => getLocale('en_GB')).toThrowError();
  });

  it('#getLocaleFromStandard should return instance of Locale class', () => {
    const locale = getLocaleFromStandard('en_US');
    expect(locale instanceof Locale).toBe(true);
  });


  it('#getLocaleFromStandard should throw error if format is wrong', () => {
    expect(() => getLocaleFromStandard('en-GB')).toThrowError();
  });

  it('#getLocale and #getLocaleFromStandard should return the same value', () => {
    const locale1 = getLocale('en-gB');
    const locale2 = getLocaleFromStandard('en_Gb');

    expect(locale1).toBe(locale2);
  });

  it('#code should return locale code', () => {
    const locale = getLocale('en-gb');
    expect(locale.code).toBe('en-GB');
  });

  it('#toString should return locale code', () => {
    const locale = getLocale('en-gb');
    expect(locale.toString()).toBe('en-GB');
  });

  it('#toLocaleId should return locale code', () => {
    const locale = getLocale('en-gb');
    expect(locale.toLocaleId()).toBe('en-GB');
  });

  it('#toStandardString should return code with underscore', () => {
    const locale = getLocale('en-gb');
    expect(locale.toStandardString()).toBe('en_GB');
  });
});
