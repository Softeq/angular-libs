// Developed by Softeq Development Corporation
// http://www.softeq.com

import isNull from 'lodash/isNull';
import omit from 'lodash/omit';
import {DataMapper, ETagSupport} from './mapper.interfaces';
import { HeadersData, HttpDataMapper } from './http-data-mapper';

export class ETagHttpDataMapper<ObjectView extends ETagSupport> extends HttpDataMapper<ObjectView> {

  constructor(mapper: DataMapper<ObjectView, any>) {
    super(mapper);
  }

  serializeHeaders(headers: HeadersData, obj: ObjectView, json: any): any {
    if (obj.etag) {
      headers.set('If-Match', obj.etag);
    }
    return omit(json, 'etag');
  }

  deserializeHeaders(headers: HeadersData, obj: ObjectView): ObjectView {
    const etagHeader = headers.get('ETag');
    obj.etag = isNull(etagHeader) ? void 0 : etagHeader;

    return obj;
  }
}
