// Developed by Softeq Development Corporation
// http://www.softeq.com

import { isArray, isEmpty } from 'lodash-es';
import { DataTypeValidator, TextRangeLengthConstraint } from '../type.interfaces';

function rangeLength(constraint: TextRangeLengthConstraint): DataTypeValidator {
  let minLengthValue: number;
  let maxLengthValue: number;

  if (isArray(constraint)) {
    minLengthValue = constraint[0];
    maxLengthValue = constraint[1];
  } else {
    minLengthValue = constraint.min;
    maxLengthValue = constraint.max;
  }

  return (value) => {
    if (isEmpty(value)) {
      return;
    }

    if (value.length < minLengthValue || value.length > maxLengthValue) {
      return {
        minLength: minLengthValue,
        maxLength: maxLengthValue,
        actualLength: value.length,
      };
    }
  };
}

function minLength(constraint: number): DataTypeValidator {
  return (value) => {
    if (isEmpty(value)) {
      return;
    }

    if (value.length < constraint) {
      return {
        requiredLength: constraint,
        actualLength: value.length,
      };
    }
  };
}

function maxLength(constraint: number): DataTypeValidator {
  return (value) => {
    if (isEmpty(value)) {
      return;
    }

    if (value.length > constraint) {
      return {
        requiredLength: constraint,
        actualLength: value.length,
      };
    }
  };
}

function pattern(constraint: RegExp): DataTypeValidator {
  return (value) => {
    if (isEmpty(value)) {
      return;
    }

    if (!constraint.test(value)) {
      return {
        requiredPattern: constraint,
        actualValue: value,
      };
    }
  };
}

// tslint:disable-next-line:variable-name
export const textTypeValidators = {
  rangeLength,
  minLength,
  maxLength,
  pattern,
};
