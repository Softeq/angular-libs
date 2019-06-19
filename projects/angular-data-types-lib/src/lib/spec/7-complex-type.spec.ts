// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Maybe } from '@softeq/types';
import { compact, find, isNil, trim } from 'lodash-es';
import { Locale, MlsNumberLocalization } from '@softeq/mls';
import {
  AbstractBaseType,
  DataTypeContext,
  DataTypeDefinition,
  dataTypeParseError,
  DataTypeParseResult,
  dataTypeParseSuccess,
  DataTypeValidationErrors,
  getDebugTypeName
} from '@softeq/data-types';

const COMPLEX_TYPE_ERROR_MAPPINGS = { $complexFormat: 'format' };

function createNoValueError(): Error {
  return new Error('There is no value for ComplexType');
}

function createWrongTypeError(value: any): Error {
  return new Error(`Wrong type of value for ComplexType: '${getDebugTypeName(value)}'`);
}

export class Complex {
  constructor(public r: number,
              public i: number) {
  }
}

export function complex(r: number, i: number): Complex {
  return new Complex(r, i);
}

export function isComplex(value: any): value is Complex {
  return value instanceof Complex;
}

export enum ComplexTypeFormat { Algebraic, Plane }

export interface ComplexTypeDefinition extends DataTypeDefinition {
  format?: ComplexTypeFormat;
  constraints: {
    minLength?: number;
  };
  coordinateSeparator?: string;
}

interface ComplexParseResult {
  complex: Complex;
  errors?: DataTypeValidationErrors;
}

function comlexFormatError(str): DataTypeValidationErrors {
  return { $complexFormat: { value: str } };
}

function complexParseErrorResult(str): DataTypeParseResult<Complex> {
  return {
    errors: comlexFormatError(str),
  };
}

function parseComplexParts(localization: MlsNumberLocalization,
                           full: string,
                           realPart: string,
                           imageryPart: string): DataTypeParseResult<Complex> {

  if (isNil(realPart) && isNil(imageryPart)) {
    return complexParseErrorResult(full);
  } else {

    const realErrors = realPart ? localization.validateFormat(realPart) : void 0;
    const imageryErrors = imageryPart ? localization.validateFormat(imageryPart) : void 0;

    return realErrors || imageryErrors ?
      complexParseErrorResult(full)
      : dataTypeParseSuccess(new Complex(localization.parse(realPart), localization.parse(imageryPart)));
  }
}

function parseComplex(localization: MlsNumberLocalization,
                      str: string,
                      format: ComplexTypeFormat,
                      coordinateSeparator: string = ','): DataTypeParseResult<Complex> {
  switch (format) {
    case ComplexTypeFormat.Algebraic: {
      const parts = str.split('+').map(trim);

      const imageryWithIPart = find(parts, (part) => part.endsWith('i'));
      const realPart = find(parts, (part) => part !== imageryWithIPart);
      const imageryPart = imageryWithIPart ? imageryWithIPart.substring(0, imageryWithIPart.length - 1) : imageryWithIPart;

      return parseComplexParts(localization, str, realPart, imageryPart);
    }
    case ComplexTypeFormat.Plane: {
      const [realPart, imageryPart] = str.trim().substring(0, str.length - 1).split(coordinateSeparator).map(trim);
      return parseComplexParts(localization, str, realPart, imageryPart);
    }
    default:
      return complexParseErrorResult(str);
  }
}

const complexTypeValidators = {
  minLength: (constraint: any) => (c: Complex) => {
    const length = Math.hypot(c.r, c.i);
    return length > constraint ? { minLength: constraint, actualLength: length } : void 0;
  },
};

export class ComplexType extends AbstractBaseType<Complex> {
  kind = 'complex';

  private localization: MlsNumberLocalization;

  protected get complexDefinition(): ComplexTypeDefinition {
    return this.definition as ComplexTypeDefinition;
  }

  constructor(definition: ComplexTypeDefinition) {
    super(definition, complexTypeValidators);
  }

  parse(raw: string): DataTypeParseResult<Complex> {
    if (isNil(raw)) {
      throw createNoValueError();
    }

    const { format, coordinateSeparator } = this.complexDefinition;
    const parseResult = parseComplex(this.localization, raw, format, coordinateSeparator);
    if (parseResult.errors) {
      return dataTypeParseError(this.useErrorMessages(parseResult.errors, COMPLEX_TYPE_ERROR_MAPPINGS));
    }
    return dataTypeParseSuccess(parseResult.value);
  }

  format(value: Complex): string {
    if (isNil(value)) {
      throw createNoValueError();
    } else if (!isComplex(value)) {
      throw createWrongTypeError(value);
    }

    switch (this.complexDefinition.format) {
      case ComplexTypeFormat.Algebraic:
        return compact([
          value.r ? this.localization.format(value.r, {}) : void 0,
          value.i ? this.localization.format(value.i, {}) + 'i' : void 0,
        ]).join(' + ');
      case ComplexTypeFormat.Plane:
        // tslint:disable-next-line:max-line-length
        return `(${this.localization.format(value.r, {})}${this.complexDefinition.coordinateSeparator || ', '}${this.localization.format(value.i, {})})`;
      default:
        throw new Error('Wrong complex format error');
    }
  }

  validateFormat(str?: string): Maybe<DataTypeValidationErrors> {
    const { format, coordinateSeparator } = this.complexDefinition;
    const parseResult = parseComplex(this.localization, str, format, coordinateSeparator);
    return this.useErrorMessages(parseResult.errors, COMPLEX_TYPE_ERROR_MAPPINGS);
  }

  equals(first: Complex, second: Complex): boolean {
    return first.r === second.r && first.i === second.i;
  }

  init(locale: Locale, context: DataTypeContext): void {
    this.localization = context.mlsProvider.getNumberLocalization();

    super.init(locale, context);
  }
}
