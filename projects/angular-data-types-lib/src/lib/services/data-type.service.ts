// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Inject, Injectable, InjectionToken } from '@angular/core';

import { each, isNil, uniqueId } from 'lodash-es';

import { Hash } from '@softeq/types';
import { Locale } from '@softeq/mls';
import { DataTypeContextService } from './data-type-context.service';
import { DataType, getDebugTypeName, PrototypeType } from '@softeq/data-types';

export const DATA_TYPE_SET = new InjectionToken<Hash<DataType<any>> | Hash<DataType<any>>[]>('DataTypeSet');

@Injectable({ providedIn: 'root' })
export class DataTypeService {
  private prototypeTypes: Hash<PrototypeType<any, any>> = {};
  private typeToUniqueName = new Map<DataType<any>, string>();
  private typeInstances: Hash<Hash<DataType<any>>> = {};

  constructor(@Inject(DATA_TYPE_SET) typeSet: Hash<DataType<any>> | Hash<DataType<any>>[],
              private context: DataTypeContextService) {
    const typeSets = Array.isArray(typeSet) ? typeSet : [typeSet];

    typeSets.forEach((set) => {
      each(set, (type, name: string) => {
        if (this.prototypeTypes[name]) {
          throw new Error(`Type having name '${name}' is already registered`);
        }

        this.registerType(name, type);
      });
    });
  }

  create<D extends DataType<T>, T>(type: D): D {
    const name = uniqueId('DynamicType:');
    this.registerType(name, type);

    return this.get<T>(name) as D;
  }

  get<T>(type: string | DataType<T>): DataType<T> {
    const locale = this.context.mlsProvider.getCurrentLocale();

    if (typeof type === 'string') {
      const uniqueName = this.typeToUniqueName.get(this.prototypeTypes[type]);
      return this.getByName(uniqueName, locale);
    } else {
      const name = this.typeToUniqueName.get(type);
      if (name) {
        return this.getByName(name, locale);
      } else {
        return this.create(type);
      }
    }
  }

  private registerType(name: string, type: DataType<any>): void {
    const { prototypeTypes, typeToUniqueName, context } = this;
    if (!(type instanceof PrototypeType)) {
      throw new Error(`Cannot create type based on non-PrototypeType: '${getDebugTypeName(type)}'`);
    }

    const prototypeType = type as PrototypeType<any, any>;
    prototypeTypes[name] = prototypeType;

    // init type if it was not registered earlier
    if (!typeToUniqueName.has(type)) {
      typeToUniqueName.set(type, name);
      prototypeType.init(context);
    }
  }

  private getByName<T>(name: string, locale: Locale): DataType<T> {
    const localeKey = locale.toStandardString();
    let typesByLocale = this.typeInstances[localeKey];
    if (isNil(typesByLocale)) {
      typesByLocale = this.typeInstances[localeKey] = {};
    }
    let type = typesByLocale[name];
    if (isNil(type)) {
      type = typesByLocale[name] = this.instantiateType(name, locale);
    }
    return type;
  }

  private instantiateType(name: string, locale: Locale): DataType<any> {
    const prototype = this.prototypeTypes[name];
    if (isNil(prototype)) {
      throw new Error(`Type having name '${name}' is not registered`);
    }
    return prototype.instantiate(locale);
  }
}
