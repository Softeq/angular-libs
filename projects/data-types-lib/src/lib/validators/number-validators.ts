// Developed by Softeq Development Corporation
// http://www.softeq.com

import gt from 'lodash/gt';
import gte from 'lodash/gte';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import lt from 'lodash/lt';
import lte from 'lodash/lte';
import { DataTypeValidator, NumberRangeConstraint, NumberValueConstraint } from '../type.interfaces';
import { coalesce } from './validator.utils';

function max(constraint: NumberValueConstraint): DataTypeValidator {
  let maxValue: number;
  let includeValue: boolean;

  if (isNumber(constraint)) {
    maxValue = constraint;
    includeValue = true;
  } else {
    maxValue = constraint.value;
    includeValue = coalesce(constraint.include, true);
  }

  return (value) => {
    if (isNil(value)) {
      return;
    }

    const cmp = includeValue ? lte : lt;

    if (!cmp(value, maxValue)) {
      return {
        max: maxValue,
        includeMax: includeValue,
        actual: value,
      };
    }
  };
}

function min(constraint: NumberValueConstraint): DataTypeValidator {
  let minValue: number;
  let includeValue: boolean;

  if (isNumber(constraint)) {
    minValue = constraint;
    includeValue = true;
  } else {
    minValue = constraint.value;
    includeValue = coalesce(constraint.include, true);
  }

  return (value) => {
    if (isNil(value)) {
      return;
    }

    const cmp = includeValue ? gte : gt;

    if (!cmp(value, minValue)) {
      return {
        min: minValue,
        includeMin: includeValue,
        actual: value,
      };
    }
  };
}

function range(constraint: NumberRangeConstraint): DataTypeValidator {
  let minValue: number;
  let maxValue: number;
  let includeMin: boolean;
  let includeMax: boolean;

  if (isArray(constraint)) {
    minValue = constraint[0];
    maxValue = constraint[1];
    includeMin = true;
    includeMax = true;
  } else {
    minValue = constraint.min;
    maxValue = constraint.max;
    includeMin = coalesce(constraint.includeMin, true);
    includeMax = coalesce(constraint.includeMax, true);
  }

  return (value) => {
    if (isNil(value)) {
      return;
    }

    const maxCmp = includeMax ? lte : lt;
    const minCmp = includeMin ? gte : gt;

    if (!(minCmp(value, minValue) && maxCmp(value, maxValue))) {
      return {
        min: minValue,
        includeMin,
        max: maxValue,
        includeMax,
        actual: value,
      };
    }
  };
}

function integral(shouldBeIntegral: boolean): DataTypeValidator {
  return (value) => {
    if (isNil(value)) {
      return;
    }

    if (shouldBeIntegral && Math.trunc(value) !== value) {
      return { actual: value };
    }
  };
}

// tslint:disable-next-line:variable-name
export const numberTypeValidators = {
  integral,
  min,
  max,
  range,
};
