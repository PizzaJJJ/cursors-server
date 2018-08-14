const Engine        = require('../../Engine/Engine.js');
const levelManager = require('../LevelManager.js');

module.exports = function(id) {
    const getPacket = Engine.getPacketManager().getPacket;
    const server    = Engine.getEngine().server; 
    const idPacket  = getPacket("S00");

    idPacket.setId(id);
    server.send(id, idPacket);

    levelManager.assignToSpawnLevel(id);
};