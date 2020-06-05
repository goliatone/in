'use strict';

process.env.DEBUG = '*';

const PluginLoader = require('../..');
const EventEmitter = require('events');

const app = new EventEmitter();

app.name = 'App';

app.on('plugins.ready', _ => {
    this.logger.info('Application plugins loaded');
    this.debug('here we are!!');
});

const manager = new PluginLoader({
    context: app,
    basepath: __dirname,
    afterMount: (context) => context.emit('plugins.ready')
});

manager.find('./plugins').then(plugins => {
    plugins.push({
        'debug': function(plugin, context, options) {
            context.debug = plugin('in-load');
        }
    });

    return manager.load(plugins);

}).then(plugins => {
    return manager.mount(plugins);
}).catch(console.error);