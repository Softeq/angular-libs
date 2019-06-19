// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DataType } from '@softeq/data-types';
import { Hash } from '@softeq/types';
import { setupTestTypeModule } from './0-masked-data-type-test-data.spec';
import { maskedTextType } from '../types/masked-text-type';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';

interface MaskedTextTypeFixtureOptions {
  value?: any;
  type: string | DataType<any>;
}

const TEXT_VALID_VALUE = '33';
const TEXT_INVALID_VALUE = '332';

@Component({
  selector: 'sq-masked-text-type-test-host',
  template: `<input type="test" [sqMaskedTextType]="type" [ngModel]="value">`,
})
class MaskedTextTypeTestHostComponent {
  @Input() value: any;
  @Input() type: string | DataType<any>;

  @ViewChild(NgModel, { static: true }) model: NgModel;

  get control(): FormControl {
    return this.model.control;
  }
}

describe('MaskedTextTypeDirective', () => {
  let Types: Hash<DataType<any>>;
  let fixture: ComponentFixture<MaskedTextTypeTestHostComponent>;

  beforeEach(() => {
    Types = {
      Test: maskedTextType({
        mask: [/\d/, /\d/],
        constraints: {
          maxLength: 2,
        },
      }),
    };

    setupTestTypeModule({
      useStatic: true,
      typeSet: () => Types,
    }, {
      imports: [FormsModule],
      declarations: [MaskedTextTypeTestHostComponent],
    });

    fixture = TestBed.createComponent(MaskedTextTypeTestHostComponent);
  });

  function initFixture(options: MaskedTextTypeFixtureOptions): void {
    fixture.componentInstance.type = options.type;
    fixture.componentInstance.value = options.value;

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
    initFixture({ type: 'Test', value: TEXT_VALID_VALUE });

    expect(getFixtureElementValue()).toBe(TEXT_VALID_VALUE);
  }));

  it('should use type by DataType', fakeAsync(() => {
    initFixture({ type: Types.Test, value: TEXT_VALID_VALUE });

    expect(getFixtureElementValue()).toBe(TEXT_VALID_VALUE);
  }));

  it('should provide nil value if set value is nil', fakeAsync(() => {
    initFixture({ type: Types.Test, value: null });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(null);

    initFixture({ type: Types.Test, value: void 0 });
    expect(getFixtureElementValue()).toBe('');
    expect(getFixtureControlValue()).toBe(void 0);
  }));

  it('should not change provided value', fakeAsync(() => {
    initFixture({ type: Types.Test, value: TEXT_VALID_VALUE });
    expect(getFixtureElementValue()).toBe(TEXT_VALID_VALUE);
  }));

  it('should clean entered value according to the mask', fakeAsync(() => {
    initFixture({ type: Types.Test });
    typeFixtureElementValue(TEXT_INVALID_VALUE);
    expect(getFixtureControlValue()).toBe(TEXT_VALID_VALUE);
  }));

  it('should not provide new value if parsed value is not changed', fakeAsync(() => {
    initFixture({ type: Types.Test });

    const next = jasmine.createSpy('next');
    const control = getFixtureControl();
    control.valueChanges.subscribe(next);

    typeFixtureElementValue(TEXT_VALID_VALUE);
    typeFixtureElementValue(TEXT_VALID_VALUE);

    expect(next.calls.count()).toBe(1);
  }));

  it('should set maxlength attribute if type has corresponding property', fakeAsync(() => {
    initFixture({ type: Types.Test, value: TEXT_VALID_VALUE });
    const input = getFixtureInputElement();
    expect(input.attributes.maxlength).toBe('2');
  }));
});
