// Developed by Softeq Development Corporation
// http://www.softeq.com

import { HttpData, HttpDataMapper } from './http-data-mapper';
import { DataMapper } from './mapper.interfaces';

export class ConstantBodyHttpDataMapper<ObjectView> extends HttpDataMapper<ObjectView> {
  constructor(mapper: DataMapper<ObjectView, any>, private value: any) {
    super(mapper);
  }

  serialize(obj: ObjectView): HttpData {
    return {
      ...super.serialize(obj),
      body: this.value,
    };
  }

  deserialize(data: HttpData): ObjectView {
    return super.deserialize({
      ...data,
      body: this.value,
    });
  }
}
