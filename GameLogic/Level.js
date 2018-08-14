const Player            = require('./Player.js');
const Engine            = require('../Engine/Engine.js');
const initLevelObjects  = require('./initLevel.js');
const validator         = require('./PlayerPositionValidation.js');
const levelManager      = require('./LevelManager.js');
const objDispatcher     = require('./Level objects/LevelObjectDispatcher.js');
const logger            = Engine.getLogging().getLogger(__filename);
const getPacket         = Engine.getPacketManager().getPacket;
const LinkedList        = require('../Engine/Utilities/LinkedList.js');
const NULL              = Engine.getConstants().NULL;

var maxPlayersToDraw    = 30;
var maxPlayersToShow    = 100;
var resetTime           = 600000;
var maxWidth            = 400;
var maxHeight           = 300;
var dataSendLimit       = 100;

class Level {
    constructor(config, updateCallback) {
        this._updateCallback    = updateCallback || function() {};

        this.name               = config.lvlname;
        this.spawn              = config.spawn;
        this.resetTimer         = null;

        this.players            = [];
        this.playersAmount      = 0;
        this.playersQuadTree    = NULL;

        this.objects = {
            texts:      [],
            walls:      [],
            exits:      [],
            hovers:     [],
            buttons:    []
        };

        this.map = NULL; // compressed 2d-map of level's objects and players.

        this.updates = {
            clicks:     new LinkedList(),
            lines:      new LinkedList(),
            objRemove:  [],
            objAdd:     []
        };

        initLevelObjects(this, config.objects, maxWidth, maxHeight);
    }

    _getPlayersArray(limited) {
        var players = [];

        for (var i = 0, l = this.players.length; i < l; i++) {
            if (this.players[i]) {

                if (limited && players.length >= maxPlayersToShow) {
                    break;
                }

                players.push(this.players[i]);
            }
        }

        return players;
    }

    _getLevelInfoPacket() {
        const levelPacket = getPacket("S04");
        levelPacket.setMap(this);

        return levelPacket;
    }

    _getLevelUpdatePacket(players) {
        const updatePacket = getPacket("S01");

        if (players) {
            if (players.length > maxPlayersToShow) {
                players.length = maxPlayersToShow;
            }
        } else {
            players = this._getPlayersArray(true);
        }

        const clicks    = this.updates.clicks.extractFirstDataArray(dataSendLimit);
        const lines     = this.updates.lines.extractFirstDataArray(dataSendLimit);

        updatePacket.setPlayerUpdates(players);
        updatePacket.setClicks(clicks);
		updatePacket.setWallsRemoved(this.updates.objRemove);
        updatePacket.setMapUpdates(this.updates.objAdd);
        updatePacket.setLines(lines);

        updatePacket.setPlayerCount(Engine.getEngine().server.clientAmount);
        
        return updatePacket;
    }

    addPlayer(id) {
        this.players[id] = new Player(id, this.spawn.x, this.spawn.y);
        this.map.addPlayer(this.players[id]);
        this.playersAmount++;

        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.reset(), resetTime);

        const levelPacket = this._getLevelInfoPacket();
        const server      = Engine.getEngine().server;

        server.send(id, levelPacket);
        server.setPermission(id, true);

        this._updateCallback(this);

