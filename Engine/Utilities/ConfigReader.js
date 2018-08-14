const readContent = require('./FileManager.js').getFileContent;
const logger = require('./Logging.js').getLogger(__filename);

module.exports.readConfigFile = function(configPath) {
    const configJSON = readContent(configPath);

    var config;

    if (configJSON) {
        try {
            config = JSON.parse(configJSON);
            logger.debug(`Following configuration loaded: ${configJSON}`);
        } catch (err) {
            logger.error(`Invalid configuration file <${configPath}>`, err);
        }
    } else {
        logger.error(`Error loading configuration from <${configPath}>`);
    }

    return config;
};