# @softeq/mls

`@softeq/mls` defines **CONTRACT** for main locale-dependent operations.
 The primary focus of this library is other locale-dependent libraries that require multi-language support (**MLS**).
 Such libraries can rely on operations defined in `@softeq/mls` library and does not depend on specific MLS implementation.  
It is important to note that **`@softeq/mls` defines only contract rather than implementation**.

`@softeq/mls` provides the following locale-dependent operations:
* number & date formatting/parsing,
* providing of text translation,
* providing of current locale.

It is implementation of `@softeq/mls` contract that provides these operations.
List of current implementations can be found here below.

Although this library was initially designed for Angular, now it does not depend on Angular core
 and can be used for other frameworks or core libraries (just in theory).

## Implementations of `@softeq/mls` contract

* `@softeq/angular-mls-ri` is a reference implementation for Angular that relies on
  * `@ngx-translate/core` to provide translations
  * embedded Angular capabilities for number & date formatting
  * and implements the simplest parsing of number & date values. 

## Build

Run `ng build mls-lib` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build mls-lib`, go to the dist folder `cd dist/mls-lib` and run `npm publish`.

## Running unit tests

Run `ng test mls-lib` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
