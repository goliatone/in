# in

Generic plugin loader facility.

## Getting Started
Install the module with: `npm install in`

```javascript
var in = require('in');
```

A plugin should expose a `init` function.
```js
module.exports.init = function(app, config){};
```

A module can expose a `priority` value:
```js
module.exports.priority = 5000;
```


## Documentation

### find
Scan directory for plugins, either as javascript files or under a subdirectory. If in a subdirectory, it will look for an `index.js` file.

### sort

### normalize

### filter

### load

```javascript
{
    id: 'logger',
    path: '/Users/in/examples/plugins/logger.js',
    config: {},
    plugin: { init: [Function], priority: -100 },
    isLocal: true
}
```

### mount


## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.
