
var normalize = require('..').normalize;

var paths = [
    '/Users/gol/plugins/authentication',
    '/Users/gol/plugins/logger.js',
    '/Users/gol/plugins/pubsub.js',
    'debug'
];


var mixed = [
    '/Users/gol/plugins/authentication',
    '/Users/gol/plugins/logger.js',
    {'/Users/gol/plugins/pubsub.js':{endpoing: 'URL', admin:'admin', pass:'pass'}},
    'debug'
];

var obj = {
    '/Users/gol/plugins/authentication':{hash:'sh1'},
    '/Users/gol/plugins/logger.js': {level:'info'},
    '/Users/gol/plugins/pubsub.js': {endpoing: 'URL', admin:'admin', pass:'pass'},
    'debug':{}
};

console.log(JSON.stringify(normalize(paths), null, 4));
console.log(JSON.stringify(normalize(mixed), null, 4));
console.log(JSON.stringify(normalize(obj), null, 4));
