const FS = require('fs');
const PATH = require('path');
const logger = require('./Logging.js').getLogger(__filename);

const transformPath = function(relPath) {
    return PATH.resolve(relPath);
};

const getFileExtension = function(relPath) {
    try {
        return PATH.extname(relPath);
    } catch (err) {
        logger.error(`Requested file <${relPath}> doesn't exist!`, err);
    }
};

const getFileContent = function(relPath) {
    try {
        return FS.readFileSync(transformPath(relPath), 'utf8');
    } catch (err) {
        logger.error(`Requested file <${relPath}> doesn't exist!`, err);
    }
};

const forAllFilesInDir = function(relPath, callback) {
    try {
        var files = FS.readdirSync(transformPath(relPath));

        for (var i = 0; i < files.length; i++) {
            callback(files[i]);
        }
    } catch (err) {
        logger.error(`Requested file <${relPath}> doesn't exist!`, err);
    }
};

module.exports.getFileExtension = getFileExtension;
module.exports.getFileContent = getFileContent;
module.exports.forAllFilesInDir = forAllFilesInDir;