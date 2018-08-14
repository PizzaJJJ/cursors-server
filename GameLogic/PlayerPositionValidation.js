const logger = require('../Engine/Engine.js').getLogging().getLogger(__filename);

var level = 'insideCheck';

const TYPES = {
    0: 'insideCheck',
    1: 'avoidWalls',
    2: 'onlyStraight'
};

const getResult = function(x, y, isCorrected) {
    return {
        x: x,
        y: y,
        corrected: !!isCorrected
    };
};

const validations = {
    insideCheck: function(map, playerX, playerY, dataX, dataY) {
        if (map.isInside(dataX, dataY)) {
            return getResult(dataX, dataY, false);
        }

        return getResult(playerX, playerY, true);
    },

    avoidWalls: function(map, playerX, playerY, dataX, dataY) {
        if (map.isWalkableAt(dataX, dataY)) {
            return getResult(dataX, dataY, false);
        }

        return getResult(playerX, playerY, true);
    },

    onlyStraight: function(map, playerX, playerY, dataX, dataY) {
        const result = map.walkStraight(playerX, playerY, dataX, dataY);

        return getResult(result.x, result.y, (result.x != dataX || result.y != dataY));
    }
};

module.exports.setLevel = function(num) {
    level = TYPES[num];

    if (!TYPES[num]) {
        level = TYPES[0];
    }

    logger.info(`Wallhack protection set to level: ${level}`);
};

module.exports.validate = function(map, playerX, playerY, dataX, dataY) {
    return validations[level](map, playerX, playerY, dataX, dataY);
};