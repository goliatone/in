'use strict';
const join = require('path').join;
const lstat = require('fs').lstatSync;
const exists = require('fs').existsSync;
/**
 * We want to filter out directories that
 * are not able to be required, that is
 * directories that do not have an index.js
 * file.
 * @param  {Array} list List of filepaths
 * @return {Array}
 */
function filterEmptyDir(list=[]) {
    return list.map((f)=>{
        if(lstat(f).isDirectory() && !exists(join(f, 'index.js'))) {
            return false;
        }
        return f;
    }).filter(Boolean);
}

module.exports = filterEmptyDir;
