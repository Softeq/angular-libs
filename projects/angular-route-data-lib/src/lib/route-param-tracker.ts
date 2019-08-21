// Developed by Softeq Development Corporation
// http://www.softeq.com

import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRouteSnapshot, Params } from '@angular/router';

import { DataMapper, identityMapper, deserializeData, serializeData } from '@softeq/data-mappers';
import { Hash, Maybe } from '@softeq/types';

import create from 'lodash/create';
import every from 'lodash/every';
import fromPairs from 'lodash/fromPairs';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, skip, startWith, switchMap } from 'rxjs/operators';

/**
 * This interface defines tracker for subset of route query parameters. It is responsible for
 * <ul>
 * <li> tracking of route query parameters;
 * <li> tracking of filter changes;
 * <li> notifying about new query parameters
 * </ul>
 */
export interface RouteParamTracker<F> {
  /**
   * Stream of filter changes. As soon as filter has been changed this stream should emit new value.
   * If this tracker is registered as filter tracker, emitted value will be available
   * under {@link RouteTracker#filterChanges}
   */
  filterChanges: Observable<F>;
  /**
   * Stream of query parameters. When stream emits new query parameters, they are merged into URL of the current page.
   */
  paramChanges: Observable<Params>;

  /**
   * This method is called when query parameters of the current route has been modified.
   * It gets all current query parameters.
   * Typically implementation of this method should handle received parameters
   * and emit new filter (under {@link RouteParamTracker#filterChanges}).
   */
  mergeParams(params: Params): void;

  /**
   * This method allows to setup default filter. Main role of default filter is to reset query parameters.
   * @param defaultFilter
   */
  withDefault(defaultFilter: F): this;
}

/**
 * Manual tracker is used to immediately manage routable parameters
 */
export type ManualRouteParamTracker<F> = RouteParamTracker<F> & { setValue(filter: F): void };

/**
 * This interface defines typical pattern of criteria-based filtering.
 *
 * In typical scenario page having filter provides set of criterion (inputs, selects, check boxes)
 * and trigger button ('Search') to start searching.
 * This fits into this interface in the following way:
 * <ul>
 * <li> when user changes filter criteria => underlying filter is modified,
 *    but search is not triggered until filter is emitted by {@link Filterable#emitFilter};
 * <li> when user push trigger button ('Search'), page should call {@link Filterable#emitFilter} method
 *    to emit new value into {@link Filterable#filterChanges} stream;
 * <li> on the other hand, when query parameters has been modified {@link RouteTracker} finally
 *    calls {@link Filterable#setFilter} to notify implementation of {@link Filterable} interface about new filter.
 * </ul>
 */
export interface Filterable<F> {
  /**
   * Current filter
   */
  readonly currentFilter: F;

  /**
   * This stream emits new filter as soon as {@link Filterable#emitFilter} method is called.
   */
  filterChanges: Observable<F>;

  /**
   * Updates current filter
   */
  setFilter(filter: F): void;

  /**
   * Emits current filter.
   */
  emitFilter(): void;
}

/**
 * Interface to define {@link RouteParamTracker} based on {@link Observable}.
 */
export interface ObservableFilter<F> {
  filterChanges: Observable<F>;
  /** Name of query parameter this filter will be saved under */
  name?: string;
  dataMapper?: DataMapper<F, any>;

  setFilter?(filter: F): void;
}

/**
 * Interface to define plain {@link RouteParamTracker} based on {@link Observable}.
 * Plain tracker merges emitted filter into set of specified query parameters
 * (rather than single parameter as other trackers)
 */
export interface ObservablePlainFilter<F> {
  /** Set of filter fields to be merged as query parameters */
  names: string[];
  filterChanges: Observable<F>;
  /** Optional {@link DataMapper}s used to serialize/deserialize filter fields */
  dataMappers?: Hash<DataMapper<any, any>>;

  setFilter?(filter: F): void;
}

