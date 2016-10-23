# in

Generic plugin loader facility.


<!-- toc orderedList:0 -->

- [in](#in)
	- [Getting Started](#getting-started)
	- [Documentation](#documentation)
		- [constructor options](#constructor-options)
		- [context](#context)
		- [mountDirectory(directory,options,context)](#mountdirectorydirectoryoptionscontext)
		- [find(directory)](#finddirectory)
		- [sort(plugins)](#sortplugins)
			- [sortFilter](#sortfilter)
		- [normalize(plugins)](#normalizeplugins)
			- [String](#string)
			- [Array](#array)
			- [Object](#object)
			- [Mixed](#mixed)
		- [filter(plugins)](#filterplugins)
		- [load(plugins, options={})](#loadplugins-options)
		- [mount](#mount)
		- [mountHandler](#mounthandler)
	- [Examples](#examples)
	- [Release History](#release-history)
	- [License](#license)

<!-- tocstop -->


## Getting Started
Install the module with: `npm install in`

```javascript
var PluginLoader = require('in');
```

A plugin should expose a `init` function.
```js
module.exports.init = function(app, config){};
```

A module can expose a `priority` value:
```js
module.exports.priority = 5000;
```
A negative value indicates a higher priority

## Documentation

A plugin is nothing more than a regular Node module. By default, we expect plugins to expose an `init` function that takes two arguments:

* [context](#context)
* config

### constructor options

* [context](#context)
* [basepath](#basepath)
* [normalize](#normalizeplugins)
* [mountHandler](#mounthandler)
* [sortFilter](#sortfilter)

### context
This is where all plugins will be mounted. This would normally be your application instance.

### mountDirectory(directory,options,context)
It will mount all plugins found in directory into the provided context.

This is in effect applying [find](#finddirectory), [filter](#filterplugins), [load](#loadplugins-options), [sort](#sortplugins), and [mount](#mount) in that order.

### find(directory)

Scans a directory for files and directories, returning a list of absolute paths to the files.
It `target` is not an absolute path, we resolve it against `basepath`.

### sort(plugins)
Sorts an array of plugins after they have been loaded. By default it uses `sortFilter`:

#### sortFilter
```js
function _sortFilter(a, b) {
	return a.priority < b.priority ? -1 : 1;
}
```

### normalize(plugins)
When we call load we apply the `normalize` function which will ensures that `plugins` can be any of the following:

#### String
```js
var plugins = '/Users/application/plugins/authentication';
```

Output after calling `normalize`:

```js
[
    {
        "id": "authentication",
        "path": "/Users/application/plugins/authentication",
        "config": {}
    }
]
```

#### Array
```js
var plugins = ['/Users/application/plugins/authentication'];
```

Output after calling `normalize`:

```js
[
    {
        "id": "authentication",
        "path": "/Users/application/plugins/authentication",
        "config": {}
    }
]
```

#### Object
```js
var plugins = {
    '/Users/application/plugins/authentication': { hash: 'sh1' }
};
```

Output after calling `normalize`:

```js
[
    {
        "id": "authentication",
        "path": "/Users/application/plugins/authentication",
        "config": {
            "hash": "sh1"
        }
    }
]
```

#### Mixed
```js
var plugins = [
    {'/Users/application/plugins/authentication':{ hash: 'sh1' }},
    'debug'
];
```

Output after calling `normalize`:

```js
[
    {
        "id": "authentication",
        "path": "/Users/application/plugins/authentication",
        "config": {
            "hash": "sh1"
        }
    },
    {
        "id": "debug",
        "path": "debug",
        "config": {}
    }
]
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
	var plugin = bean.plugin;
	if(typeof bean.config === 'function') return bean.config(plugin, context, config);
	if(typeof bean.config.mount === 'function') return bean.config.mount(plugin, context, config);
	if(typeof plugin.init === 'function') return plugin.init(context, config);
	return context[bean.id] = plugin;
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
* 2016-10-23: v0.4.0 Mayor update
    * Added examples
    * Added documentation
    * Added `mountDirectory`

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.

[examples]: ./examples
