/*
 * in
 * https://github.com/goliatone/in
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

const extend = require('gextend');

const join = require('path').join;
const readdir = require('fs').readdir;
const resolve = require('path').resolve;
const exists = require('fs').existsSync;
const isAbsolute = require('path').isAbsolute;

const EventEmitter = require('events');
const multimatch = require('multimatch');

var DEFAULTS = {
    autoinitialize: true,
    basepath: process.cwd(),
    normalize: _normalize,
    logger: console,
    afterMount: function(){},
    mountHandler: function _mount(bean, context, config={}){
        config = extend({}, bean.config, config);
        var plugin = bean.plugin;
        if(typeof bean.config === 'function') return bean.config(plugin, context, config);
        if(typeof bean.config.mount === 'function') return bean.config.mount(plugin, context, config);
        if(typeof plugin.init === 'function') return plugin.init(context, config);
        return context[bean.id] = plugin;
    },
    sortFilter: function _sortFilter(a, b) {
        return a.priority < b.priority ? -1 : 1;
    }
};

class PluginLoader {
    constructor(config){
        config = extend({}, DEFAULTS, config);
        if(config.autoinitialize) this.init(config);
    }

    init(options = {}){

        this.context = new EventEmitter();

        extend(this, options);
    }

    /**
     *  Public: Scans `target` for files
     *  * `target` {String} Path to scan
     *  Returns Arrat {Array} Arrat containing absolute paths to all files in target
     */
    find(target){
        if(!isAbsolute(target)){
            target = resolve(join(this.basepath, target));
        }

        return new Promise(function(resolve, reject){
            readdir(target, function(err, list){
                if(err) return reject(err);
                list = list.map((f) => join(target, f));
                resolve(list);
            });
        });
    }

    /**
     *  Public: Apply `minimatch` patterns against `paths`,
     *  an array of paths.
     *  The default pattern is `['**', '!node_modules', '!.git']`
     *  * `paths` {Array} Array of paths
     *  * `patterns=['**', '!node_modules', '!.git']` {Array} `minimatch` patterns
     *
     *  Returns [Promise] {Array} Array containing filtered paths.
     */
    filter(paths, patterns = ['**', '!node_modules', '!.git']){
        return Promise.resolve(multimatch(paths, patterns));
    }

    /**
     * Collect all plugins into an array.
     *
     * @type {Object}
     */
    load(plugins=[], options={}){
        options = extend({}, DEFAULTS, options);

        if(plugins.length === 0) this.logger.warn('PluginLoader: no plugins provided');

        var basepath = options.basepath || this.basepath;

        if(options.plugins){
            plugins = plugins.concat(options.plugins);
        }
        plugins = this.normalize(plugins);
console.log(plugins);
        this._paths = plugins;
        this._plugins = [];

        var output = Promise.defer();

        plugins.map((bean) =>{
            bean.isLocal = true;
            try {
                if(exists(bean.path)){
                    bean.plugin = require(bean.path);
                }
                else if(exists(bean.path + '.js')){
                    bean.plugin = require(bean.path + '.js');
                }
                else {
                    bean.plugin = require(join(this.basepath, 'node_modules', bean.path));
                    bean.isLocal = false;
                }
            } catch(e) {
                output.reject(new Error('Failed to require plugin: ' + bean.id + '\n\n' + e.message));
            }
            //TODO: Do we really want to do this? If so, we are effectively
            //making a choice on how a plugin module must look...
            bean.priority = bean.plugin.priority === undefined ? 0 : bean.plugin.priority;

            this._plugins.push(bean);
        });

        this.sort(this._plugins);

        output.resolve(this._plugins);

        return output.promise;
    }

    sort(plugins){
        return plugins.sort(this.sortFilter);
    }

    mount(plugin, config={}, context=this.context){
        var plugins = plugin,
            defer = Promise.defer();

        if(!Array.isArray(plugins)) plugins = [plugin];

        try {
            plugins.map((plugin) => this.mountHandler(plugin, context, config));
        } catch(e){
            defer.reject(new Error('Error running plugin: ' + plugin.id + '\n\n' + e.message+ '\n\n' + e.stack));
        }

        this.afterMount(context);

        defer.resolve(context);
        return defer.promise;
    }

    mountDirectory(directory, options= {}, context=this.context){
        return this.find(directory)
            .then(this.filter)
            .then((plugins) => this.load(plugins, options))
            .then((plugins) => this.mount(plugins, options, context))
    }
}

PluginLoader.DEFAULTS = DEFAULTS;




function _normalize(plugins){
    function getIdFromPath(plugin){
        var path = require('path');
        var basename = path.basename(plugin);
        var extname = path.extname(basename);
        return basename.replace(extname, '');
    }

    if(typeof plugins === 'string') plugins = [plugins];

    //TODO: use assert-is
    if(Array.isArray(plugins)){
        return plugins.map((plugin) => {
            var out = {};
            if(typeof plugin === 'string') {
                out = {
                    id: getIdFromPath(plugin),
                    path: plugin,
                    config: {}
                };
            }
            if(typeof plugin === 'object') {
                for(var id in plugin){
                    out = {
                        id: getIdFromPath(id),
                        path: id,
                        config: plugin[id]
                    }
                }
            }
            return out;
        });
    }

    if(typeof plugins === 'object'){
        var out = [];
        var plugin, key;
        for(key in plugins){
            plugin = {
                id: getIdFromPath(key),
                path: key,
                config: plugins[key]
            };
            out.push(plugin);
        }

        return out;
    }
}

PluginLoader.normalize = _normalize;

/**
 * Expose PluginLoader
 */
module.exports = PluginLoader;
