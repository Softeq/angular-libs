// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Directive, ElementRef, HostListener, Inject, InjectionToken, Input, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { DATA_TYPE_NUMBER_KIND, NumberType, NumberTypeImpl } from '@softeq/data-types';
import { DataTypeService } from '@softeq/angular-data-types';
import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';
import { MlsNumberFormatQuery } from '@softeq/mls';
import { InputState } from '../services/input-state.service';

function isMinusOnly(str: string): boolean {
  return str === '-';
}

export const DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS = new InjectionToken<MlsNumberFormatQuery>('DefaultMaskedNumberTypeFormatOnFocus');

export const DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS_QUERY =
  new InjectionToken<MlsNumberFormatQuery>('DefaultMaskedNumberTypeFormatOnFocusQuery');

/**
 * This directive declares {@link ControlValueAccessor} for number inputs bound to {@link NumberTypeImpl} and based on text-mask library.
 *
 * The most part of implementation was taken from this repository https://github.com/text-mask/text-mask.
 * File: https://github.com/text-mask/text-mask/blob/master/angular2/src/angular2TextMask.ts
 */
@Directive({
  selector: 'input[sqMaskedNumberType]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MaskedNumberTypeDirective,
    multi: true,
  }],
})
export class MaskedNumberTypeDirective implements OnInit, ControlValueAccessor {
  // tslint:disable-next-line:no-input-rename
  @Input('sqMaskedNumberTypeFormatOnFocus') formatOnFocus;
  // tslint:disable-next-line:no-input-rename
  @Input('sqMaskedNumberTypeFormatOnFocusQuery') formatOnFocusQuery: MlsNumberFormatQuery;

  private textMaskInputElement: any;

  // stores the last value for comparison
  private lastValue?: any;
  private lastStrValue: string;

  private _type: NumberType; // tslint:disable-line:variable-name

  private _onChange = noop; // tslint:disable-line:variable-name
  private _onTouched = noop; // tslint:disable-line:variable-name

  constructor(private renderer: Renderer2,
              private elementRef: ElementRef,
              private types: DataTypeService,
              @Inject(DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS) defaultFormatOnFocus: boolean,
              @Inject(DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS_QUERY) defaultFormatOnFocusQuery: MlsNumberFormatQuery,
              private inputState: InputState) {
    this.formatOnFocus = defaultFormatOnFocus;
    this.formatOnFocusQuery = defaultFormatOnFocusQuery;
  }

  @Input('sqMaskedNumberType')
  set type(type: NumberType | string) {
    this._type = isString(type) ? this.types.get(type) as NumberType : type;
  }

  ngOnInit(): void {
    if (isNil(this._type)) {
      throw new Error('Type is undefined for sqMaskedNumberType directive');
    } else if (this._type.kind !== DATA_TYPE_NUMBER_KIND) {
      throw new Error('Type is not an instance of NumberType');
    }

    this.setupMask();
  }

  @HostListener('input', ['$event.target.value'])
  onInput(nextStrValue: string): void {
    this.input(nextStrValue);
  }

  @HostListener('focus')
  onFocus(): void {
    const element = this.elementRef.nativeElement;
    if (this.formatOnFocus && !isNil(this.lastValue)) {
      element.value = this._type.format(this.lastValue, this.formatOnFocusQuery);

      // Default browser behavior is to select whole value on focus,
      // but value is not selected when it is updated by statement above.
      // So, we have to select value manually (excluding the case when user focuses element using mouse)
      if (!this.inputState.mouseDown) {
        element.select();
      }
    }
  }

  @HostListener('blur')
  onBlur(): void {
    if (!isNil(this.lastValue)) {
      this.elementRef.nativeElement.value = this._type.format(this.lastValue);
    } else if (isMinusOnly(this.lastStrValue)) {
      this.elementRef.nativeElement.value = '';
    }
    this._onTouched();
  }

  writeValue(value: any): void {
    this.lastValue = value;

    if (!isNil(value) && this.textMaskInputElement !== void 0) {
      this.textMaskInputElement.update(this._type.format(value));
    } else {
      this.elementRef.nativeElement.value = '';
    }
    this.lastStrValue = this.elementRef.nativeElement.value;
  }

  /**
   * This method allows to simulate typing into the field.
   *
   * Note!!! This is low-level method.
   * Be patient using this method, because you can break field content.
   * To guarantee correct behavior it is better to focus the field after it was updated using this method.
   *
   * @param str string content to set into the field
   */
  input(str: string): void {
    this.textMaskInputElement.update(str);

    const nextStrValue = this.elementRef.nativeElement.value;

    if (this.lastStrValue !== nextStrValue) {
      this.lastStrValue = nextStrValue;
      if (nextStrValue && !isMinusOnly(nextStrValue)) {
        const nextValue = this._type.parse(nextStrValue).value;
        if (this.lastValue !== nextValue) {
          this.lastValue = nextValue;
          this._onChange(nextValue);
        }
      } else {
        this.lastValue = void 0;
        this._onChange(void 0);
      }
    }
  }

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }

  private setupMask(): void {
    this.textMaskInputElement = createTextMaskInputElement({
      inputElement: this.elementRef.nativeElement,
      mask: this._type.properties.mask,
    });
  }
}
