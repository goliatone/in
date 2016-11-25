'use strict';

module.exports.init = function(app, config){
    app.auth = {
        check: function(){}
    };
    app.logger.info('Plugin auth loaded!');
};

module.exports.dependencies = ['logger', 'persistence'];
