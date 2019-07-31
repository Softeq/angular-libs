// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  getMlsRecordKey,
  getMlsRecordParams,
  mergeMlsRecordParams,
  normalizeTranslationRecord,
  RiMlsRecord, setMlsRecordKey,
  setMlsRecordParams
} from './utils';
import { Hash } from '@softeq/types';
import isNil from 'lodash/isNil';
import { RiDateTimeLocalization, RiNumberLocalization } from './localization';
import {
  MlsDateTimeLocalization,
  getLocale,
  Locale,
  MlsProvider,
  MlsTranslator,
  MlsNumberLocalization,
  MlsTextLocalization,
  MlsRecord,
} from '@softeq/mls';

export class MlsRiTranslator implements MlsTranslator {
  constructor(private locale: Locale,
              private translateService: TranslateService) {}

  create(record: RiMlsRecord, params?: any): any {
    return mergeMlsRecordParams(normalizeTranslationRecord(record), params);
  }

  translate(record: MlsRecord): string {
    const normalizedRecord = normalizeTranslationRecord(record);

    return this.translateService.instant(normalizedRecord.key, normalizedRecord.params);
  }
}

@Injectable()
export class MlsRiProviderService implements MlsProvider {
  private currentLocale: Locale;
  private translatorCache: Hash<MlsTranslator> = {};
  private dateTimeCache: Hash<MlsDateTimeLocalization> = {};
  private numberCache: Hash<MlsNumberLocalization> = {};
  private textCache: Hash<MlsTextLocalization> = {};

  constructor(@Optional() private translateService: TranslateService) {
    if (isNil(translateService)) {
      throw new Error('ngx-translate should be imported when MlsRiModule is used');
    }
    this.setCurrentLanguage(this.translateService.currentLang);
    this.translateService.onLangChange.subscribe(({ lang }) => this.setCurrentLanguage(lang));
  }

  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  getTranslator(): MlsTranslator {
    const { translatorCache } = this;
    const locale = this.getCurrentLocale();
    const localeKey = locale.toStandardString();
    let translator = translatorCache[localeKey];
    if (isNil(translator)) {
      translator = translatorCache[localeKey] = new MlsRiTranslator(locale, this.translateService);
    }
    return translator;
  }

  getDateTimeLocalization(): MlsDateTimeLocalization {
    const { dateTimeCache } = this;
    const locale = this.getCurrentLocale();
    const localeKey = locale.toStandardString();
    let localization = dateTimeCache[localeKey];
    if (isNil(localization)) {
      localization = dateTimeCache[localeKey] = this.createDateTimeLocalization(locale);
    }
    return localization;
  }

  getNumberLocalization(): MlsNumberLocalization {
    const { numberCache } = this;
    const locale = this.getCurrentLocale();
    const localeKey = locale.toStandardString();
    let localization = numberCache[localeKey];
    if (isNil(localization)) {
      localization = numberCache[localeKey] = this.createNumberLocalization(locale);
    }
    return localization;
  }

  getTextLocalization(): MlsTextLocalization {
    const { textCache } = this;
    const locale = this.getCurrentLocale();
    const localeKey = locale.toStandardString();
    let localization = textCache[localeKey];
    if (isNil(localization)) {
      localization = textCache[localeKey] = new MlsTextLocalization(locale);
    }
    return localization;
  }

  private setCurrentLanguage(language: string): void {
    this.currentLocale = getLocale(language);
  }

  private createDateTimeLocalization(locale: Locale): MlsDateTimeLocalization {
    const localization = this.translateService.instant('$localization');
    if (isNil(localization)) {
      throw new Error(`Property '$localization' is not specified for locale '${locale.toLocaleId()}'`);
    }
    const { dateFormat } = localization;
    if (isNil(dateFormat)) {
      throw new Error(`Property '$localization.dateFormat' is not specified for locale '${locale.toLocaleId()}'`);
    }

    return new RiDateTimeLocalization(locale, dateFormat);
  }

  private createNumberLocalization(locale: Locale): MlsNumberLocalization {
    const localization = this.translateService.instant('$localization');
    if (isNil(localization)) {
      throw new Error(`Property '$localization' is not specified for locale '${locale.toLocaleId()}'`);
    }
    const { numberFormat } = localization;
    if (isNil(numberFormat)) {
      throw new Error(`Property '$localization.numberFormat' is not specified for locale '${locale.toLocaleId()}'`);
    }

    return new RiNumberLocalization(locale, numberFormat);
  }
}
