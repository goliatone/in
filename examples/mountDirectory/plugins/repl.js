'use strict';

module.exports.init = function(app, config){

    app.repl = {
        context: {app}
    };

    app.logger.info('Plugin REPL loaded!');
};

// module.exports.priority = 300;
