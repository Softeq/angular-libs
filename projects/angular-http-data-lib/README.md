# @softeq/angular-http-data

`@softeq/angular-http-data` provides
* base classes to implement common HTTP communications.
* integration of Angular `HttpClient` with [`@softeq/data-mappers`](../data-mappers-lib/README.md) library

#### Base classes to implement common HTTP communications

This library provides helpers to implement REST-like communications.
1. First of all you have to setup this library.
   ```typescript
   @NgModule({
     imports: [
       SofteqHttpDataModule.forRoot({
         baseUrl: 'https://api.example.com',
       }),
       ...
     ],
     ...   
   })
   ```
   where `baseUrl` points to basic part of URL all subsequent requests will be resolved upon.

2. Create service that extends `AbstractRestService`
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
   where `httpGet` and `httpPut` methods accept
   * URL resolved upon `baseUrl`.
   * body (only for `httpPut` method)
   * `DataMapper` (the last parameter for all `http*` methods)  

There are several `http*` methods defined in `AbstractRestService`:
* `httpGet` for `GET` request
* `httpPost` for `POST` request
* `httpPut` for `PUT` request
* `httpDelete` for `DELETE` request
* `httpRequest` allows to send request of any method.

#### Integration of Angular `HttpClient` with `@softeq/data-mappers`

If you want to use `DataMapper`s, but do not like `AbstractRestService` you can use `DataMapper`s directly with `HttpClient`,
but in this case you have to map requests/responses manually.

* In order to map `HttpRequest`
  ```
  mergeRequestWithMapper<S, R>(request: HttpRequest<S>,
                               requestMapper?: HttpDataMapper<S>,
                               responesMapper?: HttpDataMapper<R>): HttpRequest<any>
  ```
  transforms body of request using given `requestMapper`,  
  `responseMapper` is optional here,
  but sometimes it is necessary to define correct `responseType` of `HttpRequest` (only for non-`json` `responseType`).
* In order to map `HttpResponse`
  ```
  parseResponseWithMapper<T>(response: HttpResponse<T>,
                             responseMapper?: HttpDataMapper<T>): T
  ```
  transforms response using provided `responseMapper`.

#### Support of pageable REST resources

Tables often show data by pages or have infinite scroll, where only visible part of content is fetched from the server.  
In both cases we have to return data by chunks. `@softeq/angular-http-data` library provides `AbstractPaginationRestService`
 to implement such behavior.

Look at the following example
```typescript
class EmployeeRest extends AbstractPaginationRestService {
  findAllByNameAsDataSource(name: string): SlicedDataSource {
    return this.createSlicedDataSourceGet(`/employees`, { name }, identityMapper(), arrayMapperOf(employeeMapper));
  }
}
```

Here we use `createSlicedDataSourceGet` method which
* accepts URL of the target endpoint
* accepts request body (for `GET` request body is merged into URL as query parameters)
* accepts `DataMapper` for request body
* accepts `DataMapper` for response body (body is always array of data)
* returns `SlicedDataSource`.

`SlicedDataSource` allows to `select` data by chunks
```typescript
const dataSource = this.employeeRest.findAllByNameAsDataSource('John');
const slicedData$ = dataSource.select({
  from: 0,
  to: 25,
  sorting: { field: 'name', direction: SortDirection.Descending },
});

slicedData$.subscribe((slicedData: SlicedData) => {
  slicedData.data; // chunk of returned data
  slicedData.total; // total number of data
});
```

There are several `createSlicedDataSource*` methods defined in `AbstractPaginationRestService`:
* `createSlicedDataSourceGet` for `GET` request
* `createSlicedDataSourcePut` for `PUT` request
* `createSlicedDataSourcePost` for `POST` request
* `createSlicedDataSource` allows to send request of any method

##### Protocol `AbstractPaginationRestService` relies on
`AbstractPaginationRestService` is opinionated regarding protocol used for paging.
 It uses `Range` header to perform request.
```
Range: items=0-24
```
The server should respond with a `Content-Range` header to indicate how many items are being returned
 and how many total items exist.

```
Content-Range: items 0-24/66
```

Body of response should be a chunk (`Array`) of retrieved data.
```json
[
  {
    "id": 1,
    "name": "John"
  },
  {
    "id": 2,
    "name": "Mark"
  },
  ...
]
```
