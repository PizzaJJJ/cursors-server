const Emitter       = require('events').EventEmitter;
const GameLoop      = require('../Utilities/GameLoop.js');
const LinkedList    = require('../Utilities/LinkedList.js');
const TIMESTAMP     = require('../Utilities/Time.js').getTimestamp;
const NULL          = require('../Utilities/Constants.js').NULL;

class PlayerInboundDataController {
    /**
     * This is the layer of abstraction which could be wrapped around the server. It allows to control 
     * game logic execution by putting players' messages into queques and emitting 'clientMessage' event 
     * when a message may be processed. Game logic could just subscribe on those event and do its own 
     * business.
     * 
     * The constructor receives Server class instance and tick interval value in ms as parameters.
     * @param {Server} server 
     * @param {number} tickInterval
     */
    constructor(server, tickInterval) {
        this._playerQueues = [];
        this._activePlayers = [];
        this._activePlayersShortList = [];
        this._activePlayerIndex = 0;

        this._handleInboundQueueLoop = new GameLoop(this._handleInboundQueue.bind(this), tickInterval);
        this._handleInboundQueueLoop.start();

        this._eventEmitter = new Emitter();

        if (server) {
            this.subscribeOnServerEvents(server);
        }
    }

    _initPlayer(id) {
        this._playerQueues[id] = new LinkedList();
        this._eventEmitter.emit('connection', id);
    }

    _removePlayer(id) {
        this._playerQueues[id].clear();
        this._playerQueues[id] = NULL;
        this._activePlayers[id] = NULL;
        this._eventEmitter.emit('disconnection', id);
    }

    _onclientMessage(id, packet) {
        this._playerQueues[id].add(packet);

        if (!this._activePlayers[id]) {
            this._activePlayers[id] = true;
            this._activePlayersShortList.push(id);
        }
    }

    _handleInboundQueue(callTime, expireTime) {
        if (this._activePlayersShortList.length == 0) {
            return;
        }

        for (var i = this._activePlayerIndex; i < this._activePlayersShortList.length; i++) {
            let id = this._activePlayersShortList[i];
            let queue = this._playerQueues[id];

            if (!queue) {
                continue;
            }

            let packet = queue.extractFirstData();

            while (packet) {
                this._eventEmitter.emit('clientMessage', id, packet, expireTime);

                if (TIMESTAMP() >= expireTime) {
                    this._activePlayerIndex = i;
                    return;
                }

                packet = queue.extractFirstData();
            }

            this._activePlayers[id] = NULL;
        }

        this._activePlayerIndex = 0;
        this._activePlayersShortList = [];
    }

    emitMessage() {

    }

    confirmMessage() {
        
    }

    stop() {
        this._handleInboundQueueLoop.stop();
    }

    /**
     * List of emitted events:
     * 
     * 1. 'connection'. It fires when new client connected to the server.
     * 
     * 2. 'clientMessage'. It fires when it is a time to process player messages. Arguments for a listener 
     * are player id, message body and expire time, before which the message should be processed.
     * 
     * 3. 'disconnection'. It fires when a client disconnects from the server.
     * 
     * @param {string} eventName 
     * @param {function(number, ?object=, ?number=)} handler 
     */
    subscribeOnEvent(eventName, handler) {
        this._eventEmitter.on(eventName, handler);
    }

    subscribeOnServerEvents(server) {
        server.subscribeOnEvent('connection', this._initPlayer.bind(this));
        server.subscribeOnEvent('disconnection', this._removePlayer.bind(this));
        server.subscribeOnEvent('clientMessage', this._onclientMessage.bind(this));
    }
}

module.exports = PlayerInboundDataController;