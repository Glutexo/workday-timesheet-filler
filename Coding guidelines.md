# Coding guidelines #

## JavaScript ##

### Program as a whole ###

Everything is encapsulated in a function to protect the global namespace.
Strict mode is used.

```javascript
(function() {
    'use strict';
    // Everything goes in here.
})();
```

### Architecture ###

Dictionaries are used for namespaces. They are initialized empty and then keys
are added separatly. That saves one level of indentation and allows to keep the
functions together consistently.

```javascript
const ui = {};
ui.myFunction = function () {};
```

### Tiny bits ###

Strings are enclosed in single quotes.

```javascript
'string'
```

Instructions are terminated with a semicolon.

```javascript
a = 'b';
doThis();
```

Function calls and named definitions have parentheses immediately after the
name  without spaces. Anonymous functions have a single space between the
_function_ keyword and the parentheses.

```javascript
function doThis() {};
doThis();

const doThat = function () {};
```
