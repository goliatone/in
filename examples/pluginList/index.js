process.env.DEBUG = '*';

const PluginLoader = require('../..');
const EventEmitter = require('events');


var app = new EventEmitter();
app.name = 'App';
app.on('plugins.ready', function(){
    app.logger.info('Application plugins loaded');
});

const loader = new PluginLoader({
    context: app,
    basepath: __dirname,
    afterMount: function(context){
        context.emit('plugins.ready');
    }
});

var plugins = [
    './repl',
    './pubsub',
    './logger',
    './authentication'
];

loader.mountList(plugins, {}, app)
    .catch(console.error);
