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

A plugin is nothing more than a regular Node module.

### constructor options

* [context][#context]
* [`basepath`][#basepath]
* [`normalize`][#normalize]
* [`mountHandler`][#mountHandler]
* [`sortFilter`][#sortFilter]

### mountDirectory(directory, options= {}, context=this.context)
It will mount all plugins found in directory into the provided context.

This is in effect applying [find][#find], [filter][#filter], [load][#load], and [mount][#mount] in that order.

### find(directory)

Scans a directory for files and directories, returning a list of absolute paths to the files.
It `target` is not an absolute path, we resolve it against `basepath`.

### sort(plugins)
Sorts an array of plugins after they have been loaded. By default it uses `sortFilter`:

```js
function _sortFilter(a, b) {
    //this assumes we have right plugin structure :)
    var ap = a.plugin.priority === undefined ? 0 : a.plugin.priority;
    var bp = b.plugin.priority === undefined ? 0 : b.plugin.priority;
    return ap < bp ? -1 : 1;
}
```

### normalize(plugins)
When we call load we apply the `normalize` function which will ensures that `plugins` can be any of the following:

#### String:
```js
var plugins = '/Users/application/plugins/authentication';
```
#### Array:
```js
var plugins = ['/Users/application/plugins/authentication'];
```
#### Object:
```js
var plugins = {
    '/Users/application/plugins/authentication': {hash: 'sh1'}
};
```

#### Mixed:
```js
var plugins = [
    {'/Users/application/plugins/authentication':{hash:'sh1'}},
    'debug'
];
```

### filter(plugins)

Public: Apply `minimatch` patterns against `paths`, an array of paths. The default pattern is `['**', '!node_modules', '!.git']`
Returns a `Promise` which once resolved will contain an Array of filtered paths.

### load(plugins, options={})
Given a list of plugins, create a plugin object with metadata and the result of `require`ing the module.

We create a bean per plugin:
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
Makes plugins available to the provided context by calling `mountHandler` to previously loaded plugins.

### mountHandler
Adds a `plugin` to the provided `context`.
```js
function _mount(bean, context, config={}){
    config = extend({}, bean.config, config);
    return bean.plugin.init(context, config);
}
```

## Examples
Look at the [examples][examples] directory. Run it with `node examples/index.js`.

Directory structure:

- index.js
- plugins
    - repl.js
    - pubsub.js
    - logger.js
    - authentication
        - index.js

```js
const PluginManager = require('..');
const EventEmitter = require('events');

var app = new EventEmitter();
app.on('plugins.ready', function(){
    app.logger.info('Application plugins loaded');
});

const manager = new PluginManager({
    context: app,
    basepath: __dirname,
});

manager.mountDirectory('./plugins')
    .then((context) => {
        context.emit('plugins.ready');
    })
    .catch(console.error);
```

```js
module.exports.init = function(app, config){
    app.logger = console;
    app.logger.info('Plugin logger loaded!');
};

module.exports.priority = -100;
```

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.

[examples]: ./examples
