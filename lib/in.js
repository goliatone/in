/*
 * in
 * https://github.com/goliatone/in
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('gextend');
var exists = require('fs').existsSync;
var resolve = require('path').resolve;

var DEFAULTS = {
    sort: _sort,
    handler: _handler,
    root: process.cwd(),
    normalize: _normalize,
    mount: _mount
};

PluginManager.DEFAULTS = DEFAULTS;

function PluginManager(options, plugins) {

    options = extend({}, DEFAULTS, options);

    var root = options.root;
    var sort = options.sort;
    var mount = options.mount;
    var normalize = options.normalize;

    sort(normalize(plugins)).forEach(function(plugin){
        var id, config, local, npm, plugin;
        for(id in plugin){
            // try {
                config = plugin[id];
                local = resolve(root, id);
                npm = resolve(root, 'node_modules', id);
                plugin = null;

                //TODO: wrap this in try/catch. Error handling more concrete
                try {
                    if(exists(local)) plugin = require(local);
                    else if(exists(local + '.js')) plugin = require(local);
                    else if(exists(npm)) plugin = require(npm);
                    else plugin = require(id);
                } catch(e) {
                    throw new Error('Failed to require plugin: ' + id + '\n\n' + e.message);
                }


                try {
                    mount(plugin, config, options);
                } catch(e){
                    throw new Error('Error running plugin: ' + id + '\n\n' + e.message);
                }

            // } catch(e) {
                // throw new Error('PluginManager failed to require plugin: ' + id + '\n\n' + e.message);
            // }
        }
    });
}

function _sort(plugins){
    return plugins;
}

function _normalize(config){
    if(Array.isArray(config)) return config;

    var plugins = [];
    var plugin, key;

    for(key in config){
        plugin = {};
        plugin[key] = config[key];
        plugins.push(plugin);
    }

    return plugins;
}

function _mount(plugin, config, options){
    return options.handler(plugin(config));
}

function _handler(fn){
    return fn;
}

/**
 * Expose PluginManager
 */
module.exports = PluginManager;
