// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import isNil from 'lodash/isNil';

import { from, Observable } from 'rxjs';

import { Hash } from '@softeq/types';

export interface LazyModuleSymbols {
  injector: Injector;
  symbols: Hash<any>;
}

export interface LazyLoadedSymbol<T> {
  injector: Injector;
  symbol: T;
}

/**
 * This service manages registry of all loaded modules and its symbols.
 * Symbol is named chunk loaded from a module.
 *
 * Lazy loading is based on @angular/router functionality:
 * 1. When developer asks to lazy load some module using its path,
 * this service appends <code>/@lazy-activator</code> path element and tries to open result route
 * 2. <code>/@lazy-activator</code> route should have <code>CanActivate</code> service {@link LazyActivator}
 * that just adds symbols into {@link LazyRegistry}.
 * 3. Symbols exported by lazy module should be defined under {@link LAZY_SYMBOLS} token in the loaded module.
 */
@Injectable()
export class LazyRegistry {
  private modules: Hash<LazyModuleSymbols> = {};

  constructor(private router: Router) {

  }

  /**
   * Answers if module having the given path was loaded
   */
  isModuleLoaded(modulePath: string): boolean {
    return !isNil(this.modules[modulePath]);
  }

  /**
   * Adds module along with its injector and symbols into the set of loaded modules.
   */
  add(path: string, injector: Injector, symbols: Hash<any>): void {
    this.modules[path] = { injector, symbols };
  }

  /**
   * Tries to load module. If module was loaded successfully takes separate symbol from it.
   * Symbol is always retrieved with injector.
   */
  load<T>(modulePath: string, name: string): Observable<LazyLoadedSymbol<T>> {
    return from(this.router.navigate([`${modulePath}/@lazy-activator`])
      .then(() => {
        const module = this.modules[modulePath];
        if (isNil(module)) {
          throw new Error(`LazyRegistry: cannot find module by path '${modulePath}'`);
        }

        const symbol = module.symbols[name];
        if (isNil(symbol)) {
          throw new Error(`LazyRegistry: cannot find symbol '${modulePath}:${name}'`);
        }

        return { injector: module.injector, symbol };
      })
      .catch((error) => {
        console.error(`LazyRegistry: error while loading module '${modulePath}'`, error);
        return Promise.reject(error);
      }));
  }
}
