// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ModuleWithProviders, NgModule } from '@angular/core';
import { MaskedTextTypeDirective } from './directives/masked-text-type.directive';
import { DATA_TYPE_INITIALIZER } from '@softeq/angular-data-types';
import { MaskedDataTypeInitializer } from './services/masked-data-type-initializer.service';
import {
  DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS,
  DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS_QUERY,
  MaskedNumberTypeDirective
} from './directives/masked-number-type.directive';
import { MlsNumberFormatQuery } from '@softeq/mls';

export interface SofteqMaskedDataTypesModuleConfig {
  defaultNumberTypeFormatOnFocus?: boolean;
  defaultNumberTypeFormatOnFocusQuery?: MlsNumberFormatQuery;
}

export const DEFAULT_NUMBER_FORMAT_ON_FOCUS = true;
export const DEFAULT_NUMBER_FORMAT_ON_FOCUS_QUERY: MlsNumberFormatQuery = {
  minimumFractionDigits: 0,
  maximumFractionDigits: Number.MAX_SAFE_INTEGER,
};

@NgModule({
  imports: [],
  declarations: [MaskedTextTypeDirective, MaskedNumberTypeDirective],
  providers: [],
  exports: [MaskedTextTypeDirective, MaskedNumberTypeDirective]
})
export class SofteqMaskedDataTypesModule {
  static forRoot(config?: SofteqMaskedDataTypesModuleConfig): ModuleWithProviders {
    return {
      ngModule: SofteqMaskedDataTypesModule,
      providers: [
        { provide: DATA_TYPE_INITIALIZER, useClass: MaskedDataTypeInitializer, multi: true },
        {
          provide: DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS_QUERY,
          useValue: config && config.defaultNumberTypeFormatOnFocusQuery ?
            config.defaultNumberTypeFormatOnFocusQuery
            : DEFAULT_NUMBER_FORMAT_ON_FOCUS_QUERY,
        },
        {
          provide: DEFAULT_MASKED_NUMBER_TYPE_FORMAT_ON_FOCUS,
          useValue: config && config.defaultNumberTypeFormatOnFocus ?
            config.defaultNumberTypeFormatOnFocus
            : DEFAULT_NUMBER_FORMAT_ON_FOCUS,
        },
      ],
    };
  }

  static forChild(): ModuleWithProviders {
    return {
      ngModule: SofteqMaskedDataTypesModule,
      providers: [],
    };
  }
}