export function getRouteTrackerFilter<F>(snapshot: ActivatedRouteSnapshot, mapper?: DataMapper<F, any>): Maybe<F>;
export function getRouteTrackerFilter<F>(snapshot: ActivatedRouteSnapshot,
                                         paramName?: string,
                                         mapper?: DataMapper<F, any>): Maybe<F>;
export function getRouteTrackerFilter<F>(snapshot: ActivatedRouteSnapshot,
                                         paramNameOrDataMapper?: string | DataMapper<F, any>,
                                         optionalDataMapper?: DataMapper<F, any>): Maybe<F> {
  const paramName = paramNameOrDataMapper && isString(paramNameOrDataMapper) ? paramNameOrDataMapper : 'filter';
  const dataMapper = (optionalDataMapper || (paramName ? void 0 : paramNameOrDataMapper)) as any;
  return deserializeData(snapshot.queryParams[paramName], dataMapper);
}

/**
 * Defines {@link RouteParamTracker} for {@link Filterable} object. Filter coming from/to query parameters will be
 * deserialized/serialized using provided <code>dataMapper</code> correspondingly.
 * This method stores filter under the single query parameter (by default, 'filter')
 */
export function filterTracker<F>(filterable: Filterable<F>,
                                 dataMapper?: DataMapper<F, any>): RouteParamTracker<F>;
export function filterTracker<F>(queryParamName: string,
                                 filterable: Filterable<F>,
                                 dataMapper?: DataMapper<F, any>): RouteParamTracker<F>;
export function filterTracker<F>(queryParamNameOrFilterable: string | Filterable<F>,
                                 filterableOrDataMapper?: Filterable<F> | Maybe<DataMapper<F, any>>,
                                 optionalDataMapper?: DataMapper<F, any>): RouteParamTracker<F> {
  if (!isString(queryParamNameOrFilterable)) {
    return filterTracker(
      'filter',
      queryParamNameOrFilterable as Filterable<F>,
      filterableOrDataMapper as DataMapper<F, any>);
  }

  const queryParamName = queryParamNameOrFilterable as string;
  const filterable = filterableOrDataMapper as Filterable<F>;
  const dataMapper = optionalDataMapper as DataMapper<F, any> || identityMapper();
  let defaultFilter: F = filterable.currentFilter;

  const tracker: RouteParamTracker<F> = {
    filterChanges: filterable.filterChanges,
    paramChanges: filterable.filterChanges.pipe(
      // there is no sense to store initial filter in query parameters
      skip(1),
      map((filter) =>
        isSimilarFilter(filter, defaultFilter)
          // send empty set of query parameters if they are equal to default filter
          ? { [queryParamName]: void 0 }
          // serialize filter
          // store whole filter under 'filter' query parameter
          : ({ [queryParamName]: dataMapper.serialize(filter) })),
      startWith({})),
    // take parameters from 'filter' query parameter
    mergeParams: (params) => {
      const filter = params[queryParamName];
      if (filter) {
        filterable.setFilter(dataMapper.deserialize(filter));
      } else if (!isNil(defaultFilter)) {
        filterable.setFilter(defaultFilter);
      }
    },
    withDefault: (filter: F) => {
      defaultFilter = filter;
      return tracker;
    },
  };

  return tracker;
}

/**
 * Defines {@link RouteParamTracker} for {@link AbstractControl} object. Filter coming from/to query parameters will be
 * deserialized/serialized using provided <code>dataMapper</code> correspondingly.
 * This method stores filter under the single query parameter (by default, 'filter')
 */
export function controlTracker<F>(control: AbstractControl,
                                  dataMapper?: DataMapper<F, any>): RouteParamTracker<F>;
export function controlTracker<F>(queryParamName: string,
                                  control: AbstractControl,
                                  dataMapper?: DataMapper<F, any>): RouteParamTracker<F>;
