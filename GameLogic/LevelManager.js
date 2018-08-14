const Level                 = require('./Level.js');
const GameLoop              = require('../Engine/Utilities/GameLoop.js');
const levelLoader           = require('./LevelLoader.js');
const validator             = require('./PlayerPositionValidation.js');

const Engine                = require('../Engine/Engine.js');
const logger                = Engine.getLogging().getLogger(__filename);
const TIMESTAMP             = Engine.getTime().getTimestamp;
const NULL                  = Engine.getConstants().NULL;

var playersDistribution = [];
var updateLoop = NULL;

var activeLevels = new Set();
var firstLevel = NULL;

const SPAWN_LEVEL_NAME = 'A1';

const addToActive = function(level) {
    activeLevels.add(level);
};

/**
 * It doesn't allow same level be updated multiple times per tick.
 * @param {*} callTime 
 * @param {*} expireTime 
 */
const updateActiveLevels = function(callTime, expireTime) {
    const updated = new WeakSet();

    for (let level of activeLevels) {
        if (updated.has(level)) {
            continue;
        }

        activeLevels.delete(level);
        level.update();

        updated.add(level);

        if (TIMESTAMP() >= expireTime) {
            return;
        }
    }
};

const getLevelOfPlayer = function(id) {
    return playersDistribution[id];
};

const removePlayer = function(id) {
    const oldLevel = getLevelOfPlayer(id);

    if (oldLevel) {
        oldLevel.removePlayer(id);
        playersDistribution[id] = NULL;
    }
};

const assignToLevel = function(id, level) {
    removePlayer(id);

    if (level) {
        level.addPlayer(id);
        playersDistribution[id] = level;
    } else {
        assignToSpawnLevel(id);
    }
};

const assignToSpawnLevel = function(id) {
    const config = levelLoader.getConfig(SPAWN_LEVEL_NAME);

    if (config) {
        const spawnLevel    = new Level(config, addToActive);
        const exits         = spawnLevel.getGoals();

        for (i = 0, l = exits.length; i < l; i++) {
            exits[i].destination = firstLevel;
        }

        assignToLevel(id, spawnLevel);
    } else {
        logger.error(`Can't find a configuration of level ${SPAWN_LEVEL_NAME}.`,
            'Level Manager was not initialized probably.');
    }
};

module.exports.removePlayer = removePlayer;

module.exports.assignToSpawnLevel = assignToSpawnLevel;

module.exports.assignToLevel = assignToLevel;

module.exports.interactWithPlayer = function(id, data) {
    const level = getLevelOfPlayer(id);

    if (level) {
        level.validatePlayerPos(id, data);
    }

    return true;
};

module.exports.initialise = function(config) {
    if (config.hasOwnProperty('wallHackProtection')) {
        validator.setLevel(config.wallHackProtection);
    }

    if (config.hasOwnProperty('maxDraw')) {
        Level.setMaxPlayersToDraw(config.maxDraw);
    }

    if (config.hasOwnProperty('maxShow')) {
        Level.setMaxPlayersToShow(config.maxShow);
    }

    if (config.hasOwnProperty('resetTimeout')) {
        Level.setResetTime(config.resetTimeout);
    }

    if (config.hasOwnProperty('levelWidth')) {
        Level.setMaxWidth(config.levelWidth);
    }

    if (config.hasOwnProperty('levelHeight')) {
        Level.setMaxHeight(config.levelHeight);
    }

    if (config.hasOwnProperty('dataSendLimit')) {
        Level.setDataSendLimit(config.dataSendLimit);
    }

    var names       = levelLoader.loadConfigs(config.pathsToLevels);
    var levels      = levelLoader.instantiateLevels(names.slice(1));

    firstLevel = levels[0];

    for (var i = 0, l = levels.length; i < l; i++) {
        levels[i].setUpdateCallback(addToActive);
    }

    updateLoop = new GameLoop(updateActiveLevels, config.tickInterval);
    updateLoop.start();

    logger.verbose(`${levels.length} + 1 levels are initialized`);
};