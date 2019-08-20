// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable } from '@angular/core';
import { DataTypeInitializer } from './data-type-context.service';
import { DataType } from '@softeq/data-types';
import { Hash, Maybe } from '@softeq/types';
import { ValidatorFn } from '@angular/forms';

export function formValidatorFrom(type: DataType<any>): ValidatorFn {
  if (type.properties.formValidator) {
    return type.properties.formValidator;
  }

  return createFormValidator(type);
}

function createFormValidator(type: DataType<any>): ValidatorFn {
  return (control) => type.validate(control.value);
}

@Injectable({ providedIn: 'root' })
export class FormValidatorTypeInitializerService implements DataTypeInitializer {
  initType(type: DataType<any>): Maybe<Hash<any>> {
    return {
      formValidator: createFormValidator(type),
    };
  }
}
