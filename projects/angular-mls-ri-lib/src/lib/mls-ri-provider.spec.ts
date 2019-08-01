// Developed by Softeq Development Corporation
// http://www.softeq.com

import { MlsDateTimeLocalization, getLocale, MlsProvider, MlsTranslator, MlsNumberLocalization } from '@softeq/mls';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { SofteqMlsRiModule } from './softeq-mls-ri.module';
import { LOCALE_EN_AU, LOCALE_EN_US, LOCALE_RU_RU, setupTestLocaleData, setupTestTranslationData, switchLocale } from '@softeq/test-data';
import isNil from 'lodash/isNil';
import omitBy from 'lodash/omitBy';

setupTestLocaleData();

describe('@softeq/mls implementation', () => {
  let mlsProvider: MlsProvider;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SofteqMlsRiModule.forRoot(),
      ],
    });

    setupTestTranslationData();

    translate = TestBed.get(TranslateService);
    mlsProvider = TestBed.get(MlsProvider);
  });

  it('#getCurrentLocale should return the same value as ngx-translate module', () => {
    expect(mlsProvider.getCurrentLocale()).toBe(getLocale(translate.currentLang));
  });

  it('#getTranslator should return instance of MlsTranslator', () => {
    expect(mlsProvider.getTranslator()).toBeTruthy();
  });

  it('#getNumberLocalization should return the same instance for the same locale', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getNumberLocalization();
    const localization2 = mlsProvider.getNumberLocalization();
    expect(localization1 === localization2).toBe(true);
  });

  it('#getNumberLocalization should return different instances for different locales', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getNumberLocalization();
    switchLocale(LOCALE_EN_AU);
    const localization2 = mlsProvider.getNumberLocalization();
    expect(localization1 === localization2).toBe(false);
  });

  it('#getDateLocalization should return the same instance for the same locale', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getDateTimeLocalization();
    const localization2 = mlsProvider.getDateTimeLocalization();
    expect(localization1 === localization2).toBe(true);
  });

  it('#getDateLocalization should return different instances for different locales', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getDateTimeLocalization();
    switchLocale(LOCALE_EN_AU);
    const localization2 = mlsProvider.getDateTimeLocalization();
    expect(localization1 === localization2).toBe(false);
  });

  it('#getTextLocalization should return the same instance for the same locale', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getTextLocalization();
    const localization2 = mlsProvider.getTextLocalization();
    expect(localization1 === localization2).toBe(true);
  });

  it('#getTextLocalization should return different instances for different locales', () => {
    switchLocale(LOCALE_EN_US);
    const localization1 = mlsProvider.getTextLocalization();
    switchLocale(LOCALE_EN_AU);
    const localization2 = mlsProvider.getTextLocalization();
    expect(localization1 === localization2).toBe(false);
  });

  describe('Translator', () => {
    let translator: MlsTranslator;

    beforeEach(() => {
      translator = mlsProvider.getTranslator();
    });

    it('#create should parametrize label id with provided parameters', () => {
      expect(omitBy(translator.create('msg_error'), isNil)).toEqual({ key: 'msg_error' });
      expect(translator.create('msg_error', { value: 123 })).toEqual({ key: 'msg_error', params: { value: 123 } });
      expect(translator.create({ key: 'msg_error' }, { value: 123 })).toEqual({ key: 'msg_error', params: { value: 123 } });
      expect(translator.create({ key: 'msg_error', params: { a: 10 } }, { value: 123 }))
        .toEqual({ key: 'msg_error', params: { a: 10, value: 123 } });
    });

    it('#translate should return translation using ngx-translate library', () => {
      expect(translator.translate('label_id')).toBe('Some translation');
    });
  });

  describe('MlsNumberLocalization', () => {
    let usLocalization: MlsNumberLocalization;
    let auLocalization: MlsNumberLocalization;
    let ruLocalization: MlsNumberLocalization;

    beforeEach(() => {
      switchLocale(LOCALE_EN_US);
      usLocalization = mlsProvider.getNumberLocalization();
      switchLocale(LOCALE_EN_AU);
      auLocalization = mlsProvider.getNumberLocalization();
      switchLocale(LOCALE_RU_RU);
      ruLocalization = mlsProvider.getNumberLocalization();
    });

    it('#parse should parse number according to the provided input formats', () => {
      expect(usLocalization.parse('1,234.5678')).toBe(1234.5678);
      expect(auLocalization.parse('1.234,5678')).toBe(1234.5678);
      expect(ruLocalization.parse('1 234,5678')).toBe(1234.5678);
    });

    it('#parse should throw error when format is wrong', () => {
      expect(() => usLocalization.parse('1,234.jjj')).toThrowError();
    });

    it('#validateFormat should return ValidationErrors when format is wrong', () => {
      const value = '1.234,222,222';

      expect(usLocalization.validateFormat(value)).toEqual({ $numberFormat: { value } });
    });

    it('#validateFormat should return undefined when format is correct', () => {
      const value = '1,234.5678';

      expect(usLocalization.validateFormat(value)).toBe(void 0);
    });

    it('#format should format number according to the given query', () => {
      expect(usLocalization.format(123456.789, { minimumFractionDigits: 1, maximumFractionDigits: 2 })).toBe('123,456.79');
      expect(usLocalization.format(123456.789, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('123,456.8');
      expect(usLocalization.format(123456.789, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('123,457');
      expect(usLocalization.format(123456.789, { minimumFractionDigits: 2, maximumFractionDigits: 4 })).toBe('123,456.789');
      expect(usLocalization.format(123456.789, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe('123,456.7890');
    });
  });

  describe('MlsDateTimeLocalization', () => {
    let usLocalization: MlsDateTimeLocalization;
    let auLocalization: MlsDateTimeLocalization;
    let ruLocalization: MlsDateTimeLocalization;

    beforeEach(() => {
      switchLocale(LOCALE_EN_US);
      usLocalization = mlsProvider.getDateTimeLocalization();
      switchLocale(LOCALE_EN_AU);
      auLocalization = mlsProvider.getDateTimeLocalization();
      switchLocale(LOCALE_RU_RU);
      ruLocalization = mlsProvider.getDateTimeLocalization();
    });

    describe('date', () => {
      it('#parse should parse date according to the provided input format', () => {
        const date = new Date(2019, 11, 2);
        expect(usLocalization.parse('12/2/2019', 'shortDate')).toEqual(date);
        expect(auLocalization.parse('2/12/2019', 'shortDate')).toEqual(date);
        expect(ruLocalization.parse('2.12.2019', 'shortDate')).toEqual(date);
      });

      it('#parse should throw error when format is wrong', () => {
        expect(() => usLocalization.parse('2.12.2019', 'shortDate')).toThrowError();
      });

      it('#parse should throw error if input format is not provided', () => {
        expect(() => (usLocalization as any).parse('12/2/2019')).toThrowError();
      });

      it('#format should format date according to the provided format', () => {
        expect(usLocalization.format(new Date(2019, 11, 2), 'shortDate')).toBe('12/2/2019');
      });

      it('#format should throw error if format is not provided', () => {
        expect(() => (usLocalization as any).format(new Date(2019, 11, 2))).toThrowError();
      });

      it('#validateFormat should return ValidationErrors when format is wrong', () => {
        const value = 'dasdfasdf';

        expect(usLocalization.validateFormat(value, 'shortDate')).toEqual({ $dateFormat: { value } });
      });

      it('#validateFormat should throw error if input format is not provided', () => {
        expect(() => (usLocalization as any).validateFormat('12/2/2019')).toThrowError();
      });

      it('#validateFormat should return undefined when format is correct', () => {
        const value = '12/2/2019';

        expect(usLocalization.validateFormat(value, 'shortDate')).toBe(void 0);
      });

      it('#validate should return ValidationErrors when date is invalid', () => {
        const value = new Date('Invalid Date');

        expect(usLocalization.validate(value)).toEqual({ $dateInvalid: { value } });
      });
    });

    describe('time', () => {
      it('#parse should parse time according to the provided input format', () => {
        const date = new Date(0, 0, 1, 14, 5);
        expect(usLocalization.parse('2:5 PM', 'shortTime')).toEqual(date);
        expect(auLocalization.parse('14:05', 'shortTime')).toEqual(date);
        expect(ruLocalization.parse('14:05', 'shortTime')).toEqual(date);
      });

      it('#parse should throw error when format is wrong', () => {
        expect(() => usLocalization.parse('14/05/50', 'shortTime')).toThrowError();
      });

      it('#format should format time according to the provided format', () => {
        expect(usLocalization.format(new Date(0, 0, 1, 14, 5, 50), 'shortTime')).toBe('2:05 PM');
      });

      it('#validateFormat should return ValidationErrors when format is wrong', () => {
        const value = 'dasdfasdf';

        expect(usLocalization.validateFormat(value, 'shortTime')).toEqual({ $dateFormat: { value } });
      });

      it('#validateFormat should return undefined when format is correct', () => {
        const value = '2:5 PM';

        expect(usLocalization.validateFormat(value, 'shortTime')).toBe(void 0);
      });
    });

    describe('datetime', () => {
      it('#parse should parse date-time according to the provided input format', () => {
        const date = new Date(2019, 11, 2, 14, 5);
        expect(usLocalization.parse('12/2/2019 2:5 PM', 'shortDatetime')).toEqual(date);
        expect(auLocalization.parse('2/12/2019 14:05', 'shortDatetime')).toEqual(date);
        expect(ruLocalization.parse('2.12.2019 14:05', 'shortDatetime')).toEqual(date);
      });

      it('#parse should throw error when format is wrong', () => {
        expect(() => usLocalization.parse('2.12/2019 14/05/50', 'shortDatetime')).toThrowError();
      });

      it('#format should format time according to the provided format', () => {
        expect(usLocalization.format(new Date(2019, 11, 2, 14, 5, 50), 'shortDatetime')).toBe('12/2/2019 2:05 PM');
      });

      it('#validateFormat should return ValidationErrors when format is wrong', () => {
        const value = 'dasdfasdf';

        expect(usLocalization.validateFormat(value, 'shortDatetime')).toEqual({ $dateFormat: { value } });
      });

      it('#validateFormat should return undefined when format is correct', () => {
        const value = '12/2/2019 2:5 PM';

        expect(usLocalization.validateFormat(value, 'shortDatetime')).toBe(void 0);
      });
    });
  });
});
