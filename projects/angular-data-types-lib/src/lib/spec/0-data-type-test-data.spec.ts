// Developed by Softeq Development Corporation
// http://www.softeq.com

import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SofteqMlsRiModule } from '@softeq/angular-mls-ri';
import { setupTestLocaleData, setupTestTranslationData } from '@softeq/test-data';
import { SofteqDataTypesModuleConfig, SofteqDataTypesModule } from '../softeq-data-types.module';
import { DataTypeService } from '../services/data-type.service';
import { DataType } from '@softeq/data-types';

setupTestLocaleData();

export function setupTestTypeModule(config: SofteqDataTypesModuleConfig, metadata: TestModuleMetadata = {}): void {
  TestBed.configureTestingModule({
    ...(metadata || {}),
    imports: [
      ...(metadata.imports || []),
      TranslateModule.forRoot(),
      SofteqMlsRiModule.forRoot(),
      SofteqDataTypesModule.forRoot(config),
    ],
  });

  setupTestTranslationData();
}

export function getDataTypeService(): DataTypeService {
  return TestBed.get(DataTypeService);
}

export function getDataType(name: string | DataType<any>): DataType<any> {
  return getDataTypeService().get(name);
}
