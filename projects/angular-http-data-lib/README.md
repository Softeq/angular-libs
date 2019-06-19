# @softeq/angular-http-data

`@softeq/angular-http-data` provides
* base classes to implement common HTTP communications.
* integration of Angular `HttpClient` with `@softeq/data-mappers` library

#### Base classe to implement common HTTP communications

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

2. After library was setup you can create service extended from `AbstractRestService` for REST-like communications
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
   * The last parameter for all `http*` methods is always `DataMapper`  

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
  retrieves response body and transforms it using provided `responseMapper`.

#### Support of pageable REST resources

Tables often show data by pages or have integrated infinite scroll, where only visible part of content is fetched
 from the server.  
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

`AbstractPaginationRestService` is opinionated regarding protcol used for paging.
 It uses `Range` header to perform request.
```
Range: items=0-24
```
The server should respond with a `Content-Range` header to indicate how many items are being returned
 and how many total items exist.

```
Content-Range: items 0-24/66
```

## Code scaffolding

Run `ng generate component component-name --project angular-http-data-lib` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project http-data-lib`.
> Note: Don't forget to add `--project angular-http-data-lib` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build angular-http-data-lib` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build angular-http-data-lib`, go to the dist folder `cd dist/http-data-lib` and run `npm publish`.

## Running unit tests

Run `ng test angular-http-data-lib` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
