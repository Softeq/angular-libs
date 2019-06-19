// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable } from '@angular/core';
import { AbstractRestService } from './abstract-rest.service';
import { TestBed } from '@angular/core/testing';
import { SofteqHttpDataModule } from './softeq-http-data.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { identityMapper } from '@softeq/data-mappers';
import { RestSettings } from './rest-settings.service';

const TEST_ABSOLUTE_URL = 'https://test.test/abc/def';

const BASE_URL = 'https://localhost:6666/api';
const resolveRelativeUrl = (relative: string) => `${BASE_URL}${relative}`;

@Injectable()
class TestRestService extends AbstractRestService {
  get(): Observable<void> {
    return this.httpGet('/test', identityMapper());
  }

  absolute(): Observable<void> {
    return this.httpGet(TEST_ABSOLUTE_URL, identityMapper());
  }
}

describe('AbstractRestService', () => {
  let restClient: TestRestService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SofteqHttpDataModule.forRoot({
          baseUrl: BASE_URL,
        }),
      ],
      providers: [TestRestService],
    });

    restClient = TestBed.get(TestRestService);
    httpTesting = TestBed.get(HttpTestingController);
  });

  it('relative URL should be concatenated with baseUrl', () => {
    const url = resolveRelativeUrl('/test');

    restClient.get().subscribe();

    const req = httpTesting.expectOne(url);

    expect(req.request.url).toBe(url);

    req.flush({});

    httpTesting.verify();
  });

  it('absolute URL should not be concatenated with baseUrl', () => {
    restClient.absolute().subscribe();

    const req = httpTesting.expectOne(TEST_ABSOLUTE_URL);

    expect(req.request.url).toBe(TEST_ABSOLUTE_URL);

    req.flush({});

    httpTesting.verify();
  });
});
