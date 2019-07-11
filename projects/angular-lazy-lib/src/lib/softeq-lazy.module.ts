// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ModuleWithProviders, NgModule } from '@angular/core';
import { Route, RouterStateSnapshot } from '@angular/router';

import { LAZY_SYMBOLS, LazyActivator } from './lazy-activator.service';
import { LazyRegistry } from './lazy-registry.service';

export const LAZY_ACTIVATOR_PATH = '@lazy-activator';

/**
 * Defines common configuration of <code>@lazy-activator</code> route.
 * <code>@lazy-activator</code> route is never opened. It is necessary just to register <code>LAZY_SYMBOLS</code>.
 */
export const lazyActivatorRoute: Route = {
  path: LAZY_ACTIVATOR_PATH,
  canActivate: [LazyActivator],
};

/**
 * Checks if given router state represents <code>@lazy-activator</code> route.
 * Typically <code>@lazy-activator</code> routes are filtered from validation by canDeactivate services.
 */
export function isRouterStateLazyActivator(state: RouterStateSnapshot): boolean {
  return state.url.includes(LAZY_ACTIVATOR_PATH);
}

@NgModule({})
export class SofteqLazyModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SofteqLazyModule,
      providers: [LazyRegistry],
    };
  }

  static forChild(): ModuleWithProviders {
    return {
      ngModule: SofteqLazyModule,
      providers: [
        LazyActivator,
        { provide: LAZY_SYMBOLS, useValue: {} },
      ],
    };
  }
}
