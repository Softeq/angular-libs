// Developed by Softeq Development Corporation
// http://www.softeq.com

import { isNil } from 'lodash-es';
import { Enum, EnumSet } from '../enum';
import { DataMapper } from './mapper.interfaces';

export class EnumMapper<T extends Enum<S>, S> implements DataMapper<EnumSet<T>, string> {
  constructor(private enumeration: T) {}

  serialize(name?: EnumSet<T>): string {
    if (isNil(name)) {
      return void 0;
    }

    const value = Enum.toValue(this.enumeration, name);
    if (isNil(value)) {
      throw new Error(`EnumMapper: enumeration value '${name}' cannot be serialized (Enum '${Enum.name(this.enumeration)}')`);
    }
    return value;
  }

  deserialize(value?: string): EnumSet<T> {
    if (isNil(value)) {
      return void 0;
    }

    const name = Enum.byValue(this.enumeration, value);
    if (isNil(name)) {
      // tslint:disable-next-line:max-line-length
      throw new Error(`EnumMapper: enumeration value '${value}' cannot be deserialized (Enum '${Enum.name(this.enumeration)}')`);
    }
    return name;
  }
}
