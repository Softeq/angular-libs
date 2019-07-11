# @softeq/data-types

`@softeq/data-types` library introduces `DataType` concept, centralize and promotes work with similar primitive data. 

## Description

Developers often work with data like prices, percents, email strings, zip codes, dates (in different formats), etc.

Let's consider **price**. **Price** has associated behavior which should be the same in all application.  
For example
* have locale-dependent *formatting*, like `1,234.87` (1,234 dollars and 87 cents)
* have the same *constraints*, like to be positive and less than 1,000,000

*Formatting* is important not only for displaying, but also for *parsing* of user input.

Besides **price** application can work with another data
* percents
* hours
* days
* email strings
* zip codes
* phone numbers
* dates in different formats
* etc

We can say that each element of this list define logical data type having associated
* *formatting* and *parsing*
* set of *constraints*
* and may be some other options

`@softeq/data-types` library introduces `DataType` concept that covers all set of operations for specific logical type.

#### `DataType`

This way `DataType` defines the following operations
* `format` to transform value to string according to the locale
* `parse` to transform string to value according to the locale
* `validate` to validate value if it satisfies set of constraints 
* `validateFormat` to validate string if it can be converted to a value according to the locale
* `equals` to check whether two values are equal
* `compare` to check order of two values relative to each other 

#### Embedded `DataType`s

`@softeq/data-types` has the following embedded types:
* `NumberType` for `number`s
* `DateTimeType` for `Date`s
* `TextType` for `string`s

Each of these types has own set of options (*constraints*, *formats*, *violation messages*, etc).
 To construct specific type developer can use one of available factory functions: `numberType`, `dateTimeType`, `textType`.
 Each factory function accepts `DataTypeDefinition` that describe options for corresponding type.

### `NumberType`

The simplest `NumberType`
```javascript
const SimplestNumberType = numberType();
```

More complex `NumberType`
```javascript
const PriceType = numberType({
  format: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  constraints: {
    min: 0,
    max: 1000000,
  },
});
```
Here we have defined `NumberType` type which
* formats number with 2 digits in fractional part (formatting options, like grouping and number separators are defined by @softeq/mls implementation)
* validates that value >= 0
* validates that value <= 1000000

All possible options for `numberType` factory described on [API](API.md) page.

##### `format`

`format` transforms number to localized text number according to the provided format settings.
`PriceType` always formats numbers with 2 fractional digits.
```javascript
PriceType.format(1234.22);
// > 1,234.22
PriceType.format(1234);
// > 1,234.00
PriceType.format(1234.789);
// > 1,234.79
```

##### `parse`

`parse` allows to parse localized text number to `number`. For example in `en-US` locale
```javascript
PriceType.parse('1,234.22').value
// > 1234.22
```
and in `ru-RU` locale
```javascript
PriceType.parse('1 234,22').value
// > 1234.22
```

When text to be parsed has wrong format `parse` returns `errors`
```javascript
PriceType.parse('1;234.22').errors
// > { $numberFormat: { value: '1;234.22' } }
```

##### `validateFormat`

`validateFormat` allows to check if text can be parsed to `number`.
If format is right `validateFormat` returns `undefined`.

```javascript
PriceType.validateFormat('1,234.22')
// > undefined
```
otherwise `validateFormat` returns set of errors
```javascript
PriceType.validateFormat('1;234.22')
// > { $numberFormat: { value: '1;234.22' } }
```

##### `validate`

`validate` checks if number satisfies set of defined constraints.
 If value is valid, `validate` returns `undefined`

```javascript
PriceType.validate(100);
// > undefined
```

otherwise `validate` returns set of errors
```javascript
PriceType.validate(-100);
// > { min: { min: 0, includeMin: true, actual: -100 } }
```

#####  `equals`

`equals` compares if two values are equal or not

```javascript
PriceType.equals(1, 2);
// > false
```

#####  `compare`

`equals` compares order of values relative to each other

```javascript
PriceType.compare(1, 2);
// > -1
```

#### `messages`

To provide message support this library relies on `@softeq/mls` contract. Thus, this is a responsibility
of `@softeq/mls` implementation to provide format and source of messages.

Developer can define violation messages for validations associated with the type

```javascript
const PriceType = numberType({
  format: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  constraints: {
    min: 0,
    max: 1000000,
  },
  messages: {
    // format of MLS record depends on @softeq/mls contract implementation
    min: 'msg_number_min',
  },
});
```

**Note!** Format of record defined under `messages.min` field depends on `@softeq/mls` implementation.

When developer calls `validate` method violation message is returned under `$message` field of violation

