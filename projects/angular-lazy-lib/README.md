# @softeq/angular-lazy

`@softeq/angular-lazy` allows to load modules lazily without opening of a route.

**Note!!!** There is no any magic in this library and it does rely on `@angular/router` to load modules. This library has strong limitations described here below. **READ THEM BEFORE USING THIS LIBRARY**.

## Description

Let's consider an example to better understand when this library can be helpful.

### Example

We have a huge enterprise application.  
 Its substantial part presents typical web application having a large number of pages (`MAIN` part of our application).  
 Also it has complex component displayed in overlay (or dialog) (`SECONDARY` part of our application).
  Say, this component can display `PDF` and should work with `three.js`.

This way we have two following Angular modules
```
// ====================== app-main.module.ts =========================
@NgModule({
  ...
})
export class AppMainModule {
}

// ====================== app-secondary.module.ts =========================
@NgModule({
  ...
})
export class AppSecondaryModule {
}
```

#### Lazy loading chunks of `MAIN` application part

It is a good solution to split our application on chunks to avoid loading whole application.
  Angular has great and ease to use tools to fulfill this task:
  we can split our application on lazy loaded modules and tell `@angular/router` how and when to load them,
  everything else Angular does for us.

```typescript
// ====================== app-main.module.ts =========================

@NgModule({
  imports: [
    RouterModule.forRoot([{
      path: 'main-part1',
      loadChildren: 'app-main-part1.module#AppPart1Module',
    }, {
      path: 'main-part2',
      loadChildren: 'app-main-part2.module#AppPart2Module',
    }]),
  ]
})
export class AppMainModule {}


// =================== app-main-part1.module.ts ======================

@NgModule({
  imports: [
    RouterModule.forChild([
      ...
    ]),
  ]
})
export class AppMainPart1Module {}

// =================== app-main-part2.module.ts ======================

@NgModule({
  imports: [
    RouterModule.forChild([
      ...
    ]),
  ]
})
export class AppMainPart2Module {}

```

According to this configuration module `AppMainPart1Module` will be loaded when user comes under `/main-part1` route and module `AppMainPart2Module` will be loaded when user comes under `/main-part2` route.

This solution optimizes well `MAIN` part of the application: now we split it on separate chunks loaded only when they are really necessary.

#### Lazy loading of `SECONDARY` application part

The `SECONDARY` part of our application is also very large, because it has pdf support (`pdf.js`), `three.js` and may be some other libraries. Moreover `SECONDARY` part may be necessary only for small part of users. There is no sense to blow up size of application in behalf of functionality which may be necessary only for some users. It would be a good choice to load `SECONDARY` part only when it will be really necessary. The same way as we do for chunks of `MAIN` application part.

So, we need to load `SECONDARY` part of our application lazily. In turn, Angular offers the only standard way to do this: load module lazily when user goes by some route. Lazy loading of modules is deeply integrated into Angular framework and Angular build toolchain.

Unfortunately `SECONDARY` part of application is opened in overlay or dialog rather than by route. Angular does not provide ease to use way to load module without associated route.

### Solution this library proposes

This library proposes a solution to solve problem described here above. So, you can load modules lazily without opening a route.
* this solution is fully integrated into Angular build toolchain
* the irony is that this library still relies on `@angular/router` and it does require at least one route to be defined in loaded module
* this library has strong limitations described here below

Angular module becomes helpful when it does something. Typical Angular module exports services, directives, pipes, and components, There is no exception for lazy loaded module. Typical lazy loaded module embeds (exports) `ROUTES` into parent route configuration.

```typescript
@NgModule({
  RouterModule.forChild([
    { path: 'route1', component: Route1Component }
  ]),
})
export class TypicalLazyLoadedModule {
}
```

In the terms of `@softeq/angular-lazy` library, lazy loaded module exports set of named data, called *lazy symbols*. Each *lazy symbol* has text name and some value. For example, `AppSecondaryModule` can export symbol `TestComponent` (which is an Angular component) under the name `test`.

The following steps describe how to setup this library.

1. Init library in the root application module
    ```typescript
    @NgModule({
      imports: [
        SofteqLazyModule.forRoot(),
      ],
    })
    export class AppMainModule {}
    ```
1. Init library in the lazy loaded module
    ```typescript
    @NgModule({
      imports: [
        SofteqLazyModule.forChild(),
      ],
    })
    export class AppSecondaryModule {}
    ```
1. Add lazy activator route to the lazy loaded module
    ```typescript
    @NgModule({
      imports: [
        SofteqLazyModule.forChild(),
        RouterModule.forChild([
          lazyActivatorRoute,
        ]),
      ],
    })
    export class AppSecondaryModule {}
    ```
1. Add link to the lazy loaded module from the root module
    ```typescript
    @NgModule({
      imports: [
        SofteqLazyModule.forRoot(),
        RouterModule.forRoot([{
          path: 'lazy-loaded',
          loadChildren: 'app-secondary.module#AppSecondaryModule'
        }]),
      ],
    })
    export class AppMainModule {}
    ```
