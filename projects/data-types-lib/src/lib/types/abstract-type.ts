// Developed by Softeq Development Corporation
// http://www.softeq.com

import { assign, create, isNil, mapValues } from 'lodash-es';
import {
  DataType,
  DataTypeDefinition,
  DataTypeParseResult,
  DataTypeValidationErrors,
  DataTypeValidator,
  DataTypeValidatorFactory
} from '../type.interfaces';
import { Constructor, Hash, Maybe } from '@softeq/types';
import { Locale, MlsProvider, MlsTranslator } from '@softeq/mls';
import { validationErrorWithMessage } from '../type.utils';
import { composeDataTypeValidators, nullTypeValidator } from '../validators/validator.utils';

export interface DataTypeContext {
  readonly useStatic: boolean;
  readonly mlsProvider: MlsProvider;

  initType(type: DataType<any>): Hash<any>;
}

export abstract class AbstractType<T> implements DataType<T> {
  abstract readonly kind: string;
  abstract readonly definition: DataTypeDefinition;
  abstract readonly locale: Locale;
  abstract readonly properties: Hash<any>;

  abstract parse(str: string): DataTypeParseResult<T>;

  abstract format(value: T, options?: any): string;

  abstract validateFormat(str: string): Maybe<DataTypeValidationErrors>;

  abstract validate(value: T): Maybe<DataTypeValidationErrors>;

  compare(first: T, second: T): number {
    throw new Error('DataType does not support comparision');
  }

  equals(first: T, second: T): boolean {
    throw new Error('DataType does not support equality check');
  }

  abstract init(locale: Locale, context: DataTypeContext): void;
}

export abstract class AbstractBaseType<T> extends AbstractType<T> {
  protected translator: MlsTranslator;
  private _properties: Hash<any>; // tslint:disable-line:variable-name
  private _locale: Locale; // tslint:disable-line:variable-name
  private typeValidator: DataTypeValidator;
  private validators: Hash<DataTypeValidatorFactory>;

  protected constructor(readonly definition: DataTypeDefinition,
                        defaultValidators: Hash<DataTypeValidatorFactory> = {}) {
    super();
    this.validators = create(definition.validators || {}, defaultValidators);
    this._properties = definition.properties || {};
  }

  get locale(): Locale {
    return this._locale;
  }

  set locale(locale: Locale) {
    throw new Error(`Locale of type '${name}' cannot be changed after initialization`);
  }

  get properties(): Hash<any> {
    return this._properties;
  }

  set properties(properties: Hash<any>) {
    throw new Error(`Properties of type '${name}' cannot be changed after initialization`);
  }

  validate(value?: T): Maybe<DataTypeValidationErrors> {
    return this.useErrorMessages(this.typeValidator(value));
  }

  init(locale: Locale, context: DataTypeContext): void {
    const { definition } = this;

    this._locale = locale;
    this.translator = context.mlsProvider.getTranslator();

    if (definition.constraints) {
      this.typeValidator = composeDataTypeValidators(definition.constraints, this.validators);
    } else {
      this.typeValidator = nullTypeValidator;
    }

    const additionalProperties = context.initType(this);
    if (additionalProperties) {
      this._properties = assign({}, this._properties, additionalProperties);
    }
  }

  protected useErrorMessages(errors: Maybe<DataTypeValidationErrors>,
                             errorKeyToMessageKey: { [errorKey: string]: string } = {}): Maybe<DataTypeValidationErrors> {
    // if we define custom error message => transform validation error to use custom error message
    if (errors) {
      const { definition } = this;

      return mapValues(errors, (error, errorKey) => {
        const messageKey = errorKeyToMessageKey[errorKey] || errorKey;
        const message = definition.messages && definition.messages[messageKey];
        if (messageKey && message) {
          return validationErrorWithMessage(error, this.translator.create(message, error));
        } else {
          return error;
        }
      });
    }
    return errors;
  }
}

export abstract class DecoratedType<T, B> extends AbstractType<T> {
  protected constructor(protected baseType: AbstractType<B>) {
    super();
  }

  get locale(): Locale {
    return this.baseType.locale;
  }

  set locale(locale: Locale) {
    throw new Error(`Locale of type '${name}' cannot be changed after initialization`);
  }

  get properties(): Hash<any> {
    return this.baseType.properties;
  }

  set properties(properties: Hash<any>) {
    throw new Error(`Properties of type '${name}' cannot be changed after initialization`);
  }

  get definition(): DataTypeDefinition {
    return this.baseType.definition;
  }

  init(locale: Locale, context: DataTypeContext): void {
    this.baseType.init(locale, context);
  }

  validateFormat(str?: string): Maybe<DataTypeValidationErrors> {
    return this.baseType.validateFormat(str);
  }
}

export class PrototypeType<D extends DataType<T>, T> implements DataType<T> {
  private instantiatedType?: AbstractType<T> & D;
  private context: DataTypeContext;
  private _locale: Locale; // tslint:disable-line:variable-name

  constructor(readonly kind: string,
              private typeConstructor: Constructor<D>,
              readonly definition: DataTypeDefinition) {
  }

  get locale(): Locale {
    return this.ensureLocale();
  }

  set locale(locale: Locale) {
    throw new Error(`Locale of type '${name}' cannot be changed after initialization`);
  }

  get properties(): Hash<any> {
    return this.ensureType().properties;
  }

  set properties(properties: Hash<any>) {
    throw new Error(`Properties of type '${name}' cannot be changed after initialization`);
  }

  init(context: DataTypeContext): void {
    this.context = context;
  }

  parse(str: string): DataTypeParseResult<T> {
    return this.ensureType().parse(str);
  }

  format(value: T, options?: any): string {
    return this.ensureType().format(value, options);
  }

  validate(value?: T): Maybe<DataTypeValidationErrors> {
    return this.ensureType().validate(value);
  }

  validateFormat(str?: string): Maybe<DataTypeValidationErrors> {
    return this.ensureType().validateFormat(str);
  }

  equals(first: T, second: T): boolean {
    return this.ensureType().equals(first, second);
  }

  compare(first: T, second: T): number {
    return this.ensureType().compare(first, second);
  }

  instantiate(locale: Locale): AbstractType<T> & D {
    const type = new this.typeConstructor(this.definition) as (AbstractType<T> & D);
    type.init(locale, this.context);
    return type;
  }

  /**
   * We postpone retrieving of locale as much as possible to take application time to initialize default locale.
   */
  private ensureLocale(): Locale {
    let { _locale } = this;
    if (_locale) {
      return _locale;
    }
    this._locale = _locale = this.getContextIfStatic().mlsProvider.getCurrentLocale();
    return _locale;
  }

  /**
   * Prototype type can be instantiated ONLY when {@link DataType} was initialized with useStatic flag.
   */
  private ensureType(): D {
    let { instantiatedType } = this;
    if (isNil(instantiatedType)) {
      this.instantiatedType = instantiatedType = this.instantiate(this.ensureLocale());
    }
    return instantiatedType;
  }

  private getContextIfStatic(): DataTypeContext {
    const { context } = this;
    if (isNil(context)) {
      throw new Error(`Type cannot be used until DataType is initialized`);
    }

    if (!context.useStatic) {
      // tslint:disable-next-line:max-line-length
      throw new Error(`DataType cannot be used statically. To allow static usage of types initialize DataType system with useStatic = true`);
    }
    return context;
  }
}
