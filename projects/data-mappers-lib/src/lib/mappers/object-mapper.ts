// Developed by Softeq Development Corporation
// http://www.softeq.com

import clone from 'lodash/clone';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import { DataMapper, JSONObject } from './mapper.interfaces';

export class ObjectMapper<Entity, ID> implements DataMapper<Entity, JSONObject> {
  private keys: string[];

  constructor(private mappers: { [P in keyof Entity]?: DataMapper<Entity[P], any> }) {
    this.keys = Object.keys(mappers);
  }

  serialize(source: Entity): JSONObject {
    if (isNil(source)) {
      return void 0;
    }

    if (!isObject(source)) {
      throw new Error('Value to be serialized is not an object');
    }

    if (this.keys.length === 0) {
      return source;
    }

    return this.keys.reduce(
      (target, field) => {
        if (!isNil(target[field])) {
          target[field] = this.mappers[field].serialize(target[field]);
        }

        return target;
      },
      clone(source));
  }

  deserialize(json: JSONObject): Entity {
    if (isNil(json)) {
      return void 0;
    }

    if (!isObject(json)) {
      throw new Error('Value to be deserialized is not an object');
    }

    if (this.keys.length === 0) {
      return json as any;
    }

    return this.keys.reduce(
      (target, field) => {
        if (!isNil(target[field])) {
          target[field] = this.mappers[field].deserialize(target[field]);
        }

        return target;
      },
      clone(json)) as any;
  }
}
