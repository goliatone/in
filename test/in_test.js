'use strict';

var Plugin = require('../index');

var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var fixture = path.resolve.bind(path, __dirname, 'fixtures');



describe('in: Plugin loader', function(){

    describe('load', function(){

        it('should expose DEFAULTS', function(){
            assert.isObject(Plugin.DEFAULTS);
        });

        it('should expose a "normalize" function', function(){
            assert.isFunction(Plugin.normalize);
        });

        it('should expose a "sort" function', function(){
            assert.isFunction(Plugin.sort);
        });

        it('should expose a "handler" function', function(){
            assert.isFunction(Plugin.handler);
        });

        it('should expose a "mount" function', function(){
            assert.isFunction(Plugin.mount);
        });

        it('should have PWD as default root value', function(){
            assert.ok(Plugin.DEFAULTS.root, process.env.PWD)
        });


        describe('∆ normalize', function(){
            it('should return an array if given an array', function(){
                assert.ok(Plugin.normalize([]), []);
            });

            it('should return an array if given an object', function(){
                assert.ok(Plugin.normalize({}), []);
            });

            it('should return an array from object keys', function(){
                var plugins = {
                    './plugins/noop':{},
                    './plugins/noop2':{}
                };

                var expected = [
                    {
                        './plugins/noop':{},
                    },
                    {
                        './plugins/noop2':{}
                    }
                ];

                assert.deepEqual(Plugin.normalize(plugins), expected);
            });

            it('should return an array from complex object keys', function(){
                var plugins = {
                    './plugins/noop': {
                        config:{
                            a: true
                        }
                    },
                    './plugins/noop2':{
                        config:{
                            a: true
                        }
                    }
                };

                var expected = [
                    {
                        './plugins/noop': {
                            config:{
                                a: true
                            }
                        },
                    },
                    {
                        './plugins/noop2':{
                            config:{
                                a: true
                            }
                        }
                    }
                ];

                assert.deepEqual(Plugin.normalize(plugins), expected);
            });
        });

        describe('∆ handler', function(){
            it('default handler should return what it was fed', function(){
                var expected = {};
                assert.equal(Plugin.handler(expected), expected);
            });

        });

        xit('should load plugins', function(done){
            var options = {
                root: process.env.PWD,
                handler: function(plugin){
                    assert.ok(plugin);
                    done();
                }
            };
            var plugins = fixture('local/local.json');
            Plugin(plugins, options);
        });
    });
});