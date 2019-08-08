# Roadmap

* Clean code
  * Get rid of `void 0` cryptic syntax
  * Use `strictNullChecks` option
* Documenation
  * Document API/generate typedoc?
* Simplify publish process
  * `semantic-release`?
* Actualize `package.json`s
* Integrate CI
* Build process
  * if change time of dependency is later than change time of library, library should be rebuild
* Implement `npm run watch` command
 
## `@softeq/types`

Investigate whether it is possible to integrate types by default without `import`ing.

## `@softeq/data-mappers`

* Serialize simple object into query params
* Support different query params serialization techniques
* Serialize simple object into `FormData`
* Support different `FormData` serialization techniques
* Add support of status and method into `HttpData`

## `@softeq/data-types`

* Make test case library to test `@softeq/data-types` implementations
