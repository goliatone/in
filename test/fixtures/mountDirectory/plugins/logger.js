'use strict';
const NOOP = function() {};

module.exports.init = function(app, config) {
    app.logger = { info: NOOP };
    app.logger.info('Plugin logger loaded!');
};

module.exports.priority = -100;