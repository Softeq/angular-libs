// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNil from 'lodash/isNil';
import invert from 'lodash/invert';

import { DataMapper } from './mapper.interfaces';

export class ValueMapper<T> implements DataMapper<T, any> {
  valueToSerialized = invert(this.serializedToValue);

  constructor(private serializedToValue: { [name: string]: T }) {
  }

  serialize(obj: T) {
    if (!isNil(obj)) {
      const serialized = this.valueToSerialized[obj as any];
      if (isNil(serialized)) {
        throw new Error(`ValueMapper: cannot find serialized value for "${obj}"`);
      }
      return serialized;
    }
  }

  deserialize(serialized: any): T {
    if (!isNil(serialized)) {
      const value = this.serializedToValue[serialized];
      if (isNil(value)) {
        throw new Error(`ValueMapper: cannot find deserialized value for "${serialized}"`);
      }
      return value;
    }
  }

}
