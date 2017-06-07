'use strict';


module.exports.isDevelopment = function $isDevelopment() {
    if(process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
        return true;
    }

    if(process.env.DEBUG) {
        return true;
    }
};
