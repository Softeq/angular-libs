// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DATA_TYPE_MASKED_TEXT_KIND, MaskedTextType, MaskedTextTypeImpl } from '../types/masked-text-type';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { DataTypeService } from '@softeq/angular-data-types';
import { createTextMaskInputElement } from 'text-mask-core/dist/textMaskCore';

/**
 * This directive declares {@link ControlValueAccessor} for text inputs bound to {@link MaskedTextType} and based on text-mask library.
 *
 * The most part of implementation was taken from this repository https://github.com/text-mask/text-mask.
 * File: https://github.com/text-mask/text-mask/blob/master/angular2/src/angular2TextMask.ts
 */
@Directive({
  selector: 'input[sqMaskedTextType], textarea[sqMaskedTextType]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MaskedTextTypeDirective,
    multi: true,
  }],
})
export class MaskedTextTypeDirective implements OnInit, ControlValueAccessor {
  // tslint:disable-next-line:no-input-rename
  @Input('sqMaskedTextTypeConfig') config: any = {
    guide: false,
    placeholderChar: '_',
    keepCharPositions: false,
    onReject: void 0,
    onAccept: void 0,
  };

  private textMaskInputElement: any;

  // stores the last value for comparison
  private lastValue?: string;

  private _type: MaskedTextType; // tslint:disable-line:variable-name

  private _onChange = noop; // tslint:disable-line:variable-name
  private _onTouched = noop; // tslint:disable-line:variable-name

  constructor(private renderer: Renderer2,
              private elementRef: ElementRef,
              private types: DataTypeService) {
  }

  @Input('sqMaskedTextType')
  set type(type: MaskedTextType | string) {
    this._type = isString(type) ? this.types.get(type) as MaskedTextType : type;
  }

  ngOnInit(): void {
    if (isNil(this._type)) {
      throw new Error('Type is undefined for sqMaskedTextType directive');
    } else if (this._type.kind !== DATA_TYPE_MASKED_TEXT_KIND) {
      throw new Error('Type is not an instance of MaskedTextType');
    }

    const { properties } = this._type;
    if (properties && properties.maxLength) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'maxlength', String(properties.maxLength));
    }

    this.setupMask();
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
    if (!isNil(value) && this.textMaskInputElement !== void 0) {
      this.textMaskInputElement.update(value);
    } else {
      this.elementRef.nativeElement.value = '';
    }
    this.lastValue = this.elementRef.nativeElement.value;
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

  /**
   * This method allows to simulate typing into the field.
   *
   * @param str string content to set into the field
   */
  input(str: string): void {
    this.textMaskInputElement.update(str);

    const nextValue = this.elementRef.nativeElement.value;

    if (this.lastValue !== nextValue) {
      this.lastValue = nextValue;
      this._onChange(nextValue);
    }
  }

  private setupMask(): void {
    this.textMaskInputElement = createTextMaskInputElement({
      ...this.config,
      inputElement: this.elementRef.nativeElement,
      mask: this._type.properties.mask,
      pipe: this._type.properties.pipe,
    });
  }
}
