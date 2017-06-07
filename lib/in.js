/*
 * in
 * https://github.com/goliatone/in
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */
/*jshint esversion:6*/
'use strict';

const extend = require('gextend');

const join = require('path').join;
const readdir = require('fs').readdir;
const separator = require('path').sep;
const resolve = require('path').resolve;
const exists = require('fs').existsSync;
const isAbsolute = require('path').isAbsolute;
const VError = require('verror');

const EventEmitter = require('events');
const multimatch = require('multimatch');

const _normalize = require('./normalizeArguments');

var DEFAULTS = {
    logger: console,
    autoinitialize: true,
    basepath: process.cwd(),
    normalize: _normalize,
    afterMount: function(){},
    mountHandler: function _mount(bean, context, config={}){
        var plugin = bean.plugin;
        if(typeof bean.config === 'function') return bean.config(plugin, context, config);
        config = extend({}, bean.config, config);
        if(typeof config.mount === 'function') return config.mount(plugin, context, config);
        if(typeof plugin.init === 'function') return plugin.init(context, config);
        return context[bean.id] = plugin;
    },
    sortFilter: function _sortFilter(plugins){
        function filter(a, b) {
            function p(i){
                return i.plugin.priority === undefined ? 0 : i.plugin.priority;
            }
            return p(a) < p(b) ? -1 : 1;
        }
        return plugins.sort(filter);
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

    isPluginId(plugin){
        return plugin.indexOf(separator) === -1;
    }

    normalizePath(path, basepath=this.basepath){
        return resolve(join(basepath, path));
    }
    /**
     *  Public: Scans `target` for files
     *  * `target` {String} Path to scan
     *  Returns Array {Array} Array containing absolute paths to all files in target
     */
    find(target){
        if(!this.isPluginId(target) && !isAbsolute(target)){
            target = this.normalizePath(target, this.basepath);
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
     * @argument {Array} paths Array of paths.
     * @argument {Array} patterns minimatch patterns
     * @return {Promise} Array containing filtered paths.
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

        plugins = this.normalize(plugins, this.basepath);

        this._paths = plugins;
        this._plugins = [];

        var output = Promise.defer();

        plugins.map((bean) => {
            bean.isLocal = true;
            try {
                if(exists(bean.path)){
                    bean.plugin = require(bean.path);
                }
                else if(exists(bean.path + '.js')) {
                    bean.plugin = require(bean.path + '.js');
                }
                else {
                    bean.plugin = require(join(this.basepath, 'node_modules', bean.path));
                    bean.isLocal = false;
                }
            } catch(e) {
                let msg = 'Failed to require plugin "' + bean.id + '": ' + e.message;
                this.logger.error(msg);
                output.reject(new VError(e, msg));
            }
            //TODO: we could have a post require hook, to add meta to each plugin?
            // bean.priority = bean.plugin.priority === undefined ? 0 : bean.plugin.priority;
            // bean.dependencies = bean.plugin.dependencies === undefined ? [] : bean.plugin.dependencies;

            this._plugins.push(bean);
        });

        this.sort(this._plugins);

        output.resolve(this._plugins);

        return output.promise;
    }

    /**
     * Applies `sortFilter` to the passed in
     * list of plugins.
     * You can set `sortFilter` using the config
     * object.
     * The deafult value will sort plugins on a
     * `priority` property.
     *
     * ```js
     * function _sortFilter(a, b) {
     *     function p(i){
     *         return i.priority === undefined ? 0 : i.priority;
     *     }
     *     return p(a) < p(b) ? -1 : 1;
     * }
     * ```
     *
     * Syncronous.
     * @param  {Array} plugins List of plugins.
     * @return {Array} List of ordered plugins.
     */
    sort(plugins){
        return this.sortFilter(plugins);
    }

    /**
     * Provided a list of loaded plugins it
     * will mount them in the provided `context`.
     *
     * It uses `mountHandler` which will do the
     * actual work.
     *
     * You can override `mountHandler` using the
     * config object.
     *
     * @param {Array} plugin List of loaded plugins.
     * @param {Object} config Configuration object.
     * @param {Object} context Passed as argument to
     *                         `mountHandler`
     * @type {Object}
     */
    mount(plugin, config={}, context=this.context){

        config = extend({}, {
            mountHandler: this.mountHandler,
            afterMount: this.afterMount
        }, config);

        let plugins = plugin,
            defer = Promise.defer();

        let {mountHandler} = config;

        if(!Array.isArray(plugins)) plugins = [plugin];

        try {
            plugins.map((plugin) => mountHandler(plugin, context, config));
        } catch(e) {
            defer.reject(new VError(e, 'Error running plugin: ' + plugin.id + '\n\n' + e.message+ '\n\n' + e.stack));
        }

        config.afterMount(context, config);

        defer.resolve(context);

        return defer.promise;
    }

    mountDirectory(directory, options= {}, context=this.context){
        return this.find(directory)
            .then(this.filter)
            .then((plugins) => this.load(plugins, options))
            .then((plugins) => this.mount(plugins, options, context))
    }

    mountList(list, options= {}, context=this.context){
        return this.load(list, options)
            .then((plugins) => this.mount(plugins, options, context))
    }
}

PluginLoader.DEFAULTS = DEFAULTS;


PluginLoader.normalize = _normalize;

/**
 * Expose PluginLoader
 */
module.exports = PluginLoader;
