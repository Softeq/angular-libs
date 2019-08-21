// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNil from 'lodash/isNil';

import { DataMapper } from './mapper.interfaces';

export class JsonMapper<SerializedView, ObjectView = SerializedView> implements DataMapper<ObjectView, string> {
  constructor(private baseMapper?: DataMapper<ObjectView, SerializedView>) {

  }

  deserialize(str?: string): ObjectView {
    if (isNil(str)) {
      return void 0;
    }

    const json = JSON.parse(str);
    return this.baseMapper ? this.baseMapper.deserialize(json) : json;
  }

  serialize(obj?: ObjectView): string {
    if (isNil(obj)) {
      return void 0;
    }

    const json = this.baseMapper ? this.baseMapper.serialize(obj) : obj;
    return JSON.stringify(json);
  }
}
