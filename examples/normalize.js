const normalize = require('..').normalize;

const paths = [
    '/Users/application/plugins/authentication',
    './logger.js',
    './pubsub.js',
    'debug'
];


const mixed = [
    '/Users/application/plugins/authentication',
    '/Users/application/plugins/logger.js',
    { '/Users/application/plugins/pubsub.js': { endpoint: 'URL', admin: 'admin', pass: 'pass' } },
    'debug'
];

const obj = {
    '/Users/application/plugins/authentication': { hash: 'sh1' },
    '/Users/application/plugins/logger.js': { level: 'info' },
    '/Users/application/plugins/pubsub.js': { endpoint: 'URL', admin: 'admin', pass: 'pass' },
    'debug': {}
};

console.log(JSON.stringify(normalize(paths), null, 4));
// console.log(JSON.stringify(normalize(mixed), null, 4));
// console.log(JSON.stringify(normalize(obj), null, 4));