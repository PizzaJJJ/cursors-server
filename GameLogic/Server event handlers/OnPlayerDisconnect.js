const levelManager = require('../LevelManager.js');

module.exports = function(id) {
    levelManager.removePlayer(id);
};