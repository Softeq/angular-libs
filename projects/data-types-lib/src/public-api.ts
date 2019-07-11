// Developed by Softeq Development Corporation
// http://www.softeq.com

/*
 * Public API Surface of data-types-lib
 */


export { AbstractBaseType, AbstractType, DataTypeContext, DecoratedType, PrototypeType } from './lib/types/abstract-type';
export { DateTimeTypeImpl } from './lib/types/date-type';
export { NumberTypeImpl } from './lib/types/number-type';
export { TextTypeImpl } from './lib/types/text-type';
export {
  DATA_TYPE_DATE_KIND,
  DATA_TYPE_NUMBER_KIND,
  DATA_TYPE_TEXT_KIND,
  DataType, DataTypeDefinition,
  dataTypeParseError,
  DataTypeParseResult,
  DataTypeParseErrorResult,
  dataTypeParseSuccess,
  DataTypeParseSuccessResult,
  DataTypeValidationErrors,
  DataTypeValidator, DataTypeValidatorFactory, DateRangeConstraint,
  DateTimeType, DateTimeTypeDefinition, DateValueConstraint,
  isDataTypeParseError,
  isDataTypeParseSuccess, NumberRangeConstraint,
  NumberType, NumberTypeDefinition, NumberValueConstraint, TextRangeLengthConstraint,
  TextType, TextTypeDefinition
} from './lib/type.interfaces';
export { createDataType, dateTimeType, numberType, textType } from './lib/type-factories';
export { getDebugTypeName } from './lib/type.utils';
