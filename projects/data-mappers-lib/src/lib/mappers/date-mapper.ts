// Developed by Softeq Development Corporation
// http://www.softeq.com

// tslint:disable:no-magic-numbers

import isNil from 'lodash/isNil';
import padStart from 'lodash/padStart';

import { DataMapper } from './mapper.interfaces';

export enum DateFormat {
  Date = 1,
  Time = 2,
  DateTime = 3,
}

const RE_DATE = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/;
const RE_TIME = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/;
const RE_DATE_TIME = /^(\d{1,4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d+))?$/;

function format2(n: number): string {
  return padStart('' + n, 2, '0');
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${format2(date.getMonth() + 1)}-${format2(date.getDate())}`;
}

export function toIsoTime(date: Date): string {
  return `${format2(date.getHours())}:${format2(date.getMinutes())}:${format2(date.getSeconds())}`;
}

export function toIsoDateTime(date: Date): string {
  return `${toIsoDate(date)}T${toIsoTime(date)}${date.getMilliseconds() ? '.' + date.getMilliseconds() : ''}`;
}

export class DateMapper implements DataMapper<Date, string> {

  constructor(private format: DateFormat) {

  }

  serialize(date: Date): string {
    if (isNil(date)) {
      return void 0;
    }

    if (!(date instanceof Date)) {
      throw new Error('Value to be serialized is not a Date');
    }

    switch (this.format) {
      case DateFormat.Date:
        return toIsoDate(date);
      case DateFormat.Time:
        return toIsoTime(date);
      case DateFormat.DateTime:
        return toIsoDateTime(date);
      default:
        break;
    }
    throw new Error(`Illegal format '${this.format}'`);
  }

  deserialize(str: string): Date {
    if (isNil(str)) {
      return void 0;
    }

    switch (this.format) {
      case DateFormat.Date: {
        const match = RE_DATE.exec(str);

        if (match) {
          return new Date(+match[1], +match[2] - 1, +match[3]);
        } else {
          break;
        }
      }
      case DateFormat.Time: {
        const match = RE_TIME.exec(str);

        if (match) {
          return new Date(0, 0, 0, +match[1], +match[2], +match[3]);
        } else {
          break;
        }
      }
      case DateFormat.DateTime: {
        const match = RE_DATE_TIME.exec(str);

        if (match) {
          return new Date(+match[1], +match[2] - 1, +match[3], +match[4], +match[5], +match[6], +match[7] || 0);
        } else {
          break;
        }
      }
      default:
        break;
    }
    throw new Error(`Illegal format '${this.format}:${str}'`);
  }
}

const DATE_MAPPER = new DateMapper(DateFormat.Date);
const TIME_MAPPER = new DateMapper(DateFormat.Time);
const DATE_TIME_MAPPER = new DateMapper(DateFormat.DateTime);

export function getDateMapper(format: DateFormat): DateMapper {
  switch (format) {
    case DateFormat.Date:
      return DATE_MAPPER;
    case DateFormat.Time:
      return TIME_MAPPER;
    case DateFormat.DateTime:
      return DATE_TIME_MAPPER;
    default:
      throw new Error(`Unknown date format: ${format}`);
  }
}