```javascript
PriceType.validate(-100)
// > {
// >   min: {
// >     min: 0,
// >     includeMin: true,
// >     actual: -100,
// >     $message: { key: 'msg_number_min', params: { ... } }
// >   }
// > }
```

**Note!** Format of message returned under `$message` field depends on `@softeq/mls` implementation.

### `DateTimeType`

The simplest `DateTimeType`
```javascript
const SimplestDateType = dateTimeType({
  format: 'shortDate'
});
```

More complex `DateTimeType`
```javascript
const PayDateType = dateTimeType({
  format: 'shortDatetime',
  constraints: {
    min: new Date(2000, 0, 1),
    max: new Date(),
  },
});
```
Here we have defined `NumberType` type which
* formats `Date` according to the `shortDatetime` format (format is defined by @softeq/mls implementation)
* validates that `Date` >= 2000 year
* validates that `Date` <= current date

All possible options for `dateTimeType` factory described on [API](API.md) page.

`DateTimeType` provides the same operations as `NumberType`

```javascript
PayDateType.format(new Date(2010, 1, 12, 3, 4));
// > 2/12/2010 3:04 am

PayDateType.parse('2/12/2010 3:04 am').value;
// > new Date(2010, 1, 12, 3, 4)

PayDateType.parse('2.12.2010 3:04 am')
// > { value: new Date('invalid date'), errors: { $dateFormat: { value: '2.12.2010 3:04 am' } } )

PayDateType.validateFormat('2/12/2010 3:04 am')
// > undefined

PayDateType.validateFormat('2.12.2010 3:04 am')
// > { $dateFormat: { value: '2.12.2010 3:04 am' } }

PayDateType.validate(new Date(2010, 1, 12, 3, 4))
// > undefined

PayDateType.validate(new Date(1999, 1, 12, 3, 4))
// > {
// >   min: {
// >     min: new Date(2000, 0, 1),
// >     includeMin: true,
// >     actual: new Date(1999, 1, 12, 3, 4),
// >   }
// > }

PayDateType.validate(new Date('invalid date'))
// > {
// >   $dateInvalid: {
// >     value: new Date('invalid date')
// >   }
// > }

PayDateType.equals(new Date(2010, 1, 12, 3, 4), new Date(1999, 1, 12, 3, 4));
// > false

PayDateType.compare(new Date(2010, 1, 12, 3, 4), new Date(1999, 1, 12, 3, 4));
// > 1
```

### `TextType`

The simplest `TextType`
```javascript
const SimplestTextType = textType();
```

More complex `TextType`
```javascript
const EmailType = textType({
  constraints: {
    maxLength: 64,
    pattern: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/,
  },
});
```
Here we have defined `EmailType` type which
* validates that length of string <= 64
* validates that string satisfies provided `pattern`

All possible options for `textType` factory described on [API](API.md) page.

`TextType` provides the same operations as `NumberType`

```javascript
EmailType.format('mail@example.com') // just returns passed string
// > 'abc'

EmailType.parse('mail@example.com').value // just returns passed string
// > 'abc'

EmailType.validateFormat('mail@example.com') // always returns undefined
// > undefined

EmailType.validate('mail@example.com')
// > undefined

EmailType.validate('abc')
// > {
// >   pattern: {
// >     requiredPattern: /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
// >     actualValue: 'abc',
// >   }
// > }

EmailType.validate(new Date('invalid date'))
// > {
// >   $dateInvalid: {
// >     value: new Date('invalid date')
// >   }
// > }

EmailType.equals('abc', 'def');
// > false

PayDateType.compare('abc', 'def');
// > -1
```

### Initialization of types

Actually, before `DataType` can be used it should be initialized. While initialization
* `DataType` binds to specific locale and takes specific locale settings (for example, `NumberType` takes number format for `en-US` or `ru-RU` locale)
* `DataType` can be complemented by some library-specific properties (as `@softeq/angular-masked-data-types` library does)

There is no common way to initialize `DataType` system, because it depends on specific environment.
For example, look at `@softeq/angular-data-types` for details.

For full list of supported environments, look at the bottom of this page

### Custom type constraints

Developer can associate custom constraints with any `DataType`.

For example, in the following example we constraint numbers to multiples of 3.

```javascript
const MultipleNumberType = numberType({
  constraints: {
    multiple: 3
  },
  validators: {
    multiple: (multiple) => (value) => { // here multiple gets value = 3 from constraint defined above
      if ((value % multiple) === 0) {
        return undefined; // return undefined when constraint is satisfied
      } else {
        return { multiple, actual: value }; // return object with error parameters when constraint is not satisfied
      }
    }
  },
});
```

