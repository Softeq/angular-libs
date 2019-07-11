// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { setupTestTypeModule } from './0-data-type-test-data.spec';
import { By } from '@angular/platform-browser';
import { DataType, dateTimeType, numberType, textType } from '@softeq/data-types';
import { DataTypeValidateOption } from '../directives/data-type.directive';

@Component({
  selector: 'sq-data-type-test-host',
  template: `<input type="text" [sqDataType]="type" [sqDataTypeValidate]="validateOption" [ngModel]="value">`,
})
class DataTypeTestHostComponent {
  @Input() value: any;
  @Input() type: string | DataType<any>;
  @Input() validateOption?: DataTypeValidateOption;

  @ViewChild(NgModel, { static: true }) model: NgModel;

  get control(): FormControl {
    return this.model.control;
  }
}

const NUMBER_VALUE = 12345.678;
const FORMATTED_NUMBER_VALUE = '12,345.678';

interface DataTypeFixtureOptions {
  value?: any;
  type: string | DataType<any>;
  validateOption?: DataTypeValidateOption;
}

const MIN_DATE = new Date(2010, 1, 1);

describe('DataTypeDirective', () => {
  let Types;
  let fixture: ComponentFixture<DataTypeTestHostComponent>;

  beforeEach(() => {
    Types = {
      TestNumber: numberType(),
      TestDate: dateTimeType({
        format: 'shortDate',
      }),
      TestDateWithConstraint: dateTimeType({
        format: 'shortDate',
        constraints: {
          min: MIN_DATE,
        },
      }),
      TestText: textType({
        constraints: {
          maxLength: 32,
        },
      }),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    }, {
      imports: [FormsModule],
      declarations: [DataTypeTestHostComponent],
    });

    fixture = TestBed.createComponent(DataTypeTestHostComponent);
  });

  function initFixture(options: DataTypeFixtureOptions): void {
    fixture.componentInstance.type = options.type;
    fixture.componentInstance.value = options.value;
    fixture.componentInstance.validateOption = options.validateOption;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  function typeFixtureElementValue(str: string): void {
    getFixtureInputElement().triggerEventHandler('input', { target: { value: str } });
  }

  function getFixtureInputElement(): DebugElement {
    return fixture.debugElement.query(By.css('input'));
  }

  function getFixtureElementValue(): string {
    return getFixtureInputElement().properties.value;
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
    fixture.componentInstance.type = 'TestNumber2';
    expect(() => fixture.detectChanges()).toThrowError();
  });

  it('should use type by name', fakeAsync(() => {
    initFixture({ type: 'TestNumber', value: NUMBER_VALUE });

    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should use type by DataType', fakeAsync(() => {
    initFixture({ type: Types.TestNumber, value: NUMBER_VALUE });

    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should provide nil value if set value is nil', fakeAsync(() => {
    initFixture({ type: Types.TestNumber, value: null });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(null);

    initFixture({ type: Types.TestNumber, value: void 0 });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(void 0);
  }));

  it('should format entered value', fakeAsync(() => {
    initFixture({ type: Types.TestNumber, value: NUMBER_VALUE });
    expect(getFixtureElementValue()).toBe(FORMATTED_NUMBER_VALUE);
  }));

  it('should parse typed value', fakeAsync(() => {
    initFixture({ type: Types.TestNumber });
    typeFixtureElementValue(FORMATTED_NUMBER_VALUE);
    expect(getFixtureControlValue()).toBe(NUMBER_VALUE);
  }));

  it('should not provide new value if parsed value is not changed', fakeAsync(() => {
    initFixture({ type: Types.TestDate });

    const next = jasmine.createSpy('next');
    const control = getFixtureControl();
    control.valueChanges.subscribe(next);

    typeFixtureElementValue('3/27/2019');
    typeFixtureElementValue('03/27/2019');

    expect(next.calls.count()).toBe(1);
  }));

  it('should set maxlength attribute if type has corresponding property', fakeAsync(() => {
    initFixture({ type: Types.TestText, value: 'abc' });
    const input = getFixtureInputElement();
    expect(input.attributes.maxlength).toBe('32');
  }));

  it('should provide invalid value (if any) if format of value is invalid', fakeAsync(() => {
    initFixture({ type: Types.TestDate });
    typeFixtureElementValue('1.1.2019');
    expect(getFixtureControlValue().getTime()).toBeNaN();
  }));

  it('should generate format errors if format of value is invalid (when validateOption="format")', fakeAsync(() => {
    initFixture({ type: Types.TestDate });
    typeFixtureElementValue('1.1.2019');
    expect(getFixtureControl().errors).toEqual({ $dateFormat: { value: '1.1.2019' } });
  }));

  it('should not generate validation errors (when validateOption="format")', fakeAsync(() => {
    initFixture({ type: Types.TestDateWithConstraint });
    typeFixtureElementValue('01/01/2001');
    expect(getFixtureControl().errors).toEqual(null);
  }));

  it('should generate validation errors if some of type constraints are not satisfied (when validateOption="all")', fakeAsync(() => {
    initFixture({ type: Types.TestDateWithConstraint, validateOption: DataTypeValidateOption.All });
    typeFixtureElementValue('01/01/2001');
    expect(getFixtureControl().errors).toEqual({
      min: { min: MIN_DATE, includeMin: true, actual: new Date(2001, 0, 1) },
    });
  }));

  it('should generate only format errors if format of value is invalid (when validateOption="all")', fakeAsync(() => {
    initFixture({ type: Types.TestDateWithConstraint, validateOption: DataTypeValidateOption.All });
    typeFixtureElementValue('1.1.2019');
    expect(getFixtureControl().errors).toEqual({ $dateFormat: { value: '1.1.2019' } });
  }));

  it('should not generate any errors if value is invalid (when validateOption="none")', fakeAsync(() => {
    initFixture({ type: Types.TestDateWithConstraint, validateOption: DataTypeValidateOption.None });
    typeFixtureElementValue('1.1.2019');
    expect(getFixtureControl().errors).toEqual(null);

    typeFixtureElementValue('01/01/2001');
    expect(getFixtureControl().errors).toEqual(null);
  }));
});
