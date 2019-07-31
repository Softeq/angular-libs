// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Directive, ElementRef, HostListener, Inject, InjectionToken, Input, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { DataType, DataTypeValidationErrors } from '@softeq/data-types';
import { DataTypeService } from '../services/data-type.service';

export enum DataTypeValidateOption {
  All = 'all',
  Format = 'format',
  None = 'none',
}

export const DATA_TYPE_DEFAULT_VALIDATE_OPTION = new InjectionToken<DataTypeValidateOption>('DataTypeDefaultValidateOption');

function isValueEquals(type: DataType<any>, first: any, second: any): boolean {
  if (isNil(first)) {
    return isNil(second);
  } else if (isNil(second)) {
    return false;
  } else {
    return type.equals(first, second);
  }
}

@Directive({
  selector: 'input[sqDataType], textarea[sqDataType]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DataTypeDirective,
    multi: true,
  }, {
    provide: NG_VALIDATORS,
    useExisting: DataTypeDirective,
    multi: true,
  }],
})
export class DataTypeDirective implements OnInit, ControlValueAccessor, Validator {
  // tslint:disable-next-line:no-input-rename
  @Input('sqDataTypeValidate') validateOption: DataTypeValidateOption;

  private _type: DataType<any>; // tslint:disable-line:variable-name

  private lastValue?: any;
  private lastStrValue: string;
  private formatErrors?: DataTypeValidationErrors;

  private _onChange = noop; // tslint:disable-line:variable-name
  private _onTouched = noop; // tslint:disable-line:variable-name

  constructor(private renderer: Renderer2,
              private elementRef: ElementRef,
              private types: DataTypeService,
              @Inject(DATA_TYPE_DEFAULT_VALIDATE_OPTION) defaultValidateOption) {
    this.validateOption = defaultValidateOption;
  }

  @Input('sqDataType')
  set type(type: DataType<any> | string) {
    this._type = isString(type) ? this.types.get(type) : type;
  }

  ngOnInit(): void {
    if (isNil(this._type)) {
      throw new Error('Type is undefined for ghDataType directive');
    }

    const { properties } = this._type;
    if (properties && properties.maxLength) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'maxlength', String(properties.maxLength));
    }
  }

  @HostListener('input', ['$event.target.value'])
  onInput(nextStrValue: string): void {
    this.input(nextStrValue);
  }

  @HostListener('blur')
  onTouched(): void {
    this._onTouched();
  }

  writeValue(value: any): void {
    this.lastValue = value;

    const strValue = isNil(value) ? '' : this._type.format(value);
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', strValue);

    this.lastStrValue = strValue;
    this.formatErrors = void 0;
  }

  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  validate(c: AbstractControl): ValidationErrors | null {
    return this.formatErrors || this.validateOption === DataTypeValidateOption.All && this._type.validate(c.value) || null;
  }

  /**
   * This method allows to simulate typing into the field.
   *
   * @param nextStrValue string content to set into the field
   */
  input(nextStrValue: string): void {
    if (this.lastStrValue !== nextStrValue) {
      this.lastStrValue = nextStrValue;
      if (nextStrValue) {
        const parseResult = this._type.parse(nextStrValue);
        const nextValue = parseResult.value;
        if (this.validateOption !== DataTypeValidateOption.None) {
          this.formatErrors = parseResult.errors;
        }

        if (!isValueEquals(this._type, this.lastValue, nextValue)) {
          this.lastValue = nextValue;
          this._onChange(nextValue);
        }
      } else {
        this.lastValue = void 0;
        this._onChange(void 0);
      }
    }
  }
}
