process.env.DEBUG = '*';

const PluginLoader = require('../..');
const EventEmitter = require('events');


var app = new EventEmitter();
app.name = 'App';
app.on('plugins.ready', function(){
    app.logger.info('Application plugins loaded');
    app.debug('Application debug stuffs');
});

const loader = new PluginLoader({
    context: app,
    basepath: __dirname,
    sortFilter: require('../..').sortByDependencies,
    afterMount: function(context){
        context.emit('plugins.ready');
    }
});

var plugins = [
    {
        'debug': function(plugin, context, options){
            console.log('Plugin debug loaded!');
            context.debug = plugin('in-load');
        }
    }
];

loader.mountDirectory('./plugins', {plugins})
    .catch(console.error);
