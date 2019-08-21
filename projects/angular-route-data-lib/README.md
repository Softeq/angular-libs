# @softeq/angular-route-data

`@softeq/angular-route-data` allows to keep URL up to date with the page content.

#### Motivation

Let's consider the following example to understand what problem this library tries to solve.  
Imagine we have a page under the round `/heroes` displaying list of heroes and toggle that allows to *show only active heroes*.

![](docs/angular-route-data.png)

When user turns switch on we need to update URL to `/heroes?onlyActive=true`. In addition user expects when he pastes this URL into browser address bar he goes to the same page having switch *show only active heroes* on.  
In the real world page can have more criteria, like name of hero, set of checkboxes, etc.
Such behavior allows user to keep bookmarkable URLs or send URLs via messenger. For developer it can simplify implementation of back behavior (when user press on browser *back* button).

*DOCUMENTATION IS IN PROGRESS*
