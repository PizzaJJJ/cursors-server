const Level         = require('./Level.js');
const Engine        = require('../Engine/Engine.js');
const shuffle       = require('./Utilities/ShuffleArray.js');
const readConfig    = Engine.getConfig;
const fileManager   = Engine.getFileManager();
const getExt        = fileManager.getFileExtension;

var configs = {};

const saveConfig = function(path, names) {
    const conf = readConfig(path);

    if (conf) {
        const name = conf.lvlname;

        configs[name] = conf;
        names.push(name);
    }
};

module.exports.loadConfigs = function(paths) {
    var names = [];

    for (var i = 0, l = paths.length; i < l; i++) {
        names.push([]);

        const path = __dirname + '/../' + paths[i];
        const ext  = getExt(path);

        if (ext) {
            if (ext == ".json") {
                saveConfig(path, names[i]);
            }
        } else {
            fileManager.forAllFilesInDir(path, function(file) {
                if (getExt(file) == ".json") {
                    saveConfig(path + '/' +  file, names[i]);
                }
            });
        }
    }

    return names;
};

module.exports.instantiateLevels = function(names) {
    var levels = [], levelsTable = {},
        i, j, il, jl;

    for (i = 0, il = names.length; i < il; i++) {
        shuffle(names[i]);
        
        for (j = 0, jl = names[i].length; j < jl; j++) {
            const level = new Level( configs[ names[i][j] ] );

            levelsTable[names[i][j]] = level;
            levels.push(level);
        }
    }

    for (i = 0, il = levels.length - 1; i < il; i++) {
        const exits         = levels[i].getGoals();
        const conf          = configs[levels[i].name];

        let destinations;

        if (conf.hasOwnProperty('destinations')) {
            destinations = shuffle(conf.destinations.slice());
        }

        for (j = 0, jl = exits.length; j < jl; j++) {

            if (exits[j].destination) {

                exits[j].destination = levelsTable[exits[j].destination];

            } else if (destinations && exits[j].isRandom) {

                let dst = destinations.pop();

                if (dst) {
                    exits[j].destination = levelsTable[dst];
                } else {
                    exits[j].destination = levels[i + 1];
                }

            } else {
                exits[j].destination = levels[i + 1];
            }
        }
    }

    return levels;
};

module.exports.getConfig = function(levelName) {
    return configs[levelName];
};
