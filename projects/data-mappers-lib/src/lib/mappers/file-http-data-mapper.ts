// Developed by Softeq Development Corporation
// http://www.softeq.com

import { DataMapper } from './mapper.interfaces';
import { HeadersData, HttpDataMapper } from './http-data-mapper';

export class FileHttpDataMapper<File> extends HttpDataMapper<File> {
  constructor(mapper: DataMapper<File, File>, mimeType: string) {
    super(mapper, mimeType, 'blob');
  }

  serializeHeaders(headers: HeadersData, obj: File, json: any): File {
    return obj;
  }

  deserializeHeaders(headers: HeadersData, obj: File): File {
    return obj;
  }
}
