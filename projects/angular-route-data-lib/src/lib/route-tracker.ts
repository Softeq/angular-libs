// Developed by Softeq Development Corporation
// http://www.softeq.com

import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Params, Router, RouterState } from '@angular/router';
import { Maybe } from '@softeq/types';
import assign from 'lodash/assign';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { RouteParamTracker } from './route-param-tracker';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { parseUrl, stringifyUrl } from './url.utils';

export type RouteTracker1<F1> = RouteTracker<[F1]>;
export type RouteTracker2<F1, F2> = RouteTracker<[F1, F2]>;
export type RouteTracker3<F1, F2, F3> = RouteTracker<[F1, F2, F3]>;
export type RouteTracker4<F1, F2, F3, F4> = RouteTracker<[F1, F2, F3, F4]>;

/**
 * Checks if provided snapshot is in the snapshot tree of the router state
 */
function hasRouteInState(router: RouterState, snapshot: ActivatedRouteSnapshot): boolean {
  const snapshotStack: ActivatedRouteSnapshot[] = [];
  snapshotStack.push(router.snapshot.root);

  // simple tree traversal via stack
  while (snapshotStack.length) {
    const current = snapshotStack.pop()!; // tslint:disable-line:no-non-null-assertion

    if (current === snapshot) {
      // we have found snapshot in the tree
      return true;
    } else {
      current.children.forEach((child) => snapshotStack.push(child));
    }
  }

  // we did not find snapshot in the tree
  return false;
}

/**
 * RouteTracker allows to
 * -- track changes of route query parameters;
 * -- update in-page data when route query parameters has changed;
 * -- update route query parameters when in-page data has been changed.
 *
 * <i>
 * Example:
 * Application has a page displaying list of entries filtered by parameters set on UI.
 * When one of filter parameters is changed => list of entries should be reloaded accordingly.
 * User can open one of entries in the separate page (leaving list of entries).
 * When he/she returns to the list (by pressing 'Back' browser's button)
 * it is convenient to have the latest parameters set on UI.
 *
 * Typical solution of this problem is to save all filters in query parameters of the page.
 * It allows to implement 'Back' behavior and gives 'bookmarkability' of such pages (at least).
 * </i>
 *
 * This class helps to solve similar problems.
 * In order to track and update query parameters RouteTracker registers {@link RouteParamTracker}s.
 * Each {@link RouteParamTracker} tracks and updates one or several query parameters.
 *
 * All registered {@link RouteParamTracker}s are divided into filter and effect parameter trackers.
 *
 * When query parameters tracked by filter parameter trackers are changed => {@link RouteTracker} emits the last filters
 * into {@link RouteTracker#filterChanges} stream. This allows to update page based on filter changes.
 *
 * Effect parameter trackers also tracks query parameters, but they do not notify {@link RouteTracker#filterChanges}
 * stream about the changes. This is the only difference.
 */
export class RouteTracker<F> {
  private enableMergeParams: boolean;
  // active subscription for ActivatedRoute
  private subscription?: Subscription;
  private filterChanges$$: BehaviorSubject<F>;

  constructor(private router: Router,
              private filterTrackers: RouteParamTracker<any>[],
              private effectTrackers: RouteParamTracker<any>[],
              private defaultFilter: F) {
  }

  /**
   * Returns true iff tracker listens for some ActivatedRoute
   */
  get listening(): boolean {
    return !isNil(this.subscription) && !this.subscription.closed;
  }

  /**
   * Returns the latest filters tracked by filter {@link RouteParamTracker}s
   */
  get filterChanges(): Observable<F> {
    if (!this.listening) {
      throw new Error('RouteTracker: filterChanges can be called only when tracker in listening state (listen(route))');
    }

    return this.filterChanges$$.asObservable();
  }

  /**
   * Constructs new {@link RouteTracker} with the given set of {@link RouteParamTracker}s as effect param trackers.
   * Set of filter {@link RouteParamTracker}s is not modified.
   */
  withEffects(...effectTrackers: RouteParamTracker<any>[]): RouteTracker<F> {
    return new RouteTracker<F>(this.router, this.filterTrackers, effectTrackers, this.defaultFilter);
  }

  /**
   * Starts listening for given {@link ActivatedRoute}. Although this method returns {@link Subscription}, generally
   * it is unnecessary to unsubscribe explicitly. When user leaves given route, subscription is destroyed automatically.
   */
  listen(route: ActivatedRoute): Subscription {
    if (this.listening) {
      throw new Error('RouteTracker: tracker already in listening state.');
    }

    const { filterTrackers, effectTrackers } = this;

    const subscription = this.subscription = new Subscription();
    this.filterChanges$$ = new BehaviorSubject<F>(this.defaultFilter);
    this.enableMergeParams = true;

    // listen for route.queryParams
    // Generally speaking, it is unnecessarily to unsubscribe from route observables (as stated in the documentation
    // https://angular.io/guide/router#observable-parammap-and-component-reuse)
    subscription.add(route.queryParams.subscribe((queryParams) => {
      // merge queryParams into filter and effect trackers
      if (this.enableMergeParams) {
        filterTrackers.forEach((tracker) => tracker.mergeParams(queryParams));
        effectTrackers.forEach((tracker) => tracker.mergeParams(queryParams));
      }
    }));

    // Emit filter changes
    subscription.add(combineLatest(filterTrackers.map((tracker) => tracker.filterChanges))
      .subscribe((filters) => this.filterChanges$$.next(filters as any)));

    // Listen for paramTrackers.paramChanges
    subscription.add(combineLatest(filterTrackers.concat(effectTrackers).map((tracker) => tracker.paramChanges)).pipe(
      map((paramsArr) => assign({}, ...paramsArr)),
      // merge params into url
      map((params) => this.mergeQueryParams(params)),
      // if URL was modified
      filter(Boolean),
      // there is no need to merge next query parameters, because they just changed
      tap(() => {
        this.enableMergeParams = false;
      }),
      // navigate
      switchMap((nextUrl) => this.router.navigateByUrl(nextUrl, { replaceUrl: true })))
      .subscribe(() => {
        // enable parameter merging again
        this.enableMergeParams = true;
      }));

    // Create dispose subscription.
    // This subscription is necessary just to catch the moment when listened route was removed from the router state.
    // Unfortunately there is no easy way to catch the moment when ActivatedRoute should be disposed:
    // here we listen all NavigationEnd events and try to find if current route was removed from the router state.
    subscription.add(this.router.events.pipe(
      // wait when any navigation has been completed
      filter((event) => event instanceof NavigationEnd),
      // if listened route was removed from router state => it means we left listened route
      filter(() => !hasRouteInState(this.router.routerState, route.snapshot)))
      // dispose subscription if we leave listened route
      .subscribe(() => subscription.unsubscribe()));

    return this.subscription;
  }

  /**
   * Dispose subscription for listened route.
   */
  unlisten(): void {
    if (this.listening) {
      this.filterChanges$$.complete();
      this.subscription!.unsubscribe(); // tslint:disable-line:no-non-null-assertion
      this.subscription = void 0;
    }
  }

  /**
   * Merges given query parametes into current URL. If parameters do not change final URL this method returns undefined.
   */
  private mergeQueryParams(params: Params): Maybe<string> {
    const url = this.router.routerState.snapshot.url;
    const { pathname, query, hash } = parseUrl(url);
    const nextQuery = { ...query, ...params };

    const nextUrl = stringifyUrl({ pathname, query: nextQuery, hash });
    return nextUrl === url || isEqual(query, nextQuery) ? void 0 : nextUrl;
  }
}
