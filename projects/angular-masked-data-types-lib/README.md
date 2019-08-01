# @softeq/angular-masked-data-types

`@softeq/angular-masked-data-types` extends `@softeq/angular-data-types` by [`text-mask`](https://github.com/text-mask/text-mask) support:
* extends `DataType` support by adding new `MaskedTextType`
* integrates `text-mask` support for `NumberType`s
* adds `sqMaskedTextType` directive
* adds `sqMaskedNumberType` directive

## Setup

1. Setup `@softeq/angular-data-types` library as described in [this](../angular-data-types-lib/README.md) document.
1. Import `SofteqMaskedDataTypesModule` to the root application module
   ```typescript
    imports: [
      ...
      SofteqDataTypesModule.forRoot({
        typeSet: () => ...,
      }),
      SofteqMaskedDataTypesModule.forRoot(),
      ...
    ],
   ```

## `MaskedTextType` and `sqMaskedTextType`

`MaskedTextType` extends `TextType` and adds `text-mask` support.  
`MaskedTextType` is useful only when used together with `sqMaskedTextType` directive.

The following example defines `MaskedTextType`
```typescript
const TwoDigits = maskedTextType({
  mask: [/d/, /d/],
});
```   
`maskedTextType` factory similar to `textType` factory, but it accepts two additional optional properties:
* `mask`. Read [official `text-mask` documentation](https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md) to understand how to use this property.
* `pipe`. Read [official `text-mask` documentation](https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md) to understand how to use this property.

**Note!** `TwoDigits` should be added into `typeSet` and properly initialized as described on [this](../angular-data-types-lib/README.md) page.

The following example shows how to use `sqMaskedTextType`
```html
<input type="text" sqMaskedTextType="TwoDigits" [ngModel]="value">
```
This input will allow to type only digits and no more than 2 digits.

`sqMaskedTextType` directive can accept other `text-mask` parameters via `sqMaskedTextTypeConfig` input.
Read about all possible parameters in the [officical `text-mask` documentation](https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md)

```html
<input type="text"
       sqMaskedTextType="TwoDigits"
       sqMaskedTextTypeConfig="{ guide: true }"
       [ngModel]="value">
```

**Note!!!** Although `mask` field fully controls user input, it does nothing with validations.
If developer needs to validate user input in the example above, he/she should define type constraints

```typescript
const TwoDigits = maskedTextType({
  mask: [/d/, /d/],
  constraints: {
    pattern: /^\d\d$/,
  },
});
```
This example defines type which validates if string-value consists of two digits.
So, if string-value contains only one digit, this value will violate `pattern` constraint.

## `NumberType` and `sqMaskedNumberType`

`@softeq/angular-masked-data-types` extends `NumberType` by `text-mask` support.
`NumberType` along with `sqMaskedNumberType` allows to enter localized number values in `input`s by mask.

The following example defines `NumberType`
```typescript
const Price = numberType(...);
```

**Note!** `Price` should be added into `typeSet` and properly initialized as described on [this](../angular-data-types-lib/README.md) page.

This type can be used by `sqMaskedNumberType` directive
```html
<input type="text"
       [ngModel]="value"
       sqMaskedNumberType="Price">
```
`sqMaskedNumberType` formats `input` content and allows to enter only meaningful characters
 (numbers, number separators, `-` character in the beginning).
