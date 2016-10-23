const PluginLoader = require('..');
const EventEmitter = require('events');


var app = new EventEmitter();
app.name = 'App';
app.on('plugins.ready', function(){
    app.logger.info('Application plugins loaded');
});

const manager = new PluginLoader({
    context: app,
    basepath: __dirname,
});

console.log('--------- loading plugins --------');
manager.mountDirectory('./plugins')
    .then((context) => {
        console.log('----------------------------------');
        context.emit('plugins.ready');
    })
    .catch(console.error);
