// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

import { Hash } from '@softeq/types';

import initial from 'lodash/initial';

import { LazyRegistry } from './lazy-registry.service';

/**
 * Symbols exported by lazy module should be defined under this token
 */
export const LAZY_SYMBOLS = new InjectionToken<Hash<any>>('LazySymbols');

function getLazyModulePath(snapshot: ActivatedRouteSnapshot): string {
  return initial(snapshot.pathFromRoot).map((element) => element.url.toString()).join('/');
}

/**
 * Can activate service which should be registered under <code>/@lazy-activator</code> route in the lazy module.
 * It exports all symbols available under <code>LAZY_SYMBOLS</code> into the {@link LazyRegistry}
 */
@Injectable()
export class LazyActivator implements CanActivate {
  constructor(private lazyRegistry: LazyRegistry,
              @Inject(LAZY_SYMBOLS) private symbols: Hash<any>,
              private injector: Injector) {

  }

  /**
   * Exports all lazy symbols
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const modulePath = getLazyModulePath(route);
    if (!this.lazyRegistry.isModuleLoaded(modulePath)) {
      this.lazyRegistry.add(modulePath, this.injector, this.symbols);
    }
    return false;
  }
}
