// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNil from 'lodash/isNil';
import flatMap from 'lodash/flatMap';
import groupBy from 'lodash/groupBy';
import mapValues from 'lodash/mapValues';
import toPairs from 'lodash/toPairs';
import { Hash } from '@softeq/types';

export interface ParsedUrl {
  pathname: string;
  query: Hash<any>;
  hash: string;
}

const URL_RE = /^([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;

export function parseUrl(url: string): ParsedUrl {
  const match = URL_RE.exec(url);
  if (match) {
    const [_, pathname, query, hash] = match;
    return {
      pathname,
      hash,
      query: mapValues(
        mapValues(
          groupBy(
            (query || '')
              .split('&')
              .map((param) => param.split('=').map(decodeURIComponent)),
            ([key]) => key),
          (pairs) => pairs.map(([_, value]) => value)),
        (values) => values.length === 1 ? values[0] : values),
    };
  } else {
    return { pathname: '', query: {}, hash: '' };
  }
}

export function stringifyUrl(url: ParsedUrl): string {
  return [
    url.pathname,
    url.query ? '?' : '',
    flatMap(
      toPairs(url.query)
        .filter(([_, value]) => !isNil(value))
        .map(([key, value]) => [key, Array.isArray(value) ? value : [value]]),
      ([key, values]: [string, string[]]) => values.map((value) => `${encodeURIComponent(key)}=${encodeURIComponent((value))}`)).join('&'),
    url.hash ? '#' : '',
    url.hash,
  ].join('');
}
