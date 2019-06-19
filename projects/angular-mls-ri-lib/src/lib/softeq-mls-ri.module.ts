// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ModuleWithProviders, NgModule } from '@angular/core';
import { MlsRiProviderService } from './mls-ri-provider.service';
import { MlsProvider } from '@softeq/mls';

@NgModule({
  providers: [
    MlsRiProviderService,
    { provide: MlsProvider, useExisting: MlsRiProviderService },
  ],
})
export class SofteqMlsRiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SofteqMlsRiModule,
      providers: [],
    };
  }
}
