/*jshint esversion:6*/
'use strict';

function getIdFromPath(plugin) {
    const path = require('path');
    const basename = path.basename(plugin);
    const extname = path.extname(basename);
    return basename.replace(extname, '');
}

function normalizePath(plugin, basepath) {
    const path = require('path');
    if (plugin.indexOf(path.sep) === -1) return plugin;
    if (path.isAbsolute(plugin)) return plugin;
    return path.resolve(path.join(basepath, plugin));
}

/**
 * This function will create the bean object for
 * each path.
 * 
 * @param {Array} plugins List of globbed plugins
 * @param {String} basepath Base path for plugin location
 */
function normalizeArguments(plugins, basepath) {

    if (typeof plugins === 'string') plugins = [plugins];

    //TODO: use assert-is
    if (Array.isArray(plugins)) {
        return plugins.map((plugin) => {
            let out = {};
            if (typeof plugin === 'string') {
                out = {
                    id: getIdFromPath(plugin),
                    path: normalizePath(plugin, basepath),
                    config: {}
                };
            }
            if (typeof plugin === 'object') {
                for (let id in plugin) {
                    out = {
                        id: getIdFromPath(id),
                        path: id,
                        config: plugin[id]
                    };
                }
            }
            return out;
        });
    }

    if (typeof plugins === 'object') {
        let out = [];
        let plugin, key;
        for (key in plugins) {
            plugin = {
                id: getIdFromPath(key),
                path: normalizePath(key, basepath),
                config: plugins[key]
            };
            out.push(plugin);
        }

        return out;
    }
}

module.exports = normalizeArguments;

module.exports.normalizePath = normalizePath;
module.exports.getIdFromPath = getIdFromPath;