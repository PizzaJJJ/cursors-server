const levelManager  = require('../LevelManager.js');

module.exports = function(id, data) {
    return levelManager.interactWithPlayer(id, data);
};