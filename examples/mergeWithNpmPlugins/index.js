'use strict';

process.env.DEBUG = '*';

const PluginLoader = require('../..');
const EventEmitter = require('events');


const app = new EventEmitter();

app.name = 'App';
app.on('plugins.ready', _ => {
    this.logger.info('Application plugins loaded');
    this.debug('Application debug stuffs');
});

const loader = new PluginLoader({
    context: app,
    basepath: __dirname,
    afterMount: function(context) {
        context.emit('plugins.ready');
    }
});

const plugins = [{
    'debug': function(plugin, context, options) {
        console.log('Plugin debug loaded!');
        context.debug = plugin('in-load');
    }
}];

loader.mountDirectory('./plugins', { plugins })
    .catch(console.error);