/*jshint esversion:6*/
'use strict';

var Plugin = require('..');

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
                var loader = new Plugin();

                var plugins = [
                    {id: 'a', plugin: { priority: -100}},
                    {id: 'c', plugin: { priority: 100}},
                    {id: 'b', plugin:{}},
                ];
                var expected = [
                    {id: 'a', plugin: { priority: -100}},
                    {id: 'b' , plugin:{}},
                    {id: 'c', plugin: { priority: 100}},
                ];

                loader.sort(plugins);
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
                    assert.deepEqual(plugins, expected);
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
                    assert.deepEqual(plugins, expected);
                    done()
                }).catch(done);
            });
        });
    });

    describe('∆ mount', function(){
        it('should mount plugins in a given directory', function(done){
            var loader = new Plugin({
                basepath: __dirname
            });
            var paths = [
                './fixtures/mountDirectory/plugins/authentication',
                './fixtures/mountDirectory/plugins/logger.js',
                './fixtures/mountDirectory/plugins/pubsub.js',
                './fixtures/mountDirectory/plugins/repl.js'
            ];

            var expected = ['logger', 'repl', 'pubsub', 'authentication'];

            loader.load(paths).then((plugins)=>{
                loader.mount(plugins).then((_)=>{
                    var res = [];
                    plugins.map((plugin)=> res.push(plugin.id));
                    assert.deepEqual(res, expected);
                    done()
                }).catch(done);
            });
        });

        it('should mount plugins in a given directory using mountHandler', function(done){
            var loader = new Plugin({
                basepath: __dirname,
                mountHandler: function _mount(bean, context){
                    return bean.plugin;
                },
            });
            var paths = [
                './fixtures/mountDirectory/plugins/authentication',
                './fixtures/mountDirectory/plugins/logger.js',
                './fixtures/mountDirectory/plugins/pubsub.js',
                './fixtures/mountDirectory/plugins/repl.js'
            ];

            var expected = ['logger', 'repl', 'pubsub', 'authentication'];

            loader.load(paths).then((plugins)=>{
                loader.mount(plugins).then((_)=>{
                    var res = [];
                    plugins.map((plugin)=> res.push(plugin.id));
                    assert.deepEqual(expected, res);
                    done()
                }).catch(done);
            }).catch(done);
        });

        it('should call afterMount', function(done){
            var spy = sinon.spy();

            var loader = new Plugin({
                basepath: __dirname,
                mountHandler: function _mount(bean, context){
                    return bean.plugin;
                },
                afterMount: spy
            });

            var paths = [
                './fixtures/mountDirectory/plugins/authentication',
                './fixtures/mountDirectory/plugins/logger.js',
                './fixtures/mountDirectory/plugins/pubsub.js',
                './fixtures/mountDirectory/plugins/repl.js'
            ];

            loader.load(paths).then((plugins)=>{
                loader.mount(plugins).then((_)=>{
                    assert.ok(spy.calledOnce);
                    done();
                }).catch(done);
            }).catch(done);
        });

        it('should call afterMount passed in options', function(done){
            var spy = sinon.spy();

            var options = {
                afterMount: spy
            };

            var loader = new Plugin({
                basepath: __dirname,
                mountHandler: function _mount(bean, context){
                    return bean.plugin;
                }
            });

            var paths = [
                './fixtures/mountDirectory/plugins/authentication',
                './fixtures/mountDirectory/plugins/logger.js',
                './fixtures/mountDirectory/plugins/pubsub.js',
                './fixtures/mountDirectory/plugins/repl.js'
            ];

            loader.load(paths).then((plugins)=>{
                loader.mount(plugins, options).then((_)=>{
                    assert.ok(spy.calledOnce);
                    done();
                }).catch(done);
            }).catch(done);
        });
    });

    describe('∆ sortByDependencies', function(){

        it('should sort using dependencies', function(){
            var loader = new Plugin({
                sortFilter: require('..').sortByDependencies
            });
            var plugins = [ { id: 'authentication',
                priority: 500,
                plugin: {dependencies: ['logger', 'persistence']}
                },
              { id: 'logger',
                priority: -100,
                plugin: { dependencies: []} },
              { id: 'pubsub',
                priority: 0,
                plugin: { dependencies: ['logger']} },
              { id: 'persistence',
                priority: 0,
                plugin: { dependencies: ['logger'] } },
              { id: 'repl',
                priority: 0,
                plugin: { dependencies: ['logger']}
                } ];

            var expected = [ { id: 'logger',
                priority: 5,
                plugin: { dependencies: [] }},
                { id: 'persistence',
                priority: 1,
                plugin: { dependencies: [ 'logger' ] }},
                { id: 'authentication',
                priority: 0,
                plugin: { dependencies: [ 'logger', 'persistence' ] }},
                { id: 'pubsub',
                priority: 0,
                plugin: { dependencies: [ 'logger' ] }},
                { id: 'repl',
                priority: 0,
                plugin: { dependencies: [ 'logger' ] }
            } ];

            var result = loader.sort(plugins);

            assert.deepEqual(result, expected);
        });

        it.only('should sort modules with no declared dependencies', function(){
            var loader = new Plugin({
                sortFilter: require('..').sortByDependencies
            });

            var plugins = [
              { id: 'authentication',
                plugin: {}},
              { id: 'logger',
                plugin: {} },
              { id: 'pubsub',
                plugin: {} },
              { id: 'persistence',
                plugin: {} },
              { id: 'repl',
                plugin: {},
            }];

            var expected = [
                { id: 'authentication',
                    priority: 0,
                  plugin: {}},
                { id: 'logger',
                    priority: 0,
                  plugin: {} },
                { id: 'pubsub',
                    priority: 0,
                  plugin: {} },
                { id: 'persistence',
                    priority: 0,
                  plugin: {} },
                { id: 'repl',
                    priority: 0,
                    plugin: {},
            } ];

            var result = loader.sort(plugins);

            assert.deepEqual(result, expected);
        });

        it('should order paths based on dependencies', function(done){
            var loader = new Plugin({
                basepath: __dirname,
                sortFilter: require('..').sortByDependencies,
                mountHandler: function _mount(bean, context){
                    return bean.plugin;
                }
            });

            var paths = [
                './fixtures/sortByDependencies/plugins/repl.js',
                './fixtures/sortByDependencies/plugins/logger.js',
                './fixtures/sortByDependencies/plugins/pubsub.js',
                './fixtures/sortByDependencies/plugins/authentication',
                './fixtures/sortByDependencies/plugins/persistence.js'
            ];

            var expected = ['logger', 'persistence', 'repl', 'pubsub', 'authentication'];

            loader.load(paths).then((plugins)=>{
                var result = plugins.map((plugin) => plugin.id);
                assert.deepEqual(result, expected);
                done();
            }).catch(done);
        });
    });
});