Consider this code in more details.  
To use custom constraint we have to define validator factory
```javascript
validators: {
  multiple: (multiple) => /* validator function */
}
```
and constraint
```javascript
constraints: {
  multiple: 3
}
```

When constraint is defined, validator factory creates validator for the the given constraint

```javascript
(multiple /* multiple = 3 */) => (value) => /* violation error */
```

Validator is a function that accepts a value and returns an error (any object) if constraint is not satisfied,
 or `undefined` otherwise

```javascript
(value) => { // here multiple gets value = 3 from constraint defined above
  if ((value % multiple) === 0) {
    return undefined; // return undefined when constraint is satisfied
  } else {
    return { multiple, actual: value }; // return object with error parameters when constraint is not satisfied
  }
}
```

`MultipleNumberType` can be used as any other `NumberType`

```javascript
MultipleNumberType.validate(3)
// > undefined

// if constraint is not satisfied validator returns errors
// where object returned by validator is placed under the corresponding constraint name
MultipleNumberType.validate(4)
// > {
// >   multiple: { multiple: 3, actual: 4 }
// > }
```

Developer can also provide message for custom constraints.
 Format of MLS record depends on `@softeq/mls` contract implementation

```javascript
const MultipleNumberType = numberType({
  constraints: {
    multiple: 3
  },
  validators: {
    multiple: (multiple) => (value) => { // here multiple gets value = 3 from constraint defined above
      if ((value % multiple) === 0) {
        return undefined; // return undefined when constraint is satisfied
      } else {
        return { multiple, actual: value }; // return object with error parameters when constraint is not satisfied
      }
    }
  },
  messages: {
    // format of MLS record depends on @softeq/mls contract implementation
    multiple: 'msg_number_multiple',
  }
});

// if constraint is not satisfied validator returns errors
// where object returned by validator is placed under the corresponding constraint name.
// If message is defined for constraint, $message field is merged to the error object
MultipleNumberType.validate(4)
// > {
// >   multiple: {
// >     multiple: 3,
// >     actual: 4,
// >     $message: { key: 'msg_number_multiple', params: { ... } }
// >   }
// > }
```

### Type specialization

`DataType`s can be inherited. It can be useful when types have common set of messages,
 constraints or format settings.

For example, take a look at the following example

```javascript
const BaseMultipleNumberType = numberType({
  validators: {
    multiple: (multiple) => (value) => {
      if ((value % multiple) === 0) {
        return undefined; // return undefined when constraint is satisfied
      } else {
        return { multiple, actual: value }; // return object with error parameters when constraint is not satisfied
      }
    }
  },
});
```

Here, we define `BaseMultipleNumberType` type similar to the type defined in the previous section.
 Unlike type defined in the previous section (`MultipleNumberType`),
 this type defines only validator for custom constraint, but does not define any constraint.

We can define subtypes of this type to validate whether number is multiple of `3` or `4`.

```javascript
const MultipleOf3NumberType = numberType(BaseMultipleNumberType, {
  constraints: {
    multiple: 3,
  }
});

const MultipleOf4NumberType = numberType(BaseMultipleNumberType, {
  constraints: {
    multiple: 4,
  }
});
```

and use these types

```javascript
MultipleOf3NumberType.validate(4)
// > {
// >   multiple: { multiple: 3, actual: 4 }
// > }

MultipleOf4NumberType.validate(4)
// > undefined
```

All type options are inherited when you specialize type. This allows to define common messages,
 constraints and format settings.

### Create custom `DataType`

Embedded types may not cover all developer needs. For example, if developer uses `moment` dates in application
 it will be hard to use such date with `DateTimeType` and take benefits from `@soteq/data-types` library.

But actually `DateTimeType` is just a simple implementation of `DataType` interface.
 Developer can write own `DataType` for `moment` dates the same way as it does for `DateTimeType`, `NumberType` and `TextType`.
 Look at implementation of these types to get more details.

This section does not detail how to write custom `DataType`, but keywords are `createDataType` function and `AbstractBaseType` class.
It is encouraged to provide factory functions to create custom data types, the same way as it does for embedded types
(`numberType`, `dateTimeType` and `textType`).

## Supported environments

* for Angular use [`@softeq/angular-data-types`](../angular-data-types-lib/README.md)

## Build

Run `ng build data-types-lib` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build data-types-lib`, go to the dist folder `cd dist/data-types-lib` and run `npm publish`.

## Running unit tests

Run `ng test data-types-lib` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
