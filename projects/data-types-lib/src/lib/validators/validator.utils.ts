// Developed by Softeq Development Corporation
// http://www.softeq.com

import fromPairs from 'lodash/fromPairs';
import isNil from 'lodash/isNil';
import keysIn from 'lodash/keysIn';
import { Hash, Maybe } from '@softeq/types';
import { DataTypeValidationErrors, DataTypeValidator, DataTypeValidatorFactory } from '../type.interfaces';

export function nullTypeValidator(_: any): Maybe<DataTypeValidationErrors> {
  return;
}

export function composeDataTypeValidators(constraints: any,
                                          validatorFactories: Hash<DataTypeValidatorFactory>): DataTypeValidator {
  const constraintNames = keysIn(constraints);
  const validators = fromPairs(constraintNames.map((constraintName) => {
    const constraintValidator = validatorFactories[constraintName];
    if (isNil(constraintValidator)) {
      throw new Error(`Constraint '${constraintName}' is undefined`);
    }
    return [constraintName, constraintValidator(constraints[constraintName])];
  }));

  return (value) => {
    let violations: Maybe<DataTypeValidationErrors> = void 0;

    constraintNames.forEach((name: string) => {
      const error = validators[name](value);

      if (error) {
        if (!violations) {
          violations = {};
        }

        violations[name] = error;
      }
    });

    return violations;
  };
}

export function coalesce<T>(value: T | undefined | null, defaultValue: any): T {
  return isNil(value) ? defaultValue : value;
}
