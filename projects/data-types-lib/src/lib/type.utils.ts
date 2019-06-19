/*
 * // Developed by Softeq Development Corporation
 * // http://www.softeq.com
 */

// Developed by Softeq Development Corporation
// http://www.softeq.com

import { MlsRecord } from '@softeq/mls';

export function validationErrorWithMessage<E extends object>(error: E, $message: MlsRecord): E {
  return { ...error, $message };
}

export function getDebugTypeName(value: any): string {
  const internalTypeName = typeof value;
  if (value === null) {
    return 'null';
  }
  if (internalTypeName === 'object') {
    return value.constructor.name;
  } else if (internalTypeName === 'function') {
    return value.name;
  } else {
    return internalTypeName;
  }
}
