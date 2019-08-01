# @softeq/angular-data-types

`@softeq/angular-data-types` integrates [`@softeq/data-types`](../data-types-lib/README.md)
 into Angular framework.

## Setup

1. `@softeq/data-types` relies on [`@softeq/mls`](../mls-lib/README.md) contract.
 Thus, developer needs to install implementation of `@softeq/mls` contract suitable for Angular.
 Look at list of supported implementation at [this](../mls-lib/README.md#implementations-of-softeqmls-contract) page.
2. Declare one or several `typeSet`s of `DataType`s.
    ```javascript
    const NumberTypes = {
      Price: numberType(...),
      Days: numberType(...),
    };

    const TextTypes = {
      Email: textType(...),
    };
    ```
   `typeSet` is a dictionary where key of field is an **unique** name of `DataType` and value is `DataType`. 
3. Import Angular module `SofteqDataTypesModule` to the root application module
 by providing all `typeSet`s into `SofteqDataTypesModule.forRoot`.
    ```javascript
    @NgModule({
      imports: [
        ...
        SofteqDataTypesModule.forRoot({
          typeSet: () => [NumberTypes, TextTypes],
        }),
        ...
      ],
    })
    ```

## How to use

To use `DataType` in Angular application developer should inject `DataTypeService`
```typescript
constructor(private dataTypes: DataTypeService) {

}
```

and get `DataType` from `DataTypeService` using initially defined types
```typescript
const priceType = this.dataTypes.get(NumberTypes.Price);
// or
const emailType = this.dataTypes.get(TextTypes.Email);
```

`DataTypeService.get` always return type for the current locale
 (current locale is determined by `@softeq/mls` contract implementation).

Retrieved type can be used as in the following example
```typescript
console.log(priceType.format(1122.3344));
```

### Static usage of types

By default, types from the `typeSet` cannot be used directly
```typescript
// this code throws an error
NumberTypes.Price.format(1122.3344);
```

This is an intentional restriction. There are two reasons for that:
1. `NumberType` and `DateType` depends on current locale.
 Often locale is determined **ONLY AFTER** application is initialized.
 If statement `NumberTypes.Price.format(1122.3344)` is called before application is initialized,
 it will throw an error, because locale is unknown (so, it is unknown how to format value)
1. Sometimes application supports several locales and dynamic switching between locales in runtime.
 It is not so simple to establish which locale should be used when code does not depend on Angular entities,
 like services or components.

By these reasons, this code can be considered as dangerous:
```typescript
NumberTypes.Price.format(1122.3344);
```

On the other hand
1. Typically localization of values (like `number`s or `Date`s) is necessary exactly
 after application was initialized. So, locale is known at this moment of time. 
1. Application often supports only one locale at one time and changing of locale reloads whole application.

So, if this is your case you can rely on *static usage of types*.
 For this purpose initialize module with `useStatic` flag

```
SofteqDataTypesModule.forRoot({
  typeSet: () => [NumberTypes, TextTypes],
  useStatic: true,
}),
```

Now registered types can be used like in the following example
```typescript
NumberTypes.Price.format(1122.3344);
```
**Note!** It is responsibility of developer to guarantee that this code is used after
* application is initialized
* locale is determined
* and locale data is loaded.

### Create `DataType` dynamically

`DataType` can be not only registered while application initialization, but also created dynamically.

```typescript
const HoursType = this.dataTypes.create(numberType(...));
```

It is important to call `create` for type built by `numberType` factory,
 because otherwise type will not be initialized. 

### Formatting of data in templates

If developer needs to format data, he/she can use `DataType.format` method as in the following example

```typescript
NumberTypes.Price.format(1122.3344)
```

But if developer needs to format data in template there is more convenient way to do this
```
<div>
  Salary: {{ salary | dataFormat:'Price' }}
</div>
```

where
* `dataFormat` is a pipe defined by `@softeq/angular-data-types` library
* `Price` is a name of type as it was defined in `typeSet`

### Binding of `DataType` to `input` and `textarea`

To make `DataType` more useful we can bind it to `input`s and `textarea`s using `sqDataType` directive.
`sqDataType` directive implements `ControlValueAccessor` interface, so it can be used with
 `ngModel`, `formControl` and `formControlName` directives.
```html
<input type="text"
       sqDataType="Price"
       [ngModel]="value">
```
 
 This allows
* to transform entered text values to underlying logical type and vice versa.  
  This means that `value` will be automatically parsed to `number` in the current locale
   if entered text is valid.
  On the other hand `value` assigned to `input` will be displayed as localized text number.
      
  So, if user enters `1,234.56` in `en-US` locale, `value` will get value `1234.56`.  
  The same will happen if user enters `1 234,56` in `ru-RU` locale.  
  On the other hand if `value=8232.22` and current locale is `ru-RU`, `input` will display `1 234,56`.
* automatically associate validations with the `input`.  
  This way, if user enters invalid value or value that does not satisfy `DataType` constraints,
   generated errors will be merged into the corresponding `FormControl` (for reactive forms)
   or `ngModel` directive (if template-driven form is used).
