// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_DATA_BASE_URL } from './rest-settings.service';

export interface SofteqHttpDataModuleConfig {
  baseUrl: string;
}

@NgModule()
export class SofteqHttpDataModule {
  static forRoot(options: SofteqHttpDataModuleConfig): ModuleWithProviders {
    return {
      providers: [
        { provide: HTTP_DATA_BASE_URL, useValue: options.baseUrl },
      ],
      ngModule: SofteqHttpDataModule,
    };
  }
}
