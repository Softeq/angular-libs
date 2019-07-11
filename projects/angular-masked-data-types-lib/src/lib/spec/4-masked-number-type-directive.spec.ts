// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DataType, numberType } from '@softeq/data-types';
import { Hash } from '@softeq/types';
import { setupTestTypeModule } from './0-masked-data-type-test-data.spec';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MlsNumberFormatQuery } from '@softeq/mls';

interface MaskedNumberTypeFixtureOptions {
  value?: any;
  type: string | DataType<any>;
  formatOnFocus?: boolean;
  formatOnFocusQuery?: MlsNumberFormatQuery;
}

const NUMBER_VALUE = 12345.678;
const FORMATTED_NUMBER_VALUE = '12,345.678';
const NUMBER_VALID_TEXT_VALUE = '12,345.678';
const NUMBER_INVALID_TEXT_VALUE = '12,345.678sss';

@Component({
  selector: 'sq-masked-number-type-test-host',
  template: `
    <ng-container *ngIf="formatOnFocusQuery">
      <input type="text"
             [ngModel]="value"
             [sqMaskedNumberType]="type"
             [sqMaskedNumberTypeFormatOnFocus]="formatOnFocus"
             [sqMaskedNumberTypeFormatOnFocusQuery]="formatOnFocusQuery">
    </ng-container>
    <ng-container *ngIf="!formatOnFocusQuery">
      <input type="text"
             [ngModel]="value"
             [sqMaskedNumberType]="type"
             [sqMaskedNumberTypeFormatOnFocus]="formatOnFocus">
    </ng-container>
  `,
})
class MaskedNumberTypeTestHostComponent {
  @Input() value: any;
  @Input() type: string | DataType<any>;
  @Input() formatOnFocus?: boolean;
  @Input() formatOnFocusQuery?: MlsNumberFormatQuery;

  @ViewChild(NgModel, { static: false }) model: NgModel;

  get control(): FormControl {
    return this.model.control;
  }
}

describe('MaskedNumberTypeDirective', () => {
  let Types: Hash<DataType<any>>;
  let fixture: ComponentFixture<MaskedNumberTypeTestHostComponent>;

  beforeEach(() => {
    Types = {
      Test: numberType(),
      UnsignedTest: numberType({
        constraints: { min: 0 },
      }),
      TestNegativeMax: numberType({
        constraints: { max: -1 },
      }),
      Test3: numberType({
        format: {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        },
      }),
      TestWithoutFractionalPart: numberType({
        format: {
          maximumFractionDigits: 0,
        },
      }),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    }, {
      imports: [FormsModule],
      declarations: [MaskedNumberTypeTestHostComponent],
    });

    fixture = TestBed.createComponent(MaskedNumberTypeTestHostComponent);
  });

  function initFixture(options: MaskedNumberTypeFixtureOptions): void {
    fixture.componentInstance.type = options.type;
    fixture.componentInstance.value = options.value;
    fixture.componentInstance.formatOnFocus = options.formatOnFocus;
    fixture.componentInstance.formatOnFocusQuery = options.formatOnFocusQuery;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  function typeFixtureElementValue(str: string): void {
    getFixtureInputElement().triggerEventHandler('input', { target: { value: str } });
  }

  function focusFixtureElement(): void {
    getFixtureInputElement().triggerEventHandler('focus', void 0);
  }

  function blurFixtureElement(): void {
    getFixtureInputElement().triggerEventHandler('blur', void 0);
  }

  function getFixtureInputElement(): DebugElement {
    return fixture.debugElement.query(By.css('input'));
  }

  function getFixtureElementValue(): string {
    return getFixtureInputElement().nativeElement.value;
  }

  function getFixtureControl(): FormControl {
    return fixture.componentInstance.control;
  }

  function getFixtureControlValue(): any {
    return getFixtureControl().value;
  }

  it('should throw error if type is not provided', () => {
    expect(() => fixture.detectChanges()).toThrowError();
  });

  it('should throw error when type does not exist', () => {
    fixture.componentInstance.type = 'Test2';
    expect(() => fixture.detectChanges()).toThrowError();
  });

  it('should use type by name', fakeAsync(() => {
    initFixture({ type: 'Test', value: NUMBER_VALUE });

    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should use type by DataType', fakeAsync(() => {
    initFixture({ type: Types.Test, value: NUMBER_VALUE });

    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should provide nil value if set value is nil', fakeAsync(() => {
    initFixture({ type: Types.Test, value: null });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(null);

    initFixture({ type: Types.Test, value: void 0 });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(void 0);
  }));

  it('should format provided value', fakeAsync(() => {
    initFixture({ type: Types.Test, value: NUMBER_VALUE });
    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should parse entered value according to the localization', fakeAsync(() => {
    initFixture({ type: Types.Test });
    typeFixtureElementValue(FORMATTED_NUMBER_VALUE);
    expect(getFixtureControlValue()).toBe(NUMBER_VALUE);
  }));

  it('should not provide new value if parsed value is not changed', fakeAsync(() => {
    initFixture({ type: Types.Test });

    const next = jasmine.createSpy('next');
    const control = getFixtureControl();
    control.valueChanges.subscribe(next);

    typeFixtureElementValue('1.2');
    typeFixtureElementValue('1.20');

    expect(next.calls.count()).toBe(1);
  }));

  it('should enter only allowed characters', fakeAsync(() => {
    initFixture({ type: Types.Test });
    typeFixtureElementValue(NUMBER_INVALID_TEXT_VALUE);
    expect(getFixtureElementValue()).toBe(NUMBER_VALID_TEXT_VALUE);
    expect(getFixtureControlValue()).toBe(NUMBER_VALUE);
  }));

  it('should format value on focus when formatOnFocus is turned on', fakeAsync(() => {
    initFixture({
      type: Types.Test3,
      value: 2.1,
      formatOnFocus: true,
      formatOnFocusQuery: { minimumFractionDigits: 0, maximumFractionDigits: 3 },
    });
    expect(getFixtureElementValue()).toBe('2.100');
    focusFixtureElement();
    expect(getFixtureElementValue()).toBe('2.1');
    blurFixtureElement();
    expect(getFixtureElementValue()).toBe('2.100');
  }));

  it('should allow to enter negative value for signed type', fakeAsync(() => {
    initFixture({ type: Types.Test });
    typeFixtureElementValue('-2');
    expect(getFixtureControlValue()).toBe(-2);
  }));

  it('should not allow to enter negative value for unsigned type', fakeAsync(() => {
    initFixture({ type: Types.UnsignedTest });
    typeFixtureElementValue('-2');
    expect(getFixtureControlValue()).toBe(2);
  }));

  it('should allow to enter negative value when max < 0', fakeAsync(() => {
    initFixture({ type: Types.TestNegativeMax });
    typeFixtureElementValue('-2');
    expect(getFixtureControlValue()).toBe(-2);
  }));

  it('should truncate decimal part when maximumFractionDigits = 0', fakeAsync(() => {
    initFixture({ type: Types.TestWithoutFractionalPart, value: 2.111 });
    expect(getFixtureElementValue()).toBe('2');
  }));
});
