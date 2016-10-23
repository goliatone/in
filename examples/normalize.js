
var normalize = require('..').normalize;

var paths = [
    '/Users/application/plugins/authentication',
    '/Users/application/plugins/logger.js',
    '/Users/application/plugins/pubsub.js',
    'debug'
];


var mixed = [
    '/Users/application/plugins/authentication',
    '/Users/application/plugins/logger.js',
    {'/Users/application/plugins/pubsub.js':{endpoing: 'URL', admin:'admin', pass:'pass'}},
    'debug'
];

var obj = {
    '/Users/application/plugins/authentication':{hash:'sh1'},
    '/Users/application/plugins/logger.js': {level:'info'},
    '/Users/application/plugins/pubsub.js': {endpoing: 'URL', admin:'admin', pass:'pass'},
    'debug':{}
};

console.log(JSON.stringify(normalize(paths), null, 4));
console.log(JSON.stringify(normalize(mixed), null, 4));
console.log(JSON.stringify(normalize(obj), null, 4));