export function controlTracker<F>(queryParamNameOrControl: string | AbstractControl,
                                  controlOrDataMapper?: AbstractControl | Maybe<DataMapper<F, any>>,
                                  optionalDataMapper?: DataMapper<F, any>): RouteParamTracker<F> {
  if (!isString(queryParamNameOrControl)) {
    return controlTracker('filter', queryParamNameOrControl as AbstractControl, controlOrDataMapper as DataMapper<F, any>);
  }

  const queryParamName = queryParamNameOrControl as string;
  const control = controlOrDataMapper as AbstractControl;
  const dataMapper = optionalDataMapper as DataMapper<F, any> || identityMapper();
  let defaultFilter: F = control.value;

  // we have to make lazy stream from FormControl in order to get actual current value on the moment of subscription
  const value$ = of(control).pipe(switchMap((c) => c.valueChanges.pipe(startWith(c.value))));
  const tracker: RouteParamTracker<F> = {
    filterChanges: value$,
    paramChanges: value$.pipe(
      // there is no sense to store initial filter in query parameters
      skip(1),
      map((filter) =>
        isSimilarFilter(filter, defaultFilter)
          // send empty set of query parameters if they are equal to default filter
          ? { [queryParamName]: void 0 }
          // serialize filter
          // store whole filter under 'filter' query parameter
          : ({ [queryParamName]: dataMapper.serialize(filter) })),
      // start with empty set of query parameters
      startWith({})),
    // take parameters from 'filter' query parameter
    mergeParams: (params) => {
      const filter = params[queryParamName];
      if (filter) {
        control.setValue(dataMapper.deserialize(filter));
      } else if (!isNil(defaultFilter)) {
        control.setValue(defaultFilter);
      }
    },
    withDefault: (filter: F) => {
      defaultFilter = filter;
      return tracker;
    },
  };

  return tracker;
}

/**
 * Merges {@link Filterable} behavior into provided ReactiveForms control
 */
export function filterableControl<F>(control: FormControl): FormControl & Filterable<F>;
export function filterableControl<F>(control: FormGroup): FormGroup & Filterable<F>;
export function filterableControl<F>(control: FormArray): FormArray & Filterable<F>;
export function filterableControl<F>(control: AbstractControl): AbstractControl & Filterable<F> {
  const filterChanges$$ = new BehaviorSubject(control.value);

  function setFilter(filter: F): void {
    delegated.patchValue(filter);
    emitFilter();
  }

  function emitFilter(): void {
    filterChanges$$.next(delegated.value);
  }

  const delegated = create(
    control,
    {
      get currentFilter(): F {
        return control.value;
      },
      filterChanges: filterChanges$$.asObservable(),
      setFilter,
      emitFilter,
    });

  return delegated;
}

/**
 * Creates manual tracker.
 * This method stores filter under the single query parameter (by default, 'filter')
 */
export function manualTracker<F>(dataMapper?: DataMapper<F, any>): ManualRouteParamTracker<F>;
export function manualTracker<F>(queryParamName: string,
                                 dataMapper?: DataMapper<F, any>): ManualRouteParamTracker<F>;
export function manualTracker<F>(queryParamNameOrDataMapper: string | Maybe<DataMapper<F, any>>,
                                 optionalDataMapper?: DataMapper<F, any>): ManualRouteParamTracker<F> {
  if (!isString(queryParamNameOrDataMapper)) {
    return manualTracker('filter', queryParamNameOrDataMapper as DataMapper<F, any>);
  }

  const queryParamName = queryParamNameOrDataMapper as string;
  const dataMapper = optionalDataMapper as DataMapper<F, any> || identityMapper();

  const control = new FormControl();
  return create(
    controlTracker(queryParamName, control, dataMapper),
    {
      setValue: (filter: F) => control.setValue(filter),
    },
  );
}

function isSimilarFilter<F>(filterA: F, filterB: F): boolean {
  return isEqual(filterA, filterB);
}

/**
 * Defines {@link RouteParamTracker} which updates query parameters from the given {@link Observable}.
 * If query parameters is changed tracker calls {@link ObservableFilter#setFilter} method
 * to allow developer to update a page stage.
 * Filter coming from/to query parameters will be deserialized/serialized using provided <code>dataMapper</code>.
 * This method stores filter under the single query parameter (by default, 'filter')
 */
