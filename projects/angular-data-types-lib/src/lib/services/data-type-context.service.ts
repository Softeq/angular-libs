// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { MlsProvider } from '@softeq/mls';
import { Hash, Maybe } from '@softeq/types';
import assign from 'lodash/assign';
import clone from 'lodash/clone';
import { DataType, DataTypeContext } from '@softeq/data-types';

export interface DataTypeInitializer {
  initType(type: DataType<any>): Maybe<Hash<any>>;
}

export const DATA_TYPE_USE_STATIC = new InjectionToken<boolean>('DataTypeUseStatic');
export const DATA_TYPE_INITIALIZER = new InjectionToken<DataTypeInitializer>('DataTypeInitializer');

@Injectable({ providedIn: 'root' })
export class DataTypeContextService implements DataTypeContext {
  private initializers: DataTypeInitializer[];

  constructor(readonly mlsProvider: MlsProvider,
              @Inject(DATA_TYPE_USE_STATIC) readonly useStatic: boolean,
              @Optional() @Inject(DATA_TYPE_INITIALIZER) initializer?: DataTypeInitializer | DataTypeInitializer[]) {
    if (Array.isArray(initializer)) {
      this.initializers = initializer;
    } else if (initializer) {
      this.initializers = [initializer];
    }
  }

  initType(type: DataType<any>): Maybe<Hash<any>> {
    const { initializers } = this;
    if (initializers) {
      let properties = type.properties;
      let isPropertiesModified = false;
      initializers.forEach((initializer) => {
        const newProperties = initializer.initType(type);
        if (!isPropertiesModified) {
          properties = clone(properties);
          isPropertiesModified = true;
        }
        assign(properties, newProperties);
      });

      return isPropertiesModified ? properties : void 0;
    }
  }
}
