// Developed by Softeq Development Corporation
// http://www.softeq.com

import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';

import { DataMapper } from './mapper.interfaces';

export class ArrayDataMapper<ObjectView, SerializedView> implements DataMapper<ObjectView[], SerializedView[]> {

  constructor(private elementMapper: DataMapper<ObjectView, SerializedView>) {

  }

  serialize(obj: ObjectView[]): SerializedView[] {
    if (isNil(obj)) {
      return void 0;
    }

    if (!isArray(obj)) {
      throw new Error('Value to be serialized is not an array');
    }

    const elementMapper = this.elementMapper;
    return obj.map((item) => elementMapper.serialize(item));
  }

  deserialize(json: SerializedView[]): ObjectView[] {
    if (isNil(json)) {
      return void 0;
    }

    if (!isArray(json)) {
      throw new Error('Value to be deserialized is not an array');
    }

    const elementMapper = this.elementMapper;
    return json.map((item) => elementMapper.deserialize(item));
  }
}
