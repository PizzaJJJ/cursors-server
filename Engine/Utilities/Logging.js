const time = require('./Time');
const PATH = require('path');

const logLevels = {
    'error':    0, 
    'warn':     1, 
    'info':     2, 
    'verbose':  3, 
    'debug':    4, 
    'silly':    5
};

const getLogger = function(filename) {
    filename = PATH.basename(filename);

    var outputLogger = {};

    for (var level in logLevels) {
        outputLogger[level] = getLoggerDecorator(level, filename);
    }

    return outputLogger;
};

const getLoggerDecorator = function(lvl, filename) {
    return function(...args) {
        if (logLevels[lvl] <= loggerLevel) {
            let str = `${time.getTimestampISO(timeZone)} [${filename}] ${lvl}:\t`;

            if (lvl == 'warn') {
                console.warn(str, ...args);
            } else if (lvl == 'error') {
                console.error(str, ...args);
            } else {
                console.log(str, ...args);
            }
        }
    };
};

const ownLogger = getLogger(__filename);

var loggerLevel = 2;
var timeZone = 0;

module.exports.getLevel = function() {
    for (var level in logLevels) {
        if (logLevels[level] == loggerLevel) {
            return logLevels[level];
        }
    }

    return -1;
};

module.exports.getTimezone = function() {
    return timeZone;
};

module.exports.setLevel = function(logLevel) {
    loggerLevel = logLevel;

    ownLogger.info(`Logger level was set to ${logLevel}`);
};

module.exports.setTimezone = function(num) {
    if (!Number.isNaN(num)) {
        timeZone = num;

        ownLogger.info(`Logger timezone was set to ${time.formatTimezone(timeZone)}`);
    }
};

module.exports.getLogger = getLogger;