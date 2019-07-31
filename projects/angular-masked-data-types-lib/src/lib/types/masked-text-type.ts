// Developed by Softeq Development Corporation
// http://www.softeq.com

import { createDataType, DataType, DataTypeContext, TextType, TextTypeDefinition, TextTypeImpl } from '@softeq/data-types';
import { Locale } from '@softeq/mls';
import isNil from 'lodash/isNil';
import { SupplierFn } from '@softeq/types';

export interface MaskedTextTypeDefinition extends TextTypeDefinition {
  mask?: any;
  pipe?: any;
}

function normalizeMaskedTextTypeDefinition(source: MaskedTextTypeDefinition): MaskedTextTypeDefinition {
  if (source.constraints && source.constraints.maxLength) {
    return {
      ...source,
      properties: {
        ...source.properties,
        maxLength: source.constraints.maxLength,
      },
    };
  } else {
    return source;
  }
}

export const DATA_TYPE_MASKED_TEXT_KIND: 'masked-text' = 'masked-text';

export interface MaskedTextType extends DataType<string> {
  kind: 'masked-text';
  definition: MaskedTextTypeDefinition;
}

/**
 * Constructor for masked text type.
 *
 * @param def definition of the type defines all type-related capabilities
 */
export function maskedTextType(def: MaskedTextTypeDefinition): MaskedTextType;
/**
 * Constructor for masked text type that inherits all settings from the base type
 *
 * @param baseType base type
 * @param def definition of the type defines all type-related capabilities
 */
export function maskedTextType(baseType: SupplierFn<MaskedTextType> | MaskedTextType, def?: MaskedTextTypeDefinition): MaskedTextType;
export function maskedTextType(baseTypeOrDefinition: SupplierFn<MaskedTextType> | MaskedTextType | MaskedTextTypeDefinition,
                               def?: MaskedTextTypeDefinition): MaskedTextType {
  return createDataType(DATA_TYPE_MASKED_TEXT_KIND, MaskedTextTypeImpl, baseTypeOrDefinition as any, def);
}

export class MaskedTextTypeImpl extends TextTypeImpl implements MaskedTextType {
  kind = DATA_TYPE_MASKED_TEXT_KIND as any;

  constructor(public definition: MaskedTextTypeDefinition) {
    super(normalizeMaskedTextTypeDefinition(definition));
  }

  init(locale: Locale, context: DataTypeContext): void {
    const definition = (this.definition as MaskedTextTypeDefinition);
    if (isNil(definition.mask) && isNil(definition.pipe)) {
      throw new Error('MaskedTextType should at least one of mask and pipe');
    }

    super.init(locale, context);
  }
}
