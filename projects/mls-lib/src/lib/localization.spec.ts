// Developed by Softeq Development Corporation
// http://www.softeq.com

import {
  MlsDateTimeLocalization,
  MlsProvider,
  MlsTranslator,
  MlsNumberLocalization,
  MlsTextLocalization,
  MlsRecord
} from './localization.interfaces';
import { getLocale, Locale } from './locale';

function specification(provider: MlsProvider): void {
  describe('MlsProvider', () => {

    it('#getCurrentLocale should return current locale as instance of Locale class', () => {
      // returns current locale
      const locale = provider.getCurrentLocale();

      // should be an instance of Locale
      expect(locale instanceof Locale).toBe(true);
    });

    it('#getTranslator should return translator object', () => {
      expect(provider.getTranslator()).toBeTruthy();
    });

    describe('Translator', () => {
      let translator: MlsTranslator;

      beforeEach(() => {
        translator = provider.getTranslator();
      });

      it('#create should create translation record', () => {
        // format of translation record is defined by RI
        expect(translator.create('msg_error', { param: 10 })).toEqual({ key: 'msg_error', params: { param: 10 } });
      });

      it('#translate should transform translation record (MlsRecord) to string', () => {
        // format of translation record is defined by RI
        const record: MlsRecord = 'lbl_some_label_id';
        // const record: MlsRecord = { id: 'lbl_some_label_id' };
        // const record: MlsRecord = { key: 'lbl_some_label_id' };
        // const record: MlsRecord = new MlsRecordImpl(...);

        // transforms record to text
        expect(translator.translate(record)).toBe('Some translation');
      });
    });

    describe('TextLocalization', () => {
      let localization: MlsTextLocalization;

      beforeEach(() => {
        localization = provider.getTextLocalization();
      });

      it('MlsProvider#getTextLocalization should return implementation of TextLocalization interface for the given locale', () => {
        expect(localization).toBeTruthy();
      });

      it('#toUpperCase should transform string to upper case for the locale TextLocalization belongs to', () => {
        expect(localization.toUpperCase('some text')).toBe('SOME TEXT');
      });

      it('#toLowerCase should transform string to lower case for the locale TextLocalization belongs to', () => {
        expect(localization.toLowerCase('SOME TEXT')).toBe('some text');
      });

      it('#includesIgnoreCase should test if string has given substring for the locale TextLocalization belongs to', () => {
        expect(localization.includesIgnoreCase('some full text', 'text')).toBe(true);
      });
    });

    describe('MlsNumberLocalization', () => {
      let localization: MlsNumberLocalization;

      beforeEach(() => {
        localization = provider.getNumberLocalization();
      });

      it('MlsProvider#getNumberLocalization should return implementation of NumberLocalization interface for the given locale', () => {
        expect(localization).toBeTruthy();
      });

      it('#parse should transform string to number in the locale MlsNumberLocalization belongs to', () => {
        expect(localization.parse('123,456.789')).toBe(123456.789);
      });

      it('#validateFormat should return validation error if number format is wrong in the locale MlsNumberLocalization belongs to', () => {
        const value = '123.456,789';

        expect(localization.validateFormat(value)).toEqual({ $numberFormat: { value } });
      });

      it('#validateFormat should return undefined if number format is correct in the locale MlsNumberLocalization belongs to', () => {
        const value = '123,456.789';

        expect(localization.validateFormat(value)).toBeUndefined();
      });

      it('#format should format number according to the given query in the locale MlsNumberLocalization belongs to', () => {
        expect(localization.format(123456.789, { minimumFractionDigits: 1, maximumFractionDigits: 2 })).toBe('123,456.79');
        expect(localization.format(123456.789, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('123,456.8');
        expect(localization.format(123456.789, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('123,457');
        expect(localization.format(123456.789, { minimumFractionDigits: 2, maximumFractionDigits: 4 })).toBe('123,456.789');
        expect(localization.format(123456.789, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe('123,456.7890');
      });


      it('#format should return undefined and exists just for the consistency with MlsDateTimeLocalization interface', () => {
        expect(localization.validate(123456.789)).toBeUndefined();
      });
    });

    describe('MlsDateTimeLocalization', () => {
      let localization: MlsDateTimeLocalization;

      beforeEach(() => {
        localization = provider.getDateTimeLocalization();
      });

      it('MlsProvider#getDateTimeLocalization should return implementation of DateTimeLocalization interface for the given locale', () => {
        expect(localization).toBeTruthy();
      });

      it('#parse should transform string to Date according to the given input format in the locale MlsDateTimeLocalization belongs to', () => {
        // name of input format is implementation specific ('date', 'DATE', 'MM/d/yyyy', etc)
        expect(localization.parse('12/2/2019', 'date')).toEqual(new Date(2019, 11, 2));
        // expect(localization.parse('12/2/2019', 'DATE')).toEqual(new Date(2019, 11, 2));
        // expect(localization.parse('12/2/2019', 'MM/d/yyyy')).toEqual(new Date(2019, 11, 2));
      });

      it('#parse should throw error if input format is not provided', () => {
        expect(() => (localization as any).parse('12/2/2019')).toThrowError();
      });

      it('#format should format date according to the provided format in the locale MlsDateTimeLocalization belongs to', () => {
        // name of format is implementation specific ('shortDate', 'SHORT_DATE', 'MM/d/yyyy', etc)
        // it is a good practice to implement support of format names supported by DatePipe (shortDate, mediumDate, ...)
        expect(localization.format(new Date(2019, 11, 2), 'shortDate')).toBe('12/2/2019');
      });

      it('#format should throw error if format is not provided', () => {
        expect(() => (localization as any).format(new Date(2019, 11, 2))).toThrowError();
      });

      it('#validateFormat should return ValidationErrors when format is wrong in the locale MlsDateTimeLocalization belongs to', () => {
        const value = 'dasdfasdf';

        expect(localization.validateFormat(value, 'date')).toEqual({ $dateFormat: { value } });
      });

      it('#validateFormat should throw error if input format is not provided', () => {
        expect(() => (localization as any).validateFormat('12/2/2019')).toThrowError();
      });

      it('#validateFormat should return undefined when format is correct', () => {
        const value = '12/2/2019';

        expect(localization.validateFormat(value, 'date')).toBe(void 0);
      });

      it('#validate should return ValidationErrors when date is invalid in the locale MlsDateTimeLocalization belongs to', () => {
        const value = new Date('Invalid Date');

        expect(localization.validate(value)).toEqual({ $dateInvalid: { value } });
      });

      it('#[all methods] should support operations with time and datetime values too', () => {
        const time = new Date(0, 0, 1, 14, 5);
        const datetime = new Date(2019, 11, 2, 14, 5);

        expect(localization.parse('2:5 PM', 'time')).toEqual(time);
        expect(localization.parse('12/2/2019 2:5 PM', 'datetime')).toEqual(datetime);
        // all other operations too
      });
    });
  });
}
