// Developed by Softeq Development Corporation
// http://www.softeq.com

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

const TRANSLATIONS = {
  'en-US': {
    label_id: 'Some translation',
    $localization: {
      numberFormat: {
        decimalSeparator: '.',
        groupSeparator: ',',
        grouping: true
      },
      dateFormat: {
        shortDate: 'M/d/yyyy',
        dayMonth: 'MMM d',
        monthYear: 'M/yyyy',
        dateA11y: 'MMMM/d/yyyy',
        monthYearA11y: 'MMMM/yy',
        shortMonthYear: 'MMM yy',
        shortTime: 'h:mm a',
        shortDatetime: 'M/d/yyyy h:mm a',
        mediumDateAndWeekday: 'MMM d yyyy, EE'
      },
    },
  },
  'en-AU': {
    $localization: {
      numberFormat: {
        decimalSeparator: ',',
        groupSeparator: '.',
        grouping: true
      },
      dateFormat: {
        shortDate: 'dd/MM/yyyy',
        dayMonth: 'dd MMM',
        monthYear: 'MM/yyyy',
        dateA11y: 'dd/MMMM/yyyy',
        monthYearA11y: 'MMMM/yy',
        shortMonthYear: 'MMM yy',
        shortTime: 'HH:mm',
        shortDatetime: 'dd/MM/yyyy HH:mm',
        mediumDateAndWeekday: 'd MMM yyyy, EE'
      },
    },
  },
  'ru-RU': {
    $localization: {
      numberFormat: {
        decimalSeparator: ',',
        groupSeparator: ' ',
        grouping: true
      },
      dateFormat: {
        shortDate: 'dd.MM.yyyy',
        dayMonth: 'dd MMM',
        monthYear: 'MM yyyy',
        dateA11y: 'dd MMMM yyyy',
        monthYearA11y: 'MMMM yy',
        shortMonthYear: 'MMM yy',
        shortTime: 'HH:mm',
        shortDatetime: 'dd.MM.yyyy HH:mm',
        mediumDateAndWeekday: 'd MMM yyyy, EE'
      },
    },
  }
};

export function setupTestTranslationData(): void {
  const translate = TestBed.get(TranslateService);
  translate.setTranslation('en-US', TRANSLATIONS['en-US']);
  translate.setTranslation('en-AU', TRANSLATIONS['en-AU']);
  translate.setTranslation('ru-RU', TRANSLATIONS['ru-RU']);
  translate.use('en-US');
}

export function switchLocale(code: string): void {
  const translate = TestBed.get(TranslateService);
  translate.use(code);
}
