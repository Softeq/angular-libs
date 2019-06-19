# @softeq/data-mappers

`@softeq/data-mappers` is a lightweight library which simplifies serialization/deserialization tasks.

### Problem

One of task developer has to solve from day to day is data serialization. For example, developer needs to transform data to serializable view to
* send data via HTTP client
* store data in local storage
* store some data in route query parameters
* etc

In the same time if data was serialized, one day it should be deserialized.

It is not so complex task, especially when data has the following structure
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 32,
  "children": ["Mary", "Ann"]
}
```
Developer can call `JSON.stringify` to serialize data and `JSON.parse` to deserialize data.

This approach works well while we have only primitive data (`string`, `number`, `boolean`, etc).
 But this approach will stop working as soon as we have complex objects, like `Date`, `RegExp`, `BitSet`, etc (other objects created by third-party libraries).
 Honestly `Date` object can be transformed to string by `JSON.stringify` method, but anyway `JSON.parse` will not restore it. 

For example in the following example we have two complex fields `birthday` and `salary`,

```javascript
const john = {
  id: 1,
  firstName: 'John',
  lastName: 'Smith',
  birthday: new Date(1977, 3, 2),
  salary: new BigDecimal(/*some very large and precise number*/)
};
```

To serialize and deserialize this object we can write a pair of the following functions:
```javascript
function serializeEmployee(john) {
  return JSON.stringify({
    ...john,
    birthday: john.birthday.toISOString(),
    salary: john.salary.toString(),
  });
}

function deserializeEmployee(serializedEmployee) {
  const almostDeserializedEmployee = JSON.parse(serializedEmployee);
  return {
    ...almostDeserializedJohn,
    birthday: new Date(almostDeserializedEmployee.birthday),
    salary: bigDecimalFromString(almostDeserializedEmployee.salary),
  };
}
```

and use them

```javascript
const serializedJohn = serializeEmployee(john);
const restoredJohn = deserializeEmployee(serializedJohn);
```

Both these functions take too much space even for simple object and moreover they mirrors each other.
 Actually mirroring is a common rule especially when communication protocol follows REST practices.

Things become more complex when developer has HTTP communication and he/she should take into account headers
 (for example, handling of `ETag`, `If-Match`, `If-None-Match` headers).

### Solution

This library promotes concept of `DataMapper` which encapsulates rules to serialize and deserialize objects at the same time
(we will use word **map** instead of serialize/deserialize).
For `john`, you can define mapper like

```javascript
const employeeMapper = objectMapper({
  birthday: dateMapper(DateFormat.Date),
  salary: bigDecimalMapper,
});
```

You have to describe only how to **map** all non-primitive data.

To serialize `john` using `employeeMapper` you have to write
```javascript
const serializedJohn = employeeMapper.serialize(john);
console.log(serializedJohn);
```

`serializedJohn` is an object which looks like

```
{
  id: 1,
  firstName: 'John',
  lastName: 'Smith',
  birthday: '1977-04-02', // birthday was serialized by dateMapper to ISO format
  salary: '12342342342', // BigDecimal converted to serialized view
}
```

It is important to note that `serializedJohn` is an `Object` rather than `string`.
 To serialize `serializedJohn` to a string developer can use `JSON.stringify` function.
 `JSON.stringify` is safe now, because `serializedJohn` contains only primitive values.

Original object can be restored from the serialized view using `deserialize` method
```javascript
const restoredJohn = employeeMapper.deserialize(serializedJohn);
// restoredJohn is an object equal by content to original john object
```

Actually `bigDecimalMapper` used to map `BigDecimal` does not exist, but we can ease define it.
 See the following example

```javascript
import { createMapper } from '@softeq/data-mappers';

const bigDecimalMapper = createMapper({
  serialize: (big) => big.toString(),
  deserialize: (serializeBig) => bigDecimalFromString(serializeBig),
});
```

#### Composition of mappers

But what if `employee` entity can be a part of `company` entity, like in the following example?
```javascript
const company = {
  name: 'Insurance Ltd',
  foundationDate: new Date(1920, 8, 23, 7, 5, 23), // This company was founded 23rd September 1920 at 7:05 AM and 23 seconds 
  employees: [{
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    birthday: new Date(1977, 3, 2),
    salary: new BigDecimal(/*some very large and precise number*/)
  }, {
    id: 2,
    firstName: 'Mary',
    lastName: 'Miller',
    birthday: new Date(1983, 2, 3),
    salary: new BigDecimal(/*also some very large and even more precise number*/)
  }]
}
```

In this case we can define composed mapper
```javascript
const companyMapper = objectMapper({
  foundationDate: dateMapper(DateFormat.DateTime), // we have to parse date and time (DateTime),
  employees: arrayMapperOf(employeeMapper), // array of employees, here we use employeeMapper defined above
});
```

Here we use `arrayMapperOf` which defines mapper for set of employees,
 each of employees will be mapped by `employeeMapper`.

We can use `companyMapper` like in the following example
```javascript
const serializedCompany = companyMapper.serialize(company);
const restoredCompany = companyMapper.deserialize(serializedCompany);
```

#### Mapping of HTTP Requests/Responses

HTTP communications, especially REST-based communications, actively use parts of HTTP protocol (status, method, headers)
 to transfer important information.
While HTTP request and response has different structure, both of them support headers which sometimes play crucial
 role in making request and response interpretation.  
 For example, it is a common practice to use `ETag` header together with `If-Match` (`If-Non-Match`) header to avoid
 lost updates (this technique is called "*optimistic locking*").
 `DataMapper`s can also help in this field and provide reusable composable and ease to use approach
 to support such interactions.

Let's imagine we have a page where we can update employee information. From the REST-based communication point of view
 we need two endpoints: one to get state of resource (`GET`) and another one to update its state (`PUT`).
 In addition we have to avoid *lost updates*, for this purpose our communication protocol supports handling of
 `ETag` and `If-Match` headers (which is, I believe, a common practice).

To be specific, look at response of `GET` call
```
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "363d707003c01515b2c627fc15b9e4d88"