export function observableFilterTracker<F>(oFilter: ObservableFilter<F>): RouteParamTracker<F> {
  const queryParamName = oFilter.name || 'filter';
  const dataMapper = oFilter.dataMapper || identityMapper();
  let defaultFilter: F = void 0 as any;

  const value$ = oFilter.filterChanges;
  const tracker: RouteParamTracker<F> = {
    filterChanges: value$,
    paramChanges: value$.pipe(
      // there is no sense to store initial filter in query parameters
      skip(1),
      map((filter) =>
        isSimilarFilter(filter, defaultFilter)
          // send empty set of query parameters if they are equal to default filter
          ? { [queryParamName]: void 0 }
          // serialize filter
          // store whole filter under 'filter' query parameter
          : ({ [queryParamName]: dataMapper.serialize(filter) })),
      // start with empty set of query parameters
      startWith({})),
    // take parameters from 'filter' query parameter
    mergeParams: (params) => {
      const { setFilter } = oFilter;
      if (setFilter) {
        const filter = params[queryParamName];
        if (filter) {
          setFilter(dataMapper.deserialize(filter));
        } else if (!isNil(defaultFilter)) {
          setFilter(defaultFilter);
        }
      }
    },
    withDefault: (filter: F) => {
      defaultFilter = filter;
      return tracker;
    },
  };

  return tracker;
}

/**
 * Defines {@link RouteParamTracker} which updates query parameters from the given {@link Observable}.
 * If query parameters is changed tracker calls {@link ObservableFilter#setFilter} method
 * to allow developer to update a page stage.
 * Filter coming from/to query parameters will be deserialized/serialized using provided <code>dataMappers</code>.
 * This tracker tracks only parameters specified under <code>names</code> parameter.
 * Modified filter is merged into query parameters defined by <code>names</code> parameter.
 */
export function observablePlainFilterTracker<F>(oFilter: ObservablePlainFilter<F>): RouteParamTracker<F> {
  let defaultFilter: F = void 0 as any;

  const { dataMappers } = oFilter;

  const serialize = (name: string, value: any) => {
    return serializeData(value, dataMappers && dataMappers[name]);
  };
  const deserialize = (name: string, value: any) => {
    return deserializeData(value, dataMappers && dataMappers[name]);
  };

  const emptyQueryParameters = fromPairs(oFilter.names.map((name) => [name, void 0]));

  const value$ = oFilter.filterChanges;
  const tracker: RouteParamTracker<F> = {
    filterChanges: value$,
    paramChanges: value$.pipe(
      // there is no sense to store initial filter in query parameters
      skip(1),
      map((filter) =>
        isSimilarFilter(filter, defaultFilter)
          // send empty set of query parameters if they are equal to default filter
          ? emptyQueryParameters
          // serialize filter
          // store whole filter under corresponding query parameters
          : fromPairs(
          oFilter.names
            .map((name) => [name, serialize(name, filter[name])])
            // send empty query parameter if it is equal to corresponding parameter from the default filter
            .map(([name, value]) => [
              name,
              defaultFilter && isSimilarFilter(value, defaultFilter[name]) ? void 0 : value,
            ]))),
      // start with empty set of query parameters
      startWith({})),
    // take parameters from corresponding query parameters
    mergeParams: (params) => {
      const { setFilter } = oFilter;
      if (setFilter) {
        const filter = fromPairs(oFilter.names.map((name) => [name, deserialize(name, params[name])]));
        if (!isEmpty(filter) && !every(filter, isNil)) {
          setFilter(filter as F);
        } else if (!isNil(defaultFilter)) {
          setFilter(defaultFilter);
        }
      }
    },
    withDefault: (filter: F) => {
      defaultFilter = filter;
      return tracker;
    },
  };

  return tracker;
}
