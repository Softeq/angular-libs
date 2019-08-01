# Set of Reusable Libraries for Angular

This repository has the following libraries:
* [`@softeq/types`](projects/types-lib/README.md)
* [`@softeq/data-mappers`](projects/data-mappers-lib/README.md)
* [`@softeq/mls`](projects/mls-lib/README.md)
* [`@softeq/data-types`](projects/data-types-lib/README.md)
* [`@softeq/angular-mls-ri`](projects/angular-mls-ri-lib/README.md)
* [`@softeq/angular-http-data`](projects/angular-http-data-lib/README.md)
* [`@softeq/angular-data-types`](projects/angular-data-types-lib/README.md)
* [`@softeq/angular-masked-data-types`](projects/angular-masked-data-types-lib/README.md)
* [`@softeq/angular-lazy`](projects/angular-lazy-lib/README.md)

## How to develop

This library defines set of commands to make development easier.

#### build
```
npm run build -- [library name]
npm run build -- data-types-lib  
npm run build -- angular-masked-data-types-lib
``` 
Builds library and its dependencies.

#### test
```
npm run test -- [library name]
npm run test -- data-types-lib  
npm run test -- angular-masked-data-types-lib
``` 
Builds library dependencies and runs its tests

#### prepare
```
npm run prepare -- [library name]
npm run prepare -- data-types-lib  
npm run prepare -- angular-masked-data-types-lib
``` 
Prepares library for publishing, built library can be found in `dist` directory
