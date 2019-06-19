// Developed by Softeq Development Corporation
// http://www.softeq.com

import { registerLocaleData } from '@angular/common';
import localeEnUs from '@angular/common/locales/en';
import localeEnAu from '@angular/common/locales/en-AU';
import localeRuRu from '@angular/common/locales/ru';

export const LOCALE_EN_US = 'en-US';
export const LOCALE_EN_AU = 'en-AU';
export const LOCALE_RU_RU = 'ru-RU';

export function setupTestLocaleData(): void {
  registerLocaleData(localeEnUs, LOCALE_EN_US);
  registerLocaleData(localeEnAu, LOCALE_EN_AU);
  registerLocaleData(localeRuRu, LOCALE_RU_RU);
}
