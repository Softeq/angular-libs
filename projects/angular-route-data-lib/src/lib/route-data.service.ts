// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { DataMapper, identityMapper } from '@softeq/data-mappers';
import { from, Observable, of } from 'rxjs';

import { RouteParamTracker } from './route-param-tracker';
import { RouteTracker, RouteTracker1, RouteTracker2, RouteTracker3, RouteTracker4 } from './route-tracker';
import { parseUrl, stringifyUrl } from './url.utils';

/**
 * This service allows to request and save dynamic data associated with routes.
 *
 * Service supports two kinds of data association:
 * - data can be associated with the route by its url and query parameters (current route)
 * - data can be associated with the state id attached to the current route as a parameter (savepoint)
 *
 */
@Injectable({ providedIn: 'root' })
export class RouteDataService {
  constructor(private router: Router) {

  }

  /**
   * Creates {@link RouteTracker} using provided {@link RouteParamTracker}s as filter trackers.
   */
  tracker(): RouteTracker1<void>;
  tracker<F1>(filter: RouteParamTracker<F1>): RouteTracker1<F1>;
  tracker<F1, F2>(filter1: RouteParamTracker<F1>, filter2: RouteParamTracker<F2>): RouteTracker2<F1, F2>;
  // tslint:disable-next-line:max-line-length
  tracker<F1, F2, F3>(filter1: RouteParamTracker<F1>,
                      filter2: RouteParamTracker<F2>,
                      filter3: RouteParamTracker<F3>): RouteTracker3<F1, F2, F3>;
  // tslint:disable-next-line:max-line-length
  tracker<F1, F2, F3, F4>(filter1: RouteParamTracker<F1>,
                          filter2: RouteParamTracker<F2>,
                          filter3: RouteParamTracker<F3>,
                          filter4: RouteParamTracker<F4>): RouteTracker4<F1, F2, F3, F4>;
  tracker(...filters: RouteParamTracker<any>[]): RouteTracker<any[]> {
    return new RouteTracker(this.router, filters, [], []);
  }

  /**
   * Merges provided <code>data</code> into the query parameters of current route
   */
  mergeQueryParams<T>(data: T, mapper: DataMapper<T, any> = identityMapper()): Observable<boolean> {
    const url = this.router.routerState.snapshot.url;
    const { pathname, query, hash } = parseUrl(url);
    const serializedData = mapper.serialize(data);

    const nextUrl = stringifyUrl({ pathname, query: { ...query, ...serializedData }, hash });
    return nextUrl === url ? of(true) : from(this.router.navigateByUrl(nextUrl, {
      replaceUrl: true,
    }));
  }
}
