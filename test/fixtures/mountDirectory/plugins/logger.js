'use strict';

module.exports.init = function(app, config){
    var NOOP = function(){};
    app.logger = {info: NOOP};
    app.logger.info('Plugin logger loaded!');
};

module.exports.priority = -100;
