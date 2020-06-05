'use strict';

const PluginLoader = require('../..');
const EventEmitter = require('events');

const app = new EventEmitter();
app.name = 'App';

app.on('plugins.ready', _ => {
    console.log('done');
});

const manager = new PluginLoader({
    context: app,
    basepath: __dirname
});

manager.mountDirectory('./commands', {
    mountHandler(plugin, context, config) {
        console.log('load file', plugin.id);
    },
    afterMount: context => context.emit('plugins.ready')
});