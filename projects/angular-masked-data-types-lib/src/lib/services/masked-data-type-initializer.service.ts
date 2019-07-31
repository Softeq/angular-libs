// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DATA_TYPE_NUMBER_KIND, DataType, NumberType } from '@softeq/data-types';
import { DataTypeInitializer } from '@softeq/angular-data-types';
import { Hash, Maybe } from '@softeq/types';
import { Injectable } from '@angular/core';
import { DATA_TYPE_MASKED_TEXT_KIND, MaskedTextType } from '../types/masked-text-type';
import { createNumberMask } from './create-number-mask';
import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';

@Injectable()
export class MaskedDataTypeInitializer implements DataTypeInitializer {
  initType(type: DataType<any>): Maybe<Hash<any>> {
    switch (type.kind) {
      case DATA_TYPE_NUMBER_KIND:
        return this.genPropertiesForNumberType(type as NumberType);
      case DATA_TYPE_MASKED_TEXT_KIND:
        return this.genPropertiesForMaskedTextType(type as MaskedTextType);
      default:
        break;
    }
  }

  private genPropertiesForNumberType({ definition, localization }: NumberType) {
    const constraints = definition.constraints || {};
    const { min, max, range } = constraints;
    const minValue = isNil(min) ? Number.NEGATIVE_INFINITY : (isNumber(min) ? min : min.value);
    const minValueInRange = isNil(range) ? Number.NEGATIVE_INFINITY : (isArray(range) ? range[0] : range.min);
    const maxValue = isNil(max) ? Number.POSITIVE_INFINITY : (isNumber(max) ? max : max.value);
    const maxValueInRange = isNil(range) ? Number.POSITIVE_INFINITY : (isArray(range) ? range[1] : range.max);
    const maximumFractionDigits = definition.format && definition.format.maximumFractionDigits || 3;

    const mask = createNumberMask({
      prefix: '',
      suffix: '',
      includeThousandsSeparator: localization.grouping,
      thousandsSeparatorSymbol: localization.groupSeparator,
      allowNegative: minValue < 0 && minValueInRange < 0 || maxValue < 0 || maxValueInRange < 0,
      allowDecimal: maximumFractionDigits > 0,
      decimalSymbol: localization.decimalSeparator,
      decimalLimit: maximumFractionDigits,
      requireDecimal: false,
    });

    return { mask };
  }

  private genPropertiesForMaskedTextType(type: MaskedTextType) {
    return {
      mask: type.definition.mask,
      pipe: type.definition.pipe,
    };
  }
}