{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "birthday": "1977-04-02",
  "salary": "12342342342"
}
```

and possible request of `PUT` call
```
PUT /employees/1 HTTP/1.1
Content-Type: application/json
If-Match: "363d707003c01515b2c627fc15b9e4d88"

{
  "id": 1,
  "firstName": "John",
  "lastName": "Davis",
  "birthday": "1987-04-02",
  "salary": "92342342342"
}
```

Thanks to `ETag`/`If-Match` headers employee will be updated only when its state is not changed between these
 two requests.

Using `@softeq/data-mappers` library this behavior can easily be achieved.
 First of all you have to compose new mapper with *ETag* support 
```javascript
const employeeMapperWithOptimisticLock = httpEtagMapperOf(employeeMapper);
```

and use `employeeMapperWithOptimisticLock` to construct `HttpData` for `PUT` call
```javascript
const johnHttpData = employeeMapperWithOptimisticLock.serialize(john);
```
`HttpData` can be transformed back to the plain JS object for `GET` call
```javascript
const john = employeeMapperWithOptimisticLock.deserialize(johnHttpData);
```
`HttpData` is a library-agnostic structure which does not depend on specific library used for HTTP communications
 under the hood. See the list of supported libraries/frameworks here below.

`HttpData` provides set of `headers` and `body` field for request/response calls.  
`HttpDataMapper.deserialize` method used for `GET` call complements `john` entity by `etag` field having value from `ETag` header.
On the other hand `HttpDataMapper.serialize` method used for `PUT` call moves value from `etag` field to the `If-Match` header.

Although, support of HTTP mappers can sound too complex, it becomes much easier with specific library used for HTTP communications.
For example, for Angular framework real world example with `@softeq/angular-http-data` library looks like

```typescript
class EmployeeRest extends AbstractRestService {
  get(id: number): Observable<Employee> {
    return this.httpGet(`/employees/${id}`, optimisticLockingOf(employeeMapper));
  }

  update(employee: Employee): Observable<Employee> {
    return this.httpPut(`/employees/${employee.id}`, employee, optimisticLockingOf(employeeMapper));
  }
}
```

#### Chained `HttpDataMapper`s

`HttpDataMapper`s can be composed (*chained*) together to create more complex `HttpDataMapper` having several mappings.

For example, back to our employee sample. Imagine we need functionality to delete users.
 We have to use `DELETE` endpoint for this purpose
```
DELETE /employees/1 HTTP/1.1
If-Match: "363d707003c01515b2c627fc15b9e4d88"
```
but this endpoint does not accept body (which is a common practice for `DELETE` endpoints).
Unfortunately `employeeMapperWithOptimisticLock` do generates body,
 but we can add one more `HttpDataMapper`: `httpConstantBodyMapperOf`, like
```javascript
httpConstantBodyMapperOf(httpEtagMapperOf(employeeMapper), undefined);
// or
httpConstantBodyMapperOf(httpEtagMapperOf(employeeMapper));
```
`httpConstantBodyMapperOf` always returns its second argument as HTTP body.
 Now we can use result `DataMapper` for `DELETE` request,
 it behaves as `httpEtagMapperOf` and `httpConstantBodyMapperOf` simultaneously.

Construction of `DataMapper` handling `ETag` and returning empty body can be simplified using `flow` function from `lodash`.
```javascript
const httpEmptyEtagMapperOf = flow(httpConstantBodyMapperOf, httpEtagMapperOf);
```

For `@softeq/angular-http-data` real world example can look like
```typescript
class EmployeeRest extends AbstractRestService {
  remove(employee: Employee): Observable<void> {
    return this.httpDelete(`/employees/${employee.id}`, employee, httpEmptyEtagMapperOf(employeeMapper));
  }
}
```

#### Create custom `HttpDataMapper`

You can write own implementation of `HttpDataMapper`, look at implementation of `ETagHttpDataMapper` or `ConstantBodyHttpDataMapper`.

#### Libraries used for HTTP communications
* Angular, `@softeq/angular-http-data`

## Build

Run `ng build data-mappers-lib` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build data-mappers-lib`, go to the dist folder `cd dist/data-mappers-lib` and run `npm publish`.

## Running unit tests

Run `ng test data-mappers-lib` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
