// Developed by Softeq Development Corporation
// http://www.softeq.com

export type Maybe<T> = T | undefined;

export type Nullable<T> = T | null;

export type Nilable<T> = T | undefined | null;

export interface Hash<T> {
  [name: string]: T;
}

export interface NumericHash<T> {
  [name: number]: T;
}

export type SupplierFn<T> = () => T;

export type ConsumerFn<T> = (value: T) => void;
export type BiConsumerFn<T, U> = (t: T, u: U) => void;

export type PredicateFn<T> = (value: T) => boolean;
export type BiPredicateFn<T, U> = (t: T, u: U) => boolean;

export type IdentityFn<T> = (value: T) => T;

export type TransformFn<T, R> = (value: T) => R;
export type BiTransformFn<T, U, R> = (t: T, u: U) => R;

export type Constructor<T> = new (...args: any[]) => T;

