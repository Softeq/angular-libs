// Developed by Softeq Development Corporation
// http://www.softeq.com

import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';

export const HTTP_DATA_BASE_URL = new InjectionToken('HttpDataBaseUrl');

@Injectable({ providedIn: 'root' })
export class RestSettings {
  constructor(public httpClient: HttpClient,
              @Inject(HTTP_DATA_BASE_URL) public baseUrl: string) {

  }
}