1. Export *lazy symbols* from the lazy loaded module using `LAZY_SYMBOLS` token
    ```typescript
    @NgModule({
      imports: [
        SofteqLazyModule.forChild(),
        RouterModule.forChild([
          lazyActivatorRoute,
        ]),
      ],
      declarations: [
        TestComponent,
      ],
      providers: [
        { provide: LAZY_SYMBOLS, useValue: { test: TestComponent } }, // you can use useFactory instead
      ],
    })
    export class AppSecondaryModule {}
    ```

#### How to load *lazy symbol*

To load *lazy symbol* anywhere in the application, inject `LazyRegistry` service.
```typescript
constructor(private lazyRegistry: LazyRegistry) {}
```

and use it to load *lazy symbol*
```typescript
this.lazyRegistry.load('lazy-loaded', 'test').subscribe((loaded) => {
  loaded.injector; // root Injector of lazy loaded module
  loaded.symbol; // loaded symbol
})
```
parameters of `load` method
* the first parameter is lazy route path (defined in `AppMainModule`)
* the second parameter is a name of exported symbol (all *lazy symbols* were exported under `LAZY_SYMBOLS` token)

`load` method returns pair of `symbol` (`TextComponent` in our case) and `injector`. `injector` is a root injector in lazy loaded module. `Injector` is important to resolve returned `symbol`. 

##### Why do you need `injector` returned by `load` method?

For example, we want to load component from lazy loaded module and create it somewhere in the application.
We can write something like

```typescript
@Component({ ... })
export class SomeAppComponent implements OnInit {
  constructor(private viewContainerRef: ViewContainerRef,
              private lazyRegistry: LazyRegistry,
              // we need componentFactoryResolver to create component dynamically
              private componentFactoryResolver: ComponentFactoryResolver) {
    
  }
  
  ngOnInit(): void {
    // load TestComponent from lazy-loaded module
    this.lazyRegistry.load('lazy-loaded', 'test').subscribe((loaded) => {
      // find ComponentFactory for TestComponent using exported component class
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(loaded.symbol);
      // use ComponentFactory to create component
      this.viewContainerRef.createComponent(componentFatory);
    });
  }
}
```

Actually this code will not work, because `ComponentFactoryResolver` cannot find `ComponentFactory` for component loaded from another module.  
To load `ComponentFactory` correctly, you have to write something like
```typescript
  // take ComponentFactoryResolver from the lazy loaded module
  const componentFactoryResolver = loaded.injector.get(ComponentFactoryResolver);
  // use retrieved ComponentFactoryResolver to find ComponentFactory by the component class
  const componentFactory = componentFactoryResolver.resolveComponentFactory(loaded.symbol);
  // use ComponentFactory to create component
  this.viewContainerRef.createComponent(componentFatory);
```

The same problem will be with services, if you need to resolve service defined in lazy loaded module you have to use returned `injector`.
```typescript
const someServiceDefinedInLazyLoadedModule = loaded.injector.get(loaded.symbol);
```

## Limitations

`@softeq/angular-lazy` relies on `@angular/router`. For example, the following code
```typescript
this.lazyRegistry.load('lazy-loaded', 'test')
```
tries to open route `/lazy-loaded/@lazy-activator`. `@lazy-activator` route is defined by `lazyActivatorRoute` value. Actually, this route will never be opened, because `@lazy-activator` defines `CanActivate` service which **always** returns `false`.

> The only purpose of `@lazy-activator` route is to register `LAZY_SYMBOLS`

There are two known limitations related to this behavior.

1. You cannot use `load` function while you in in process of routing.  
For example, you should not use `load` function in `CanActivate` or `CanDeativate` services, because `load` function will try to start another route. This way you have current route and starts another one. This can break expected behavior and you can get hard to resolve errors.
1. It is a common practice to use `CanDeactivate` handler to suppress leaving of page or some other behavior.
When you call `load` function, `@angular/router` **tries to leave current route** and call its `CanDeactivate` services. Probably, this hardly expected behavior, because `@lazy-activator` route will never be opened. It is recommended to ignore opening of `@lazy-activator` route in your `CanDeactivate` handlers.  
`@softeq/angular-lazy` simplifies this task by providing `isRouterStateLazyActivator` function which determines if url belongs to `@lazy-activator`.
    ```typescript
    @Injectable()
    export class CanDeactivateSample implements CanDeactivate<any> {
      canDeactivate(component: any,
                    route: ActivatedRouteSnapshot,
                    state: RouterStateSnapshot,
                    nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        // always allow any lazy activator route as it never leads to location change
        if (nextState && isRouterStateLazyActivator(nextState)) {
          return true;
        }
    
        ...
      }
    }
    ```

### Do you really need this library?

> In general this library proposes kind of workaround and should be considered as extreme measure. May be it is better to solve initial problem in the field of UX. I believe, even example given here above points to bad UX.
