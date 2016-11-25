/*jshint esversion:6*/
'use strict';

function normalizeArguments(plugins, basepath){
    function getIdFromPath(plugin){
        var path = require('path');
        var basename = path.basename(plugin);
        var extname = path.extname(basename);
        return basename.replace(extname, '');
    }

    if(typeof plugins === 'string') plugins = [plugins];

    function normalizePath(plugin){
        var path = require('path');
        if(plugin.indexOf(path.sep) === -1) return plugin;
        if(path.isAbsolute(plugin)) return plugin;
        return path.resolve(path.join(basepath, plugin));
    }

    //TODO: use assert-is
    if(Array.isArray(plugins)){
        return plugins.map((plugin) => {
            var out = {};
            if(typeof plugin === 'string') {
                out = {
                    id: getIdFromPath(plugin),
                    path: normalizePath(plugin),
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
                path: normalizePath(key),
                config: plugins[key]
            };
            out.push(plugin);
        }

        return out;
    }
}

module.exports = normalizeArguments;
