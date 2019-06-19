// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Hash, Maybe } from '@softeq/types';
import { isEmpty } from 'lodash-es';

export interface RiMlsRecordNormalized {
  key: string;
  params?: Hash<any>;
}

export type RiMlsRecord = RiMlsRecordNormalized | string;

export function normalizeTranslationRecord(record: RiMlsRecord): RiMlsRecordNormalized {
  return typeof record === 'string' ? { key: record } : record;
}

export function mlsRecord(key: string, params: Hash<any>): RiMlsRecord {
  return { key, params };
}

export function getMlsRecordKey(record: RiMlsRecord): string {
  return typeof record === 'string' ? record : record.key;
}

export function getMlsRecordParams(record: RiMlsRecord): Maybe<Hash<any>> {
  return typeof record === 'string' ? void 0 : record.params;
}

export function setMlsRecordKey(record: RiMlsRecord, key: string): RiMlsRecord {
  return { key, params: getMlsRecordParams(record) };
}

export function setMlsRecordParams(record: RiMlsRecord, params: Hash<any>): RiMlsRecord {
  return { key: getMlsRecordKey(record), params };
}

export function mergeMlsRecordParams(record: RiMlsRecord, params: Hash<any>): RiMlsRecord {
  const normalized = normalizeTranslationRecord(record);
  return { key: normalized.key, params: isEmpty(normalized.params) && isEmpty(params) ? void 0 : { ...normalized.params, ...params } };
}
