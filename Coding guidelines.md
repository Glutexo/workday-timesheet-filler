# Coding guidelines #

## JavaScript ##

### Program as a whole ###

Everything is encapsulated in a function to protect the global namespace.  Strict mode is used.

```javascript
(function() {
    'use strict';
    // Everything goes in here.
})();
```

### Tiny bits ###

Strings are enclosed in single quotes.

```javascript
'string'
```
