'use strict';

module.exports.init = function(app, config){
    app.pubsub = {
        publibsh: function(type, event){
            app.logger.warn('publish: %s. payload: %s', type, event);
        },
        subscribe: function(type, handler){
            app.logger.warn('subscribe to %s', type);
        }
    };
    app.logger.info('Plugin pubsub loaded!');
};

module.exports.dependencies = ['logger'];
