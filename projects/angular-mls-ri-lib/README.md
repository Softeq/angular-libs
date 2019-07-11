# @softeq/angular-mls-ri

Reference implementation of [`@softeq/mls`](../mls-lib/README.md) contract.

`@softeq/angular-mls-ri` is based on
* `@ngx-translate/core` to provide translations
* embedded Angular capabilities for number & date formatting
* and implements the simplest parsing of number & date values. 

## Setup

To work with this library it should be properly initialized.

1. First of all you have to initialize `TranslateModule` from `@ngx-translate/core` library.
   ```typescript
   @NgModule({
     imports: [
       TranslateModule.forRoot({
         ...
       }),
     ],
     ...   
   })
   ```
2. Define number and date formats used to format/parse dates and numbers.
 If you store your translations (used by `@ngx-translate` library) in the `json` file its content may look like
   ```json
   {
    "$localization": {
      "numberFormat": {
        "decimalSeparator": ".",
        "groupSeparator": ",",
        "grouping": true
      },
      "dateFormat": {
        "shortDate": "M/d/yyyy",
        "dayMonth": "MMM d",
        "monthYear": "M/yyyy",
        "dateA11y": "MMMM/d/yyyy",
        "monthYearA11y": "MMMM/yy",
        "shortMonthYear": "MMM yy",
        "shortTime": "h:mm a",
        "shortDatetime": "M/d/yyyy h:mm a",
        "mediumDateAndWeekday": "MMM d yyyy, EE"
      }
    },
    ...
   }
   ```
   All formats should be defined under `$localization` field.
   The main idea is to make localization structure available when it is retrieved by `TranslateService`
    using `$localization` key
   ```typescript
   this.translate.instant('$localization'); // should retrieve localization structure
   ```
   Localization structure MUST define number & date formats under the corresponding fields as in the example above.
   Read here below about structure of these fields
3. Add `SofteqMlsRiModule` module into `imports` section of root `NgModule`
   ```typescript
   @NgModule({
     imports: [
       TranslateModule.forRoot({
         ...
       }),
       SofteqMlsRiModule.forRoot(),
     ],
     ...   
   })
   ```

#### Number Format

Number format should consist of the following fields
* `decimalSeparator` is a decimal separator
* `grouping` whether to use grouping
* `groupSeparator` is a character used to separate groups

#### Date Format

Date format defines set of named formats, like `M/d/yyyy` or `MMM d`.
* formatting of dates works according to the rules used by `DatePipe`
* parsing of dates currently supports only digit-only formats, like `M/d/yyyy` or `h:mm a`.

## Restrictions

* Date and number formats are retrieved using `TranslateService#instant` call.
 This means that translations should be loaded before `MlsProvider` is used first time.
 You should care about this yourself.

## Build

Run `ng build angular-mls-ri-lib` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build angular-mls-ri-lib`, go to the dist folder `cd dist/angular-mls-ri-lib` and run `npm publish`.

## Running unit tests

Run `ng test angular-mls-ri-lib` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
