// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { Hash, SupplierFn } from '@softeq/types';
import { DataType } from '@softeq/data-types';
import { DATA_TYPE_INITIALIZER, DATA_TYPE_USE_STATIC, DataTypeInitializer } from './services/data-type-context.service';
import { DATA_TYPE_DEFAULT_VALIDATE_OPTION, DataTypeDirective, DataTypeValidateOption } from './directives/data-type.directive';
import { DataFormatPipe } from './pipes/data-format.pipe';
import { DATA_TYPE_SET } from './services/data-type.service';

export interface SofteqDataTypesModuleConfig {
  typeSet?: SupplierFn<Hash<DataType<any>> | Hash<DataType<any>>[]>;
  useStatic?: boolean;
  defaultValidateOption?: DataTypeValidateOption;
}

@NgModule({
  declarations: [
    DataFormatPipe,
    DataTypeDirective,
  ],
  exports: [
    DataFormatPipe,
    DataTypeDirective,
  ],
})
export class SofteqDataTypesModule {
  static forRoot(config: SofteqDataTypesModuleConfig): ModuleWithProviders {
    return {
      ngModule: SofteqDataTypesModule,
      providers: [
        config.typeSet ? { provide: DATA_TYPE_SET, useFactory: config.typeSet, deps: [], multi: true } : [],
        { provide: DATA_TYPE_USE_STATIC, useValue: config.useStatic || false },
        {
          provide: DATA_TYPE_DEFAULT_VALIDATE_OPTION,
          useValue: config.defaultValidateOption ? config.defaultValidateOption : DataTypeValidateOption.Format,
        },
      ],
    };
  }

  static forChild(): ModuleWithProviders {
    return {
      ngModule: SofteqDataTypesModule,
      providers: [],
    };
  }
}