        logger.debug(`Player ${id} was added on level ${this.name}`);
    }

    removePlayer(id) {
        Engine.getEngine().server.setPermission(id, false);

        this.map.removePlayer(this.players[id]);
        this.players[id] = NULL;
        this.playersAmount--;

        logger.debug(`Player ${id} was removed from level ${this.name}`);

        if (this.playersAmount == 0) {
            clearTimeout(this.resetTimer);
            this.reset();
        } else {
            this._updateCallback(this);
        }
    }

    movePlayerTo(id, x, y, needSend) {
        const player = this.players[id];

        if (player.x != x || player.y != y) {
            const playerX   = this.map.shrinkCoord(player.x),
                  playerY   = this.map.shrinkCoord(player.y),
                  shX       = this.map.shrinkCoord(x),
                  shY       = this.map.shrinkCoord(y);

            if (playerX != shX || playerY != shY) {
                this.map.removePlayer(this.players[id]);

                player.x = x;
                player.y = y;

                this.map.addPlayer(this.players[id]);
            } else {
                player.x = x;
                player.y = y;
            }

            if (needSend) {
                const teleportPacket = getPacket("S05");

                teleportPacket.setX(x);
                teleportPacket.setY(y);

                Engine.getEngine().server.send(id, teleportPacket);
            }

            this._updateCallback(this);
        }
    }

    validatePlayerPos(id, data) {
        const player = this.players[id];
        var result;

        switch (data.pid) {
            case 1:
                result = validator.validate(this.map, player.x, player.y, data.x, data.y);
                break;
            case 2:
                let buttons, i, l;

                result = validator.validate(this.map, player.x, player.y, data.x, data.y);

                buttons = this.map.getTypedObjectsAt(result.x, result.y, objDispatcher.TYPES.BUTTON);
                for (i = 0, l = buttons.length; i < l; i++) {
                    buttons[i].pressDown();
                }

                this.updates.clicks.add(result);
                this._updateCallback(this);
                
                break;
            case 3:
                result = validator.validate(this.map, player.x, player.y, data.x1, data.y1);
                let result2 = validator.validate(this.map, result.x, result.y, data.x2, data.y2);

                if ((result.x != result2.x || result.y != result2.y) && 
                    this.playersAmount <= maxPlayersToDraw) {
                    this.updates.lines.add(data);
                }

                result = result2;

                break;
        }

        this.movePlayerTo(id, result.x, result.y, result.corrected);
    }

    reset() {
        const players = this._getPlayersArray();

        for (var i = 0, l = players.length; i < l; i++) {
            this.movePlayerTo(players[i].id, this.spawn.x, this.spawn.y, true);
        }

        for (i = 0, l = this.objects.hovers.length; i < l; i++) {
            this.objects.hovers[i].reset();
        }

        for (i = 0, l = this.objects.buttons.length; i < l; i++) {
            this.objects.buttons[i].reset();
        }

        if (this.playersAmount != 0) {
            this.resetTimer = setTimeout(() => this.reset(), resetTime);
            this._updateCallback(this);
        }

        logger.debug(`Level ${this.name} was reset`);
    }

    moveOutPlayers(obj) {
        const players = this.map.getPlayersInArea(obj.x, obj.y, obj.width, obj.height);

        for (var i = 0, l = players.length; i < l; i++) {
            const player = this.players[players[i]];
            const newPos = this.map.findClosestWalkable(player.x, player.y);

            if (newPos) {
                this.movePlayerTo(player.id, newPos.x, newPos.y, true);
            } else {
                this.movePlayerTo(player.id, this.spawn.x, this.spawn.y, true);
            }
        }
    }

    getGoals() {
        var goals = [];

        for (var i = 0, l = this.objects.exits.length; i < l; i++) {
            if (!this.objects.exits[i].isBad) {
                goals.push(this.objects.exits[i]);
            }
        }

        return goals;
    }

    checkExits() {
        var j, lj;

        for (var i = 0, l = this.objects.exits.length; i < l; i++) {
            let goal    = this.objects.exits[i];
            let players = this.map.getPlayersInArea(goal.x, goal.y, goal.width, goal.height);

            if (goal.isBad || goal.destination == this) {
                for (j = 0, lj = players.length; j < lj; j++) {
                    this.movePlayerTo(players[j], this.spawn.x, this.spawn.y, true);
                }
            } else {
                for (j = 0, lj = players.length; j < lj; j++) {
                    levelManager.assignToLevel(players[j], goal.destination);
                }
            }
        }
    }

    checkHovers() {
        for (var i = 0, l = this.objects.hovers.length; i < l; i++) {
            let hover   = this.objects.hovers[i];
            let players = this.map.getPlayerAmountInArea(hover.x, hover.y, hover.width, hover.height);

            hover.hover(players);
        }
    }

    update() {
        this.checkExits();
        this.checkHovers();

        const players       = this._getPlayersArray();
        const updatePacket  = this._getLevelUpdatePacket(players);
        const server        = Engine.getEngine().server;

        for (var i = 0, l = players.length; i < l; i++) {
            server.send(players[i].id, updatePacket);
        }

        this.updates.objRemove.length   = 0;
        this.updates.objAdd.length      = 0;

        if (this.updates.clicks.length  != 0 || 
            this.updates.lines.length   != 0) {

            this._updateCallback(this);
        }
    }

    setUpdateCallback(updateCallback) {
        this._updateCallback = updateCallback;
    }

    invokeUpdateCallback() {
        this._updateCallback(this);
    }

    static setMaxPlayersToDraw(num) {
        maxPlayersToDraw = num;

        logger.verbose(`Drawing allowance: level allows drawing if there are no more than ${maxPlayersToDraw} cursors on it`);
    }

    static setMaxPlayersToShow(num) {
        maxPlayersToShow = num;

        logger.verbose(`Cursor showing allowance: level shows no more than ${maxPlayersToShow} cursors`);
    }

    static setResetTime(num) {
        resetTime = num;

        logger.verbose(`Reset timeout: ${resetTime/1000} sec (${Math.floor(resetTime/60000)} min)`);
    }

    static setMaxWidth(num) {
        maxWidth = num;

        logger.verbose(`Level width size: ${maxWidth}`);
    }

    static setMaxHeight(num) {
        maxHeight = num;

        logger.verbose(`Level height size: ${maxHeight}`);
    }

    static setDataSendLimit(num) {
        dataSendLimit = num;

        logger.verbose(`Data sent limit: ${dataSendLimit}`);
    }
}

module.exports = Level;