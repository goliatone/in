'use strict';

module.exports.init = function(app, config){
    app.logger = console;
    app.logger.info('Plugin logger loaded!');
};

module.exports.priority = -100;
