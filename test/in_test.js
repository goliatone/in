'use strict';

var Plugin = require('../index');

var fs = require('fs');
var sinon = require('sinon');
var path = require('path');
var assert = require('chai').assert;
var fixture = path.resolve.bind(path, __dirname, 'fixtures');

describe('in: Plugin loader', function(){

    describe('load', function(){

        it('should expose DEFAULTS', function(){
            assert.isObject(Plugin.DEFAULTS);
        });

        it('should expose a "normalize" function', function(){
            assert.isFunction(Plugin.normalize);
        });

        describe('∆ normalize', function(){
            it('should return an array if given an array', function(){
                assert.ok(Plugin.normalize([]), []);
            });

            it('should return an array if given an object', function(){
                assert.ok(Plugin.normalize({}), []);
            });

            it('should return a normalized array from a String', function(){
                var plugins = '/Users/application/plugins/authentication';
                var expected = [
                    {
                        "id": "authentication",
                        "path": "/Users/application/plugins/authentication",
                        "config": {}
                    }
                ];

                assert.deepEqual(Plugin.normalize(plugins), expected);
            });

            it('should normalize an array of paths', function(){
                var plugins = ['/Users/application/plugins/authentication'];

                var expected = [
                    {
                        "id": "authentication",
                        "path": "/Users/application/plugins/authentication",
                        "config": {}
                    }
                ];

                assert.deepEqual(Plugin.normalize(plugins), expected);
            });

            it('should return an array from complex object keys', function(){
                var plugins = {
                    '/Users/application/plugins/authentication': { hash: 'sh1' }
                };

                var expected = [
                    {
                        "id": "authentication",
                        "path": "/Users/application/plugins/authentication",
                        "config": {
                            "hash": "sh1"
                        }
                    }
                ];

                assert.deepEqual(Plugin.normalize(plugins), expected);
            });
        });

        describe('∆ mountHandler', function(){
            it('default mountHandler should call bean.init', function(){

                var bean = {
                    plugin: {
                        init: function(context, config){}
                    }
                };
                var config = {};
                var context = {};

                var spy = sinon.spy(bean.plugin, 'init');

                Plugin.DEFAULTS.mountHandler(bean, context, config);

                assert.ok(spy.calledOnce);
                assert.ok(spy.calledWith(config, context));
            });

            it('default mountHandler should call bean.config if its a function', function(){

                var bean = {
                    config: function(context, config){},
                    plugin: {}
                };
                var config = {};
                var context = {};

                var spy = sinon.spy(bean, 'config');

                Plugin.DEFAULTS.mountHandler(bean, context, config);

                assert.ok(spy.calledOnce);
                assert.ok(spy.calledWith(bean.plugin, config, context));
            });

            it('default mountHandler should call bean.config.mount if its a function', function(){

                var bean = {
                    config: {
                        mount: function(context, config){}
                    },
                    plugin: {}
                };
                var config = {};
                var context = {};

                var spy = sinon.spy(bean.config, 'mount');

                Plugin.DEFAULTS.mountHandler(bean, context, config);

                assert.ok(spy.calledOnce);
            });

            it('default mountHandler should add a property in context with the plugin', function(){

                var bean = {
                    id: 'plugin',
                    plugin: {}
                };
                var config = {};
                var context = {};

                Plugin.DEFAULTS.mountHandler(bean, context, config);

                assert.ok(context.plugin === bean.plugin);
            });
        });

        describe('∆ sortFilter', function(){
            it('default sortFilter should sort based on negative priority', function(){
                var plugins = [
                    {id: 'a', priority: -100},
                    {id: 'c', priority: 100},
                    {id: 'b'},
                ];
                var expected = [
                    {id: 'a', priority: -100},
                    {id: 'b' },
                    {id: 'c', priority: 100},
                ];

                plugins.sort(Plugin.DEFAULTS.sortFilter);
                assert.deepEqual(plugins, expected);
            });
        });

        describe('∆ find', function(){
            it('should list plugins in a given directory', function(done){
                var loader = new Plugin({
                    basepath: __dirname
                });

                var expected = [
                    'authentication',
                    'logger.js',
                    'pubsub.js',
                    'repl.js'
                ];

                loader.find('./fixtures/mountDirectory/plugins').then((plugins)=>{
                    plugins = plugins.map((plugin) => require('path').basename(plugin));
                    assert.deepEqual(expected, plugins);
                    done()
                }).catch(done);
            });
        });

        describe('∆ filter', function(){
            it('should list plugins in a given directory', function(done){
                var loader = new Plugin({
                    basepath: __dirname
                });
                var paths = [
                    'authentication',
                    'logger.js',
                    'pubsub.js',
                    'repl.js'
                ];

                var expected = [
                    'authentication',
                ];

                loader.filter(paths, ['**', '!*.js']).then((plugins)=>{
                    assert.deepEqual(expected, plugins);
                    done()
                }).catch(done);
            });
        });
    });
});
