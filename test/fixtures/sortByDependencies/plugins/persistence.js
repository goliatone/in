'use strict';

module.exports.init = function(app, config){
    app.persistence = {
        save: function(vo){
            app.logger.warn('save: %s.', vo);
        }
    };
    app.logger.info('Plugin persistence loaded!');
};

module.exports.dependencies = ['logger'];
