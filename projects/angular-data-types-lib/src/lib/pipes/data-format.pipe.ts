// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Pipe, PipeTransform } from '@angular/core';
import { isNil, isString } from 'lodash-es';
import { DataTypeService } from '../services/data-type.service';
import { DataType } from '@softeq/data-types';

@Pipe({
  name: 'dataFormat',
})
export class DataFormatPipe implements PipeTransform {
  constructor(private types: DataTypeService) {

  }

  transform(value: any, name: string | DataType<any>): any {
    if (isNil(name) || name === '') {
      throw new Error('DataType is not provided into "dataFormat" pipe');
    }

    const type = isString(name) ? this.types.get(name) : name;

    return isNil(value) ? value : type.format(value);
  }
}
